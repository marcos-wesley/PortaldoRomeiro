import type { Express, Request, Response, NextFunction } from "express";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { storage } from "./storage";
import { createNewsSchema, updateNewsSchema } from "@shared/schema";
import { fromError } from "zod-validation-error";

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
    res.send(getPlaceholderPage("Noticias", "Gerencie as noticias do app"));
  });

  app.get("/admin/hospedagens", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Hospedagens", "Gerencie as hospedagens"));
  });

  app.get("/admin/eventos", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Eventos", "Gerencie os eventos"));
  });

  app.get("/admin/oracoes", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Oracoes", "Gerencie as oracoes"));
  });

  app.get("/admin/pontos-turisticos", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Pontos Turisticos", "Gerencie os pontos turisticos"));
  });

  app.get("/admin/usuarios", requireAuth, (req, res) => {
    res.send(getPlaceholderPage("Usuarios", "Gerencie os usuarios do app"));
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
      
      return res.json({
        users: usersCount,
        news: newsCount,
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
