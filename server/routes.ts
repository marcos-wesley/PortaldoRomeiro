import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { registerUserSchema, loginUserSchema, updateProfileSchema, createNewsSchema, updateNewsSchema, createVideoSchema, updateVideoSchema, createAttractionSchema, updateAttractionSchema, createBusinessReviewSchema } from "@shared/schema";
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

  // News Routes (Public API)
  app.get("/api/news", async (req, res) => {
    try {
      const publishedOnly = req.query.published !== "false";
      const allNews = await storage.getAllNews(publishedOnly);
      return res.json({ news: allNews });
    } catch (error) {
      console.error("Get news error:", error);
      return res.status(500).json({ error: "Erro ao buscar noticias" });
    }
  });

  app.get("/api/news/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const newsItem = await storage.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ error: "Noticia nao encontrada" });
      }

      // Increment views
      await storage.incrementNewsViews(id);

      return res.json({ news: newsItem });
    } catch (error) {
      console.error("Get news item error:", error);
      return res.status(500).json({ error: "Erro ao buscar noticia" });
    }
  });

  // Videos Routes (Public API)
  app.get("/api/videos", async (req, res) => {
    try {
      const publishedOnly = req.query.published !== "false";
      const allVideos = await storage.getAllVideos(publishedOnly);
      return res.json({ videos: allVideos });
    } catch (error) {
      console.error("Get videos error:", error);
      return res.status(500).json({ error: "Erro ao buscar videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideoById(id);
      
      if (!video) {
        return res.status(404).json({ error: "Video nao encontrado" });
      }

      await storage.incrementVideoViews(id);

      return res.json({ video });
    } catch (error) {
      console.error("Get video error:", error);
      return res.status(500).json({ error: "Erro ao buscar video" });
    }
  });

  // Partners Routes (Public API)
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getAllPartners(true);
      return res.json({ partners });
    } catch (error) {
      console.error("Get partners error:", error);
      return res.status(500).json({ error: "Erro ao buscar parceiros" });
    }
  });

  // Banners Routes (Public API)
  app.get("/api/banners", async (req, res) => {
    try {
      const position = req.query.position as string | undefined;
      const banners = await storage.getAllBanners(true, position);
      return res.json({ banners });
    } catch (error) {
      console.error("Get banners error:", error);
      return res.status(500).json({ error: "Erro ao buscar banners" });
    }
  });

  // Upload image for news
  app.post("/api/upload/image", async (req, res) => {
    try {
      const { imageData } = req.body;
      if (!imageData) {
        return res.status(400).json({ error: "Dados da imagem sao obrigatorios" });
      }

      const matches = imageData.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ error: "Formato de imagem invalido" });
      }

      const extension = matches[1];
      const base64Data = matches[2];
      
      const uploadsDir = path.join(process.cwd(), "uploads", "images");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${extension}`;
      const filepath = path.join(uploadsDir, filename);

      const buffer = Buffer.from(base64Data, "base64");
      
      if (buffer.length > 10 * 1024 * 1024) {
        return res.status(400).json({ error: "Imagem muito grande. Maximo 10MB." });
      }

      fs.writeFileSync(filepath, buffer);

      const imageUrl = `/uploads/images/${filename}`;
      return res.json({ url: imageUrl });
    } catch (error) {
      console.error("Upload image error:", error);
      return res.status(500).json({ error: "Erro ao enviar imagem" });
    }
  });

  // Attractions Routes (Public API)
  app.get("/api/attractions", async (req, res) => {
    try {
      const publishedOnly = req.query.published !== "false";
      const category = req.query.category as string | undefined;
      const allAttractions = await storage.getAllAttractions(publishedOnly, category);
      return res.json({ attractions: allAttractions });
    } catch (error) {
      console.error("Get attractions error:", error);
      return res.status(500).json({ error: "Erro ao buscar atracoes" });
    }
  });

  app.get("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const attraction = await storage.getAttractionById(id);
      
      if (!attraction) {
        return res.status(404).json({ error: "Atracao nao encontrada" });
      }

      await storage.incrementAttractionViews(id);

      return res.json({ attraction });
    } catch (error) {
      console.error("Get attraction error:", error);
      return res.status(500).json({ error: "Erro ao buscar atracao" });
    }
  });

  // Admin Attractions Routes
  app.post("/api/attractions", async (req, res) => {
    try {
      const validationResult = createAttractionSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const attraction = await storage.createAttraction(validationResult.data);
      return res.status(201).json({ attraction, message: "Atracao criada com sucesso!" });
    } catch (error) {
      console.error("Create attraction error:", error);
      return res.status(500).json({ error: "Erro ao criar atracao" });
    }
  });

  app.put("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateAttractionSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const attraction = await storage.updateAttraction(id, validationResult.data);
      if (!attraction) {
        return res.status(404).json({ error: "Atracao nao encontrada" });
      }

      return res.json({ attraction, message: "Atracao atualizada com sucesso!" });
    } catch (error) {
      console.error("Update attraction error:", error);
      return res.status(500).json({ error: "Erro ao atualizar atracao" });
    }
  });

  app.delete("/api/attractions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteAttraction(id);
      
      if (!success) {
        return res.status(404).json({ error: "Atracao nao encontrada" });
      }

      return res.json({ message: "Atracao excluida com sucesso!" });
    } catch (error) {
      console.error("Delete attraction error:", error);
      return res.status(500).json({ error: "Erro ao excluir atracao" });
    }
  });

  // Static Pages Routes (Public API)
  app.get("/api/static-pages/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      const page = await storage.getStaticPage(pageKey);
      
      if (!page) {
        return res.json({ content: null });
      }

      return res.json({ content: JSON.parse(page.content), updatedAt: page.updatedAt });
    } catch (error) {
      console.error("Get static page error:", error);
      return res.status(500).json({ error: "Erro ao buscar conteudo" });
    }
  });

  app.get("/api/static-pages", async (req, res) => {
    try {
      const pages = await storage.getAllStaticPages();
      return res.json({ pages: pages.map(p => ({ ...p, content: JSON.parse(p.content) })) });
    } catch (error) {
      console.error("Get all static pages error:", error);
      return res.status(500).json({ error: "Erro ao buscar paginas" });
    }
  });

  // Admin Static Pages Routes
  app.put("/api/static-pages/:pageKey", async (req, res) => {
    try {
      const { pageKey } = req.params;
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ error: "Conteudo e obrigatorio" });
      }

      const contentString = typeof content === "string" ? content : JSON.stringify(content);
      const page = await storage.upsertStaticPage(pageKey, contentString);
      
      return res.json({ page: { ...page, content: JSON.parse(page.content) }, message: "Conteudo atualizado com sucesso!" });
    } catch (error) {
      console.error("Update static page error:", error);
      return res.status(500).json({ error: "Erro ao atualizar conteudo" });
    }
  });

  // Business Routes (Public)
  app.get("/api/businesses", async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses(true);
      return res.json({ businesses });
    } catch (error) {
      console.error("Get businesses error:", error);
      return res.status(500).json({ error: "Erro ao buscar empresas" });
    }
  });

  app.get("/api/businesses/:businessId", async (req, res) => {
    try {
      const { businessId } = req.params;
      const business = await storage.getBusinessById(businessId);
      if (!business || !business.published) {
        return res.status(404).json({ error: "Empresa nao encontrada" });
      }
      return res.json({ business });
    } catch (error) {
      console.error("Get business error:", error);
      return res.status(500).json({ error: "Erro ao buscar empresa" });
    }
  });

  // Business Reviews Routes
  app.get("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const reviews = await storage.getBusinessReviews(businessId);
      return res.json({ reviews });
    } catch (error) {
      console.error("Get business reviews error:", error);
      return res.status(500).json({ error: "Erro ao buscar avaliacoes" });
    }
  });

  app.post("/api/businesses/:businessId/reviews", async (req, res) => {
    try {
      const { businessId } = req.params;
      const validationResult = createBusinessReviewSchema.safeParse({
        ...req.body,
        businessId,
      });

      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const review = await storage.createBusinessReview(validationResult.data);
      return res.status(201).json({ review, message: "Avaliacao enviada com sucesso!" });
    } catch (error) {
      console.error("Create business review error:", error);
      return res.status(500).json({ error: "Erro ao enviar avaliacao" });
    }
  });

  // Accommodation Routes (Public)
  app.get("/api/accommodations", async (req, res) => {
    try {
      const accommodations = await storage.getAllAccommodations(true);
      return res.json({ accommodations });
    } catch (error) {
      console.error("Get accommodations error:", error);
      return res.status(500).json({ error: "Erro ao buscar hospedagens" });
    }
  });

  app.get("/api/accommodations/search", async (req, res) => {
    try {
      const { checkIn, checkOut } = req.query;
      
      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: "Datas de check-in e check-out sao obrigatorias" });
      }

      const checkInDate = checkIn as string;
      const checkOutDate = checkOut as string;

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(checkInDate) || !dateRegex.test(checkOutDate)) {
        return res.status(400).json({ error: "Formato de data invalido. Use YYYY-MM-DD" });
      }

      // Validate checkIn is before checkOut
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res.status(400).json({ error: "Data de check-in deve ser anterior ao check-out" });
      }

      const accommodations = await storage.getAvailableAccommodations(checkInDate, checkOutDate);
      return res.json({ accommodations, checkIn: checkInDate, checkOut: checkOutDate });
    } catch (error) {
      console.error("Search accommodations error:", error);
      return res.status(500).json({ error: "Erro ao buscar hospedagens disponiveis" });
    }
  });

  app.get("/api/accommodations/:accommodationId", async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const accommodation = await storage.getAccommodationById(accommodationId);
      if (!accommodation || !accommodation.published) {
        return res.status(404).json({ error: "Hospedagem nao encontrada" });
      }
      
      // Get all rooms for this accommodation
      const rooms = await storage.getRoomsByAccommodation(accommodationId, true);
      
      return res.json({ accommodation, rooms });
    } catch (error) {
      console.error("Get accommodation error:", error);
      return res.status(500).json({ error: "Erro ao buscar hospedagem" });
    }
  });

  app.get("/api/accommodations/:accommodationId/availability", async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const { checkIn, checkOut } = req.query;
      
      if (!checkIn || !checkOut) {
        return res.status(400).json({ error: "Datas de check-in e check-out sao obrigatorias" });
      }

      const checkInDate = checkIn as string;
      const checkOutDate = checkOut as string;

      const accommodation = await storage.getAccommodationById(accommodationId);
      if (!accommodation || !accommodation.published) {
        return res.status(404).json({ error: "Hospedagem nao encontrada" });
      }

      const allRooms = await storage.getRoomsByAccommodation(accommodationId, true);
      const availableRooms = [];

      for (const room of allRooms) {
        const isAvailable = await storage.checkRoomAvailability(room.id, checkInDate, checkOutDate);
        if (isAvailable) {
          availableRooms.push(room);
        }
      }

      return res.json({ accommodation, availableRooms, checkIn: checkInDate, checkOut: checkOutDate });
    } catch (error) {
      console.error("Check accommodation availability error:", error);
      return res.status(500).json({ error: "Erro ao verificar disponibilidade" });
    }
  });

  // Accommodation Reviews Routes
  app.get("/api/accommodations/:accommodationId/reviews", async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const reviews = await storage.getAccommodationReviews(accommodationId);
      return res.json({ reviews });
    } catch (error) {
      console.error("Get accommodation reviews error:", error);
      return res.status(500).json({ error: "Erro ao buscar avaliacoes" });
    }
  });

  // Partners Routes (public)
  app.get("/api/partners", async (req, res) => {
    try {
      const partners = await storage.getAllPartners(true);
      return res.json({ partners });
    } catch (error) {
      console.error("Get partners error:", error);
      return res.status(500).json({ error: "Erro ao buscar parceiros" });
    }
  });

  // Banners Routes (public)
  app.get("/api/banners", async (req, res) => {
    try {
      const position = req.query.position as string | undefined;
      const banners = await storage.getAllBanners(true, position);
      return res.json({ banners });
    } catch (error) {
      console.error("Get banners error:", error);
      return res.status(500).json({ error: "Erro ao buscar banners" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
