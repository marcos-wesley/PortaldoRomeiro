import { ScrollView, View, StyleSheet, Pressable, ImageBackground, Platform, Linking, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { routesData, Route } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TRINDADE_COORDS = {
  latitude: -16.6514,
  longitude: -49.4897,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

const routeCoordinates: Record<string, { latitude: number; longitude: number }[]> = {
  "1": [
    { latitude: -16.6850, longitude: -49.4950 },
    { latitude: -16.6750, longitude: -49.4920 },
    { latitude: -16.6650, longitude: -49.4900 },
    { latitude: -16.6514, longitude: -49.4897 },
  ],
  "2": [
    { latitude: -16.6600, longitude: -49.4850 },
    { latitude: -16.6560, longitude: -49.4870 },
    { latitude: -16.6514, longitude: -49.4897 },
  ],
  "3": [
    { latitude: -16.7100, longitude: -49.5100 },
    { latitude: -16.6900, longitude: -49.5050 },
    { latitude: -16.6700, longitude: -49.4980 },
    { latitude: -16.6600, longitude: -49.4920 },
    { latitude: -16.6514, longitude: -49.4897 },
  ],
};

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Facil":
      return Colors.light.success;
    case "Moderado":
      return Colors.light.warning;
    case "Dificil":
      return Colors.light.error;
    default:
      return Colors.light.primary;
  }
}

