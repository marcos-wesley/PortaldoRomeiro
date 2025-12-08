import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

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
  } catch (error) {
    console.error("Error loading favorites:", error);
    return [];
  }
}

export async function addFavorite(favorite: Omit<Favorite, "savedAt">): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const exists = favorites.some((f) => f.id === favorite.id && f.type === favorite.type);
    if (!exists) {
      favorites.unshift({ ...favorite, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
    return true;
  } catch (error) {
    console.error("Error saving favorite:", error);
    Alert.alert("Erro", "Nao foi possivel salvar o favorito. Tente novamente.");
    return false;
  }
}

export async function removeFavorite(id: string, type: string): Promise<boolean> {
  try {
    const favorites = await getFavorites();
    const filtered = favorites.filter((f) => !(f.id === id && f.type === type));
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing favorite:", error);
    Alert.alert("Erro", "Nao foi possivel remover o favorito. Tente novamente.");
    return false;
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
  } catch (error) {
    console.error("Error loading offline prayers:", error);
    return [];
  }
}

export async function saveOfflinePrayer(prayer: Omit<OfflinePrayer, "savedAt">): Promise<boolean> {
  try {
    const prayers = await getOfflinePrayers();
    const exists = prayers.some((p) => p.id === prayer.id);
    if (!exists) {
      prayers.unshift({ ...prayer, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(prayers));
    }
    return true;
  } catch (error) {
    console.error("Error saving offline prayer:", error);
    Alert.alert("Erro", "Nao foi possivel salvar a oracao para acesso offline. Tente novamente.");
    return false;
  }
}

export async function removeOfflinePrayer(id: string): Promise<boolean> {
  try {
    const prayers = await getOfflinePrayers();
    const filtered = prayers.filter((p) => p.id !== id);
    await AsyncStorage.setItem(OFFLINE_PRAYERS_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error("Error removing offline prayer:", error);
    Alert.alert("Erro", "Nao foi possivel remover a oracao. Tente novamente.");
    return false;
  }
}

export async function isOfflinePrayer(id: string): Promise<boolean> {
  const prayers = await getOfflinePrayers();
  return prayers.some((p) => p.id === id);
}
