import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@portal_romeiro_favorites";
const OFFLINE_PRAYERS_KEY = "@portal_romeiro_offline_prayers";

export interface Favorite {
  id: string;
  type: "news" | "video" | "prayer" | "route";
  title: string;
  savedAt: string;
}

export interface OfflinePrayer {
  id: string;
  title: string;
  content: string;
  category: string;
  savedAt: string;
}

export async function getFavorites(): Promise<Favorite[]> {
  try {
    const data = await AsyncStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addFavorite(favorite: Omit<Favorite, "savedAt">): Promise<void> {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some((f) => f.id === favorite.id && f.type === favorite.type);
    if (!exists) {
      favorites.unshift({ ...favorite, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  } catch (error) {
    console.log("Error saving favorite:", error);
  }
}

export async function removeFavorite(id: string, type: string): Promise<void> {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((f) => !(f.id === id && f.type === type));
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.log("Error removing favorite:", error);
  }
}

export async function isFavorite(id: string, type: string): Promise<boolean> {
  const favorites = await getFavorites();
  return favorites.some((f) => f.id === id && f.type === type);
}

export async function getOfflinePrayers(): Promise<OfflinePrayer[]> {
  try {
    const data = await AsyncStorage.getItem(OFFLINE_PRAYERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveOfflinePrayer(prayer: Omit<OfflinePrayer, "savedAt">): Promise<void> {
  try {
    const prayers = await getOfflinePrayers();
    const exists = prayers.some((p) => p.id === prayer.id);
    if (!exists) {
      prayers.unshift({ ...prayer, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(prayers));
    }
  } catch (error) {
    console.log("Error saving offline prayer:", error);
  }
}

export async function removeOfflinePrayer(id: string): Promise<void> {
  try {
    const prayers = await getOfflinePrayers();
    const filtered = prayers.filter((p) => p.id !== id);
    await AsyncStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.log("Error removing offline prayer:", error);
  }
}

export async function isOfflinePrayer(id: string): Promise<boolean> {
  const prayers = await getOfflinePrayers();
  return prayers.some((p) => p.id === id);
}
