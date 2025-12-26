import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "node:http";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { registerUserSchema, loginUserSchema, updateProfileSchema, createNewsSchema, updateNewsSchema, createVideoSchema, updateVideoSchema, createAttractionSchema, updateAttractionSchema, createBusinessReviewSchema, createAccommodationReviewSchema, createNotificationSchema, updateNotificationSchema, registerPushDeviceSchema, updateNotificationPreferencesSchema, createActivityLogSchema, createAnalyticsEventSchema } from "@shared/schema";
import { storage } from "./storage";
import { fromError } from "zod-validation-error";
import * as fs from "node:fs";
import * as path from "node:path";
import { updatesHub } from "./updates-hub";

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
  // Real-time updates SSE endpoint
  app.get("/api/updates/stream", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    updatesHub.addClient(clientId, res);
    
    req.on("close", () => {
      // Client disconnected, handled in updatesHub
    });
  });

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

  // Useful Phones Routes (Public API)
  app.get("/api/useful-phones", async (req, res) => {
    try {
      const phones = await storage.getAllUsefulPhones(true);
      return res.json(phones);
    } catch (error) {
      console.error("Get useful phones error:", error);
      return res.status(500).json({ error: "Erro ao buscar telefones úteis" });
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

  // Romaria (Pilgrimage Countdown) - Public API
  app.get("/api/romaria", async (req, res) => {
    try {
      const settings = await storage.getAppSettingsByCategory("romaria");
      const romariaData: Record<string, string | null> = {};
      
      for (const setting of settings) {
        const key = setting.key.replace("romaria_", "");
        romariaData[key] = setting.value;
      }
      
      return res.json(romariaData);
    } catch (error) {
      console.error("Get romaria settings error:", error);
      return res.status(500).json({ error: "Erro ao buscar configurações da romaria" });
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

      // Get complete plan accommodations with available rooms
      const accommodations = await storage.getAvailableAccommodations(checkInDate, checkOutDate);
      
      // Get basic plan accommodations (free - just listing info, no rooms)
      const basicAccommodations = await storage.getBasicAccommodations();
      
      return res.json({ 
        accommodations, 
        basicAccommodations,
        checkIn: checkInDate, 
        checkOut: checkOutDate 
      });
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

  app.post("/api/accommodations/:accommodationId/reviews", async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const validationResult = createAccommodationReviewSchema.safeParse({
        ...req.body,
        accommodationId,
      });
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).message;
        return res.status(400).json({ error: errorMessage });
      }
      const review = await storage.createAccommodationReview(validationResult.data);
      return res.status(201).json({ review });
    } catch (error) {
      console.error("Create accommodation review error:", error);
      return res.status(500).json({ error: "Erro ao criar avaliacao" });
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

  // =====================
  // NOTIFICATION ROUTES
  // =====================

  // Admin: Get all notifications
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      const notifications = await storage.getAllNotifications();
      return res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ error: "Erro ao buscar notificacoes" });
    }
  });

  // Admin: Create notification
  app.post("/api/admin/notifications", async (req, res) => {
    try {
      const validationResult = createNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const notification = await storage.createNotification(validationResult.data);
      return res.status(201).json({ notification });
    } catch (error) {
      console.error("Create notification error:", error);
      return res.status(500).json({ error: "Erro ao criar notificacao" });
    }
  });

  // Admin: Update notification
  app.put("/api/admin/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateNotificationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const notification = await storage.updateNotification(id, validationResult.data);
      if (!notification) {
        return res.status(404).json({ error: "Notificacao nao encontrada" });
      }
      return res.json({ notification });
    } catch (error) {
      console.error("Update notification error:", error);
      return res.status(500).json({ error: "Erro ao atualizar notificacao" });
    }
  });

  // Admin: Delete notification
  app.delete("/api/admin/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNotification(id);
      if (!deleted) {
        return res.status(404).json({ error: "Notificacao nao encontrada" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json({ error: "Erro ao deletar notificacao" });
    }
  });

  // Admin: Send notification (broadcast to all users)
  app.post("/api/admin/notifications/:id/send", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.getNotificationById(id);
      if (!notification) {
        return res.status(404).json({ error: "Notificacao nao encontrada" });
      }

      // Broadcast to all users (internal notifications)
      const count = await storage.broadcastNotification(notification);

      // Mark as sent
      await storage.markNotificationSent(id);

      // Send push notifications using Expo push notification service
      const pushDevices = await storage.getAllPushDevices();
      let pushSent = 0;
      let pushErrors = 0;

      if (pushDevices.length > 0) {
        const messages = pushDevices.map((device) => ({
          to: device.pushToken,
          sound: "default" as const,
          title: notification.title,
          body: notification.body,
          data: {
            notificationId: notification.id,
            type: notification.type,
            actionType: notification.actionType,
            actionData: notification.actionData,
          },
        }));

        // Send in chunks of 100 (Expo limit)
        const chunks = [];
        for (let i = 0; i < messages.length; i += 100) {
          chunks.push(messages.slice(i, i + 100));
        }

        for (const chunk of chunks) {
          try {
            const response = await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                "Accept": "application/json",
                "Accept-Encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(chunk),
            });

            const result = await response.json();
            if (result.data) {
              for (const ticket of result.data) {
                if (ticket.status === "ok") {
                  pushSent++;
                } else {
                  pushErrors++;
                  console.error("Push error:", ticket.message);
                }
              }
            }
          } catch (pushError) {
            console.error("Expo push API error:", pushError);
            pushErrors += chunk.length;
          }
        }
      }

      return res.json({ 
        success: true, 
        userCount: count, 
        pushSent,
        pushErrors,
        message: `Notificacao enviada para ${count} usuarios. Push: ${pushSent} enviados, ${pushErrors} erros.` 
      });
    } catch (error) {
      console.error("Send notification error:", error);
      return res.status(500).json({ error: "Erro ao enviar notificacao" });
    }
  });

  // Admin: Get notification stats
  app.get("/api/admin/notifications/stats", async (req, res) => {
    try {
      const notificationsCount = await storage.getNotificationsCount();
      const devicesCount = await storage.getPushDevicesCount();
      const usersCount = await storage.getUsersCount();
      return res.json({ notificationsCount, devicesCount, usersCount });
    } catch (error) {
      console.error("Get notification stats error:", error);
      return res.status(500).json({ error: "Erro ao buscar estatisticas" });
    }
  });

  // User: Get my notifications (inbox)
  app.get("/api/user/:userId/notifications", async (req, res) => {
    try {
      const { userId } = req.params;
      const notifications = await storage.getUserNotifications(userId);
      const unreadCount = await storage.getUnreadUserNotificationsCount(userId);
      return res.json({ notifications, unreadCount });
    } catch (error) {
      console.error("Get user notifications error:", error);
      return res.status(500).json({ error: "Erro ao buscar notificacoes" });
    }
  });

  // User: Get unread notifications count
  app.get("/api/user/:userId/notifications/unread-count", async (req, res) => {
    try {
      const { userId } = req.params;
      const count = await storage.getUnreadUserNotificationsCount(userId);
      return res.json({ count });
    } catch (error) {
      console.error("Get unread count error:", error);
      return res.status(500).json({ error: "Erro ao buscar contador" });
    }
  });

  // User: Mark notification as read
  app.put("/api/user/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await storage.markUserNotificationRead(id);
      if (!notification) {
        return res.status(404).json({ error: "Notificacao nao encontrada" });
      }
      return res.json({ notification });
    } catch (error) {
      console.error("Mark notification read error:", error);
      return res.status(500).json({ error: "Erro ao marcar como lida" });
    }
  });

  // User: Mark all notifications as read
  app.put("/api/user/:userId/notifications/read-all", async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.markAllUserNotificationsRead(userId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Mark all read error:", error);
      return res.status(500).json({ error: "Erro ao marcar todas como lidas" });
    }
  });

  // User: Delete notification from inbox
  app.delete("/api/user/notifications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUserNotification(id);
      if (!deleted) {
        return res.status(404).json({ error: "Notificacao nao encontrada" });
      }
      return res.json({ success: true });
    } catch (error) {
      console.error("Delete user notification error:", error);
      return res.status(500).json({ error: "Erro ao deletar notificacao" });
    }
  });

  // Push Device Registration
  app.post("/api/push/register", async (req, res) => {
    try {
      const validationResult = registerPushDeviceSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const device = await storage.registerPushDevice(validationResult.data);
      return res.status(201).json({ device });
    } catch (error) {
      console.error("Register push device error:", error);
      return res.status(500).json({ error: "Erro ao registrar dispositivo" });
    }
  });

  // Push Device Unregister
  app.delete("/api/push/unregister", async (req, res) => {
    try {
      const { pushToken } = req.body;
      if (!pushToken) {
        return res.status(400).json({ error: "Token obrigatorio" });
      }

      await storage.deletePushDevice(pushToken);
      return res.json({ success: true });
    } catch (error) {
      console.error("Unregister push device error:", error);
      return res.status(500).json({ error: "Erro ao remover dispositivo" });
    }
  });

  // User: Get notification preferences
  app.get("/api/user/:userId/notification-preferences", async (req, res) => {
    try {
      const { userId } = req.params;
      let preferences = await storage.getUserNotificationPreferences(userId);
      if (!preferences) {
        // Return default preferences
        preferences = {
          id: "",
          userId,
          pushEnabled: true,
          newsNotifications: true,
          accommodationNotifications: true,
          tipNotifications: true,
          routeNotifications: true,
          promoNotifications: true,
          updatedAt: new Date(),
        };
      }
      return res.json({ preferences });
    } catch (error) {
      console.error("Get notification preferences error:", error);
      return res.status(500).json({ error: "Erro ao buscar preferencias" });
    }
  });

  // User: Update notification preferences
  app.put("/api/user/:userId/notification-preferences", async (req, res) => {
    try {
      const { userId } = req.params;
      const validationResult = updateNotificationPreferencesSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const preferences = await storage.createOrUpdateNotificationPreferences(userId, validationResult.data);
      return res.json({ preferences });
    } catch (error) {
      console.error("Update notification preferences error:", error);
      return res.status(500).json({ error: "Erro ao atualizar preferencias" });
    }
  });

  // Activity Log (for smart suggestions)
  app.post("/api/activity", async (req, res) => {
    try {
      const validationResult = createActivityLogSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const log = await storage.createActivityLog(validationResult.data);
      return res.status(201).json({ log });
    } catch (error) {
      console.error("Create activity log error:", error);
      return res.status(500).json({ error: "Erro ao registrar atividade" });
    }
  });

  // Smart Suggestions based on user activity
  app.get("/api/user/:userId/suggestions", async (req, res) => {
    try {
      const { userId } = req.params;
      const suggestions: any[] = [];

      // Get recent activity
      const recentAccommodationViews = await storage.getRecentActivityByType(userId, "view_accommodation");
      const recentRouteViews = await storage.getRecentActivityByType(userId, "view_route");

      // If user viewed accommodations, suggest tips
      if (recentAccommodationViews.length > 0) {
        const tips = await storage.getAllPilgrimTips(true);
        if (tips.length > 0) {
          suggestions.push({
            type: "tip",
            title: "Dicas para sua hospedagem",
            body: "Veja nossas dicas para aproveitar melhor sua estadia em Trindade",
            actionType: "navigate",
            actionData: JSON.stringify({ screen: "DicasRomeiro" }),
          });
        }
      }

      // If user viewed routes, suggest accommodations
      if (recentRouteViews.length > 0) {
        const accommodations = await storage.getAllAccommodations(true);
        if (accommodations.length > 0) {
          suggestions.push({
            type: "accommodation",
            title: "Onde se hospedar?",
            body: "Encontre as melhores opcoes de hospedagem em Trindade",
            actionType: "navigate",
            actionData: JSON.stringify({ screen: "Hospedagem" }),
          });
        }
      }

      // Always suggest news if there are recent ones
      const news = await storage.getAllNews(true);
      if (news.length > 0) {
        suggestions.push({
          type: "news",
          title: "Fique por dentro!",
          body: "Confira as ultimas noticias do Santuario",
          actionType: "navigate",
          actionData: JSON.stringify({ screen: "Noticias" }),
        });
      }

      return res.json({ suggestions: suggestions.slice(0, 3) }); // Max 3 suggestions
    } catch (error) {
      console.error("Get suggestions error:", error);
      return res.status(500).json({ error: "Erro ao buscar sugestoes" });
    }
  });

  // Analytics API - Record events from mobile app
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const validationResult = createAnalyticsEventSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const event = await storage.createAnalyticsEvent(validationResult.data);
      return res.status(201).json({ event });
    } catch (error) {
      console.error("Create analytics event error:", error);
      return res.status(500).json({ error: "Erro ao registrar evento" });
    }
  });

  // Analytics API - Get summary for dashboard
  app.get("/admin/api/analytics/summary", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const summary = await storage.getAnalyticsSummary(days);
      return res.json(summary);
    } catch (error) {
      console.error("Get analytics summary error:", error);
      return res.status(500).json({ error: "Erro ao buscar resumo" });
    }
  });

  // Analytics API - Get top performing entities
  app.get("/admin/api/analytics/top/:entityType", async (req, res) => {
    try {
      const { entityType } = req.params;
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 10;
      const topEntities = await storage.getTopEntities(entityType, days, limit);
      return res.json({ entities: topEntities });
    } catch (error) {
      console.error("Get top entities error:", error);
      return res.status(500).json({ error: "Erro ao buscar top entidades" });
    }
  });

  // Analytics API - Get events by day for chart
  app.get("/admin/api/analytics/timeline", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const timeline = await storage.getEventsByDay(days);
      return res.json({ timeline });
    } catch (error) {
      console.error("Get analytics timeline error:", error);
      return res.status(500).json({ error: "Erro ao buscar timeline" });
    }
  });

  // Analytics API - Get recent events
  app.get("/admin/api/analytics/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const events = await storage.getRecentEvents(limit);
      return res.json({ events });
    } catch (error) {
      console.error("Get recent events error:", error);
      return res.status(500).json({ error: "Erro ao buscar eventos recentes" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
