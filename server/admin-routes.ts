import type { Express, Request, Response, NextFunction } from "express";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import multer from "multer";
import { storage } from "./storage";
import { createNewsSchema, updateNewsSchema, createVideoSchema, updateVideoSchema, createAttractionSchema, updateAttractionSchema, createUsefulPhoneSchema, updateUsefulPhoneSchema, createPilgrimTipSchema, updatePilgrimTipSchema, createServiceSchema, updateServiceSchema, createBusinessSchema, updateBusinessSchema, createAccommodationSchema, updateAccommodationSchema, createRoomSchema, updateRoomSchema, createRoomBlockedDateSchema, createPartnerSchema, updatePartnerSchema, createBannerSchema, updateBannerSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";
import { updatesHub } from "./updates-hub";

const uploadsDir = path.join(process.cwd(), "server", "uploads", "empresas");
const uploadsHospedagensDir = path.join(process.cwd(), "server", "uploads", "hospedagens");
const uploadsQuartosDir = path.join(process.cwd(), "server", "uploads", "quartos");
const uploadsParceirosDir = path.join(process.cwd(), "server", "uploads", "parceiros");
const uploadsBannersDir = path.join(process.cwd(), "server", "uploads", "banners");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(uploadsHospedagensDir)) {
  fs.mkdirSync(uploadsHospedagensDir, { recursive: true });
}
if (!fs.existsSync(uploadsQuartosDir)) {
  fs.mkdirSync(uploadsQuartosDir, { recursive: true });
}
if (!fs.existsSync(uploadsParceirosDir)) {
  fs.mkdirSync(uploadsParceirosDir, { recursive: true });
}
if (!fs.existsSync(uploadsBannersDir)) {
  fs.mkdirSync(uploadsBannersDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const hospedagensStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsHospedagensDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const quartosStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsQuartosDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const imageFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo nao permitido. Use JPEG, PNG, GIF ou WebP."));
  }
};

