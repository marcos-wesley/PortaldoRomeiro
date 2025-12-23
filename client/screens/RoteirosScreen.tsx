import { ScrollView, View, StyleSheet, Pressable, TextInput, ImageBackground, Platform, Linking } from "react-native";
import { useState, useCallback } from "react";
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

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { MaisStackParamList } from "@/navigation/MaisStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Category = "Todas" | "Igrejas" | "Monumentos" | "Pracas" | "Museus";

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

const attractions: Attraction[] = [
  {
    id: "1",
    name: "Santuario Basilica do Divino Pai Eterno",
    category: "Igrejas",
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800",
    distance: "0m",
    address: "Praca do Santuario, 238 - Vila Pai Eterno, Trindade - GO, 75380-000",
    phone: "(62) 3505-1780",
    website: "paieterno.com.br",
    description: "O Santuario Basilica do Divino Pai Eterno e um templo catolico brasileiro localizado no municipio de Trindade, em Goias. E o unico santuario do mundo dedicado ao Divino Pai Eterno.\n\nA devocao ao Divino Pai Eterno em Trindade teve inicio por volta de 1840, quando o casal Constantino e Ana Rosa Xavier encontrou um medalhao de barro com a imagem da Santissima Trindade coroando a Virgem Maria.",
    schedule: {
      weekdays: "07h as 18h",
      saturday: "07h as 17h",
      sunday: "07h as 12h",
    },
    massSchedule: [
      "Seg a Sex: 07h, 19h30",
      "Sabado: 07h, 10h, 15h, 17h30",
      "Domingo: 05h45, 08h, 10h, 12h, 15h, 17h30",
    ],
    amenities: ["Acessivel", "Lanchonete", "Estacionamento", "Loja Oficial"],
    tips: [
      "Chegue cedo para as missas de domingo, pois costumam lotar.",
      "Visite a Sala dos Milagres no subsolo.",
      "Use roupas adequadas para entrar no templo.",
      "Beba bastante agua, o clima pode ser seco.",
    ],
    related: ["Igreja Matriz", "Portal da Fe", "Via Sacra"],
  },
  {
    id: "2",
    name: "Igreja Matriz",
    category: "Igrejas",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    distance: "800m",
    address: "Praca da Matriz, Centro - Trindade, GO",
    phone: "(62) 3505-1200",
    website: "",
    description: "A Igreja Matriz de Trindade e um dos templos mais antigos da cidade, com arquitetura historica que remonta aos primeiros anos da devocao ao Divino Pai Eterno na regiao.",
    schedule: {
      weekdays: "08h as 17h",
      saturday: "08h as 16h",
      sunday: "08h as 12h",
    },
    amenities: ["Acessivel"],
    tips: [
      "Visite durante a semana para evitar multidoes.",
      "Aprecie os vitrais historicos.",
    ],
    related: ["Santuario Basilica", "Praca da Matriz"],
  },
  {
    id: "3",
    name: "Portal da Fe",
    category: "Monumentos",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    distance: "1.2km",
    address: "Entrada da cidade - Trindade, GO",
    phone: "",
    website: "",
    description: "O Portal da Fe e um monumento imponente que marca a entrada da cidade de Trindade. Simboliza a fe e devocao dos romeiros que chegam a cidade.",
    schedule: {
      weekdays: "24 horas",
      saturday: "24 horas",
      sunday: "24 horas",
    },
    amenities: ["Estacionamento"],
    tips: [
      "Otimo local para fotos.",
      "Visite ao entardecer para melhor iluminacao.",
    ],
    related: ["Santuario Basilica", "Carreirodromos"],
  },
  {
    id: "4",
    name: "Praca da Matriz",
    category: "Pracas",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    distance: "850m",
    address: "Centro - Trindade, GO",
    phone: "",
    website: "",
    description: "A Praca da Matriz e um espaco publico no coracao de Trindade, cercado por comercios e restaurantes. E um ponto de encontro tradicional para moradores e visitantes.",
    schedule: {
      weekdays: "24 horas",
      saturday: "24 horas",
      sunday: "24 horas",
    },
    amenities: ["Lanchonete", "Estacionamento"],
    tips: [
      "Boa opcao para descansar durante a romaria.",
      "Experimente os doces tipicos vendidos na praca.",
    ],
    related: ["Igreja Matriz", "Restaurantes"],
  },
  {
    id: "5",
    name: "Via Sacra",
    category: "Monumentos",
    imageUrl: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800",
    distance: "500m",
    address: "Proximo ao Santuario - Trindade, GO",
    phone: "",
    website: "",
    description: "A Via Sacra de Trindade e composta por estacoes que representam os momentos da Paixao de Cristo. E um percurso de oracao e meditacao muito procurado pelos romeiros.",
    schedule: {
      weekdays: "06h as 20h",
      saturday: "06h as 20h",
      sunday: "06h as 20h",
    },
    amenities: ["Acessivel"],
    tips: [
      "Leve agua e use calcados confortaveis.",
      "Percorra com calma, parando em cada estacao.",
    ],
    related: ["Santuario Basilica", "Sala dos Milagres"],
  },
  {
    id: "6",
    name: "Museu de Arte Sacra",
    category: "Museus",
    imageUrl: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=800",
    distance: "300m",
    address: "Anexo ao Santuario - Trindade, GO",
    phone: "(62) 3505-1780",
    website: "paieterno.com.br",
    description: "O Museu de Arte Sacra abriga uma colecao de objetos religiosos, ex-votos e artefatos historicos relacionados a devocao ao Divino Pai Eterno.",
    schedule: {
      weekdays: "09h as 16h",
      saturday: "09h as 15h",
      sunday: "Fechado",
    },
    amenities: ["Acessivel", "Loja Oficial"],
    tips: [
      "Reserve pelo menos 1 hora para a visita.",
      "Fotografias sem flash sao permitidas.",
    ],
    related: ["Santuario Basilica", "Sala dos Milagres"],
  },
];

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
  onPress 
}: { 
  attraction: Attraction; 
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

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
            <View style={styles.distanceRow}>
              <Feather name="map-pin" size={12} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.distanceText}>{attraction.distance}</ThemedText>
            </View>
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
  onClose 
}: { 
  attraction: Attraction; 
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleOpenMaps = useCallback(() => {
    const url = Platform.select({
      ios: `maps://app?q=${encodeURIComponent(attraction.address)}`,
      android: `geo:0,0?q=${encodeURIComponent(attraction.address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.address)}`,
    });
    Linking.openURL(url);
  }, [attraction.address]);

  const handleCall = useCallback(() => {
    if (attraction.phone) {
      Linking.openURL(`tel:${attraction.phone.replace(/\D/g, "")}`);
    }
  }, [attraction.phone]);

  const handleOpenWebsite = useCallback(() => {
    if (attraction.website) {
      Linking.openURL(`https://${attraction.website}`);
    }
  }, [attraction.website]);

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
            colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.5)"]}
            style={styles.modalHeroGradient}
          >
            <View style={[styles.modalHeader, { paddingTop: insets.top + Spacing.md }]}>
              <Pressable 
                onPress={onClose}
                style={[styles.modalBackButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}
              >
                <Feather name="arrow-left" size={20} color={theme.text} />
              </Pressable>
              <View style={styles.modalHeaderActions}>
                <Pressable style={[styles.modalActionButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}>
                  <Feather name="share-2" size={18} color={theme.text} />
                </Pressable>
                <Pressable style={[styles.modalActionButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}>
                  <Feather name="heart" size={18} color={theme.text} />
                </Pressable>
              </View>
            </View>

            <View style={styles.modalHeroInfo}>
              <View style={[styles.categoryBadge, { backgroundColor: Colors.light.primary }]}>
                <ThemedText style={styles.categoryBadgeText}>{attraction.category}</ThemedText>
              </View>
              <View style={styles.distanceRow}>
                <Feather name="map-pin" size={14} color="#FFFFFF" />
                <ThemedText style={[styles.distanceText, { marginLeft: 4 }]}>
                  {attraction.distance} de voce
                </ThemedText>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={styles.modalContent}>
          <ThemedText type="h2" style={styles.modalTitle}>{attraction.name}</ThemedText>

          <View style={styles.actionButtonsRow}>
            <Pressable 
              onPress={handleOpenMaps}
              style={[styles.primaryActionButton, { backgroundColor: Colors.light.primary }]}
            >
              <Feather name="navigation" size={18} color="#FFFFFF" />
              <ThemedText style={styles.primaryActionButtonText}>Como Chegar</ThemedText>
            </Pressable>
            <Pressable 
              onPress={handleOpenMaps}
              style={[styles.secondaryActionButton, { borderColor: Colors.light.primary }]}
            >
              <Feather name="map" size={18} color={Colors.light.primary} />
              <ThemedText style={[styles.secondaryActionButtonText, { color: Colors.light.primary }]}>
                Ver no Mapa
              </ThemedText>
            </Pressable>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.sectionTitle}>Sobre a atracao</ThemedText>
            <ThemedText type="body" style={styles.descriptionText}>
              {attraction.description}
            </ThemedText>
          </View>

          <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.contactRow}>
              <Feather name="map-pin" size={18} color={Colors.light.primary} />
              <View style={styles.contactInfo}>
                <ThemedText type="small" style={{ fontWeight: "600" }}>Endereco</ThemedText>
                <ThemedText type="caption" secondary>{attraction.address}</ThemedText>
              </View>
            </View>

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

          <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.scheduleHeader}>
              <Feather name="clock" size={18} color={Colors.light.primary} />
              <ThemedText type="h4" style={[styles.sectionTitle, { marginLeft: Spacing.sm, marginBottom: 0 }]}>
                Horarios e Missas
              </ThemedText>
            </View>

            <View style={styles.scheduleSection}>
              <ThemedText type="small" style={{ fontWeight: "600", marginBottom: Spacing.sm }}>
                Funcionamento
              </ThemedText>
              <View style={styles.scheduleRow}>
                <ThemedText type="caption">Secretaria</ThemedText>
                <ThemedText type="caption" secondary>Seg a Sex: {attraction.schedule.weekdays}</ThemedText>
              </View>
              <View style={styles.scheduleRow}>
                <ThemedText type="caption">Sabado</ThemedText>
                <ThemedText type="caption" secondary>{attraction.schedule.saturday}</ThemedText>
              </View>
              <View style={styles.scheduleRow}>
                <ThemedText type="caption">Domingo</ThemedText>
                <ThemedText type="caption" secondary>{attraction.schedule.sunday}</ThemedText>
              </View>
            </View>

            {attraction.massSchedule && attraction.massSchedule.length > 0 ? (
              <View style={[styles.massScheduleCard, { backgroundColor: Colors.light.primary + "10" }]}>
                <ThemedText type="small" style={{ fontWeight: "600", color: Colors.light.primary, marginBottom: Spacing.sm }}>
                  Horarios de Missa
                </ThemedText>
                {attraction.massSchedule.map((schedule, index) => (
                  <ThemedText key={index} type="caption" style={{ marginBottom: 2 }}>
                    {schedule}
                  </ThemedText>
                ))}
              </View>
            ) : null}
          </View>

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
                  const related = attractions.find(a => a.name.includes(name.split(" ")[0]));
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
    </View>
  );
}

export default function RoteirosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<Category>("Todas");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  const filteredAttractions = attractions.filter(attraction => {
    const matchesCategory = selectedCategory === "Todas" || attraction.category === selectedCategory;
    const matchesSearch = attraction.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (selectedAttraction) {
    return (
      <AttractionDetailModal 
        attraction={selectedAttraction} 
        onClose={() => setSelectedAttraction(null)} 
      />
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl + 60,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="caption" secondary style={styles.headerSubtitle}>
          NA CAPITAL DA FE
        </ThemedText>
        <View style={styles.headerTitleRow}>
          <ThemedText type="h1" style={styles.headerTitle}>Atracoes Turisticas</ThemedText>
          <Pressable style={styles.locationButton}>
            <Feather name="crosshair" size={20} color={Colors.light.primary} />
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

      <View style={styles.attractionsGrid}>
        {filteredAttractions.map((attraction) => (
          <AttractionCard
            key={attraction.id}
            attraction={attraction}
            onPress={() => setSelectedAttraction(attraction)}
          />
        ))}
      </View>

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
});
