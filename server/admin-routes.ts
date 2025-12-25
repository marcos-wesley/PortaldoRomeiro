import type { Express, Request, Response, NextFunction } from "express";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import multer from "multer";
import { storage } from "./storage";
import { createNewsSchema, updateNewsSchema, createVideoSchema, updateVideoSchema, createAttractionSchema, updateAttractionSchema, createUsefulPhoneSchema, updateUsefulPhoneSchema, createPilgrimTipSchema, updatePilgrimTipSchema, createServiceSchema, updateServiceSchema, createBusinessSchema, updateBusinessSchema, createAccommodationSchema, updateAccommodationSchema, createRoomSchema, updateRoomSchema, createRoomBlockedDateSchema, createPartnerSchema, updatePartnerSchema, createBannerSchema, updateBannerSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

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

  app.get("/admin/configuracoes", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Configuracoes", "Configuracoes do sistema"));
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