const upload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadHospedagens = multer({
  storage: hospedagensStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadQuartos = multer({
  storage: quartosStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const parceirosStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsParceirosDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const bannersStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsBannersDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const uploadParceiros = multer({
  storage: parceirosStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const uploadBanners = multer({
  storage: bannersStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const isProduction = process.env.NODE_ENV === "production";
const isAdminConfigured = ADMIN_EMAIL && ADMIN_PASSWORD;

const adminSessions: Map<string, { email: string; expiresAt: Date }> = new Map();

function hashPassword(password: string): string {
  const salt = "admin_portal_romeiro_salt_2024";
  const hash = pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
  return hash;
}

function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const expectedHash = hashPassword(ADMIN_PASSWORD);
  const providedHash = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(providedHash, "hex"));
  } catch {
    return false;
  }
}

function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

function getSessionFromCookie(req: Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  return cookies["admin_session"] || null;
}

function isAuthenticated(req: Request): boolean {
  const sessionToken = getSessionFromCookie(req);
  if (!sessionToken) return false;
  
  const session = adminSessions.get(sessionToken);
  if (!session) return false;
  
  if (new Date() > session.expiresAt) {
    adminSessions.delete(sessionToken);
    return false;
  }
  
  return true;
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!isAuthenticated(req)) {
    if (req.path.startsWith("/admin/api/")) {
      return res.status(401).json({ error: "Nao autorizado" });
    }
    return res.redirect("/admin");
  }
  next();
}

export function registerAdminRoutes(app: Express) {
  const express = require("express");
  app.use("/uploads/empresas", express.static(uploadsDir));

  app.post("/admin/api/upload/image", requireAuth, upload.single("image"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const imageUrl = `/uploads/empresas/${req.file.filename}`;
      res.json({ success: true, url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  app.post("/admin/api/upload/images", requireAuth, upload.array("images", 10), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const urls = files.map((file) => `/uploads/empresas/${file.filename}`);
      res.json({ success: true, urls });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload das imagens" });
    }
  });

  app.delete("/admin/api/upload/image", requireAuth, (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL da imagem nao fornecida" });
      }
      const filename = url.split("/").pop();
      if (filename) {
        const filePath = path.join(uploadsDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      res.status(500).json({ error: "Erro ao deletar imagem" });
    }
  });

  // Upload endpoints for hospedagens
  app.use("/uploads/hospedagens", express.static(uploadsHospedagensDir));

  app.post("/admin/api/hospedagens/upload/image", requireAuth, uploadHospedagens.single("image"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const imageUrl = `/uploads/hospedagens/${req.file.filename}`;
      res.json({ success: true, url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  app.post("/admin/api/hospedagens/upload/images", requireAuth, uploadHospedagens.array("images", 10), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const urls = files.map((file) => `/uploads/hospedagens/${file.filename}`);
      res.json({ success: true, urls });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload das imagens" });
    }
  });

  app.delete("/admin/api/hospedagens/upload/image", requireAuth, (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL da imagem nao fornecida" });
      }
      const filename = url.split("/").pop();
      if (filename) {
        const filePath = path.join(uploadsHospedagensDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      res.status(500).json({ error: "Erro ao deletar imagem" });
    }
  });

  // Upload endpoints for quartos
  app.use("/uploads/quartos", express.static(uploadsQuartosDir));

  app.post("/admin/api/quartos/upload/image", requireAuth, uploadQuartos.single("image"), (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const imageUrl = `/uploads/quartos/${req.file.filename}`;
      res.json({ success: true, url: imageUrl, filename: req.file.filename });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload da imagem" });
    }
  });

  app.post("/admin/api/quartos/upload/images", requireAuth, uploadQuartos.array("images", 10), (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhuma imagem enviada" });
      }
      const urls = files.map((file) => `/uploads/quartos/${file.filename}`);
      res.json({ success: true, urls });
    } catch (error) {
      console.error("Erro no upload:", error);
      res.status(500).json({ error: "Erro ao fazer upload das imagens" });
    }
  });

  app.delete("/admin/api/quartos/upload/image", requireAuth, (req: Request, res: Response) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL da imagem nao fornecida" });
      }
      const filename = url.split("/").pop();
      if (filename) {
        const filePath = path.join(uploadsQuartosDir, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar imagem:", error);
      res.status(500).json({ error: "Erro ao deletar imagem" });
    }
  });

  app.get("/admin", (req, res) => {
    if (isAuthenticated(req)) {
      return res.redirect("/admin/dashboard");
    }
    const loginPath = path.join(__dirname, "admin", "login.html");
    res.sendFile(loginPath);
  });

  app.get("/admin/dashboard", requireAuth, (req, res) => {
    const dashboardPath = path.join(__dirname, "admin", "dashboard.html");
    res.sendFile(dashboardPath);
  });

  app.get("/admin/noticias", requireAuth, (req, res) => {
    const noticiasPath = path.join(__dirname, "admin", "noticias.html");
    res.sendFile(noticiasPath);
  });

  app.get("/admin/notificacoes", requireAuth, (req, res) => {
    const notificacoesPath = path.join(__dirname, "admin", "notificacoes.html");
    res.sendFile(notificacoesPath);
  });

  app.get("/admin/noticias/nova", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "noticias-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/noticias/editar/:id", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "noticias-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/videos", requireAuth, (req, res) => {
    const videosPath = path.join(__dirname, "admin", "videos.html");
    res.sendFile(videosPath);
  });

  app.get("/admin/videos/novo", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "videos-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/videos/editar/:id", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "videos-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/hospedagens", requireAuth, (req, res) => {
    const filePath = path.join(__dirname, "admin", "hospedagens.html");
    res.sendFile(filePath);
  });

  app.get("/admin/hospedagens/nova", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "hospedagens-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/hospedagens/editar/:id", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "hospedagens-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/hospedagens/:id/quartos", requireAuth, (req, res) => {
    const quartosPath = path.join(__dirname, "admin", "hospedagens-quartos.html");
    res.sendFile(quartosPath);
  });

  app.get("/admin/hospedagens/:id/reviews", requireAuth, (req, res) => {
    const reviewsPath = path.join(__dirname, "admin", "hospedagens-reviews.html");
    res.sendFile(reviewsPath);
  });

  app.get("/admin/eventos", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Eventos", "Gerencie os eventos"));
  });

  app.get("/admin/oracoes", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Oracoes", "Gerencie as oracoes"));
  });

  app.get("/admin/pontos-turisticos", requireAuth, (req, res) => {
    const filePath = path.join(__dirname, "admin", "pontos-turisticos.html");
    res.sendFile(filePath);
  });

  app.get("/admin/pontos-turisticos/novo", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "pontos-turisticos-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/pontos-turisticos/editar/:id", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "pontos-turisticos-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/paginas", requireAuth, (req, res) => {
    const paginasPath = path.join(__dirname, "admin", "paginas.html");
    res.sendFile(paginasPath);
  });

  app.get("/admin/usuarios", requireAuth, (req, res) => {
    const usuariosPath = path.join(__dirname, "admin", "usuarios.html");
    res.sendFile(usuariosPath);
  });

  app.get("/admin/telefones", requireAuth, (req, res) => {
    const telefonesPath = path.join(__dirname, "admin", "telefones.html");
    res.sendFile(telefonesPath);
  });

  app.get("/admin/dicas", requireAuth, (req, res) => {
    const dicasPath = path.join(__dirname, "admin", "dicas.html");
    res.sendFile(dicasPath);
  });

  app.get("/admin/servicos", requireAuth, (req, res) => {
    const servicosPath = path.join(__dirname, "admin", "servicos.html");
    res.sendFile(servicosPath);
  });

  app.get("/admin/empresas", requireAuth, (req, res) => {
    const empresasPath = path.join(__dirname, "admin", "empresas.html");
    res.sendFile(empresasPath);
  });

  app.get("/admin/empresas/nova", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "empresas-form.html");
    res.sendFile(formPath);
  });

  app.get("/admin/empresas/editar/:id", requireAuth, (req, res) => {
    const formPath = path.join(__dirname, "admin", "empresas-form.html");
    res.sendFile(formPath);
  });

  app.post("/admin/api/login", async (req, res) => {
    try {
      if (!isAdminConfigured) {
        return res.status(503).json({ error: "Painel administrativo nao configurado. Configure ADMIN_EMAIL e ADMIN_PASSWORD nas variaveis de ambiente." });
      }

      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha sao obrigatorios" });
      }
      
      if (email.toLowerCase() !== ADMIN_EMAIL!.toLowerCase() || !verifyAdminPassword(password)) {
        return res.status(401).json({ error: "Credenciais invalidas" });
      }
      
      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      adminSessions.set(sessionToken, { email, expiresAt });
      
      const secureCookie = isProduction ? "; Secure" : "";
      res.setHeader("Set-Cookie", `admin_session=${sessionToken}; Path=/admin; HttpOnly; SameSite=Strict${secureCookie}; Max-Age=86400`);
      
      return res.json({ success: true, message: "Login realizado com sucesso" });
    } catch (error) {
      console.error("Admin login error:", error);
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  app.post("/admin/api/logout", (req, res) => {
    const sessionToken = getSessionFromCookie(req);
    if (sessionToken) {
      adminSessions.delete(sessionToken);
    }
    const secureCookie = isProduction ? "; Secure" : "";
    res.setHeader("Set-Cookie", `admin_session=; Path=/admin; HttpOnly${secureCookie}; Max-Age=0`);
    return res.json({ success: true });
  });

  app.get("/admin/api/stats", requireAuth, async (req, res) => {
    try {
      const usersCount = await storage.getUsersCount();
      const newsCount = await storage.getNewsCount();
      const videosCount = await storage.getVideosCount();
      
      return res.json({
        users: usersCount,
        news: newsCount,
        videos: videosCount,
        hotels: 0,
        events: 0,
      });
    } catch (error) {
      console.error("Stats error:", error);
      return res.status(500).json({ error: "Erro ao carregar estatisticas" });
    }
  });

  // News CRUD API
  app.get("/admin/api/news", requireAuth, async (req, res) => {
    try {
      const allNews = await storage.getAllNews(false);
      return res.json({ news: allNews });
    } catch (error) {
      console.error("Admin get news error:", error);
      return res.status(500).json({ error: "Erro ao buscar noticias" });
    }
  });

  app.get("/admin/api/news/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const newsItem = await storage.getNewsById(id);
      
      if (!newsItem) {
        return res.status(404).json({ error: "Noticia nao encontrada" });
      }

      return res.json({ news: newsItem });
    } catch (error) {
      console.error("Admin get news item error:", error);
      return res.status(500).json({ error: "Erro ao buscar noticia" });
    }
  });

  app.post("/admin/api/news", requireAuth, async (req, res) => {
    try {
      const validationResult = createNewsSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const newsData = validationResult.data;
      const created = await storage.createNews(newsData);
      updatesHub.broadcast("news");
      return res.status(201).json({ news: created, message: "Noticia criada com sucesso!" });
    } catch (error) {
      console.error("Admin create news error:", error);
      return res.status(500).json({ error: "Erro ao criar noticia" });
    }
  });

  app.put("/admin/api/news/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateNewsSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const newsData = validationResult.data;
      const updated = await storage.updateNews(id, newsData);
      
      if (!updated) {
        return res.status(404).json({ error: "Noticia nao encontrada" });
      }
      updatesHub.broadcast("news");
      return res.json({ news: updated, message: "Noticia atualizada com sucesso!" });
    } catch (error) {
      console.error("Admin update news error:", error);
      return res.status(500).json({ error: "Erro ao atualizar noticia" });
    }
  });

  app.delete("/admin/api/news/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNews(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Noticia nao encontrada" });
      }
      updatesHub.broadcast("news");
      return res.json({ message: "Noticia excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete news error:", error);
      return res.status(500).json({ error: "Erro ao excluir noticia" });
    }
  });

  // Videos CRUD API
  app.get("/admin/api/videos", requireAuth, async (req, res) => {
    try {
      const allVideos = await storage.getAllVideos(false);
      return res.json({ videos: allVideos });
    } catch (error) {
      console.error("Admin get videos error:", error);
      return res.status(500).json({ error: "Erro ao buscar videos" });
    }
  });

  app.get("/admin/api/videos/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const video = await storage.getVideoById(id);
      
      if (!video) {
        return res.status(404).json({ error: "Video nao encontrado" });
      }

      return res.json({ video });
    } catch (error) {
      console.error("Admin get video error:", error);
      return res.status(500).json({ error: "Erro ao buscar video" });
    }
  });

  app.post("/admin/api/videos", requireAuth, async (req, res) => {
    try {
      const validationResult = createVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const videoData = validationResult.data;
      const created = await storage.createVideo(videoData);
      updatesHub.broadcast("videos");
      return res.status(201).json({ video: created, message: "Video criado com sucesso!" });
    } catch (error) {
      console.error("Admin create video error:", error);
      return res.status(500).json({ error: "Erro ao criar video" });
    }
  });

  app.put("/admin/api/videos/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const videoData = validationResult.data;
      const updated = await storage.updateVideo(id, videoData);
      
      if (!updated) {
        return res.status(404).json({ error: "Video nao encontrado" });
      }
      updatesHub.broadcast("videos");
      return res.json({ video: updated, message: "Video atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update video error:", error);
      return res.status(500).json({ error: "Erro ao atualizar video" });
    }
  });

  app.delete("/admin/api/videos/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteVideo(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Video nao encontrado" });
      }
      updatesHub.broadcast("videos");
      return res.json({ message: "Video excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete video error:", error);
      return res.status(500).json({ error: "Erro ao excluir video" });
    }
  });

  // Attractions CRUD API
  app.get("/admin/api/attractions", requireAuth, async (req, res) => {
    try {
      const allAttractions = await storage.getAllAttractions(false);
      return res.json({ attractions: allAttractions });
    } catch (error) {
      console.error("Admin get attractions error:", error);
      return res.status(500).json({ error: "Erro ao buscar pontos turisticos" });
    }
  });

  app.get("/admin/api/attractions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const attraction = await storage.getAttractionById(id);
      
      if (!attraction) {
        return res.status(404).json({ error: "Ponto turistico nao encontrado" });
      }

      return res.json({ attraction });
    } catch (error) {
      console.error("Admin get attraction error:", error);
      return res.status(500).json({ error: "Erro ao buscar ponto turistico" });
    }
  });

  app.post("/admin/api/attractions", requireAuth, async (req, res) => {
    try {
      const validationResult = createAttractionSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const attractionData = validationResult.data;
      const created = await storage.createAttraction(attractionData);
      
      return res.status(201).json({ attraction: created, message: "Ponto turistico criado com sucesso!" });
    } catch (error) {
      console.error("Admin create attraction error:", error);
      return res.status(500).json({ error: "Erro ao criar ponto turistico" });
    }
  });

  app.put("/admin/api/attractions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateAttractionSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }

      const attractionData = validationResult.data;
      const updated = await storage.updateAttraction(id, attractionData);
      
      if (!updated) {
        return res.status(404).json({ error: "Ponto turistico nao encontrado" });
      }

      return res.json({ attraction: updated, message: "Ponto turistico atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update attraction error:", error);
      return res.status(500).json({ error: "Erro ao atualizar ponto turistico" });
    }
  });

  app.delete("/admin/api/attractions/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAttraction(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Ponto turistico nao encontrado" });
      }

      return res.json({ message: "Ponto turistico excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete attraction error:", error);
      return res.status(500).json({ error: "Erro ao excluir ponto turistico" });
    }
  });

  // Users API (list and delete only - users register through the app)
  app.get("/admin/api/users", requireAuth, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      // Remove password from response for security
      const sanitizedUsers = allUsers.map(({ password, ...user }) => user);
      return res.json(sanitizedUsers);
    } catch (error) {
      console.error("Admin get users error:", error);
      return res.status(500).json({ error: "Erro ao buscar usuarios" });
    }
  });

  app.get("/admin/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: "Usuario nao encontrado" });
      }

      // Remove password from response
      const { password, ...sanitizedUser } = user;
      return res.json(sanitizedUser);
    } catch (error) {
      console.error("Admin get user error:", error);
      return res.status(500).json({ error: "Erro ao buscar usuario" });
    }
  });

  app.delete("/admin/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUser(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Usuario nao encontrado" });
      }

      return res.json({ message: "Usuario excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete user error:", error);
      return res.status(500).json({ error: "Erro ao excluir usuario" });
    }
  });

  // Useful Phones CRUD API
  app.get("/admin/api/useful-phones", requireAuth, async (req, res) => {
    try {
      const phones = await storage.getAllUsefulPhones();
      return res.json(phones);
    } catch (error) {
      console.error("Admin get useful phones error:", error);
      return res.status(500).json({ error: "Erro ao buscar telefones" });
    }
  });

  app.get("/admin/api/useful-phones/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const phone = await storage.getUsefulPhoneById(id);
      if (!phone) {
        return res.status(404).json({ error: "Telefone nao encontrado" });
      }
      return res.json(phone);
    } catch (error) {
      console.error("Admin get useful phone error:", error);
      return res.status(500).json({ error: "Erro ao buscar telefone" });
    }
  });

  app.post("/admin/api/useful-phones", requireAuth, async (req, res) => {
    try {
      const validationResult = createUsefulPhoneSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createUsefulPhone(validationResult.data);
      updatesHub.broadcast("useful-phones");
      return res.status(201).json({ phone: created, message: "Telefone criado com sucesso!" });
    } catch (error) {
      console.error("Admin create useful phone error:", error);
      return res.status(500).json({ error: "Erro ao criar telefone" });
    }
  });

  app.put("/admin/api/useful-phones/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateUsefulPhoneSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updateUsefulPhone(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Telefone nao encontrado" });
      }
      updatesHub.broadcast("useful-phones");
      return res.json({ phone: updated, message: "Telefone atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update useful phone error:", error);
      return res.status(500).json({ error: "Erro ao atualizar telefone" });
    }
  });

  app.delete("/admin/api/useful-phones/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteUsefulPhone(id);
      if (!deleted) {
        return res.status(404).json({ error: "Telefone nao encontrado" });
      }
      updatesHub.broadcast("useful-phones");
      return res.json({ message: "Telefone excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete useful phone error:", error);
      return res.status(500).json({ error: "Erro ao excluir telefone" });
    }
  });

  // Pilgrim Tips CRUD API
  app.get("/admin/api/pilgrim-tips", requireAuth, async (req, res) => {
    try {
      const tips = await storage.getAllPilgrimTips();
      return res.json(tips);
    } catch (error) {
      console.error("Admin get pilgrim tips error:", error);
      return res.status(500).json({ error: "Erro ao buscar dicas" });
    }
  });

  app.get("/admin/api/pilgrim-tips/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const tip = await storage.getPilgrimTipById(id);
      if (!tip) {
        return res.status(404).json({ error: "Dica nao encontrada" });
      }
      return res.json(tip);
    } catch (error) {
      console.error("Admin get pilgrim tip error:", error);
      return res.status(500).json({ error: "Erro ao buscar dica" });
    }
  });

  app.post("/admin/api/pilgrim-tips", requireAuth, async (req, res) => {
    try {
      const validationResult = createPilgrimTipSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createPilgrimTip(validationResult.data);
      return res.status(201).json({ tip: created, message: "Dica criada com sucesso!" });
    } catch (error) {
      console.error("Admin create pilgrim tip error:", error);
      return res.status(500).json({ error: "Erro ao criar dica" });
    }
  });

  app.put("/admin/api/pilgrim-tips/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updatePilgrimTipSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updatePilgrimTip(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Dica nao encontrada" });
      }
      return res.json({ tip: updated, message: "Dica atualizada com sucesso!" });
    } catch (error) {
      console.error("Admin update pilgrim tip error:", error);
      return res.status(500).json({ error: "Erro ao atualizar dica" });
    }
  });

  app.delete("/admin/api/pilgrim-tips/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePilgrimTip(id);
      if (!deleted) {
        return res.status(404).json({ error: "Dica nao encontrada" });
      }
      return res.json({ message: "Dica excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete pilgrim tip error:", error);
      return res.status(500).json({ error: "Erro ao excluir dica" });
    }
  });

  // Services CRUD API
  app.get("/admin/api/services", requireAuth, async (req, res) => {
    try {
      const servicesList = await storage.getAllServices();
      return res.json(servicesList);
    } catch (error) {
      console.error("Admin get services error:", error);
      return res.status(500).json({ error: "Erro ao buscar servicos" });
    }
  });

  app.get("/admin/api/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const service = await storage.getServiceById(id);
      if (!service) {
        return res.status(404).json({ error: "Servico nao encontrado" });
      }
      return res.json(service);
    } catch (error) {
      console.error("Admin get service error:", error);
      return res.status(500).json({ error: "Erro ao buscar servico" });
    }
  });

  app.post("/admin/api/services", requireAuth, async (req, res) => {
    try {
      const validationResult = createServiceSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createService(validationResult.data);
      return res.status(201).json({ service: created, message: "Servico criado com sucesso!" });
    } catch (error) {
      console.error("Admin create service error:", error);
      return res.status(500).json({ error: "Erro ao criar servico" });
    }
  });

  app.put("/admin/api/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateServiceSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updateService(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Servico nao encontrado" });
      }
      return res.json({ service: updated, message: "Servico atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update service error:", error);
      return res.status(500).json({ error: "Erro ao atualizar servico" });
    }
  });

  app.delete("/admin/api/services/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteService(id);
      if (!deleted) {
        return res.status(404).json({ error: "Servico nao encontrado" });
      }
      return res.json({ message: "Servico excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete service error:", error);
      return res.status(500).json({ error: "Erro ao excluir servico" });
    }
  });

  // Empresas (Guia Comercial) API
  app.get("/admin/api/businesses", requireAuth, async (req, res) => {
    try {
      const businesses = await storage.getAllBusinesses();
      return res.json({ businesses });
    } catch (error) {
      console.error("Admin get businesses error:", error);
      return res.status(500).json({ error: "Erro ao buscar empresas" });
    }
  });

  app.get("/admin/api/businesses/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const business = await storage.getBusinessById(id);
      if (!business) {
        return res.status(404).json({ error: "Empresa nao encontrada" });
      }
      return res.json({ business });
    } catch (error) {
      console.error("Admin get business error:", error);
      return res.status(500).json({ error: "Erro ao buscar empresa" });
    }
  });

  app.post("/admin/api/businesses", requireAuth, async (req, res) => {
    try {
      const validationResult = createBusinessSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createBusiness(validationResult.data);
      return res.status(201).json({ business: created, message: "Empresa criada com sucesso!" });
    } catch (error) {
      console.error("Admin create business error:", error);
      return res.status(500).json({ error: "Erro ao criar empresa" });
    }
  });

  app.put("/admin/api/businesses/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateBusinessSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updateBusiness(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Empresa nao encontrada" });
      }
      return res.json({ business: updated, message: "Empresa atualizada com sucesso!" });
    } catch (error) {
      console.error("Admin update business error:", error);
      return res.status(500).json({ error: "Erro ao atualizar empresa" });
    }
  });

  app.delete("/admin/api/businesses/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBusiness(id);
      if (!deleted) {
        return res.status(404).json({ error: "Empresa nao encontrada" });
      }
      return res.json({ message: "Empresa excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete business error:", error);
      return res.status(500).json({ error: "Erro ao excluir empresa" });
    }
  });

  app.get("/admin/api/businesses/:id/reviews", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getBusinessReviews(id);
      return res.json({ reviews });
    } catch (error) {
      console.error("Admin get reviews error:", error);
      return res.status(500).json({ error: "Erro ao buscar avaliacoes" });
    }
  });

  app.delete("/admin/api/businesses/:businessId/reviews/:reviewId", requireAuth, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const deleted = await storage.deleteBusinessReview(reviewId);
      if (!deleted) {
        return res.status(404).json({ error: "Avaliacao nao encontrada" });
      }
      return res.json({ message: "Avaliacao excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete review error:", error);
      return res.status(500).json({ error: "Erro ao excluir avaliacao" });
    }
  });

  app.get("/admin/empresas/:id/reviews", requireAuth, (_req, res) => {
    const adminDir = path.join(process.cwd(), "server", "admin");
    res.sendFile(path.join(adminDir, "empresas-reviews.html"));
  });

  // Hospedagens (Accommodations) API
  app.get("/admin/api/accommodations", requireAuth, async (req, res) => {
    try {
      const accommodations = await storage.getAllAccommodations();
      return res.json({ accommodations });
    } catch (error) {
      console.error("Admin get accommodations error:", error);
      return res.status(500).json({ error: "Erro ao buscar hospedagens" });
    }
  });

  app.get("/admin/api/accommodations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const accommodation = await storage.getAccommodationById(id);
      if (!accommodation) {
        return res.status(404).json({ error: "Hospedagem nao encontrada" });
      }
      return res.json({ accommodation });
    } catch (error) {
      console.error("Admin get accommodation error:", error);
      return res.status(500).json({ error: "Erro ao buscar hospedagem" });
    }
  });

  app.post("/admin/api/accommodations", requireAuth, async (req, res) => {
    try {
      const validationResult = createAccommodationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createAccommodation(validationResult.data);
      return res.status(201).json({ accommodation: created, message: "Hospedagem criada com sucesso!" });
    } catch (error) {
      console.error("Admin create accommodation error:", error);
      return res.status(500).json({ error: "Erro ao criar hospedagem" });
    }
  });

  app.put("/admin/api/accommodations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateAccommodationSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updateAccommodation(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Hospedagem nao encontrada" });
      }
      return res.json({ accommodation: updated, message: "Hospedagem atualizada com sucesso!" });
    } catch (error) {
      console.error("Admin update accommodation error:", error);
      return res.status(500).json({ error: "Erro ao atualizar hospedagem" });
    }
  });

  app.delete("/admin/api/accommodations/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAccommodation(id);
      if (!deleted) {
        return res.status(404).json({ error: "Hospedagem nao encontrada" });
      }
      return res.json({ message: "Hospedagem excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete accommodation error:", error);
      return res.status(500).json({ error: "Erro ao excluir hospedagem" });
    }
  });

  // Rooms API
  app.get("/admin/api/accommodations/:accommodationId/rooms", requireAuth, async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const rooms = await storage.getRoomsByAccommodation(accommodationId);
      return res.json({ rooms });
    } catch (error) {
      console.error("Admin get rooms error:", error);
      return res.status(500).json({ error: "Erro ao buscar quartos" });
    }
  });

  app.get("/admin/api/rooms/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const room = await storage.getRoomById(id);
      if (!room) {
        return res.status(404).json({ error: "Quarto nao encontrado" });
      }
      return res.json({ room });
    } catch (error) {
      console.error("Admin get room error:", error);
      return res.status(500).json({ error: "Erro ao buscar quarto" });
    }
  });

  app.post("/admin/api/accommodations/:accommodationId/rooms", requireAuth, async (req, res) => {
    try {
      const { accommodationId } = req.params;
      const validationResult = createRoomSchema.safeParse({
        ...req.body,
        accommodationId,
      });
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.createRoom(validationResult.data);
      return res.status(201).json({ room: created, message: "Quarto criado com sucesso!" });
    } catch (error) {
      console.error("Admin create room error:", error);
      return res.status(500).json({ error: "Erro ao criar quarto" });
    }
  });

  app.put("/admin/api/rooms/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateRoomSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const updated = await storage.updateRoom(id, validationResult.data);
      if (!updated) {
        return res.status(404).json({ error: "Quarto nao encontrado" });
      }
      return res.json({ room: updated, message: "Quarto atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update room error:", error);
      return res.status(500).json({ error: "Erro ao atualizar quarto" });
    }
  });

  app.delete("/admin/api/rooms/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRoom(id);
      if (!deleted) {
        return res.status(404).json({ error: "Quarto nao encontrado" });
      }
      return res.json({ message: "Quarto excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete room error:", error);
      return res.status(500).json({ error: "Erro ao excluir quarto" });
    }
  });

  // Room Blocked Dates API
  app.get("/admin/api/rooms/:roomId/blocked-dates", requireAuth, async (req, res) => {
    try {
      const { roomId } = req.params;
      const blockedDates = await storage.getAllBlockedDatesForRoom(roomId);
      return res.json({ blockedDates });
    } catch (error) {
      console.error("Admin get blocked dates error:", error);
      return res.status(500).json({ error: "Erro ao buscar datas bloqueadas" });
    }
  });

  app.post("/admin/api/rooms/:roomId/blocked-dates", requireAuth, async (req, res) => {
    try {
      const { roomId } = req.params;
      const validationResult = createRoomBlockedDateSchema.safeParse({
        ...req.body,
        roomId,
      });
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const created = await storage.blockRoomDate(validationResult.data);
      return res.status(201).json({ blockedDate: created, message: "Data bloqueada com sucesso!" });
    } catch (error) {
      console.error("Admin block date error:", error);
      return res.status(500).json({ error: "Erro ao bloquear data" });
    }
  });

  app.delete("/admin/api/rooms/:roomId/blocked-dates/:date", requireAuth, async (req, res) => {
    try {
      const { roomId, date } = req.params;
      const deleted = await storage.unblockRoomDate(roomId, date);
      if (!deleted) {
        return res.status(404).json({ error: "Data bloqueada nao encontrada" });
      }
      return res.json({ message: "Data desbloqueada com sucesso!" });
    } catch (error) {
      console.error("Admin unblock date error:", error);
      return res.status(500).json({ error: "Erro ao desbloquear data" });
    }
  });

  // Accommodation Reviews API
  app.get("/admin/api/accommodations/:id/reviews", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getAccommodationReviews(id);
      return res.json({ reviews });
    } catch (error) {
      console.error("Admin get accommodation reviews error:", error);
      return res.status(500).json({ error: "Erro ao buscar avaliacoes" });
    }
  });

  app.delete("/admin/api/accommodations/:accommodationId/reviews/:reviewId", requireAuth, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const deleted = await storage.deleteAccommodationReview(reviewId);
      if (!deleted) {
        return res.status(404).json({ error: "Avaliacao nao encontrada" });
      }
      return res.json({ message: "Avaliacao excluida com sucesso!" });
    } catch (error) {
      console.error("Admin delete accommodation review error:", error);
      return res.status(500).json({ error: "Erro ao excluir avaliacao" });
    }
  });

  app.post("/admin/api/accommodations/:accommodationId/reviews/:reviewId/approve", requireAuth, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const review = await storage.approveAccommodationReview(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Avaliacao nao encontrada" });
      }
      return res.json({ review, message: "Avaliacao aprovada com sucesso!" });
    } catch (error) {
      console.error("Admin approve accommodation review error:", error);
      return res.status(500).json({ error: "Erro ao aprovar avaliacao" });
    }
  });

  app.post("/admin/api/businesses/:businessId/reviews/:reviewId/approve", requireAuth, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const review = await storage.approveBusinessReview(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Avaliacao nao encontrada" });
      }
      return res.json({ review, message: "Avaliacao aprovada com sucesso!" });
    } catch (error) {
      console.error("Admin approve business review error:", error);
      return res.status(500).json({ error: "Erro ao aprovar avaliacao" });
    }
  });

  // Partners Admin API
  app.get("/admin/api/partners", requireAuth, async (req, res) => {
    try {
      const partners = await storage.getAllPartners();
      return res.json({ partners });
    } catch (error) {
      console.error("Admin get partners error:", error);
      return res.status(500).json({ error: "Erro ao buscar parceiros" });
    }
  });

  app.post("/admin/api/partners", requireAuth, async (req, res) => {
    try {
      const validationResult = createPartnerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const partner = await storage.createPartner(validationResult.data);
      updatesHub.broadcast("partners");
      return res.status(201).json({ partner, message: "Parceiro criado com sucesso!" });
    } catch (error) {
      console.error("Admin create partner error:", error);
      return res.status(500).json({ error: "Erro ao criar parceiro" });
    }
  });

  app.put("/admin/api/partners/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updatePartnerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const partner = await storage.updatePartner(id, validationResult.data);
      if (!partner) {
        return res.status(404).json({ error: "Parceiro nao encontrado" });
      }
      updatesHub.broadcast("partners");
      return res.json({ partner, message: "Parceiro atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update partner error:", error);
      return res.status(500).json({ error: "Erro ao atualizar parceiro" });
    }
  });

  app.delete("/admin/api/partners/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePartner(id);
      if (!deleted) {
        return res.status(404).json({ error: "Parceiro nao encontrado" });
      }
      updatesHub.broadcast("partners");
      return res.json({ message: "Parceiro excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete partner error:", error);
      return res.status(500).json({ error: "Erro ao excluir parceiro" });
    }
  });

  app.post("/admin/api/parceiros/upload/image", requireAuth, uploadParceiros.single("image"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }
    const imageUrl = `/uploads/parceiros/${req.file.filename}`;
    return res.json({ imageUrl, message: "Imagem enviada com sucesso!" });
  });

  app.delete("/admin/api/parceiros/upload/image", requireAuth, (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL da imagem nao fornecida" });
    }
    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadsParceirosDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.json({ message: "Imagem removida com sucesso!" });
  });

  // Banners Admin API
  app.get("/admin/api/banners", requireAuth, async (req, res) => {
    try {
      const banners = await storage.getAllBanners();
      return res.json({ banners });
    } catch (error) {
      console.error("Admin get banners error:", error);
      return res.status(500).json({ error: "Erro ao buscar banners" });
    }
  });

  app.post("/admin/api/banners", requireAuth, async (req, res) => {
    try {
      const validationResult = createBannerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const banner = await storage.createBanner(validationResult.data);
      updatesHub.broadcast("banners");
      return res.status(201).json({ banner, message: "Banner criado com sucesso!" });
    } catch (error) {
      console.error("Admin create banner error:", error);
      return res.status(500).json({ error: "Erro ao criar banner" });
    }
  });

  app.put("/admin/api/banners/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const validationResult = updateBannerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const errorMessage = fromError(validationResult.error).toString();
        return res.status(400).json({ error: errorMessage });
      }
      const banner = await storage.updateBanner(id, validationResult.data);
      if (!banner) {
        return res.status(404).json({ error: "Banner nao encontrado" });
      }
      updatesHub.broadcast("banners");
      return res.json({ banner, message: "Banner atualizado com sucesso!" });
    } catch (error) {
      console.error("Admin update banner error:", error);
      return res.status(500).json({ error: "Erro ao atualizar banner" });
    }
  });

  app.delete("/admin/api/banners/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBanner(id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner nao encontrado" });
      }
      updatesHub.broadcast("banners");
      return res.json({ message: "Banner excluido com sucesso!" });
    } catch (error) {
      console.error("Admin delete banner error:", error);
      return res.status(500).json({ error: "Erro ao excluir banner" });
    }
  });

  app.post("/admin/api/banners/upload/image", requireAuth, uploadBanners.single("image"), (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem enviada" });
    }
    const imageUrl = `/uploads/banners/${req.file.filename}`;
    return res.json({ imageUrl, message: "Imagem enviada com sucesso!" });
  });

  app.delete("/admin/api/banners/upload/image", requireAuth, (req: Request, res: Response) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ error: "URL da imagem nao fornecida" });
    }
    const filename = path.basename(imageUrl);
    const filePath = path.join(uploadsBannersDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return res.json({ message: "Imagem removida com sucesso!" });
  });

  // Admin pages for partners and banners
  app.get("/admin/parceiros", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "parceiros.html"));
  });

  app.get("/admin/parceiros/novo", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "parceiros-form.html"));
  });

  app.get("/admin/parceiros/editar/:id", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "parceiros-form.html"));
  });

  app.get("/admin/banners", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "banners.html"));
  });

  app.get("/admin/banners/novo", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "banners-form.html"));
  });

  app.get("/admin/banners/editar/:id", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "banners-form.html"));
  });

  // App Settings API
  app.get("/admin/api/settings", requireAuth, async (req, res) => {
    try {
      await storage.initializeDefaultSettings();
      const settings = await storage.getAllAppSettings();
      res.json({ settings });
    } catch (error) {
      res.status(500).json({ error: "Erro ao carregar configuracoes" });
    }
  });

  app.put("/admin/api/settings", requireAuth, async (req, res) => {
    try {
      const { settings } = req.body;
      if (!Array.isArray(settings)) {
        return res.status(400).json({ error: "Formato invalido" });
      }
      for (const setting of settings) {
        await storage.upsertAppSetting({ key: setting.key, value: setting.value });
      }
      const updatedSettings = await storage.getAllAppSettings();
      res.json({ settings: updatedSettings, message: "Configuracoes salvas com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: "Erro ao salvar configuracoes" });
    }
  });

  app.get("/admin/api/settings/:key", requireAuth, async (req, res) => {
    try {
      const setting = await storage.getAppSettingByKey(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Configuracao nao encontrada" });
      }
      res.json({ setting });
    } catch (error) {
      res.status(500).json({ error: "Erro ao carregar configuracao" });
    }
  });

  // Configuracoes page
  app.get("/admin/configuracoes", requireAuth, (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "admin", "configuracoes.html"));
  });

  // ========================================
  // PUBLIC REGISTRATION ROUTES
  // ========================================

  // Public registration page
  app.get("/cadastro", (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "public", "cadastro.html"));
  });

  // Public API - Get settings for pricing display (limited fields)
  app.get("/api/public/settings", async (req, res) => {
    try {
      await storage.initializeDefaultSettings();
      const allSettings = await storage.getAllAppSettings();
      const publicKeys = [
        'plan_business_complete_price',
        'plan_business_complete_duration',
        'plan_accommodation_price',
        'plan_accommodation_duration',
        'app_name',
        'contact_whatsapp',
        'social_facebook',
        'social_instagram',
        'social_youtube'
      ];
      const publicSettings = allSettings.filter(s => publicKeys.includes(s.key));
      res.json({ settings: publicSettings });
    } catch (error) {
      res.status(500).json({ error: "Erro ao carregar configuracoes" });
    }
  });

  // Create uploads directory for public registrations
  const uploadsPublicDir = path.join(process.cwd(), "server", "uploads", "cadastros");
  if (!fs.existsSync(uploadsPublicDir)) {
    fs.mkdirSync(uploadsPublicDir, { recursive: true });
  }

  const publicUploadStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadsPublicDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });

  const publicUpload = multer({
    storage: publicUploadStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
  });

  // Public API - Register business or accommodation
  app.post("/api/public/register", publicUpload.single("logo"), async (req, res) => {
    try {
      const { type, plan } = req.body;
      const logoUrl = req.file ? `/uploads/cadastros/${req.file.filename}` : null;

      // Validate email first
      const ownerEmail = req.body.owner_email;
      if (!ownerEmail || typeof ownerEmail !== 'string' || !ownerEmail.includes('@')) {
        return res.status(400).json({ error: 'Email invalido ou nao fornecido' });
      }

      // Check if email already exists
      const existingOwner = await storage.getOwnerUserByEmail(ownerEmail);
      if (existingOwner) {
        return res.status(409).json({ 
          error: 'Ja existe uma conta com este email. Faca login para adicionar novos negocios.',
          action: 'login',
          redirectUrl: '/minha-conta'
        });
      }

      // Validate password
      const password = req.body.owner_password;
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
      }

      // Hash password
      const salt = randomBytes(16).toString("hex");
      const hashedPassword = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
      const passwordHash = `${salt}:${hashedPassword}`;

      if (type === 'business') {
        const businessData: any = {
          name: req.body.business_name || req.body.owner_name,
          category: req.body.business_category || 'outros',
          categoryId: req.body.business_category || 'outros',
          planType: plan,
          planStatus: plan === 'basic' ? 'active' : 'pending',
          ownerEmail: req.body.owner_email,
          ownerPhone: req.body.owner_phone,
          logoUrl: logoUrl,
          address: req.body.business_address || req.body.address,
          whatsapp: req.body.business_whatsapp || req.body.owner_phone,
          published: false,
          city: 'Trindade',
        };

        // Add extra fields for complete plan
        if (plan === 'complete') {
          businessData.description = req.body.description;
          businessData.website = req.body.website;
          businessData.instagram = req.body.instagram;
          businessData.facebook = req.body.facebook;
          businessData.hours = req.body.hours;
        }

        const business = await storage.createBusiness(businessData);

        // Create owner user account
        const ownerUser = await storage.createOwnerUser({
          email: req.body.owner_email,
          password: passwordHash,
          name: req.body.owner_name,
          phone: req.body.owner_phone,
          ownerType: 'business',
          listingId: business.id,
        });

        // Create owner_listing relationship
        await storage.createOwnerListing({
          ownerId: ownerUser.id,
          listingType: 'business',
          listingId: business.id
        });

        // Update business with ownerId
        await storage.updateBusiness(business.id, { ownerId: ownerUser.id } as any);

        // For paid plans, create payment preference with Mercado Pago
        if (plan === 'complete') {
          const allSettings = await storage.getAllAppSettings();
          const settingsMap: Record<string, string> = {};
          allSettings.forEach(s => { settingsMap[s.key] = s.value || ''; });

          const isProduction = settingsMap['mp_production_mode'] === 'true';
          const accessToken = isProduction 
            ? settingsMap['mp_production_access_token']
            : settingsMap['mp_sandbox_access_token'];
          const price = parseFloat(settingsMap['plan_business_complete_price']) || 99.90;

          if (accessToken) {
            try {
              const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  items: [{
                    title: 'Plano Completo - Guia Comercial Portal do Romeiro',
                    quantity: 1,
                    unit_price: price,
                    currency_id: 'BRL'
                  }],
                  external_reference: `business_${business.id}`,
                  back_urls: {
                    success: `${req.protocol}://${req.get('host')}/cadastro/sucesso`,
                    failure: `${req.protocol}://${req.get('host')}/cadastro/erro`,
                    pending: `${req.protocol}://${req.get('host')}/cadastro/pendente`
                  },
                  auto_return: 'approved'
                })
              });

              const mpData = await mpResponse.json();
              if (mpData.init_point) {
                return res.json({ 
                  success: true, 
                  id: business.id,
                  paymentUrl: isProduction ? mpData.init_point : mpData.sandbox_init_point
                });
              }
            } catch (mpError) {
              console.error('Mercado Pago error:', mpError);
            }
          }
          
          // If MP is not configured, return success without payment URL
          return res.json({ 
            success: true, 
            id: business.id,
            message: 'Cadastro realizado. O pagamento sera processado posteriormente.'
          });
        }

        return res.json({ success: true, id: business.id });

      } else if (type === 'accommodation') {
        const isBasicPlan = plan === 'acc_basic';
        
        const accData: any = {
          name: req.body.name,
          type: req.body.accommodation_type || 'pousada',
          planType: isBasicPlan ? 'basic' : 'complete',
          planStatus: isBasicPlan ? 'active' : 'pending',
          ownerEmail: req.body.owner_email,
          ownerPhone: req.body.owner_phone,
          coverUrl: logoUrl,
          address: req.body.address,
          whatsapp: req.body.whatsapp,
          published: false,
          city: 'Trindade',
        };

        // Add extra fields for complete plan
        if (!isBasicPlan) {
          accData.description = req.body.description;
          accData.website = req.body.website;
          accData.instagram = req.body.instagram;
          accData.checkInTime = req.body.checkin || '14:00';
          accData.checkOutTime = req.body.checkout || '12:00';
        }

        const accommodation = await storage.createAccommodation(accData);

        // Create owner user account
        const ownerUser = await storage.createOwnerUser({
          email: req.body.owner_email,
          password: passwordHash,
          name: req.body.owner_name,
          phone: req.body.owner_phone,
          ownerType: 'accommodation',
          listingId: accommodation.id,
        });

        // Create owner_listing relationship
        await storage.createOwnerListing({
          ownerId: ownerUser.id,
          listingType: 'accommodation',
          listingId: accommodation.id
        });

        // Update accommodation with ownerId
        await storage.updateAccommodation(accommodation.id, { ownerId: ownerUser.id } as any);

        // Basic plan - no payment needed
        if (isBasicPlan) {
          return res.json({ success: true, id: accommodation.id });
        }

        // Create payment preference with Mercado Pago for complete plan
        const allSettings = await storage.getAllAppSettings();
        const settingsMap: Record<string, string> = {};
        allSettings.forEach(s => { settingsMap[s.key] = s.value || ''; });

        const isProduction = settingsMap['mp_production_mode'] === 'true';
        const accessToken = isProduction 
          ? settingsMap['mp_production_access_token']
          : settingsMap['mp_sandbox_access_token'];
        const price = parseFloat(settingsMap['plan_accommodation_price']) || 199.90;

        if (accessToken) {
          try {
            const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                items: [{
                  title: 'Plano Anual - Hospedagem Portal do Romeiro',
                  quantity: 1,
                  unit_price: price,
                  currency_id: 'BRL'
                }],
                external_reference: `accommodation_${accommodation.id}`,
                back_urls: {
                  success: `${req.protocol}://${req.get('host')}/cadastro/sucesso`,
                  failure: `${req.protocol}://${req.get('host')}/cadastro/erro`,
                  pending: `${req.protocol}://${req.get('host')}/cadastro/pendente`
                },
                auto_return: 'approved'
              })
            });

            const mpData = await mpResponse.json();
            if (mpData.init_point) {
              return res.json({ 
                success: true, 
                id: accommodation.id,
                paymentUrl: isProduction ? mpData.init_point : mpData.sandbox_init_point
              });
            }
          } catch (mpError) {
            console.error('Mercado Pago error:', mpError);
          }
        }
        
        return res.json({ 
          success: true, 
          id: accommodation.id,
          message: 'Cadastro realizado. O pagamento sera processado posteriormente.'
        });
      }

      return res.status(400).json({ error: 'Tipo de cadastro invalido' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Erro ao processar cadastro' });
    }
  });

  // Payment callback pages
  app.get("/cadastro/sucesso", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Confirmado - Portal do Romeiro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #10b981 0%, #059669 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
          .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 500px; margin: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .icon { width: 80px; height: 80px; background: rgba(16, 185, 129, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
          .icon svg { width: 40px; height: 40px; color: #10b981; }
          h1 { color: #1f2937; margin-bottom: 12px; }
          p { color: #6b7280; }
          .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: #b22226; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <h1>Pagamento Confirmado!</h1>
          <p>Seu cadastro foi realizado com sucesso e seu plano ja esta ativo. Voce recebera um e-mail com os detalhes.</p>
          <a href="/" class="btn">Voltar ao Inicio</a>
        </div>
      </body>
      </html>
    `);
  });

  app.get("/cadastro/erro", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro no Pagamento - Portal do Romeiro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
          .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 500px; margin: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .icon { width: 80px; height: 80px; background: rgba(239, 68, 68, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
          .icon svg { width: 40px; height: 40px; color: #ef4444; }
          h1 { color: #1f2937; margin-bottom: 12px; }
          p { color: #6b7280; }
          .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: #b22226; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </div>
          <h1>Erro no Pagamento</h1>
          <p>Houve um problema ao processar seu pagamento. Por favor, tente novamente ou entre em contato conosco.</p>
          <a href="/cadastro" class="btn">Tentar Novamente</a>
        </div>
      </body>
      </html>
    `);
  });

  app.get("/cadastro/pendente", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pagamento Pendente - Portal do Romeiro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
          .card { background: white; border-radius: 16px; padding: 48px; text-align: center; max-width: 500px; margin: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
          .icon { width: 80px; height: 80px; background: rgba(245, 158, 11, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
          .icon svg { width: 40px; height: 40px; color: #f59e0b; }
          h1 { color: #1f2937; margin-bottom: 12px; }
          p { color: #6b7280; }
          .btn { display: inline-block; margin-top: 24px; padding: 14px 32px; background: #b22226; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <h1>Pagamento Pendente</h1>
          <p>Seu pagamento esta sendo processado. Assim que for confirmado, seu cadastro sera ativado e voce recebera um e-mail.</p>
          <a href="/" class="btn">Voltar ao Inicio</a>
        </div>
      </body>
      </html>
    `);
  });

  // ========================================
  // OWNER AUTHENTICATION ROUTES
  // ========================================

  // Owner login page
  app.get("/minha-conta", (req, res) => {
    res.sendFile(path.join(process.cwd(), "server", "public", "minha-conta.html"));
  });

  // Owner login API
  app.post("/api/owner/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
      }

      const owner = await storage.getOwnerUserByEmail(email);
      if (!owner) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      // Verify password
      const [salt, storedHash] = owner.password.split(":");
      const hash = pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
      
      if (hash !== storedHash) {
        return res.status(401).json({ error: "E-mail ou senha incorretos" });
      }

      // Set session
      (req.session as any).ownerId = owner.id;
      (req.session as any).ownerEmail = owner.email;
      (req.session as any).ownerType = owner.ownerType;
      (req.session as any).listingId = owner.listingId;

      res.json({ 
        success: true, 
        owner: { 
          id: owner.id, 
          email: owner.email, 
          name: owner.name,
          ownerType: owner.ownerType,
          listingId: owner.listingId
        } 
      });
    } catch (error) {
      console.error("Owner login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Owner logout API
  app.post("/api/owner/logout", (req, res) => {
    (req.session as any).ownerId = null;
    (req.session as any).ownerEmail = null;
    (req.session as any).ownerType = null;
    (req.session as any).listingId = null;
    res.json({ success: true });
  });

  // Owner session check
  app.get("/api/owner/me", async (req, res) => {
    const ownerId = (req.session as any).ownerId;
    if (!ownerId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const owner = await storage.getOwnerUserById(ownerId);
    if (!owner) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    res.json({ 
      owner: { 
        id: owner.id, 
        email: owner.email, 
        name: owner.name,
        phone: owner.phone,
        ownerType: owner.ownerType,
        listingId: owner.listingId
      } 
    });
  });

  // Middleware for owner authentication
  const requireOwnerAuth = (req: Request, res: Response, next: NextFunction) => {
    const ownerId = (req.session as any).ownerId;
    if (!ownerId) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    next();
  };

  // Get owner's listing data
  app.get("/api/owner/listing", requireOwnerAuth, async (req, res) => {
    try {
      const ownerType = (req.session as any).ownerType;
      const listingId = (req.session as any).listingId;

      if (!listingId) {
        return res.status(404).json({ error: "Nenhum cadastro encontrado" });
      }

      if (ownerType === "business") {
        const business = await storage.getBusinessById(listingId);
        if (!business) {
          return res.status(404).json({ error: "Empresa não encontrada" });
        }
        return res.json({ type: "business", listing: business });
      } else if (ownerType === "accommodation") {
        const accommodation = await storage.getAccommodationById(listingId);
        if (!accommodation) {
          return res.status(404).json({ error: "Hospedagem não encontrada" });
        }
        return res.json({ type: "accommodation", listing: accommodation });
      }

      return res.status(400).json({ error: "Tipo de cadastro inválido" });
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({ error: "Erro ao carregar dados" });
    }
  });

  // Update owner's listing data
  app.put("/api/owner/listing", requireOwnerAuth, publicUpload.single("logo"), async (req, res) => {
    try {
      const ownerType = (req.session as any).ownerType;
      const listingId = (req.session as any).listingId;

      if (!listingId) {
        return res.status(404).json({ error: "Nenhum cadastro encontrado" });
      }

      const updateData: any = {};
      
      // Handle logo upload
      if (req.file) {
        updateData.logoUrl = `/uploads/cadastros/${req.file.filename}`;
      }

      // Common fields
      if (req.body.name) updateData.name = req.body.name;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.whatsapp) updateData.whatsapp = req.body.whatsapp;
      if (req.body.phone) updateData.phone = req.body.phone;

      // Get current listing to check plan type
      if (ownerType === "business") {
        const business = await storage.getBusinessById(listingId);
        if (!business) {
          return res.status(404).json({ error: "Empresa não encontrada" });
        }

        // Only allow extra fields for complete plan
        if (business.planType === "complete") {
          if (req.body.description !== undefined) updateData.description = req.body.description;
          if (req.body.website !== undefined) updateData.website = req.body.website;
          if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
          if (req.body.facebook !== undefined) updateData.facebook = req.body.facebook;
          if (req.body.hours !== undefined) updateData.hours = req.body.hours;
        }

        const updated = await storage.updateBusiness(listingId, updateData);
        return res.json({ success: true, listing: updated });

      } else if (ownerType === "accommodation") {
        const accommodation = await storage.getAccommodationById(listingId);
        if (!accommodation) {
          return res.status(404).json({ error: "Hospedagem não encontrada" });
        }

        // Accommodations always have full access
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.website !== undefined) updateData.website = req.body.website;
        if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.checkInTime !== undefined) updateData.checkInTime = req.body.checkInTime;
        if (req.body.checkOutTime !== undefined) updateData.checkOutTime = req.body.checkOutTime;

        const updated = await storage.updateAccommodation(listingId, updateData);
        return res.json({ success: true, listing: updated });
      }

      return res.status(400).json({ error: "Tipo de cadastro inválido" });
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({ error: "Erro ao atualizar dados" });
    }
  });

  // Get all owner's listings (businesses and accommodations)
  app.get("/api/owner/listings", requireOwnerAuth, async (req, res) => {
    try {
      const ownerId = (req.session as any).ownerId;
      const type = req.query.type as string | undefined;

      if (type === 'business') {
        const businessList = await storage.getBusinessesByOwnerId(ownerId);
        return res.json({ 
          listings: businessList.map(b => ({ ...b, listingType: 'business' })),
          type: 'business'
        });
      } else if (type === 'accommodation') {
        const accommodationList = await storage.getAccommodationsByOwnerId(ownerId);
        return res.json({ 
          listings: accommodationList.map(a => ({ ...a, listingType: 'accommodation' })),
          type: 'accommodation'
        });
      }

      // Return all listings
      const businessList = await storage.getBusinessesByOwnerId(ownerId);
      const accommodationList = await storage.getAccommodationsByOwnerId(ownerId);

      const allListings = [
        ...businessList.map(b => ({ ...b, listingType: 'business' as const })),
        ...accommodationList.map(a => ({ ...a, listingType: 'accommodation' as const }))
      ].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      res.json({ listings: allListings });
    } catch (error) {
      console.error("Get listings error:", error);
      res.status(500).json({ error: "Erro ao carregar cadastros" });
    }
  });

  // Get a specific listing by ID
  app.get("/api/owner/listings/:type/:id", requireOwnerAuth, async (req, res) => {
    try {
      const ownerId = (req.session as any).ownerId;
      const { type, id } = req.params;

      if (type === 'business') {
        const business = await storage.getBusinessById(id);
        if (!business || business.ownerId !== ownerId) {
          return res.status(404).json({ error: "Empresa não encontrada" });
        }
        return res.json({ type: 'business', listing: business });
      } else if (type === 'accommodation') {
        const accommodation = await storage.getAccommodationById(id);
        if (!accommodation || accommodation.ownerId !== ownerId) {
          return res.status(404).json({ error: "Hospedagem não encontrada" });
        }
        return res.json({ type: 'accommodation', listing: accommodation });
      }

      return res.status(400).json({ error: "Tipo de cadastro inválido" });
    } catch (error) {
      console.error("Get listing error:", error);
      res.status(500).json({ error: "Erro ao carregar cadastro" });
    }
  });

  // Create a new business (from owner portal)
  app.post("/api/owner/listings/business", requireOwnerAuth, publicUpload.single("logo"), async (req, res) => {
    try {
      const ownerId = (req.session as any).ownerId;
      const owner = await storage.getOwnerUserById(ownerId);

      if (!owner) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const plan = req.body.plan || 'basic';
      let logoUrl = null;
      if (req.file) {
        logoUrl = `/uploads/cadastros/${req.file.filename}`;
      }

      const businessData: any = {
        name: req.body.name,
        category: req.body.category || 'outros',
        categoryId: req.body.category || 'outros',
        ownerId: ownerId,
        planType: plan,
        planStatus: plan === 'basic' ? 'active' : 'pending',
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
        logoUrl: logoUrl,
        address: req.body.address,
        whatsapp: req.body.whatsapp || owner.phone,
        published: false,
        city: 'Trindade',
      };

      if (plan === 'complete') {
        businessData.description = req.body.description;
        businessData.shortDescription = req.body.shortDescription;
        businessData.website = req.body.website;
        businessData.instagram = req.body.instagram;
        businessData.facebook = req.body.facebook;
        businessData.hours = req.body.hours;
        businessData.phone = req.body.phone;
      }

      const newBusiness = await storage.createBusiness(businessData);

      // Create owner_listing relationship
      await storage.createOwnerListing({
        ownerId: ownerId,
        listingType: 'business',
        listingId: newBusiness.id
      });

      // If complete plan, create Mercado Pago payment
      if (plan === 'complete') {
        const settings = await storage.getAllAppSettings();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s) => { if (s.value) settingsMap[s.key] = s.value; });

        const isProduction = settingsMap['mp_environment'] === 'production';
        const accessToken = isProduction 
          ? settingsMap['mp_production_access_token']
          : settingsMap['mp_sandbox_access_token'];
        const price = parseFloat(settingsMap['plan_business_complete_price']) || 99.90;

        if (accessToken) {
          try {
            const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                items: [{
                  title: `Plano Completo - ${req.body.name}`,
                  quantity: 1,
                  unit_price: price,
                  currency_id: 'BRL'
                }],
                external_reference: `business_${newBusiness.id}`,
                back_urls: {
                  success: `${req.protocol}://${req.get('host')}/cadastro/sucesso`,
                  failure: `${req.protocol}://${req.get('host')}/cadastro/erro`,
                  pending: `${req.protocol}://${req.get('host')}/cadastro/pendente`
                },
                auto_return: 'approved'
              })
            });

            const mpData = await mpResponse.json();
            const paymentUrl = isProduction ? mpData.init_point : (mpData.sandbox_init_point || mpData.init_point);
            if (paymentUrl) {
              return res.json({ 
                success: true, 
                listing: newBusiness, 
                type: 'business',
                paymentUrl: paymentUrl,
                requiresPayment: true
              });
            }
          } catch (mpError) {
            console.error("Mercado Pago error:", mpError);
          }
        }

        // If MP fails, return without payment URL
        return res.json({ 
          success: true, 
          listing: newBusiness, 
          type: 'business',
          message: 'Cadastro realizado. O pagamento sera processado posteriormente.',
          requiresPayment: true
        });
      }

      res.json({ success: true, listing: newBusiness, type: 'business' });
    } catch (error) {
      console.error("Create business error:", error);
      res.status(500).json({ error: "Erro ao criar empresa" });
    }
  });

  // Create a new accommodation (from owner portal)
  app.post("/api/owner/listings/accommodation", requireOwnerAuth, publicUpload.single("logo"), async (req, res) => {
    try {
      const ownerId = (req.session as any).ownerId;
      const owner = await storage.getOwnerUserById(ownerId);

      if (!owner) {
        return res.status(401).json({ error: "Usuário não encontrado" });
      }

      const plan = req.body.plan || 'basic';
      let logoUrl = null;
      if (req.file) {
        logoUrl = `/uploads/cadastros/${req.file.filename}`;
      }

      const accommodationData: any = {
        name: req.body.name,
        type: req.body.accommodation_type || 'pousada',
        ownerId: ownerId,
        planType: plan,
        planStatus: plan === 'basic' ? 'active' : 'pending',
        ownerEmail: owner.email,
        ownerPhone: owner.phone,
        logoUrl: logoUrl,
        address: req.body.address,
        whatsapp: req.body.whatsapp || owner.phone,
        phone: req.body.phone,
        email: req.body.email,
        published: false,
        city: 'Trindade',
      };

      if (plan === 'complete') {
        accommodationData.description = req.body.description;
        accommodationData.website = req.body.website;
        accommodationData.instagram = req.body.instagram;
        accommodationData.checkInTime = req.body.checkInTime || '14:00';
        accommodationData.checkOutTime = req.body.checkOutTime || '12:00';
      }

      const newAccommodation = await storage.createAccommodation(accommodationData);

      // Create owner_listing relationship
      await storage.createOwnerListing({
        ownerId: ownerId,
        listingType: 'accommodation',
        listingId: newAccommodation.id
      });

      // If complete plan, create Mercado Pago payment
      if (plan === 'complete') {
        const settings = await storage.getAllAppSettings();
        const settingsMap: Record<string, string> = {};
        settings.forEach((s) => { if (s.value) settingsMap[s.key] = s.value; });

        const isProduction = settingsMap['mp_environment'] === 'production';
        const accessToken = isProduction 
          ? settingsMap['mp_production_access_token']
          : settingsMap['mp_sandbox_access_token'];
        const price = parseFloat(settingsMap['plan_accommodation_price']) || 149.90;

        if (accessToken) {
          try {
            const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                items: [{
                  title: `Plano Completo Hospedagem - ${req.body.name}`,
                  quantity: 1,
                  unit_price: price,
                  currency_id: 'BRL'
                }],
                external_reference: `accommodation_${newAccommodation.id}`,
                back_urls: {
                  success: `${req.protocol}://${req.get('host')}/cadastro/sucesso`,
                  failure: `${req.protocol}://${req.get('host')}/cadastro/erro`,
                  pending: `${req.protocol}://${req.get('host')}/cadastro/pendente`
                },
                auto_return: 'approved'
              })
            });

            const mpData = await mpResponse.json();
            const paymentUrl = isProduction ? mpData.init_point : (mpData.sandbox_init_point || mpData.init_point);
            if (paymentUrl) {
              return res.json({ 
                success: true, 
                listing: newAccommodation, 
                type: 'accommodation',
                paymentUrl: paymentUrl,
                requiresPayment: true
              });
            }
          } catch (mpError) {
            console.error("Mercado Pago error:", mpError);
          }
        }

        // If MP fails, return without payment URL
        return res.json({ 
          success: true, 
          listing: newAccommodation, 
          type: 'accommodation',
          message: 'Cadastro realizado. O pagamento sera processado posteriormente.',
          requiresPayment: true
        });
      }

      res.json({ success: true, listing: newAccommodation, type: 'accommodation' });
    } catch (error) {
      console.error("Create accommodation error:", error);
      res.status(500).json({ error: "Erro ao criar hospedagem" });
    }
  });

  // Update a specific listing
  app.put("/api/owner/listings/:type/:id", requireOwnerAuth, publicUpload.single("logo"), async (req, res) => {
    try {
      const ownerId = (req.session as any).ownerId;
      const { type, id } = req.params;

      const updateData: any = {};
      
      if (req.file) {
        updateData.logoUrl = `/uploads/cadastros/${req.file.filename}`;
      }

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.address) updateData.address = req.body.address;
      if (req.body.whatsapp) updateData.whatsapp = req.body.whatsapp;
      if (req.body.phone) updateData.phone = req.body.phone;

      if (type === 'business') {
        const business = await storage.getBusinessById(id);
        if (!business || business.ownerId !== ownerId) {
          return res.status(404).json({ error: "Empresa não encontrada" });
        }

        if (business.planType === 'complete') {
          if (req.body.description !== undefined) updateData.description = req.body.description;
          if (req.body.website !== undefined) updateData.website = req.body.website;
          if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
          if (req.body.facebook !== undefined) updateData.facebook = req.body.facebook;
          if (req.body.hours !== undefined) updateData.hours = req.body.hours;
        }

        const updated = await storage.updateBusiness(id, updateData);
        return res.json({ success: true, listing: updated, type: 'business' });

      } else if (type === 'accommodation') {
        const accommodation = await storage.getAccommodationById(id);
        if (!accommodation || accommodation.ownerId !== ownerId) {
          return res.status(404).json({ error: "Hospedagem não encontrada" });
        }

        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.website !== undefined) updateData.website = req.body.website;
        if (req.body.instagram !== undefined) updateData.instagram = req.body.instagram;
        if (req.body.email !== undefined) updateData.email = req.body.email;
        if (req.body.checkInTime !== undefined) updateData.checkInTime = req.body.checkInTime;
        if (req.body.checkOutTime !== undefined) updateData.checkOutTime = req.body.checkOutTime;

        const updated = await storage.updateAccommodation(id, updateData);
        return res.json({ success: true, listing: updated, type: 'accommodation' });
      }

      return res.status(400).json({ error: "Tipo de cadastro inválido" });
    } catch (error) {
      console.error("Update listing error:", error);
      res.status(500).json({ error: "Erro ao atualizar cadastro" });
    }
  });

  // Webhook for Mercado Pago payment notifications
  app.post("/api/webhooks/mercadopago", async (req, res) => {
    try {
      const { type, data } = req.body;
      
      if (type === 'payment') {
        const allSettings = await storage.getAllAppSettings();
        const settingsMap: Record<string, string> = {};
        allSettings.forEach(s => { settingsMap[s.key] = s.value || ''; });

        const isProduction = settingsMap['mp_production_mode'] === 'true';
        const accessToken = isProduction 
          ? settingsMap['mp_production_access_token']
          : settingsMap['mp_sandbox_access_token'];

        if (accessToken && data?.id) {
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
          });
          const payment = await paymentResponse.json();

          if (payment.status === 'approved' && payment.external_reference) {
            const [entityType, entityId] = payment.external_reference.split('_');
            const duration = entityType === 'business' 
              ? parseInt(settingsMap['plan_business_complete_duration']) || 365
              : parseInt(settingsMap['plan_accommodation_duration']) || 365;
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + duration);

            if (entityType === 'business') {
              await storage.updateBusiness(entityId, {
                planStatus: 'active',
                published: true,
              });
            } else if (entityType === 'accommodation') {
              await storage.updateAccommodation(entityId, {
                planStatus: 'active',
                published: true,
              });
            }
          }
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error('Webhook error:', error);
      res.sendStatus(500);
    }
  });
}

