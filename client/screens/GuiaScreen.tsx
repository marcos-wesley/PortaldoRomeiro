import { ScrollView, View, StyleSheet, Pressable, TextInput, Linking, Platform } from "react-native";
import { useState, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { businessCategories, businessesData, Business, BusinessCategory } from "@/lib/data";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { GuiaStackParamList } from "@/navigation/GuiaStackNavigator";
import { useNavigation } from "@react-navigation/native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

function CategoryChip({ 
  category, 
  isSelected, 
  onPress 
}: { 
  category: BusinessCategory; 
  isSelected: boolean; 
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
      onPressIn={() => { scale.value = withSpring(0.95, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
      style={[
        styles.categoryChip,
        {
          backgroundColor: isSelected ? category.color : theme.backgroundDefault,
          borderColor: isSelected ? category.color : theme.border,
        },
        animatedStyle,
      ]}
    >
      <Feather 
        name={category.icon as any} 
        size={16} 
        color={isSelected ? "#FFFFFF" : category.color} 
      />
      <ThemedText 
        style={[
          styles.categoryChipText, 
          { color: isSelected ? "#FFFFFF" : theme.text }
        ]}
      >
        {category.name}
      </ThemedText>
    </AnimatedPressable>
  );
}

function SimpleBusinessCard({ 
  business, 
  onPress 
}: { 
  business: Business; 
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const category = businessCategories.find(c => c.id === business.categoryId);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
      style={[styles.simpleCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image
        source={{ uri: business.logoUrl }}
        style={styles.simpleCardLogo}
        contentFit="cover"
      />
      <View style={styles.simpleCardContent}>
        <ThemedText style={styles.simpleCardName} numberOfLines={1}>
          {business.name}
        </ThemedText>
        <View style={styles.simpleCardMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: (category?.color || Colors.light.primary) + "20" }]}>
            <ThemedText style={[styles.categoryBadgeText, { color: category?.color || Colors.light.primary }]}>
              {business.category}
            </ThemedText>
          </View>
        </View>
        <View style={styles.simpleCardLocation}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText type="caption" secondary style={styles.locationText} numberOfLines={1}>
            {business.neighborhood}, {business.city}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.simpleCardAction, { backgroundColor: Colors.light.primary }]}>
        <Feather name="chevron-right" size={20} color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
}

function FeaturedBusinessCard({ 
  business, 
  onPress 
}: { 
  business: Business; 
  onPress: () => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const category = businessCategories.find(c => c.id === business.categoryId);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleWhatsApp = (e: any) => {
    e.stopPropagation();
    if (business.whatsapp) {
      const url = `https://wa.me/${business.whatsapp}`;
      Linking.openURL(url).catch(() => {});
    }
  };

  const handleDirections = (e: any) => {
    e.stopPropagation();
    if (business.latitude && business.longitude) {
      const url = Platform.select({
        ios: `maps://app?daddr=${business.latitude},${business.longitude}`,
        android: `google.navigation:q=${business.latitude},${business.longitude}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`,
      });
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98, springConfig); }}
      onPressOut={() => { scale.value = withSpring(1, springConfig); }}
      style={[styles.featuredCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      {business.coverUrl ? (
        <Image
          source={{ uri: business.coverUrl }}
          style={styles.featuredCardCover}
          contentFit="cover"
        />
      ) : null}
      <View style={styles.featuredCardBody}>
        <View style={styles.featuredCardHeader}>
          <Image
            source={{ uri: business.logoUrl }}
            style={styles.featuredCardLogo}
            contentFit="cover"
          />
          <View style={styles.featuredCardInfo}>
            <ThemedText style={styles.featuredCardName} numberOfLines={1}>
              {business.name}
            </ThemedText>
            <View style={[styles.categoryBadge, { backgroundColor: (category?.color || Colors.light.primary) + "20" }]}>
              <ThemedText style={[styles.categoryBadgeText, { color: category?.color || Colors.light.primary }]}>
                {business.category}
              </ThemedText>
            </View>
          </View>
          {business.rating ? (
            <View style={styles.ratingBadge}>
              <Feather name="star" size={12} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>{business.rating.toFixed(1)}</ThemedText>
            </View>
          ) : null}
        </View>

        {business.shortDescription ? (
          <ThemedText type="small" secondary style={styles.featuredCardDescription} numberOfLines={2}>
            {business.shortDescription}
          </ThemedText>
        ) : null}

        <View style={styles.featuredCardLocation}>
          <Feather name="map-pin" size={12} color={theme.textSecondary} />
          <ThemedText type="caption" secondary style={styles.locationText} numberOfLines={1}>
            {business.address} - {business.neighborhood}
          </ThemedText>
        </View>

        <View style={styles.featuredCardActions}>
          {business.whatsapp ? (
            <Pressable 
              style={[styles.actionButton, { backgroundColor: "#25D366" }]}
              onPress={handleWhatsApp}
              hitSlop={8}
            >
              <Feather name="message-circle" size={16} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonText}>WhatsApp</ThemedText>
            </Pressable>
          ) : null}
          {business.latitude != null && business.longitude != null ? (
            <Pressable 
              style={[styles.actionButton, { backgroundColor: Colors.light.primary }]}
              onPress={handleDirections}
              hitSlop={8}
            >
              <Feather name="navigation" size={16} color="#FFFFFF" />
              <ThemedText style={styles.actionButtonText}>Como Chegar</ThemedText>
            </Pressable>
          ) : null}
          <Pressable 
            style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={onPress}
            hitSlop={8}
          >
            <Feather name="info" size={16} color={theme.text} />
            <ThemedText style={[styles.actionButtonText, { color: theme.text }]}>Detalhes</ThemedText>
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

export default function GuiaScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<GuiaStackParamList>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allCategories: BusinessCategory = { id: "all", name: "Todos", icon: "grid", color: Colors.light.primary };

  const filteredBusinesses = useMemo(() => {
    return businessesData.filter(business => {
      const matchesSearch = searchQuery === "" || 
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === null || 
        selectedCategory === "all" || 
        business.categoryId === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredBusinesses = filteredBusinesses.filter(b => b.featured);
  const regularBusinesses = filteredBusinesses.filter(b => !b.featured);

  const handleBusinessPress = (business: Business) => {
    navigation.navigate("EmpresaDetail", { businessId: business.id });
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="h2" style={styles.headerTitle}>Guia Comercial</ThemedText>
        <ThemedText type="small" secondary>Encontre servicos na Capital da Fe</ThemedText>
      </View>

      <View style={[styles.searchContainer, { paddingHorizontal: Spacing.lg }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar empresas, servicos..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        style={styles.categoriesScroll}
      >
        <CategoryChip
          category={allCategories}
          isSelected={selectedCategory === null || selectedCategory === "all"}
          onPress={() => handleCategorySelect("all")}
        />
        {businessCategories.map(category => (
          <CategoryChip
            key={category.id}
            category={category}
            isSelected={selectedCategory === category.id}
            onPress={() => handleCategorySelect(category.id)}
          />
        ))}
      </ScrollView>

      {featuredBusinesses.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="star" size={18} color="#F59E0B" />
            <ThemedText type="h4" style={styles.sectionTitle}>Destaques</ThemedText>
          </View>
          {featuredBusinesses.map(business => (
            <View key={business.id} style={{ paddingHorizontal: Spacing.lg }}>
              <FeaturedBusinessCard
                business={business}
                onPress={() => handleBusinessPress(business)}
              />
            </View>
          ))}
        </View>
      ) : null}

      {regularBusinesses.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Feather name="briefcase" size={18} color={Colors.light.primary} />
            <ThemedText type="h4" style={styles.sectionTitle}>Empresas</ThemedText>
            <ThemedText type="caption" secondary style={styles.countText}>
              {regularBusinesses.length} encontradas
            </ThemedText>
          </View>
          <View style={{ paddingHorizontal: Spacing.lg }}>
            {regularBusinesses.map(business => (
              <SimpleBusinessCard
                key={business.id}
                business={business}
                onPress={() => handleBusinessPress(business)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {filteredBusinesses.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color={theme.textSecondary} />
          <ThemedText type="h4" style={styles.emptyTitle}>Nenhum resultado</ThemedText>
          <ThemedText type="small" secondary style={styles.emptyText}>
            Tente buscar por outro termo ou categoria
          </ThemedText>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    marginBottom: Spacing.xs,
  },
  searchContainer: {
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  categoriesScroll: {
    marginBottom: Spacing.xl,
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    flex: 1,
  },
  countText: {
    marginLeft: "auto",
  },
  simpleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  simpleCardLogo: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  simpleCardContent: {
    flex: 1,
  },
  simpleCardName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  simpleCardMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  simpleCardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationText: {
    flex: 1,
  },
  simpleCardAction: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  featuredCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  featuredCardCover: {
    width: "100%",
    height: 140,
  },
  featuredCardBody: {
    padding: Spacing.lg,
  },
  featuredCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  featuredCardLogo: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  featuredCardInfo: {
    flex: 1,
  },
  featuredCardName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  featuredCardDescription: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  featuredCardLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  featuredCardActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["4xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    textAlign: "center",
  },
});
