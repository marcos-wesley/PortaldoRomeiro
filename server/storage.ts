import { type User, type InsertUser, type UpdateProfileInput, users, type News, type InsertNews, type UpdateNewsInput, news, type Video, type InsertVideo, type UpdateVideoInput, videos, type Attraction, type InsertAttraction, type UpdateAttractionInput, attractions, type StaticPage, type InsertStaticPage, type UpdateStaticPageInput, staticPages } from "@shared/schema";
import { db } from "./db";
import { eq, count, desc, ilike, or, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateProfileInput): Promise<User | undefined>;
  updateUserAvatar(id: string, avatarUrl: string): Promise<User | undefined>;
  getUsersCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: string, data: UpdateProfileInput): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserAvatar(id: string, avatarUrl: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ avatarUrl, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async getUsersCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count ?? 0;
  }

  async getAllNews(publishedOnly = false): Promise<News[]> {
    if (publishedOnly) {
      const result = await db.select().from(news).where(eq(news.published, true)).orderBy(desc(news.publishedAt));
      return result;
    }
    const result = await db.select().from(news).orderBy(desc(news.createdAt));
    return result;
  }

  async getNewsById(id: string): Promise<News | undefined> {
    const result = await db.select().from(news).where(eq(news.id, id));
    return result[0];
  }

  async createNews(data: InsertNews): Promise<News> {
    const publishedAt = data.published ? new Date() : null;
    const result = await db.insert(news).values({ ...data, publishedAt }).returning();
    return result[0];
  }

  async updateNews(id: string, data: UpdateNewsInput): Promise<News | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.published === true) {
      const existing = await this.getNewsById(id);
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    const result = await db.update(news).set(updateData).where(eq(news.id, id)).returning();
    return result[0];
  }

  async deleteNews(id: string): Promise<boolean> {
    const result = await db.delete(news).where(eq(news.id, id)).returning();
    return result.length > 0;
  }

  async getNewsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(news);
    return result[0]?.count ?? 0;
  }

  async incrementNewsViews(id: string): Promise<void> {
    const existing = await this.getNewsById(id);
    if (existing) {
      await db.update(news).set({ views: (existing.views || 0) + 1 }).where(eq(news.id, id));
    }
  }

  async getAllVideos(publishedOnly = false): Promise<Video[]> {
    if (publishedOnly) {
      const result = await db.select().from(videos).where(eq(videos.published, true)).orderBy(desc(videos.publishedAt));
      return result;
    }
    const result = await db.select().from(videos).orderBy(desc(videos.createdAt));
    return result;
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const result = await db.select().from(videos).where(eq(videos.id, id));
    return result[0];
  }

  async createVideo(data: InsertVideo): Promise<Video> {
    const publishedAt = data.published ? new Date() : null;
    const result = await db.insert(videos).values({ ...data, publishedAt }).returning();
    return result[0];
  }

  async updateVideo(id: string, data: UpdateVideoInput): Promise<Video | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    if (data.published === true) {
      const existing = await this.getVideoById(id);
      if (!existing?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    const result = await db.update(videos).set(updateData).where(eq(videos.id, id)).returning();
    return result[0];
  }

  async deleteVideo(id: string): Promise<boolean> {
    const result = await db.delete(videos).where(eq(videos.id, id)).returning();
    return result.length > 0;
  }

  async getVideosCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(videos);
    return result[0]?.count ?? 0;
  }

  async incrementVideoViews(id: string): Promise<void> {
    const existing = await this.getVideoById(id);
    if (existing) {
      await db.update(videos).set({ views: (existing.views || 0) + 1 }).where(eq(videos.id, id));
    }
  }

  async getAllAttractions(publishedOnly = false, category?: string): Promise<Attraction[]> {
    let query = db.select().from(attractions);
    
    if (publishedOnly && category && category !== "Todas") {
      const result = await query
        .where(and(eq(attractions.published, true), eq(attractions.category, category)))
        .orderBy(desc(attractions.createdAt));
      return result;
    } else if (publishedOnly) {
      const result = await query
        .where(eq(attractions.published, true))
        .orderBy(desc(attractions.createdAt));
      return result;
    } else if (category && category !== "Todas") {
      const result = await query
        .where(eq(attractions.category, category))
        .orderBy(desc(attractions.createdAt));
      return result;
    }
    
    const result = await query.orderBy(desc(attractions.createdAt));
    return result;
  }

  async getAttractionById(id: string): Promise<Attraction | undefined> {
    const result = await db.select().from(attractions).where(eq(attractions.id, id));
    return result[0];
  }

  async createAttraction(data: InsertAttraction): Promise<Attraction> {
    const result = await db.insert(attractions).values(data).returning();
    return result[0];
  }

  async updateAttraction(id: string, data: UpdateAttractionInput): Promise<Attraction | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(attractions).set(updateData).where(eq(attractions.id, id)).returning();
    return result[0];
  }

  async deleteAttraction(id: string): Promise<boolean> {
    const result = await db.delete(attractions).where(eq(attractions.id, id)).returning();
    return result.length > 0;
  }

  async getAttractionsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(attractions);
    return result[0]?.count ?? 0;
  }

  async incrementAttractionViews(id: string): Promise<void> {
    const existing = await this.getAttractionById(id);
    if (existing) {
      await db.update(attractions).set({ views: (existing.views || 0) + 1 }).where(eq(attractions.id, id));
    }
  }

  async getStaticPage(pageKey: string): Promise<StaticPage | undefined> {
    const result = await db.select().from(staticPages).where(eq(staticPages.pageKey, pageKey));
    return result[0];
  }

  async getAllStaticPages(): Promise<StaticPage[]> {
    const result = await db.select().from(staticPages).orderBy(staticPages.pageKey);
    return result;
  }

  async upsertStaticPage(pageKey: string, content: string): Promise<StaticPage> {
    const existing = await this.getStaticPage(pageKey);
    if (existing) {
      const result = await db
        .update(staticPages)
        .set({ content, updatedAt: new Date() })
        .where(eq(staticPages.pageKey, pageKey))
        .returning();
      return result[0];
    }
    const result = await db.insert(staticPages).values({ pageKey, content }).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
