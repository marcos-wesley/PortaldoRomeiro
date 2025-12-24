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

export const videos = pgTable("videos", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  youtubeUrl: text("youtube_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  featured: boolean("featured").default(false),
  published: boolean("published").default(false),
  publishedAt: timestamp("published_at"),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  description: true,
  youtubeUrl: true,
  thumbnailUrl: true,
  featured: true,
  published: true,
});

export const createVideoSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  description: z.string().optional().nullable(),
  youtubeUrl: z.string().url("URL do YouTube invalida"),
  thumbnailUrl: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(false),
});

export const updateVideoSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres").optional(),
  description: z.string().optional().nullable(),
  youtubeUrl: z.string().url("URL do YouTube invalida").optional(),
  thumbnailUrl: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
export type CreateVideoInput = z.infer<typeof createVideoSchema>;
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

export const attractions = pgTable("attractions", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  scheduleWeekdays: text("schedule_weekdays"),
  scheduleSaturday: text("schedule_saturday"),
  scheduleSunday: text("schedule_sunday"),
  massSchedule: text("mass_schedule"),
  amenities: text("amenities"),
  tips: text("tips"),
  relatedAttractions: text("related_attractions"),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAttractionSchema = createInsertSchema(attractions).pick({
  name: true,
  category: true,
  imageUrl: true,
  description: true,
  address: true,
  phone: true,
  website: true,
  latitude: true,
  longitude: true,
  scheduleWeekdays: true,
  scheduleSaturday: true,
  scheduleSunday: true,
  massSchedule: true,
  amenities: true,
  tips: true,
  relatedAttractions: true,
  featured: true,
  published: true,
});

export const createAttractionSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  category: z.enum(["Igrejas", "Monumentos", "Pracas", "Museus"]),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  scheduleWeekdays: z.string().optional().nullable(),
  scheduleSaturday: z.string().optional().nullable(),
  scheduleSunday: z.string().optional().nullable(),
  massSchedule: z.string().optional().nullable(),
  amenities: z.string().optional().nullable(),
  tips: z.string().optional().nullable(),
  relatedAttractions: z.string().optional().nullable(),
  featured: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

export const updateAttractionSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").optional(),
  category: z.enum(["Igrejas", "Monumentos", "Pracas", "Museus"]).optional(),
  imageUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  scheduleWeekdays: z.string().optional().nullable(),
  scheduleSaturday: z.string().optional().nullable(),
  scheduleSunday: z.string().optional().nullable(),
  massSchedule: z.string().optional().nullable(),
  amenities: z.string().optional().nullable(),
  tips: z.string().optional().nullable(),
  relatedAttractions: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type Attraction = typeof attractions.$inferSelect;
export type CreateAttractionInput = z.infer<typeof createAttractionSchema>;
export type UpdateAttractionInput = z.infer<typeof updateAttractionSchema>;

export const staticPages = pgTable("static_pages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  pageKey: text("page_key").notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaticPageSchema = createInsertSchema(staticPages).pick({
  pageKey: true,
  content: true,
});

export const updateStaticPageSchema = z.object({
  content: z.string().min(1, "Conteudo nao pode estar vazio"),
});

export type InsertStaticPage = z.infer<typeof insertStaticPageSchema>;
export type StaticPage = typeof staticPages.$inferSelect;
export type UpdateStaticPageInput = z.infer<typeof updateStaticPageSchema>;

