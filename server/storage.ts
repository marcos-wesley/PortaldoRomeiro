import { type User, type InsertUser, type UpdateProfileInput, users, type News, type InsertNews, type UpdateNewsInput, news, type Video, type InsertVideo, type UpdateVideoInput, videos, type Attraction, type InsertAttraction, type UpdateAttractionInput, attractions, type StaticPage, type InsertStaticPage, type UpdateStaticPageInput, staticPages, type UsefulPhone, type CreateUsefulPhoneInput, type UpdateUsefulPhoneInput, usefulPhones, type PilgrimTip, type CreatePilgrimTipInput, type UpdatePilgrimTipInput, pilgrimTips, type Service, type CreateServiceInput, type UpdateServiceInput, services, type Business, type CreateBusinessInput, type UpdateBusinessInput, businesses, type BusinessReview, type CreateBusinessReviewInput, businessReviews, type Accommodation, type CreateAccommodationInput, type UpdateAccommodationInput, accommodations, type Room, type CreateRoomInput, type UpdateRoomInput, rooms, type RoomBlockedDate, type CreateRoomBlockedDateInput, roomBlockedDates, type AccommodationReview, type CreateAccommodationReviewInput, accommodationReviews } from "@shared/schema";
import { db } from "./db";
import { eq, count, desc, ilike, or, and, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: UpdateProfileInput): Promise<User | undefined>;
  updateUserAvatar(id: string, avatarUrl: string): Promise<User | undefined>;
  getUsersCount(): Promise<number>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: string): Promise<boolean>;
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

  async getAllUsers(): Promise<User[]> {
    const result = await db.select().from(users).orderBy(desc(users.createdAt));
    return result;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
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

  // Useful Phones CRUD
  async getAllUsefulPhones(publishedOnly = false): Promise<UsefulPhone[]> {
    if (publishedOnly) {
      const result = await db.select().from(usefulPhones).where(eq(usefulPhones.published, true)).orderBy(asc(usefulPhones.order), desc(usefulPhones.createdAt));
      return result;
    }
    return await db.select().from(usefulPhones).orderBy(asc(usefulPhones.order), desc(usefulPhones.createdAt));
  }

  async getUsefulPhoneById(id: string): Promise<UsefulPhone | undefined> {
    const result = await db.select().from(usefulPhones).where(eq(usefulPhones.id, id));
    return result[0];
  }

  async createUsefulPhone(data: CreateUsefulPhoneInput): Promise<UsefulPhone> {
    const result = await db.insert(usefulPhones).values(data).returning();
    return result[0];
  }

  async updateUsefulPhone(id: string, data: UpdateUsefulPhoneInput): Promise<UsefulPhone | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(usefulPhones).set(updateData).where(eq(usefulPhones.id, id)).returning();
    return result[0];
  }

  async deleteUsefulPhone(id: string): Promise<boolean> {
    const result = await db.delete(usefulPhones).where(eq(usefulPhones.id, id)).returning();
    return result.length > 0;
  }

  async getUsefulPhonesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(usefulPhones);
    return result[0]?.count ?? 0;
  }

  // Pilgrim Tips CRUD
  async getAllPilgrimTips(publishedOnly = false): Promise<PilgrimTip[]> {
    if (publishedOnly) {
      const result = await db.select().from(pilgrimTips).where(eq(pilgrimTips.published, true)).orderBy(asc(pilgrimTips.order), desc(pilgrimTips.createdAt));
      return result;
    }
    return await db.select().from(pilgrimTips).orderBy(asc(pilgrimTips.order), desc(pilgrimTips.createdAt));
  }

  async getPilgrimTipById(id: string): Promise<PilgrimTip | undefined> {
    const result = await db.select().from(pilgrimTips).where(eq(pilgrimTips.id, id));
    return result[0];
  }

  async createPilgrimTip(data: CreatePilgrimTipInput): Promise<PilgrimTip> {
    const result = await db.insert(pilgrimTips).values(data).returning();
    return result[0];
  }

  async updatePilgrimTip(id: string, data: UpdatePilgrimTipInput): Promise<PilgrimTip | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(pilgrimTips).set(updateData).where(eq(pilgrimTips.id, id)).returning();
    return result[0];
  }

  async deletePilgrimTip(id: string): Promise<boolean> {
    const result = await db.delete(pilgrimTips).where(eq(pilgrimTips.id, id)).returning();
    return result.length > 0;
  }

  async getPilgrimTipsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(pilgrimTips);
    return result[0]?.count ?? 0;
  }

  // Services CRUD
  async getAllServices(publishedOnly = false): Promise<Service[]> {
    if (publishedOnly) {
      const result = await db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.order), desc(services.createdAt));
      return result;
    }
    return await db.select().from(services).orderBy(asc(services.order), desc(services.createdAt));
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async createService(data: CreateServiceInput): Promise<Service> {
    const result = await db.insert(services).values(data).returning();
    return result[0];
  }

  async updateService(id: string, data: UpdateServiceInput): Promise<Service | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(services).set(updateData).where(eq(services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }

  async getServicesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(services);
    return result[0]?.count ?? 0;
  }

  // Businesses (Guia Comercial) CRUD
  async getAllBusinesses(publishedOnly = false): Promise<Business[]> {
    if (publishedOnly) {
      const result = await db.select().from(businesses).where(eq(businesses.published, true)).orderBy(desc(businesses.createdAt));
      return result;
    }
    return await db.select().from(businesses).orderBy(desc(businesses.createdAt));
  }

  async getBusinessById(id: string): Promise<Business | undefined> {
    const result = await db.select().from(businesses).where(eq(businesses.id, id));
    return result[0];
  }

  async createBusiness(data: CreateBusinessInput): Promise<Business> {
    const result = await db.insert(businesses).values(data).returning();
    return result[0];
  }

  async updateBusiness(id: string, data: UpdateBusinessInput): Promise<Business | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(businesses).set(updateData).where(eq(businesses.id, id)).returning();
    return result[0];
  }

  async deleteBusiness(id: string): Promise<boolean> {
    const result = await db.delete(businesses).where(eq(businesses.id, id)).returning();
    return result.length > 0;
  }

  async getBusinessesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(businesses);
    return result[0]?.count ?? 0;
  }

  async getBusinessReviews(businessId: string): Promise<BusinessReview[]> {
    return await db.select().from(businessReviews).where(eq(businessReviews.businessId, businessId)).orderBy(desc(businessReviews.createdAt));
  }

  async createBusinessReview(data: CreateBusinessReviewInput): Promise<BusinessReview> {
    const result = await db.insert(businessReviews).values(data).returning();
    
    const reviews = await this.getBusinessReviews(data.businessId);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.update(businesses).set({ 
        rating: avgRating.toFixed(1),
        reviews: reviews.length 
      }).where(eq(businesses.id, data.businessId));
    }
    
    return result[0];
  }

  async deleteBusinessReview(id: string): Promise<boolean> {
    const review = await db.select().from(businessReviews).where(eq(businessReviews.id, id));
    if (!review[0]) return false;
    
    const businessId = review[0].businessId;
    const result = await db.delete(businessReviews).where(eq(businessReviews.id, id)).returning();
    
    const reviews = await this.getBusinessReviews(businessId);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.update(businesses).set({ 
        rating: avgRating.toFixed(1),
        reviews: reviews.length 
      }).where(eq(businesses.id, businessId));
    } else {
      await db.update(businesses).set({ 
        rating: null,
        reviews: 0 
      }).where(eq(businesses.id, businessId));
    }
    
    return result.length > 0;
  }

  // Accommodation methods
  async getAllAccommodations(publishedOnly = false): Promise<Accommodation[]> {
    if (publishedOnly) {
      return await db.select().from(accommodations).where(eq(accommodations.published, true)).orderBy(desc(accommodations.featured), asc(accommodations.name));
    }
    return await db.select().from(accommodations).orderBy(desc(accommodations.createdAt));
  }

  async getAccommodationById(id: string): Promise<Accommodation | undefined> {
    const result = await db.select().from(accommodations).where(eq(accommodations.id, id));
    return result[0];
  }

  async createAccommodation(data: CreateAccommodationInput): Promise<Accommodation> {
    const result = await db.insert(accommodations).values(data).returning();
    return result[0];
  }

  async updateAccommodation(id: string, data: UpdateAccommodationInput): Promise<Accommodation | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(accommodations).set(updateData).where(eq(accommodations.id, id)).returning();
    return result[0];
  }

  async deleteAccommodation(id: string): Promise<boolean> {
    // Delete all rooms first
    await db.delete(rooms).where(eq(rooms.accommodationId, id));
    const result = await db.delete(accommodations).where(eq(accommodations.id, id)).returning();
    return result.length > 0;
  }

  async getAccommodationsCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(accommodations);
    return result[0]?.count ?? 0;
  }

  // Room methods
  async getRoomsByAccommodation(accommodationId: string, publishedOnly = false): Promise<Room[]> {
    if (publishedOnly) {
      return await db.select().from(rooms).where(and(eq(rooms.accommodationId, accommodationId), eq(rooms.published, true))).orderBy(asc(rooms.pricePerNight));
    }
    return await db.select().from(rooms).where(eq(rooms.accommodationId, accommodationId)).orderBy(asc(rooms.pricePerNight));
  }

  async getRoomById(id: string): Promise<Room | undefined> {
    const result = await db.select().from(rooms).where(eq(rooms.id, id));
    return result[0];
  }

  async createRoom(data: CreateRoomInput): Promise<Room> {
    const result = await db.insert(rooms).values(data).returning();
    return result[0];
  }

  async updateRoom(id: string, data: UpdateRoomInput): Promise<Room | undefined> {
    const updateData: any = { ...data, updatedAt: new Date() };
    const result = await db.update(rooms).set(updateData).where(eq(rooms.id, id)).returning();
    return result[0];
  }

  async deleteRoom(id: string): Promise<boolean> {
    // Delete blocked dates for this room
    await db.delete(roomBlockedDates).where(eq(roomBlockedDates.roomId, id));
    const result = await db.delete(rooms).where(eq(rooms.id, id)).returning();
    return result.length > 0;
  }

  // Room availability methods
  async getBlockedDatesForRoom(roomId: string, startDate: string, endDate: string): Promise<RoomBlockedDate[]> {
    return await db.select().from(roomBlockedDates)
      .where(and(
        eq(roomBlockedDates.roomId, roomId),
        // Date is between startDate and endDate
      ))
      .orderBy(asc(roomBlockedDates.date));
  }

  async getAllBlockedDatesForRoom(roomId: string): Promise<RoomBlockedDate[]> {
    return await db.select().from(roomBlockedDates)
      .where(eq(roomBlockedDates.roomId, roomId))
      .orderBy(asc(roomBlockedDates.date));
  }

  async blockRoomDate(data: CreateRoomBlockedDateInput): Promise<RoomBlockedDate> {
    const result = await db.insert(roomBlockedDates).values(data).returning();
    return result[0];
  }

  async unblockRoomDate(roomId: string, date: string): Promise<boolean> {
    const result = await db.delete(roomBlockedDates)
      .where(and(eq(roomBlockedDates.roomId, roomId), eq(roomBlockedDates.date, date)))
      .returning();
    return result.length > 0;
  }

  async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<boolean> {
    const room = await this.getRoomById(roomId);
    if (!room) return false;

    // Get all dates between checkIn and checkOut (excluding checkOut day)
    const dates: string[] = [];
    let current = new Date(checkIn);
    const end = new Date(checkOut);
    while (current < end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    // Check if any of these dates have all rooms booked
    for (const date of dates) {
      const blocked = await db.select().from(roomBlockedDates)
        .where(and(eq(roomBlockedDates.roomId, roomId), eq(roomBlockedDates.date, date)));
      
      const totalBooked = blocked.reduce((sum, b) => sum + (b.bookedQuantity || 1), 0);
      if (totalBooked >= (room.quantity || 1)) {
        return false; // Room fully booked on this date
      }
    }
    return true;
  }

  async getAvailableAccommodations(checkIn: string, checkOut: string): Promise<(Accommodation & { availableRooms: Room[] })[]> {
    const allAccommodations = await this.getAllAccommodations(true);
    const result: (Accommodation & { availableRooms: Room[] })[] = [];

    for (const accommodation of allAccommodations) {
      const allRooms = await this.getRoomsByAccommodation(accommodation.id, true);
      const availableRooms: Room[] = [];

      for (const room of allRooms) {
        const isAvailable = await this.checkRoomAvailability(room.id, checkIn, checkOut);
        if (isAvailable) {
          availableRooms.push(room);
        }
      }

      if (availableRooms.length > 0) {
        result.push({ ...accommodation, availableRooms });
      }
    }

    return result;
  }

  // Accommodation Reviews
  async getAccommodationReviews(accommodationId: string): Promise<AccommodationReview[]> {
    return await db.select().from(accommodationReviews)
      .where(eq(accommodationReviews.accommodationId, accommodationId))
      .orderBy(desc(accommodationReviews.createdAt));
  }

  async createAccommodationReview(data: CreateAccommodationReviewInput): Promise<AccommodationReview> {
    const result = await db.insert(accommodationReviews).values(data).returning();
    
    // Update accommodation rating
    const reviews = await this.getAccommodationReviews(data.accommodationId);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.update(accommodations).set({ 
        rating: avgRating.toFixed(1),
        reviewsCount: reviews.length 
      }).where(eq(accommodations.id, data.accommodationId));
    }
    
    return result[0];
  }

  async deleteAccommodationReview(id: string): Promise<boolean> {
    const review = await db.select().from(accommodationReviews).where(eq(accommodationReviews.id, id));
    if (!review[0]) return false;
    
    const accommodationId = review[0].accommodationId;
    const result = await db.delete(accommodationReviews).where(eq(accommodationReviews.id, id)).returning();
    
    // Recalculate rating
    const reviews = await this.getAccommodationReviews(accommodationId);
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await db.update(accommodations).set({ 
        rating: avgRating.toFixed(1),
        reviewsCount: reviews.length 
      }).where(eq(accommodations.id, accommodationId));
    } else {
      await db.update(accommodations).set({ 
        rating: null,
        reviewsCount: 0 
      }).where(eq(accommodations.id, accommodationId));
    }
    
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
