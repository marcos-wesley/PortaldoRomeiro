import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { registerUserSchema, loginUserSchema, updateProfileSchema } from "@shared/schema";
import { storage } from "./storage";
import { fromError } from "zod-validation-error";
import * as fs from "node:fs";
import * as path from "node:path";

function hashPassword(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const verifyHash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(verifyHash, "hex"));
  } catch {
    return false;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const { name, email, phone, password, city, state, receiveNews, acceptedTerms } = validationResult.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "E-mail já cadastrado" });
      }

      const hashedPassword = hashPassword(password);

      const user = await storage.createUser({
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        city: city || null,
        state: state || null,
        receiveNews: receiveNews ?? false,
        acceptedTerms,
      });

      const { password: _, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword, message: "Conta criada com sucesso!" });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Erro ao criar conta. Tente novamente." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = loginUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const { email, password } = validationResult.data;

      const user = await storage.getUserByEmail(email.toLowerCase());
      if (!user) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      const isPasswordValid = verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword, message: "Login realizado com sucesso!" });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ error: "Erro ao fazer login. Tente novamente." });
    }
  });

  // Get user profile
  app.get("/api/user/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get profile error:", error);
      return res.status(500).json({ error: "Erro ao buscar perfil. Tente novamente." });
    }
  });

  // Update user profile
  app.put("/api/user/profile/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      const validationResult = updateProfileSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const updateData = validationResult.data;

      // Check if email is being changed and if it's already in use
      if (updateData.email) {
        const existingUser = await storage.getUserByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({ error: "Este e-mail já está em uso" });
        }
      }

      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({ user: userWithoutPassword, message: "Perfil atualizado com sucesso!" });
    } catch (error) {
      console.error("Update profile error:", error);
      return res.status(500).json({ error: "Erro ao atualizar perfil. Tente novamente." });
    }
  });

  // Upload avatar
  app.post("/api/user/profile/:userId/avatar", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: "ID do usuário é obrigatório" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Handle base64 image data
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Dados da imagem são obrigatórios" });
      }

      // Validate base64 image
      const matches = imageData.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagem inválido" });
      }

      const extension = matches[1];
      const base64Data = matches[2];
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), "uploads", "avatars");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${userId}-${Date.now()}.${extension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      const buffer = Buffer.from(base64Data, "base64");
      
      // Validate file size (max 5MB)
      if (buffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ error: "Imagem muito grande. Máximo 5MB." });
      }

      fs.writeFileSync(filepath, buffer);

      // Delete old avatar if exists
      if (user.avatarUrl) {
        const oldFilename = user.avatarUrl.split("/").pop();
        if (oldFilename) {
          const oldFilepath = path.join(uploadsDir, oldFilename);
          if (fs.existsSync(oldFilepath)) {
            fs.unlinkSync(oldFilepath);
          }
        }
      }

      const avatarUrl = `/uploads/avatars/${filename}`;
      const updatedUser = await storage.updateUserAvatar(userId, avatarUrl);

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).json({ user: userWithoutPassword, message: "Foto atualizada com sucesso!" });
    } catch (error) {
      console.error("Upload avatar error:", error);
      return res.status(500).json({ error: "Erro ao atualizar foto. Tente novamente." });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
