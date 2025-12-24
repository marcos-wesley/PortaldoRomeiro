import { ScrollView, View, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { businessesData, businessCategories, Business } from "@/lib/data";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GuiaStackParamList } from "@/navigation/GuiaStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.3,
  stiffness: 150,
  overshootClamping: true,
};

type Props = NativeStackScreenProps<GuiaStackParamList, "EmpresaDetail">;

function ActionButton({ 
  icon, 
  label, 
  color, 
  onPress,
  fullWidth = false,
}: { 
  icon: string; 
  label: string; 
  color: string; 
  onPress: () => void;
  fullWidth?: boolean;
}) {
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
        styles.actionButton, 
        { backgroundColor: color },
        fullWidth ? styles.actionButtonFull : null,
        animatedStyle
      ]}
    >
      <Feather name={icon as any} size={20} color="#FFFFFF" />
      <ThemedText style={styles.actionButtonText}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  onPress 
}: { 
  icon: string; 
  label: string; 
  value: string; 
  onPress?: () => void;
}) {
  const { theme } = useTheme();

  const content = (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={18} color={Colors.light.primary} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText type="caption" secondary>{label}</ThemedText>
        <ThemedText style={[styles.infoValue, onPress ? { color: Colors.light.primary } : null]}>
          {value}
        </ThemedText>
      </View>
      {onPress ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
      {content}
    </View>
  );
}

export default function EmpresaDetailScreen({ route }: Props) {
  const { businessId } = route.params;
  const business = businessesData.find(b => b.id === businessId);
  const category = businessCategories.find(c => c.id === business?.categoryId);
  
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  if (!business) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="h4" style={styles.emptyTitle}>Empresa nao encontrada</ThemedText>
      </View>
    );
  }

  const handleCall = () => {
    if (business.phone) {
      Linking.openURL(`tel:${business.phone}`).catch(() => {});
    }
  };

  const handleWhatsApp = () => {
    if (business.whatsapp) {
      Linking.openURL(`https://wa.me/${business.whatsapp}`).catch(() => {});
    }
  };

  const handleDirections = () => {
    if (business.latitude && business.longitude) {
      const url = Platform.select({
        ios: `maps://app?daddr=${business.latitude},${business.longitude}`,
        android: `google.navigation:q=${business.latitude},${business.longitude}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`,
      });
      Linking.openURL(url).catch(() => {});
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      Linking.openURL(business.website).catch(() => {});
    }
  };

  const handleInstagram = () => {
    if (business.instagram) {
      const username = business.instagram.replace("@", "");
      Linking.openURL(`https://instagram.com/${username}`).catch(() => {});
    }
  };

  const handleFacebook = () => {
    if (business.facebook) {
      Linking.openURL(`https://facebook.com/${business.facebook}`).catch(() => {});
    }
  };

  const handleDelivery = () => {
    if (business.deliveryUrl) {
      Linking.openURL(business.deliveryUrl).catch(() => {});
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.lg,
        paddingBottom: insets.bottom + Spacing["3xl"],
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      {business.coverUrl ? (
        <Image
          source={{ uri: business.coverUrl }}
          style={styles.coverImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.coverPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="image" size={48} color={theme.textSecondary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: business.logoUrl }}
            style={styles.logo}
            contentFit="cover"
          />
          <View style={styles.headerInfo}>
            <ThemedText type="h3" style={styles.businessName}>{business.name}</ThemedText>
            <View style={styles.headerMeta}>
              <View style={[styles.categoryBadge, { backgroundColor: (category?.color || Colors.light.primary) + "20" }]}>
                <Feather name={category?.icon as any || "briefcase"} size={12} color={category?.color || Colors.light.primary} />
                <ThemedText style={[styles.categoryText, { color: category?.color || Colors.light.primary }]}>
                  {business.category}
                </ThemedText>
              </View>
              {business.rating ? (
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <ThemedText style={styles.ratingText}>{business.rating.toFixed(1)}</ThemedText>
                  {business.reviews ? (
                    <ThemedText type="caption" secondary>({business.reviews})</ThemedText>
                  ) : null}
                </View>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {business.phone ? (
            <ActionButton
              icon="phone"
              label="Ligar"
              color={Colors.light.primary}
              onPress={handleCall}
            />
          ) : null}
          {business.whatsapp ? (
            <ActionButton
              icon="message-circle"
              label="WhatsApp"
              color="#25D366"
              onPress={handleWhatsApp}
            />
          ) : null}
          {business.latitude && business.longitude ? (
            <ActionButton
              icon="navigation"
              label="Rota"
              color="#F59E0B"
              onPress={handleDirections}
            />
          ) : null}
        </View>

        {business.delivery && business.deliveryUrl ? (
          <View style={styles.deliverySection}>
            <ActionButton
              icon="shopping-bag"
              label="Pedir Delivery"
              color="#EF4444"
              onPress={handleDelivery}
              fullWidth
            />
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Sobre</ThemedText>
          <View style={[styles.descriptionCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.descriptionText}>{business.description}</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h4" style={styles.sectionTitle}>Informacoes</ThemedText>
          
          <InfoRow
            icon="map-pin"
            label="Endereco"
            value={`${business.address}, ${business.neighborhood} - ${business.city}`}
            onPress={business.latitude && business.longitude ? handleDirections : undefined}
          />

          {business.phone ? (
            <InfoRow
              icon="phone"
              label="Telefone"
              value={business.phone}
              onPress={handleCall}
            />
          ) : null}

          {business.hours ? (
            <InfoRow
              icon="clock"
              label="Horario"
              value={business.hours}
            />
          ) : null}

          {business.priceRange ? (
            <InfoRow
              icon="dollar-sign"
              label="Faixa de Preco"
              value={business.priceRange}
            />
          ) : null}
        </View>

        {(business.website || business.instagram || business.facebook) ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Redes Sociais</ThemedText>
            
            {business.website ? (
              <InfoRow
                icon="globe"
                label="Website"
                value={business.website.replace("https://", "")}
                onPress={handleWebsite}
              />
            ) : null}

            {business.instagram ? (
              <InfoRow
                icon="instagram"
                label="Instagram"
                value={business.instagram}
                onPress={handleInstagram}
              />
            ) : null}

            {business.facebook ? (
              <InfoRow
                icon="facebook"
                label="Facebook"
                value={`/${business.facebook}`}
                onPress={handleFacebook}
              />
            ) : null}
          </View>
        ) : null}

        {business.gallery && business.gallery.length > 0 ? (
          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>Fotos</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryContainer}
            >
              {business.gallery.map((imageUrl, index) => (
                <Image
                  key={index}
                  source={{ uri: imageUrl }}
                  style={styles.galleryImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  coverImage: {
    width: "100%",
    height: 200,
  },
  coverPlaceholder: {
    width: "100%",
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    marginBottom: Spacing.xl,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.lg,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  businessName: {
    marginBottom: Spacing.sm,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "600",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  actionButtonFull: {
    flex: undefined,
    width: "100%",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  deliverySection: {
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  descriptionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  descriptionText: {
    lineHeight: 24,
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  galleryContainer: {
    gap: Spacing.sm,
  },
  galleryImage: {
    width: 160,
    height: 120,
    borderRadius: BorderRadius.md,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["4xl"],
  },
  emptyTitle: {
    marginTop: Spacing.lg,
  },
});
