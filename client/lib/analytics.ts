import { getApiUrl } from './query-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AnalyticsEventType = 
  | 'accommodation_view'
  | 'business_view'
  | 'reservation_click'
  | 'banner_click'
  | 'banner_impression'
  | 'news_ad_click'
  | 'video_view'
  | 'news_view'
  | 'attraction_view'
  | 'phone_click'
  | 'whatsapp_click'
  | 'website_click'
  | 'map_click'
  | 'share_click';

interface AnalyticsEventParams {
  eventType: AnalyticsEventType;
  entityType?: string;
  entityId?: string;
  entityName?: string;
  metadata?: Record<string, unknown>;
}

const ANALYTICS_QUEUE_KEY = '@analytics_queue';
let isProcessingQueue = false;

async function getSessionId(): Promise<string> {
  let sessionId = await AsyncStorage.getItem('@session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem('@session_id', sessionId);
  }
  return sessionId;
}

async function getUserId(): Promise<string | null> {
  const userData = await AsyncStorage.getItem('@user_data');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || null;
    } catch {
      return null;
    }
  }
  return null;
}

export async function trackEvent(params: AnalyticsEventParams): Promise<void> {
  try {
    const sessionId = await getSessionId();
    const userId = await getUserId();
    
    const event = {
      ...params,
      userId,
      sessionId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      source: 'app',
    };

    const baseUrl = getApiUrl();
    const response = await fetch(`${baseUrl}api/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      await addToQueue(event);
    }
  } catch (error) {
    const sessionId = await getSessionId();
    const userId = await getUserId();
    await addToQueue({
      ...params,
      userId,
      sessionId,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      source: 'app',
    });
  }
}

async function addToQueue(event: object): Promise<void> {
  try {
    const queueData = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
    const queue = queueData ? JSON.parse(queueData) : [];
    queue.push({ ...event, queuedAt: Date.now() });
    if (queue.length > 100) {
      queue.shift();
    }
    await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(queue));
  } catch {
  }
}

export async function processQueue(): Promise<void> {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  try {
    const queueData = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
    if (!queueData) {
      isProcessingQueue = false;
      return;
    }

    const queue = JSON.parse(queueData);
    if (queue.length === 0) {
      isProcessingQueue = false;
      return;
    }

    const baseUrl = getApiUrl();
    const successful: number[] = [];

    for (let i = 0; i < queue.length; i++) {
      try {
        const { queuedAt, ...event } = queue[i];
        const response = await fetch(`${baseUrl}api/analytics/event`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });

        if (response.ok) {
          successful.push(i);
        }
      } catch {
      }
    }

    const remainingQueue = queue.filter((_: object, i: number) => !successful.includes(i));
    await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(remainingQueue));
  } catch {
  } finally {
    isProcessingQueue = false;
  }
}

export function trackAccommodationView(id: string, name: string): void {
  trackEvent({
    eventType: 'accommodation_view',
    entityType: 'accommodation',
    entityId: id,
    entityName: name,
  });
}

export function trackBusinessView(id: string, name: string): void {
  trackEvent({
    eventType: 'business_view',
    entityType: 'business',
    entityId: id,
    entityName: name,
  });
}

export function trackReservationClick(accommodationId: string, name: string): void {
  trackEvent({
    eventType: 'reservation_click',
    entityType: 'accommodation',
    entityId: accommodationId,
    entityName: name,
  });
}

export function trackBannerClick(bannerId: string, name: string): void {
  trackEvent({
    eventType: 'banner_click',
    entityType: 'banner',
    entityId: bannerId,
    entityName: name,
  });
}

export function trackBannerImpression(bannerId: string, name: string): void {
  trackEvent({
    eventType: 'banner_impression',
    entityType: 'banner',
    entityId: bannerId,
    entityName: name,
  });
}

export function trackNewsAdClick(newsId: string, title: string): void {
  trackEvent({
    eventType: 'news_ad_click',
    entityType: 'news',
    entityId: newsId,
    entityName: title,
  });
}

export function trackNewsView(newsId: string, title: string): void {
  trackEvent({
    eventType: 'news_view',
    entityType: 'news',
    entityId: newsId,
    entityName: title,
  });
}

export function trackVideoView(videoId: string, title: string): void {
  trackEvent({
    eventType: 'video_view',
    entityType: 'video',
    entityId: videoId,
    entityName: title,
  });
}

export function trackAttractionView(attractionId: string, name: string): void {
  trackEvent({
    eventType: 'attraction_view',
    entityType: 'attraction',
    entityId: attractionId,
    entityName: name,
  });
}

export function trackPhoneClick(entityType: string, entityId: string, name: string): void {
  trackEvent({
    eventType: 'phone_click',
    entityType,
    entityId,
    entityName: name,
  });
}

export function trackWhatsAppClick(entityType: string, entityId: string, name: string): void {
  trackEvent({
    eventType: 'whatsapp_click',
    entityType,
    entityId,
    entityName: name,
  });
}

export function trackWebsiteClick(entityType: string, entityId: string, name: string): void {
  trackEvent({
    eventType: 'website_click',
    entityType,
    entityId,
    entityName: name,
  });
}

export function trackMapClick(entityType: string, entityId: string, name: string): void {
  trackEvent({
    eventType: 'map_click',
    entityType,
    entityId,
    entityName: name,
  });
}

export function trackShareClick(entityType: string, entityId: string, name: string): void {
  trackEvent({
    eventType: 'share_click',
    entityType,
    entityId,
    entityName: name,
  });
}