function RouteCard({ route, onPress, isSelected }: { route: Route; onPress: () => void; isSelected: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={animatedStyle}
    >
      <ImageBackground
        source={{ uri: route.imageUrl }}
        style={[styles.routeCard, isSelected && styles.routeCardSelected]}
        imageStyle={styles.routeImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.routeGradient}
        >
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(route.difficulty) }]}>
            <ThemedText style={styles.difficultyText}>{route.difficulty}</ThemedText>
          </View>
          <ThemedText style={styles.routeTitle}>{route.name}</ThemedText>
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Feather name="map" size={14} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.routeStatText}>{route.distance}</ThemedText>
            </View>
            <View style={styles.routeStat}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.routeStatText}>{route.duration}</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function RoutePoints({ route }: { route: Route }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.pointsCard, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="h4" style={styles.pointsTitle}>{route.name}</ThemedText>
      <ThemedText type="caption" secondary style={styles.pointsDescription}>{route.description}</ThemedText>
      <View style={styles.pointsList}>
        {route.points.map((point, index) => (
          <View key={index} style={styles.pointItem}>
            <View style={[styles.pointDot, { backgroundColor: Colors.light.primary }]}>
              <ThemedText style={styles.pointNumber}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.pointText}>{point}</ThemedText>
            {index < route.points.length - 1 ? (
              <View style={[styles.pointLine, { backgroundColor: theme.border }]} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

function WebMapPlaceholder() {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.mapPlaceholder, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="map" size={48} color={Colors.light.primary} />
      <ThemedText type="h4" style={styles.mapPlaceholderTitle}>Mapa Interativo</ThemedText>
      <ThemedText type="caption" secondary style={styles.mapPlaceholderText}>
        Execute no Expo Go para ver o mapa com GPS e navegacao.
      </ThemedText>
    </View>
  );
}

function LocationPermissionRequest({ onRequestPermission, onOpenSettings, canAskAgain }: { 
  onRequestPermission: () => void; 
  onOpenSettings: () => void;
  canAskAgain: boolean;
}) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.permissionCard, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="map-pin" size={32} color={Colors.light.primary} />
      <ThemedText type="h4" style={styles.permissionTitle}>Localizacao Necessaria</ThemedText>
      <ThemedText type="caption" secondary style={styles.permissionText}>
        Permita o acesso a sua localizacao para ver sua posicao no mapa.
      </ThemedText>
      {canAskAgain ? (
        <Pressable onPress={onRequestPermission} style={[styles.permissionButton, { backgroundColor: Colors.light.primary }]}>
          <ThemedText style={styles.permissionButtonText}>Permitir Localizacao</ThemedText>
        </Pressable>
      ) : (
        <Pressable onPress={onOpenSettings} style={[styles.permissionButton, { backgroundColor: Colors.light.primary }]}>
          <ThemedText style={styles.permissionButtonText}>Abrir Configuracoes</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function NativeMapView({ selectedRoute, userLocation }: { selectedRoute: Route | null; userLocation: Location.LocationObject | null }) {
  const { theme } = useTheme();
  const coords = selectedRoute ? routeCoordinates[selectedRoute.id] || [] : [];
  
  const MapView = require("react-native-maps").default;
  const { Marker, Polyline, PROVIDER_DEFAULT } = require("react-native-maps");

  return (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={TRINDADE_COORDS}
        showsUserLocation={!!userLocation}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        <Marker
          coordinate={{ latitude: -16.6514, longitude: -49.4897 }}
          title="Santuario Basilica"
          description="Divino Pai Eterno"
          pinColor={Colors.light.primary}
        />
        {coords.length > 0 ? (
          <>
            <Polyline
              coordinates={coords}
              strokeColor={getDifficultyColor(selectedRoute?.difficulty || "")}
              strokeWidth={4}
            />
            {coords.map((coord, index) => (
              <Marker
                key={index}
                coordinate={coord}
                title={selectedRoute?.points[index] || `Ponto ${index + 1}`}
                pinColor={index === coords.length - 1 ? Colors.light.primary : Colors.light.success}
              />
            ))}
          </>
        ) : null}
      </MapView>
      {selectedRoute ? (
        <View style={styles.mapOverlay}>
          <View style={[styles.routeLabel, { backgroundColor: getDifficultyColor(selectedRoute.difficulty) }]}>
            <ThemedText style={styles.routeLabelText}>{selectedRoute.name}</ThemedText>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function RoteirosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(routesData[0] || null);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionResponse | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const requestLocationPermission = useCallback(async () => {
    if (Platform.OS === "web") return;
    
    setIsLoadingLocation(true);
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(response);
      
      if (response.granted) {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(location);
      }
    } catch (error) {
      console.log("Error getting location:", error);
      Alert.alert("Erro", "Nao foi possivel obter sua localizacao. Tente novamente.");
    } finally {
      setIsLoadingLocation(false);
    }
  }, []);

  const handleOpenSettings = useCallback(async () => {
    if (Platform.OS === "web") return;
    
    try {
      await Linking.openSettings();
    } catch (error) {
      Alert.alert("Erro", "Nao foi possivel abrir as configuracoes.");
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Location.getForegroundPermissionsAsync().then((response) => {
        setPermissionStatus(response);
        if (response.granted) {
          requestLocationPermission();
        }
      });
    }
  }, [requestLocationPermission]);

  const handleOpenNavigation = () => {
    if (!selectedRoute) return;
    
    const destination = routeCoordinates[selectedRoute.id]?.[0];
    if (!destination) return;
    
    const url = Platform.select({
      ios: `maps://app?daddr=${destination.latitude},${destination.longitude}`,
      android: `google.navigation:q=${destination.latitude},${destination.longitude}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`,
    });
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Navegacao", "Nao foi possivel abrir o app de navegacao.");
      }
    });
  };

  const renderMapSection = () => {
    if (Platform.OS === "web") {
      return <WebMapPlaceholder />;
    }

    if (!permissionStatus?.granted) {
      return (
        <LocationPermissionRequest
          onRequestPermission={requestLocationPermission}
          onOpenSettings={handleOpenSettings}
          canAskAgain={permissionStatus?.canAskAgain !== false}
        />
      );
    }

    return <NativeMapView selectedRoute={selectedRoute} userLocation={userLocation} />;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.introCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="navigation" size={24} color={Colors.light.primary} />
        <View style={styles.introContent}>
          <ThemedText type="h4">Roteiros de Peregrinacao</ThemedText>
          <ThemedText type="small" secondary>
            Escolha o caminho que melhor se adapta ao seu ritmo e prepare-se para uma jornada de fe.
          </ThemedText>
        </View>
      </View>

      {renderMapSection()}

      {selectedRoute && Platform.OS !== "web" && permissionStatus?.granted ? (
        <Pressable
          onPress={handleOpenNavigation}
          style={[styles.navigateButton, { backgroundColor: Colors.light.primary }]}
        >
          <Feather name="navigation" size={18} color="#FFFFFF" />
          <ThemedText style={styles.navigateButtonText}>Iniciar Navegacao</ThemedText>
        </Pressable>
      ) : null}

      <ThemedText type="h4" style={styles.sectionTitle}>Rotas Disponiveis</ThemedText>

      {routesData.map((route) => (
        <View key={route.id} style={styles.routeSection}>
          <RouteCard 
            route={route} 
            onPress={() => setSelectedRoute(route)}
            isSelected={selectedRoute?.id === route.id}
          />
          {selectedRoute?.id === route.id ? (
            <RoutePoints route={route} />
          ) : null}
        </View>
      ))}

      <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="alert-circle" size={20} color={Colors.light.warning} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Dicas de Seguranca</ThemedText>
          <ThemedText type="caption" secondary>
            Leve agua, use roupas confortaveis, proteja-se do sol e respeite seus limites fisicos durante o percurso.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  introContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  mapContainer: {
    height: 250,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    height: 200,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  mapPlaceholderTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mapPlaceholderText: {
    textAlign: "center",
  },
  permissionCard: {
    height: 220,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  permissionTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  permissionButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  mapOverlay: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
  },
  routeLabel: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  routeLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  navigateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  navigateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  routeSection: {
    marginBottom: Spacing.xl,
  },
  routeCard: {
    height: 140,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  routeCardSelected: {
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  routeImage: {
    borderRadius: BorderRadius.lg,
  },
  routeGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  routeTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  routeStats: {
    flexDirection: "row",
  },
  routeStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  routeStatText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  pointsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  pointsTitle: {
    marginBottom: Spacing.xs,
  },
  pointsDescription: {
    marginBottom: Spacing.lg,
  },
  pointsList: {
    paddingLeft: Spacing.xs,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: Spacing.md,
  },
  pointDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    zIndex: 1,
  },
  pointNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  pointText: {
    fontSize: 14,
    flex: 1,
  },
  pointLine: {
    position: "absolute",
    left: 11,
    top: 24,
    width: 2,
    height: Spacing.lg,
  },
  tipCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
