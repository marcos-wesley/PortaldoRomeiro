import { ScrollView, View, StyleSheet, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { accommodationsData } from "@/lib/data";

type HospedagemDetailRouteProp = RouteProp<HomeStackParamList, "HospedagemDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HospedagemDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<HospedagemDetailRouteProp>();

  const accommodation = accommodationsData.find((a) => a.id === route.params.id) || accommodationsData[0];

  const handleContact = () => {
    Linking.openURL("tel:+556235050020");
  };

  const handleReserve = () => {
    Linking.openURL("https://booking.com");
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Image source={{ uri: accommodation.imageUrl }} style={styles.heroImage} contentFit="cover" />

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="h2">{accommodation.name}</ThemedText>
            <View style={styles.ratingRow}>
              <Feather name="star" size={16} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>{accommodation.rating}</ThemedText>
              <ThemedText type="small" secondary>({accommodation.reviews} avaliacoes)</ThemedText>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Feather name="map-pin" size={16} color={theme.textSecondary} />
            <ThemedText secondary style={styles.locationText}>{accommodation.location}</ThemedText>
          </View>

          <View style={[styles.priceCard, { backgroundColor: Colors.light.highlight }]}>
            <View>
              <ThemedText type="caption" secondary>Preco por noite</ThemedText>
              <View style={styles.priceRow}>
                <ThemedText style={styles.priceValue}>{accommodation.price}</ThemedText>
              </View>
            </View>
            <Feather name="calendar" size={24} color={Colors.light.primary} />
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>Sobre</ThemedText>
          <ThemedText style={styles.description}>{accommodation.description}</ThemedText>
          <ThemedText style={styles.description}>
            Localizacao privilegiada a poucos metros do Santuario Basilica, oferecendo conforto e praticidade para sua estadia durante a romaria.
          </ThemedText>

          <ThemedText type="h4" style={styles.sectionTitle}>Comodidades</ThemedText>
          <View style={styles.amenitiesGrid}>
            {accommodation.amenities.map((amenity) => (
              <View key={amenity} style={[styles.amenityItem, { backgroundColor: theme.backgroundDefault }]}>
                <Feather
                  name={getAmenityIcon(amenity) as any}
                  size={20}
                  color={Colors.light.primary}
                />
                <ThemedText style={styles.amenityText}>{amenity}</ThemedText>
              </View>
            ))}
          </View>

          <ThemedText type="h4" style={styles.sectionTitle}>Localizacao</ThemedText>
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="map" size={32} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.mapText}>
              Ver no mapa
            </ThemedText>
          </View>

          <View style={[styles.contactCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.contactHeader}>
              <Feather name="phone" size={20} color={Colors.light.primary} />
              <ThemedText type="h4" style={styles.contactTitle}>Entre em contato</ThemedText>
            </View>
            <ThemedText type="small" secondary style={styles.contactText}>
              Ligue diretamente para o estabelecimento para mais informacoes ou reservas.
            </ThemedText>
            <Pressable onPress={handleContact} style={styles.contactButton}>
              <ThemedText type="link">Ligar agora</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.md }]}>
        <View style={styles.bottomPriceContainer}>
          <ThemedText style={styles.bottomPrice}>{accommodation.price}</ThemedText>
          <ThemedText type="caption" secondary>/noite</ThemedText>
        </View>
        <Button onPress={handleReserve} style={styles.reserveButton}>
          Reservar
        </Button>
      </View>
    </View>
  );
}

function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    "Wi-Fi": "wifi",
    "Cafe da manha": "coffee",
    "Ar condicionado": "wind",
    "Estacionamento": "truck",
    "Piscina": "droplet",
    "Restaurante": "coffee",
  };
  return icons[amenity] || "check";
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    height: 280,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  locationText: {
    marginLeft: Spacing.xs,
  },
  priceCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceValue: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.xl,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginRight: "2%",
    marginBottom: Spacing.sm,
  },
  amenityText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
  },
  mapPlaceholder: {
    height: 150,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  mapText: {
    marginTop: Spacing.sm,
  },
  contactCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  contactTitle: {
    marginLeft: Spacing.sm,
  },
  contactText: {
    marginBottom: Spacing.md,
  },
  contactButton: {
    alignSelf: "flex-start",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  bottomPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  bottomPrice: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.light.primary,
    marginRight: Spacing.xs,
  },
  reserveButton: {
    paddingHorizontal: Spacing["3xl"],
  },
});
