import { useState, useMemo } from "react";
import { FlatList, View, StyleSheet, Pressable, Platform, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type AccommodationType = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  address: string | null;
  neighborhood: string | null;
  city: string | null;
  phone: string | null;
  whatsapp: string | null;
  coverUrl: string | null;
  logoUrl: string | null;
  rating: string | null;
  reviewsCount: number | null;
  amenities: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  featured: boolean | null;
};

type AccommodationWithRooms = AccommodationType & {
  availableRooms?: {
    id: string;
    name: string;
    pricePerNight: number;
    maxGuests: number;
  }[];
};

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function DatePickerModal({ 
  visible, 
  onClose, 
  onSelect, 
  selectedDate,
  minDate,
  title 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSelect: (date: string) => void;
  selectedDate: string;
  minDate: Date;
  title: string;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const dates = useMemo(() => {
    const result: Date[] = [];
    const today = new Date(minDate);
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      result.push(date);
    }
    return result;
  }, [minDate]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg }]}>
          <View style={styles.modalHeader}>
            <ThemedText type="h3">{title}</ThemedText>
            <Pressable onPress={onClose}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
          </View>
          <FlatList
            data={dates}
            keyExtractor={(item) => item.toISOString()}
            numColumns={7}
            contentContainerStyle={styles.calendarGrid}
            renderItem={({ item }) => {
              const dateStr = formatDate(item);
              const isSelected = dateStr === selectedDate;
              return (
                <Pressable 
                  onPress={() => onSelect(dateStr)}
                  style={[
                    styles.dateCell,
                    isSelected && { backgroundColor: Colors.light.primary }
                  ]}
                >
                  <ThemedText 
                    style={[
                      styles.dateCellText,
                      isSelected && { color: "#FFFFFF" }
                    ]}
                  >
                    {item.getDate()}
                  </ThemedText>
                  <ThemedText 
                    type="caption" 
                    style={[
                      styles.dateMonthText,
                      isSelected && { color: "#FFFFFF" }
                    ]}
                  >
                    {item.toLocaleDateString("pt-BR", { month: "short" }).slice(0, 3)}
                  </ThemedText>
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

function DateSelector({ 
  checkIn, 
  checkOut, 
  onCheckInChange, 
  onCheckOutChange 
}: { 
  checkIn: string; 
  checkOut: string;
  onCheckInChange: (date: string) => void;
  onCheckOutChange: (date: string) => void;
}) {
  const { theme } = useTheme();
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  const today = new Date();
  const checkInDate = new Date(checkIn + "T12:00:00");
  const minCheckOutDate = addDays(checkInDate, 1);

  return (
    <View style={styles.dateSelector}>
      <Pressable 
        style={[styles.dateBox, { backgroundColor: theme.backgroundDefault }]}
        onPress={() => setShowCheckInPicker(true)}
      >
        <ThemedText type="caption" secondary>Check-in</ThemedText>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={16} color={Colors.light.primary} />
          <ThemedText style={styles.dateText}>{formatDisplayDate(checkIn)}</ThemedText>
        </View>
      </Pressable>
      
      <Feather name="arrow-right" size={20} color={theme.textSecondary} />
      
      <Pressable 
        style={[styles.dateBox, { backgroundColor: theme.backgroundDefault }]}
        onPress={() => setShowCheckOutPicker(true)}
      >
        <ThemedText type="caption" secondary>Check-out</ThemedText>
        <View style={styles.dateRow}>
          <Feather name="calendar" size={16} color={Colors.light.primary} />
          <ThemedText style={styles.dateText}>{formatDisplayDate(checkOut)}</ThemedText>
        </View>
      </Pressable>

      <DatePickerModal
        visible={showCheckInPicker}
        onClose={() => setShowCheckInPicker(false)}
        onSelect={(date) => {
          onCheckInChange(date);
          const newCheckIn = new Date(date + "T12:00:00");
          const currentCheckOut = new Date(checkOut + "T12:00:00");
          if (currentCheckOut <= newCheckIn) {
            onCheckOutChange(formatDate(addDays(newCheckIn, 1)));
          }
          setShowCheckInPicker(false);
        }}
        selectedDate={checkIn}
        minDate={today}
        title="Selecione o check-in"
      />

      <DatePickerModal
        visible={showCheckOutPicker}
        onClose={() => setShowCheckOutPicker(false)}
        onSelect={(date) => {
          onCheckOutChange(date);
          setShowCheckOutPicker(false);
        }}
        selectedDate={checkOut}
        minDate={minCheckOutDate}
        title="Selecione o check-out"
      />
    </View>
  );
}

function FilterChips({ selected, onSelect }: { selected: string; onSelect: (filter: string) => void }) {
  const { theme } = useTheme();
  const filters = [
    { key: "todos", label: "Todos" },
    { key: "hotel", label: "Hoteis" },
    { key: "pousada", label: "Pousadas" },
    { key: "hostel", label: "Hostels" },
  ];

  return (
    <View style={styles.filtersContainer}>
      {filters.map((filter) => (
        <Pressable
          key={filter.key}
          onPress={() => onSelect(filter.key)}
          style={[
            styles.filterChip,
            selected === filter.key
              ? { backgroundColor: Colors.light.primary }
              : { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[
              styles.filterText,
              { color: selected === filter.key ? "#FFFFFF" : theme.text },
            ]}
          >
            {filter.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function getAmenityIcon(amenity: string): string {
  const icons: Record<string, string> = {
    wifi: "wifi",
    estacionamento: "truck",
    "ar-condicionado": "wind",
    tv: "tv",
    restaurante: "coffee",
    "cafe-da-manha": "coffee",
    piscina: "droplet",
    academia: "activity",
    frigobar: "box",
    sacada: "sun",
    cofre: "lock",
    ventilador: "wind",
  };
  return icons[amenity] || "check";
}

function parseAmenities(amenitiesStr: string | null): string[] {
  if (!amenitiesStr) return [];
  try {
    return JSON.parse(amenitiesStr);
  } catch {
    return [];
  }
}

function AccommodationCard({ 
  item, 
  onPress,
  showRooms = false 
}: { 
  item: AccommodationWithRooms; 
  onPress: () => void;
  showRooms?: boolean;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const amenities = parseAmenities(item.amenities);
  const rating = item.rating ? parseFloat(item.rating) : 0;
  const lowestPrice = item.availableRooms?.length 
    ? Math.min(...item.availableRooms.map(r => r.pricePerNight))
    : null;

  const typeLabel = item.type === "hotel" ? "Hotel" : item.type === "pousada" ? "Pousada" : "Hostel";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.accommodationCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      {item.coverUrl ? (
        <Image source={{ uri: item.coverUrl }} style={styles.accommodationImage} contentFit="cover" />
      ) : (
        <View style={[styles.accommodationImage, styles.imagePlaceholder, { backgroundColor: Colors.light.highlight }]}>
          <Feather name="home" size={40} color={Colors.light.primary} />
        </View>
      )}
      
      <View style={styles.typeBadge}>
        <ThemedText type="caption" style={styles.typeText}>{typeLabel}</ThemedText>
      </View>
      
      {item.featured ? (
        <View style={styles.featuredBadge}>
          <Feather name="star" size={12} color="#FFFFFF" />
          <ThemedText type="caption" style={styles.featuredText}>Destaque</ThemedText>
        </View>
      ) : null}

      <View style={styles.accommodationContent}>
        <View style={styles.accommodationHeader}>
          <ThemedText type="h4" numberOfLines={1} style={styles.accommodationName}>
            {item.name}
          </ThemedText>
          {lowestPrice ? (
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceText}>
                R$ {(lowestPrice / 100).toFixed(0)}
              </ThemedText>
              <ThemedText type="caption" secondary>/noite</ThemedText>
            </View>
          ) : null}
        </View>
        
        {rating > 0 ? (
          <View style={styles.ratingRow}>
            <Feather name="star" size={14} color="#F59E0B" />
            <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
            <ThemedText type="caption" secondary>({item.reviewsCount || 0} avaliacoes)</ThemedText>
          </View>
        ) : null}
        
        {item.address ? (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.locationText} numberOfLines={1}>
              {item.neighborhood ? `${item.neighborhood}, ` : ""}{item.city || "Trindade"}
            </ThemedText>
          </View>
        ) : null}
        
        {amenities.length > 0 ? (
          <View style={styles.amenitiesRow}>
            {amenities.slice(0, 4).map((amenity) => (
              <View key={amenity} style={[styles.amenityBadge, { backgroundColor: Colors.light.highlight }]}>
                <Feather name={getAmenityIcon(amenity) as any} size={12} color={Colors.light.primary} />
              </View>
            ))}
            {amenities.length > 4 ? (
              <ThemedText type="caption" secondary>+{amenities.length - 4}</ThemedText>
            ) : null}
          </View>
        ) : null}

        {showRooms && item.availableRooms && item.availableRooms.length > 0 ? (
          <View style={styles.roomsInfo}>
            <Feather name="check-circle" size={14} color="#22C55E" />
            <ThemedText type="small" style={styles.roomsText}>
              {item.availableRooms.length} {item.availableRooms.length === 1 ? "quarto disponivel" : "quartos disponiveis"}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

function EmptyState({ isSearching }: { isSearching: boolean }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyState}>
      <Feather name={isSearching ? "search" : "home"} size={48} color={theme.textSecondary} />
      <ThemedText type="h4" style={styles.emptyTitle}>
        {isSearching ? "Nenhuma hospedagem encontrada" : "Carregando hospedagens..."}
      </ThemedText>
      <ThemedText secondary style={styles.emptyText}>
        {isSearching 
          ? "Tente alterar as datas ou filtros de busca" 
          : "Aguarde enquanto carregamos as opcoes"}
      </ThemedText>
    </View>
  );
}

export default function HospedagemScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [filter, setFilter] = useState("todos");

  const { data: searchData, isLoading } = useQuery<{ accommodations: AccommodationWithRooms[] }>({
    queryKey: [`/api/accommodations/search?checkIn=${checkIn}&checkOut=${checkOut}`],
  });

  const accommodations = useMemo(() => {
    const data = searchData?.accommodations || [];
    if (filter === "todos") return data;
    return data.filter(a => a.type === filter);
  }, [searchData, filter]);

  const handlePress = (id: string) => {
    navigation.navigate("HospedagemDetail", { id, checkIn, checkOut });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <ThemedText type="body" secondary style={styles.introText}>
        Encontre a hospedagem ideal para sua romaria em Trindade
      </ThemedText>
      
      <DateSelector
        checkIn={checkIn}
        checkOut={checkOut}
        onCheckInChange={setCheckIn}
        onCheckOutChange={setCheckOut}
      />
      
      <FilterChips selected={filter} onSelect={setFilter} />
      
      {!isLoading ? (
        <ThemedText type="small" secondary style={styles.resultsText}>
          {accommodations.length} {accommodations.length === 1 ? "opcao encontrada" : "opcoes encontradas"}
        </ThemedText>
      ) : null}
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={accommodations}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={<EmptyState isSearching={!isLoading} />}
      renderItem={({ item }) => (
        <AccommodationCard 
          item={item} 
          onPress={() => handlePress(item.id)} 
          showRooms={true}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  introText: {
    marginBottom: Spacing.lg,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  dateBox: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  dateText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  filtersContainer: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  resultsText: {
    marginBottom: Spacing.md,
  },
  accommodationCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  accommodationImage: {
    width: "100%",
    height: 160,
  },
  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  typeText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  featuredBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    flexDirection: "row",
    alignItems: "center",
  },
  featuredText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: Spacing.xs,
  },
  accommodationContent: {
    padding: Spacing.lg,
  },
  accommodationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  accommodationName: {
    flex: 1,
    marginRight: Spacing.md,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: Spacing.xs,
    marginRight: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  locationText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  amenityBadge: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  roomsInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  roomsText: {
    marginLeft: Spacing.xs,
    color: "#22C55E",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  emptyText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  calendarGrid: {
    alignItems: "center",
  },
  dateCell: {
    width: 44,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
    borderRadius: BorderRadius.sm,
  },
  dateCellText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateMonthText: {
    fontSize: 10,
    marginTop: 2,
  },
});
