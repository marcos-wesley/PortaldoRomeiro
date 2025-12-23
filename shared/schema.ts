import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  password: text("password").notNull(),
  city: text("city"),
  state: text("state"),
  avatarUrl: text("avatar_url"),
  receiveNews: boolean("receive_news").default(false),
  acceptedTerms: boolean("accepted_terms").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  phone: true,
  password: true,
  city: true,
  state: true,
  receiveNews: true,
  acceptedTerms: true,
});

export const registerUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  city: z.string().optional(),
  state: z.string().optional(),
  receiveNews: z.boolean().optional().default(false),
  acceptedTerms: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const loginUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.string().email("E-mail inválido").optional(),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  receiveNews: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const news = pgTable("news", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  category: text("category").default("geral"),
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  summary: true,
  content: true,
  coverImage: true,
  category: true,
  featured: true,
  published: true,
});

export const createNewsSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  summary: z.string().min(10, "Resumo deve ter pelo menos 10 caracteres"),
  content: z.string().min(20, "Conteudo deve ter pelo menos 20 caracteres"),
  coverImage: z.string().optional().nullable(),
  category: z.string().optional().default("geral"),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
});

export const updateNewsSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres").optional(),
  summary: z.string().min(10, "Resumo deve ter pelo menos 10 caracteres").optional(),
  content: z.string().min(20, "Conteudo deve ter pelo menos 20 caracteres").optional(),
  coverImage: z.string().optional().nullable(),
  category: z.string().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;
export type CreateNewsInput = z.infer<typeof createNewsSchema>;
export type UpdateNewsInput = z.infer<typeof updateNewsSchema>;
