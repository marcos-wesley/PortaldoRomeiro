import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { randomBytes, pbkdf2Sync } from "node:crypto";
import { registerUserSchema } from "@shared/schema";
import { storage } from "./storage";
import { fromError } from "zod-validation-error";

function hashPassword(password: string): string {
  const salt = randomBytes(32).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
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

  const httpServer = createServer(app);

  return httpServer;
}
