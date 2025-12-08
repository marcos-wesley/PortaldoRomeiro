import { FlatList, View, StyleSheet, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { accommodationsData, Accommodation } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SearchBar() {
  const { theme } = useTheme();

  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
      <Feather name="search" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Buscar hospedagem..."
        placeholderTextColor={theme.textSecondary}
      />
    </View>
  );
}

function FilterChips() {
  const { theme } = useTheme();
  const filters = ["Todos", "Hoteis", "Pousadas", "Hostels"];

  return (
    <View style={styles.filtersContainer}>
      {filters.map((filter, index) => (
        <Pressable
          key={filter}
          style={[
            styles.filterChip,
            index === 0
              ? { backgroundColor: Colors.light.primary }
              : { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[
              styles.filterText,
              { color: index === 0 ? "#FFFFFF" : theme.text },
            ]}
          >
            {filter}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function AccommodationCard({ item, onPress }: { item: Accommodation; onPress: () => void }) {
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
      style={[styles.accommodationCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.accommodationImage} contentFit="cover" />
      <View style={styles.accommodationContent}>
        <View style={styles.accommodationHeader}>
          <ThemedText type="h4" numberOfLines={1} style={styles.accommodationName}>
            {item.name}
          </ThemedText>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceText}>{item.price}</ThemedText>
            <ThemedText type="caption" secondary>/noite</ThemedText>
          </View>
        </View>
        <View style={styles.ratingRow}>
          <Feather name="star" size={14} color="#F59E0B" />
          <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
          <ThemedText type="caption" secondary>({item.reviews} avaliacoes)</ThemedText>
        </View>
        <View style={styles.locationRow}>
          <Feather name="map-pin" size={14} color={theme.textSecondary} />
          <ThemedText type="small" secondary style={styles.locationText}>{item.location}</ThemedText>
        </View>
        <View style={styles.amenitiesRow}>
          {item.amenities.slice(0, 3).map((amenity) => (
            <View key={amenity} style={[styles.amenityBadge, { backgroundColor: Colors.light.highlight }]}>
              <ThemedText type="caption" style={{ color: Colors.light.primary }}>{amenity}</ThemedText>
            </View>
          ))}
          {item.amenities.length > 3 ? (
            <ThemedText type="caption" secondary>+{item.amenities.length - 3}</ThemedText>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function HospedagemScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const handlePress = (id: string) => {
    navigation.navigate("HospedagemDetail", { id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar />
      <FilterChips />
      <ThemedText type="small" secondary style={styles.resultsText}>
        {accommodationsData.length} opcoes encontradas
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={accommodationsData}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <AccommodationCard item={item} onPress={() => handlePress(item.id)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 15,
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
  },
  amenitiesRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  amenityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
});
