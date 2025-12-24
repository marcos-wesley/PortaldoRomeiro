import { ScrollView, View, StyleSheet, Pressable, TextInput, ImageBackground, Platform, Linking, RefreshControl, ActivityIndicator, Modal, Alert, Share } from "react-native";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { MaisStackParamList } from "@/navigation/MaisStackNavigator";
import { getApiUrl } from "@/lib/query-client";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

let MapViewComponent: any = null;
let MarkerComponent: any = null;
if (Platform.OS !== "web") {
  try {
    const RNMaps = require("react-native-maps");
    MapViewComponent = RNMaps.default;
    MarkerComponent = RNMaps.Marker;
  } catch (e) {
  }
}

function NativeMapView({ attraction, userLocation }: { 
  attraction: Attraction; 
  userLocation: { latitude: number; longitude: number } | null;
}) {
  if (!MapViewComponent || !MarkerComponent) {
    return null;
  }
  
  return (
    <MapViewComponent
      style={styles.mapView}
      initialRegion={{
        latitude: parseFloat(attraction.latitude!),
        longitude: parseFloat(attraction.longitude!),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <MarkerComponent
        coordinate={{
          latitude: parseFloat(attraction.latitude!),
          longitude: parseFloat(attraction.longitude!),
        }}
        title={attraction.name}
        description={attraction.address || undefined}
      />
    </MapViewComponent>
  );
}

type Category = "Todas" | "Igrejas" | "Monumentos" | "Pracas" | "Museus";

interface AttractionFromAPI {
  id: string;
  name: string;
  category: string;
  imageUrl: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  latitude: string | null;
  longitude: string | null;
  scheduleWeekdays: string | null;
  scheduleSaturday: string | null;
  scheduleSunday: string | null;
  massSchedule: string | null;
  amenities: string | null;
  tips: string | null;
  relatedAttractions: string | null;
  featured: boolean;
  published: boolean;
  views: number;
}

interface Attraction {
  id: string;
  name: string;
  category: Category;
  imageUrl: string;
  distance: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  latitude: string | null;
  longitude: string | null;
  schedule: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  massSchedule?: string[];
  amenities: string[];
  tips: string[];
  related: string[];
}

function getFullImageUrl(imageUrl: string | null): string {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";
  }
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return `${getApiUrl()}${imageUrl}`;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1)} km`;
}

const FAVORITES_KEY = "@attractions_favorites";

function transformAttraction(item: AttractionFromAPI): Attraction {
  return {
    id: item.id,
    name: item.name,
    category: (item.category as Category) || "Igrejas",
    imageUrl: getFullImageUrl(item.imageUrl),
    distance: "",
    address: item.address || "",
    phone: item.phone || "",
    website: item.website || "",
    description: item.description || "",
    latitude: item.latitude,
    longitude: item.longitude,
    schedule: {
      weekdays: item.scheduleWeekdays || "",
      saturday: item.scheduleSaturday || "",
      sunday: item.scheduleSunday || "",
    },
    massSchedule: item.massSchedule ? item.massSchedule.split("|").filter(s => s.trim()) : undefined,
    amenities: item.amenities ? item.amenities.split(",").filter(a => a.trim()) : [],
    tips: item.tips ? item.tips.split("|").filter(t => t.trim()) : [],
    related: item.relatedAttractions ? item.relatedAttractions.split("|").filter(r => r.trim()) : [],
  };
}


const categories: Category[] = ["Todas", "Igrejas", "Monumentos", "Pracas", "Museus"];

function CategoryChip({ 
  category, 
  isSelected, 
  onPress 
}: { 
  category: Category; 
  isSelected: boolean; 
  onPress: () => void;
}) {
  const { theme } = useTheme();
  
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.categoryChip,
        isSelected 
          ? { backgroundColor: Colors.light.primary }
          : { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border },
      ]}
    >
      <ThemedText 
        style={[
          styles.categoryChipText,
          { color: isSelected ? "#FFFFFF" : theme.text },
        ]}
      >
        {category}
      </ThemedText>
    </Pressable>
  );
}

function AttractionCard({ 
  attraction, 
  onPress,
  userLocation,
}: { 
  attraction: Attraction; 
  onPress: () => void;
  userLocation: { latitude: number; longitude: number } | null;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const distanceText = useMemo(() => {
    if (!userLocation || !attraction.latitude || !attraction.longitude) {
      return null;
    }
    const lat = parseFloat(attraction.latitude);
    const lon = parseFloat(attraction.longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    const dist = calculateDistance(userLocation.latitude, userLocation.longitude, lat, lon);
    return formatDistance(dist);
  }, [userLocation, attraction.latitude, attraction.longitude]);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.attractionCard, animatedStyle]}
    >
      <ImageBackground
        source={{ uri: attraction.imageUrl }}
        style={styles.attractionImage}
        imageStyle={{ borderRadius: BorderRadius.lg }}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.attractionGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: Colors.light.primary }]}>
            <ThemedText style={styles.categoryBadgeText}>{attraction.category}</ThemedText>
          </View>
          
          <View style={styles.attractionInfo}>
            <ThemedText style={styles.attractionName} numberOfLines={2}>
              {attraction.name}
            </ThemedText>
            {distanceText ? (
              <View style={styles.distanceRow}>
                <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
                <ThemedText style={styles.distanceText}>{distanceText}</ThemedText>
              </View>
            ) : null}
          </View>

          <Pressable 
            style={[styles.detailsButton, { backgroundColor: "rgba(255,255,255,0.95)" }]}
            onPress={onPress}
          >
            <Feather name="info" size={14} color={Colors.light.primary} />
            <ThemedText style={[styles.detailsButtonText, { color: Colors.light.primary }]}>
              Detalhes
            </ThemedText>
          </Pressable>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function AttractionDetailModal({ 
  attraction, 
  allAttractions,
  onClose,
  userLocation,
  isFavorite,
  onToggleFavorite,
}: { 
  attraction: Attraction; 
  allAttractions: Attraction[];
  onClose: () => void;
  userLocation: { latitude: number; longitude: number } | null;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [showMapModal, setShowMapModal] = useState(false);

  const distanceText = useMemo(() => {
    if (!userLocation || !attraction.latitude || !attraction.longitude) {
      return null;
    }
    const lat = parseFloat(attraction.latitude);
    const lon = parseFloat(attraction.longitude);
    if (isNaN(lat) || isNaN(lon)) return null;
    const dist = calculateDistance(userLocation.latitude, userLocation.longitude, lat, lon);
    return formatDistance(dist);
  }, [userLocation, attraction.latitude, attraction.longitude]);

  const hasCoordinates = attraction.latitude && attraction.longitude && 
    !isNaN(parseFloat(attraction.latitude)) && !isNaN(parseFloat(attraction.longitude));

  const handleDirections = useCallback(() => {
    let url: string;
    if (hasCoordinates) {
      const lat = parseFloat(attraction.latitude!);
      const lon = parseFloat(attraction.longitude!);
      url = Platform.select({
        ios: `maps://app?daddr=${lat},${lon}&dirflg=d`,
        android: `google.navigation:q=${lat},${lon}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
      }) as string;
    } else if (attraction.address) {
      url = Platform.select({
        ios: `maps://app?daddr=${encodeURIComponent(attraction.address)}`,
        android: `geo:0,0?q=${encodeURIComponent(attraction.address)}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(attraction.address)}`,
      }) as string;
    } else {
      Alert.alert("Erro", "Localizacao nao disponivel para esta atracao.");
      return;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert("Erro", "Nao foi possivel abrir o mapa.");
    });
  }, [attraction, hasCoordinates]);

  const handleViewOnMap = useCallback(() => {
    if (!hasCoordinates) {
      Alert.alert("Erro", "Coordenadas nao disponiveis para esta atracao.");
      return;
    }
    setShowMapModal(true);
  }, [hasCoordinates]);

  const handleCall = useCallback(() => {
    if (attraction.phone) {
      Linking.openURL(`tel:${attraction.phone.replace(/\D/g, "")}`);
    }
  }, [attraction.phone]);

  const handleOpenWebsite = useCallback(() => {
    if (attraction.website) {
      const url = attraction.website.startsWith("http") ? attraction.website : `https://${attraction.website}`;
      Linking.openURL(url);
    }
  }, [attraction.website]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Confira ${attraction.name} no Portal do Romeiro! ${attraction.address || ""}`,
        title: attraction.name,
      });
    } catch (error) {
      console.log("Share error:", error);
    }
  }, [attraction]);

  const hasAddress = attraction.address && attraction.address.trim().length > 0;
  const hasSchedule = attraction.schedule.weekdays || attraction.schedule.saturday || attraction.schedule.sunday;
  const hasMassSchedule = attraction.massSchedule && attraction.massSchedule.length > 0;
  const hasScheduleSection = hasSchedule || hasMassSchedule;

  return (
    <View style={[styles.modalOverlay, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={{ uri: attraction.imageUrl }}
          style={styles.modalHeroImage}
        >
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
            style={styles.modalHeroGradient}
          >
            <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.sm }]}>
              <View style={{ flex: 1 }} />
              <View style={styles.modalHeaderActions}>
                <Pressable 
                  onPress={handleShare}
                  style={[styles.modalActionButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}
                >
                  <Feather name="share-2" size={18} color={theme.text} />
                </Pressable>
                <Pressable 
                  onPress={onToggleFavorite}
                  style={[styles.modalActionButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}
                >
                  <Feather 
                    name={isFavorite ? "heart" : "heart"} 
                    size={18} 
                    color={isFavorite ? Colors.light.primary : theme.text}
                    style={isFavorite ? { opacity: 1 } : { opacity: 0.7 }}
                  />
                </Pressable>
              </View>
            </View>

            <View style={styles.modalHeroInfo}>
              <View style={[styles.categoryBadge, { backgroundColor: Colors.light.primary }]}>
                <ThemedText style={styles.categoryBadgeText}>{attraction.category}</ThemedText>
              </View>
              {distanceText ? (
                <View style={styles.distanceRow}>
                  <Feather name="map-pin" size={14} color="#FFFFFF" />
                  <ThemedText style={[styles.distanceText, { marginLeft: 4 }]}>
                    {distanceText} de voce
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.modalContent}>
          <ThemedText type="h2" style={styles.modalTitle}>{attraction.name}</ThemedText>

          <View style={styles.actionButtonsRow}>
            <Pressable 
              onPress={handleDirections}
              style={[styles.primaryActionButton, { backgroundColor: Colors.light.primary }]}
            >
              <Feather name="navigation" size={18} color="#FFFFFF" />
              <ThemedText style={styles.primaryActionButtonText}>Como Chegar</ThemedText>
            </Pressable>
            <Pressable 
              onPress={handleViewOnMap}
              style={[styles.secondaryActionButton, { borderColor: Colors.light.primary, opacity: hasCoordinates ? 1 : 0.5 }]}
            >
              <Feather name="map" size={18} color={Colors.light.primary} />
              <ThemedText style={[styles.secondaryActionButtonText, { color: Colors.light.primary }]}>
                Ver no Mapa
              </ThemedText>
            </Pressable>
          </View>

          {attraction.description ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="h4" style={styles.sectionTitle}>Sobre a atracao</ThemedText>
              <ThemedText type="body" style={styles.descriptionText}>
                {attraction.description}
              </ThemedText>
            </View>
          ) : null}

          {(hasAddress || attraction.phone || attraction.website) ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
              {hasAddress ? (
                <View style={styles.contactRow}>
                  <Feather name="map-pin" size={18} color={Colors.light.primary} />
                  <View style={styles.contactInfo}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>Endereco</ThemedText>
                    <ThemedText type="caption" secondary>{attraction.address}</ThemedText>
                  </View>
                </View>
              ) : null}

              {attraction.phone ? (
                <Pressable onPress={handleCall} style={styles.contactRow}>
                  <Feather name="phone" size={18} color={Colors.light.primary} />
                  <View style={styles.contactInfo}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>Telefone</ThemedText>
                    <ThemedText type="caption" style={{ color: Colors.light.primary }}>
                      {attraction.phone}
                    </ThemedText>
                  </View>
                </Pressable>
              ) : null}

              {attraction.website ? (
                <Pressable onPress={handleOpenWebsite} style={styles.contactRow}>
                  <Feather name="globe" size={18} color={Colors.light.primary} />
                  <View style={styles.contactInfo}>
                    <ThemedText type="small" style={{ fontWeight: "600" }}>Site Oficial</ThemedText>
                    <ThemedText type="caption" style={{ color: Colors.light.primary }}>
                      {attraction.website}
                    </ThemedText>
                  </View>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          {hasScheduleSection ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.scheduleHeader}>
                <Feather name="clock" size={18} color={Colors.light.primary} />
                <ThemedText type="h4" style={[styles.sectionTitle, { marginLeft: Spacing.sm, marginBottom: 0 }]}>
                  Horarios {hasMassSchedule ? "e Missas" : ""}
                </ThemedText>
              </View>

              {hasSchedule ? (
                <View style={styles.scheduleSection}>
                  <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                    Funcionamento
                  </ThemedText>
                  {attraction.schedule.weekdays ? (
                    <View style={styles.scheduleRow}>
                      <ThemedText type="caption">Seg a Sex</ThemedText>
                      <ThemedText type="caption" secondary>{attraction.schedule.weekdays}</ThemedText>
                    </View>
                  ) : null}
                  {attraction.schedule.saturday ? (
                    <View style={styles.scheduleRow}>
                      <ThemedText type="caption">Sabado</ThemedText>
                      <ThemedText type="caption" secondary>{attraction.schedule.saturday}</ThemedText>
                    </View>
                  ) : null}
                  {attraction.schedule.sunday ? (
                    <View style={styles.scheduleRow}>
                      <ThemedText type="caption">Domingo</ThemedText>
                      <ThemedText type="caption" secondary>{attraction.schedule.sunday}</ThemedText>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {hasMassSchedule ? (
                <View style={[styles.massScheduleCard, { backgroundColor: Colors.light.primary + "10" }]}>
                  <ThemedText type="small" style={{ fontWeight: "600", color: Colors.light.primary, marginBottom: Spacing.sm }}>
                    Horarios de Missa
                  </ThemedText>
                  {attraction.massSchedule!.map((schedule, index) => (
                    <ThemedText key={index} type="caption" style={{ marginBottom: 2 }}>
                      {schedule}
                    </ThemedText>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}

          {attraction.amenities.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="h4" style={styles.sectionTitle}>Comodidades</ThemedText>
              <View style={styles.amenitiesRow}>
                {attraction.amenities.map((amenity, index) => (
                  <View key={index} style={[styles.amenityChip, { borderColor: theme.border }]}>
                    <Feather 
                      name={
                        amenity === "Acessivel" ? "users" :
                        amenity === "Lanchonete" ? "coffee" :
                        amenity === "Estacionamento" ? "map-pin" :
                        "shopping-bag"
                      } 
                      size={14} 
                      color={theme.textSecondary} 
                    />
                    <ThemedText type="caption" style={{ marginLeft: 4 }}>{amenity}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {attraction.tips.length > 0 ? (
            <View style={[styles.tipsCard, { backgroundColor: Colors.light.warning + "15" }]}>
              <View style={styles.tipsHeader}>
                <Feather name="alert-circle" size={18} color={Colors.light.warning} />
                <ThemedText type="h4" style={[styles.sectionTitle, { marginLeft: Spacing.sm, marginBottom: 0, color: Colors.light.warning }]}>
                  Dicas do Romeiro
                </ThemedText>
              </View>
              {attraction.tips.map((tip, index) => (
                <View key={index} style={styles.tipRow}>
                  <ThemedText style={styles.tipBullet}>•</ThemedText>
                  <ThemedText type="caption" style={styles.tipText}>{tip}</ThemedText>
                </View>
              ))}
            </View>
          ) : null}

          {attraction.related.length > 0 ? (
            <View style={styles.relatedSection}>
              <ThemedText type="h4" style={styles.sectionTitle}>Voce tambem pode gostar</ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.relatedScroll}
              >
                {attraction.related.map((name, index) => {
                  const related = allAttractions.find(a => a.name.toLowerCase().includes(name.toLowerCase().split(" ")[0]));
                  return (
                    <View key={index} style={styles.relatedCard}>
                      <Image 
                        source={{ uri: related?.imageUrl || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400" }}
                        style={styles.relatedImage}
                      />
                      <ThemedText type="caption" style={styles.relatedName} numberOfLines={1}>
                        {name}
                      </ThemedText>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={[styles.mapModalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.mapModalHeader, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable 
              onPress={() => setShowMapModal(false)}
              style={[styles.modalBackButton, { backgroundColor: theme.backgroundDefault }]}
            >
              <Feather name="x" size={20} color={theme.text} />
            </Pressable>
            <ThemedText type="h4" style={{ flex: 1, textAlign: "center", marginRight: 40 }}>
              {attraction.name}
            </ThemedText>
          </View>
          {hasCoordinates ? (
            Platform.OS === "web" ? (
              <View style={styles.mapErrorContainer}>
                <Feather name="map" size={48} color={Colors.light.primary} />
                <ThemedText type="body" style={{ marginTop: Spacing.md, textAlign: "center" }}>
                  Abra o app no Expo Go para ver o mapa interativo
                </ThemedText>
                <Pressable 
                  onPress={handleDirections}
                  style={[styles.primaryActionButton, { backgroundColor: Colors.light.primary, marginTop: Spacing.lg }]}
                >
                  <Feather name="external-link" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.primaryActionButtonText}>Abrir no Google Maps</ThemedText>
                </Pressable>
              </View>
            ) : (
              <NativeMapView 
                attraction={attraction} 
                userLocation={userLocation}
              />
            )
          ) : (
            <View style={styles.mapErrorContainer}>
              <Feather name="map-pin" size={48} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={{ marginTop: Spacing.md, textAlign: "center" }}>
                Coordenadas nao disponiveis
              </ThemedText>
            </View>
          )}
          <View style={[styles.mapModalFooter, { paddingBottom: insets.bottom + Spacing.md }]}>
            <Pressable 
              onPress={handleDirections}
              style={[styles.primaryActionButton, { backgroundColor: Colors.light.primary, flex: 1 }]}
            >
              <Feather name="navigation" size={18} color="#FFFFFF" />
              <ThemedText style={styles.primaryActionButtonText}>Tracar Rota</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function RoteirosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);

  useEffect(() => {
    loadFavorites();
    requestLocationPermission();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    } catch (error) {
      console.log("Error loading favorites:", error);
    }
  };

  const saveFavorites = async (newFavorites: Set<string>) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([...newFavorites]));
    } catch (error) {
      console.log("Error saving favorites:", error);
    }
  };

  const toggleFavorite = useCallback((attractionId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(attractionId)) {
        newFavorites.delete(attractionId);
      } else {
        newFavorites.add(attractionId);
      }
      saveFavorites(newFavorites);
      return newFavorites;
    });
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === "web") {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        setLocationPermission(status);
        if (status === "granted") {
          getCurrentLocation();
        }
      } catch (error) {
        console.log("Location permission error on web:", error);
      }
      return;
    }
    
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationPermission(status);
    if (status === "granted") {
      getCurrentLocation();
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.log("Error getting location:", error);
    }
  };

  const { data, isLoading, error } = useQuery<{ attractions: AttractionFromAPI[] }>({
    queryKey: ["/api/attractions"],
    staleTime: 30000,
    refetchInterval: 60000,
    refetchOnWindowFocus: true,
  });

  const attractions = useMemo(() => {
    if (!data?.attractions) return [];
    return data.attractions.map(transformAttraction);
  }, [data?.attractions]);

  const filteredAttractions = useMemo(() => {
    return attractions.filter(attraction => {
      const matchesCategory = selectedCategory === "Todas" || attraction.category === selectedCategory;
      const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [attractions, selectedCategory, searchQuery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/attractions"] });
    getCurrentLocation();
    setRefreshing(false);
  }, [queryClient]);

  if (selectedAttraction) {
    return (
      <AttractionDetailModal 
        attraction={selectedAttraction} 
        allAttractions={attractions}
        onClose={() => setSelectedAttraction(null)}
        userLocation={userLocation}
        isFavorite={favorites.has(selectedAttraction.id)}
        onToggleFavorite={() => toggleFavorite(selectedAttraction.id)}
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl + 60,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.light.primary}
          colors={[Colors.light.primary]}
        />
      }
    >
      <View style={styles.header}>
        <ThemedText type="caption" secondary style={styles.headerSubtitle}>
          NA CAPITAL DA FE
        </ThemedText>
        <View style={styles.headerTitleRow}>
          <ThemedText type="h1" style={styles.headerTitle}>Atracoes Turisticas</ThemedText>
          <Pressable 
            style={styles.locationButton}
            onPress={getCurrentLocation}
          >
            <Feather name="crosshair" size={20} color={userLocation ? Colors.light.primary : theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar atracao..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {categories.map((category) => (
          <CategoryChip
            key={category}
            category={category}
            isSelected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
          />
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <ThemedText type="body" secondary style={{ marginTop: Spacing.md }}>
            Carregando atracoes...
          </ThemedText>
        </View>
      ) : filteredAttractions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="map-pin" size={48} color={theme.textSecondary} />
          <ThemedText type="body" secondary style={{ marginTop: Spacing.md, textAlign: "center" }}>
            {searchQuery || selectedCategory !== "Todas" 
              ? "Nenhuma atracao encontrada com os filtros selecionados."
              : "Nenhuma atracao cadastrada ainda."}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.attractionsGrid}>
          {filteredAttractions.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              attraction={attraction}
              onPress={() => setSelectedAttraction(attraction)}
              userLocation={userLocation}
            />
          ))}
        </View>
      )}

      <Pressable style={[styles.mapButton, { backgroundColor: Colors.light.primary }]}>
        <Feather name="map" size={18} color="#FFFFFF" />
        <ThemedText style={styles.mapButtonText}>Ver todas no mapa</ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  headerSubtitle: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  locationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
    paddingVertical: Spacing.xs,
  },
  categoriesContainer: {
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  attractionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  attractionCard: {
    width: "48%",
    marginBottom: Spacing.md,
  },
  attractionImage: {
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  attractionGradient: {
    flex: 1,
    padding: Spacing.sm,
    justifyContent: "space-between",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
  attractionInfo: {
    flex: 1,
    justifyContent: "flex-end",
  },
  attractionName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginLeft: 4,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    position: "absolute",
    bottom: 0,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  mapButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
  },
  modalHeroImage: {
    height: 280,
  },
  modalHeroGradient: {
    flex: 1,
    justifyContent: "space-between",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeaderActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalHeroInfo: {
    padding: Spacing.lg,
  },
  modalContent: {
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  primaryActionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  scheduleSection: {
    marginBottom: Spacing.md,
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  massScheduleCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  amenitiesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tipsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  tipBullet: {
    marginRight: Spacing.sm,
    color: Colors.light.warning,
  },
  tipText: {
    flex: 1,
  },
  relatedSection: {
    marginTop: Spacing.md,
  },
  relatedScroll: {
    gap: Spacing.md,
  },
  relatedCard: {
    width: 100,
    marginRight: Spacing.md,
  },
  relatedImage: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  relatedName: {
    fontSize: 12,
    textAlign: "center",
  },
  mapModalContainer: {
    flex: 1,
  },
  mapModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  mapView: {
    flex: 1,
  },
  mapErrorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mapModalFooter: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