function getPlaceholderPage(title: string, description: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Admin Portal do Romeiro</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f8f9fa;
      min-height: 100vh;
      display: flex;
    }
    .sidebar {
      width: 260px;
      background: #1a1a2e;
      color: white;
      padding: 24px;
      position: fixed;
      height: 100vh;
    }
    .sidebar h1 {
      color: #b22226;
      font-size: 18px;
      margin-bottom: 4px;
    }
    .sidebar p {
      color: #9ca3af;
      font-size: 12px;
      margin-bottom: 32px;
    }
    .nav-item {
      display: block;
      padding: 12px 16px;
      color: #9ca3af;
      text-decoration: none;
      border-radius: 8px;
      margin-bottom: 4px;
    }
    .nav-item:hover { background: #16213e; color: white; }
    .nav-item.active { background: #b22226; color: white; }
    .main {
      flex: 1;
      margin-left: 260px;
      padding: 32px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .header h2 { font-size: 24px; color: #1f2937; }
    .content {
      background: white;
      border-radius: 12px;
      padding: 48px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .content p { color: #6b7280; margin-top: 8px; }
    .badge {
      display: inline-block;
      background: #fef3c7;
      color: #d97706;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      margin-top: 16px;
    }
    .back-link {
      display: inline-block;
      margin-top: 24px;
      color: #b22226;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <aside class="sidebar">
    <h1>Portal do Romeiro</h1>
    <p>Painel Administrativo</p>
    <a href="/admin/dashboard" class="nav-item">Dashboard</a>
    <a href="/admin/noticias" class="nav-item ${title === 'Noticias' ? 'active' : ''}">Noticias</a>
    <a href="/admin/hospedagens" class="nav-item ${title === 'Hospedagens' ? 'active' : ''}">Hospedagens</a>
    <a href="/admin/eventos" class="nav-item ${title === 'Eventos' ? 'active' : ''}">Eventos</a>
    <a href="/admin/oracoes" class="nav-item ${title === 'Oracoes' ? 'active' : ''}">Oracoes</a>
    <a href="/admin/pontos-turisticos" class="nav-item ${title === 'Pontos Turisticos' ? 'active' : ''}">Pontos Turisticos</a>
    <a href="/admin/usuarios" class="nav-item ${title === 'Usuarios' ? 'active' : ''}">Usuarios</a>
    <a href="/admin/configuracoes" class="nav-item ${title === 'Configuracoes' ? 'active' : ''}">Configuracoes</a>
  </aside>
  <main class="main">
    <div class="header">
      <h2>${title}</h2>
    </div>
    <div class="content">
      <h3>${title}</h3>
      <p>${description}</p>
      <span class="badge">Em desenvolvimento</span>
      <br>
      <a href="/admin/dashboard" class="back-link">Voltar ao Dashboard</a>
    </div>
  </main>
</body>
</html>
  `;
}