// Telefones Uteis (Useful Phones)
export const usefulPhones = pgTable("useful_phones", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  category: text("category").default("geral"),
  icon: text("icon"),
  order: integer("order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const createUsefulPhoneSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres"),
  category: z.string().optional().default("geral"),
  icon: z.string().optional().nullable(),
  order: z.number().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const updateUsefulPhoneSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  phone: z.string().min(8, "Telefone deve ter pelo menos 8 caracteres").optional(),
  category: z.string().optional(),
  icon: z.string().optional().nullable(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export type UsefulPhone = typeof usefulPhones.$inferSelect;
export type CreateUsefulPhoneInput = z.infer<typeof createUsefulPhoneSchema>;
export type UpdateUsefulPhoneInput = z.infer<typeof updateUsefulPhoneSchema>;

// Dicas do Romeiro (Pilgrim Tips)
export const pilgrimTips = pgTable("pilgrim_tips", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  icon: text("icon"),
  order: integer("order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const createPilgrimTipSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres"),
  content: z.string().min(10, "Conteudo deve ter pelo menos 10 caracteres"),
  icon: z.string().optional().nullable(),
  order: z.number().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const updatePilgrimTipSchema = z.object({
  title: z.string().min(3, "Titulo deve ter pelo menos 3 caracteres").optional(),
  content: z.string().min(10, "Conteudo deve ter pelo menos 10 caracteres").optional(),
  icon: z.string().optional().nullable(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export type PilgrimTip = typeof pilgrimTips.$inferSelect;
export type CreatePilgrimTipInput = z.infer<typeof createPilgrimTipSchema>;
export type UpdatePilgrimTipInput = z.infer<typeof updatePilgrimTipSchema>;

// Servicos (Services)
export const services = pgTable("services", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  address: text("address"),
  phone: text("phone"),
  website: text("website"),
  category: text("category").default("geral"),
  order: integer("order").default(0),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const createServiceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  category: z.string().optional().default("geral"),
  order: z.number().optional().default(0),
  published: z.boolean().optional().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  category: z.string().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export type Service = typeof services.$inferSelect;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>;

// Empresas (Guia Comercial / Businesses)
export const businesses = pgTable("businesses", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  categoryId: text("category_id").notNull(),
  logoUrl: text("logo_url"),
  coverUrl: text("cover_url"),
  description: text("description"),
  shortDescription: text("short_description"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  website: text("website"),
  instagram: text("instagram"),
  facebook: text("facebook"),
  hours: text("hours"),
  priceRange: text("price_range"),
  rating: text("rating"),
  reviews: integer("reviews").default(0),
  featured: boolean("featured").default(false),
  gallery: text("gallery"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  delivery: boolean("delivery").default(false),
  deliveryUrl: text("delivery_url"),
  published: boolean("published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const createBusinessSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  category: z.string().min(1, "Categoria é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  hours: z.string().optional().nullable(),
  priceRange: z.string().optional().nullable(),
  rating: z.string().optional().nullable(),
  reviews: z.number().optional().default(0),
  featured: z.boolean().optional().default(false),
  gallery: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  delivery: z.boolean().optional().default(false),
  deliveryUrl: z.string().optional().nullable(),
  published: z.boolean().optional().default(true),
});

export const updateBusinessSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  logoUrl: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  shortDescription: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  hours: z.string().optional().nullable(),
  priceRange: z.string().optional().nullable(),
  rating: z.string().optional().nullable(),
  reviews: z.number().optional(),
  featured: z.boolean().optional(),
  gallery: z.string().optional().nullable(),
  latitude: z.string().optional().nullable(),
  longitude: z.string().optional().nullable(),
  delivery: z.boolean().optional(),
  deliveryUrl: z.string().optional().nullable(),
  published: z.boolean().optional(),
});

export type Business = typeof businesses.$inferSelect;
export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
export type UpdateBusinessInput = z.infer<typeof updateBusinessSchema>;

export const businessReviews = pgTable("business_reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").notNull(),
  userId: varchar("user_id"),
  userName: text("user_name").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const createBusinessReviewSchema = z.object({
  businessId: z.string(),
  userId: z.string().optional().nullable(),
  userName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional().nullable(),
});

export type BusinessReview = typeof businessReviews.$inferSelect;
export type CreateBusinessReviewInput = z.infer<typeof createBusinessReviewSchema>;
