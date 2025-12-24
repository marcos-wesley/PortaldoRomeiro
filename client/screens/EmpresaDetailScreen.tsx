import { ScrollView, View, StyleSheet, Pressable, Linking, Platform, Modal, Dimensions, TextInput, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { businessCategories } from "@/lib/data";
import { apiRequest } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { GuiaStackParamList } from "@/navigation/GuiaStackNavigator";

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  address: string;
  neighborhood: string;
  city: string;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  hours?: string | null;
  priceRange?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  gallery?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  rating?: string | null;
  reviews?: number | null;
  featured?: boolean | null;
  delivery?: boolean | null;
  deliveryUrl?: string | null;
  published?: boolean | null;
}

interface BusinessReview {
  id: string;
  businessId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

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

function StarRating({ rating, size = 16, onSelect }: { rating: number; size?: number; onSelect?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onSelect?.(star)} disabled={!onSelect}>
          <Feather
            name={star <= rating ? "star" : "star"}
            size={size}
            color={star <= rating ? "#F59E0B" : "#D1D5DB"}
            style={{ opacity: star <= rating ? 1 : 0.5 }}
          />
        </Pressable>
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: BusinessReview }) {
  const { theme } = useTheme();
  const date = new Date(review.createdAt);
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`;

  return (
    <View style={[styles.reviewCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <ThemedText style={styles.reviewAvatarText}>
            {review.userName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.reviewInfo}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>{review.userName}</ThemedText>
          <ThemedText type="caption" secondary>{formattedDate}</ThemedText>
        </View>
        <StarRating rating={review.rating} size={14} />
      </View>
      {review.comment ? (
        <ThemedText style={styles.reviewComment}>{review.comment}</ThemedText>
      ) : null}
    </View>
  );
}

export default function EmpresaDetailScreen({ route }: Props) {
  const { businessId } = route.params;
  
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const { data: businessData, isLoading: businessLoading } = useQuery<{ business: Business }>({
    queryKey: [`/api/businesses/${businessId}`],
  });

  const business = businessData?.business;
  const category = businessCategories.find(c => c.id === business?.categoryId);

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{ reviews: BusinessReview[] }>({
    queryKey: [`/api/businesses/${businessId}/reviews`],
    enabled: !!business,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { userName: string; rating: number; comment?: string }) => {
      return apiRequest("POST", `/api/businesses/${businessId}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}/reviews`] });
      queryClient.invalidateQueries({ queryKey: [`/api/businesses/${businessId}`] });
      setShowReviewForm(false);
      setReviewName("");
      setReviewRating(0);
      setReviewComment("");
      Alert.alert("Sucesso", "Sua avaliacao foi enviada com sucesso!");
    },
    onError: () => {
      Alert.alert("Erro", "Nao foi possivel enviar sua avaliacao. Tente novamente.");
    },
  });

  const handleSubmitReview = () => {
    if (!reviewName.trim()) {
      Alert.alert("Atencao", "Por favor, informe seu nome.");
      return;
    }
    if (reviewRating === 0) {
      Alert.alert("Atencao", "Por favor, selecione uma nota.");
      return;
    }
    createReviewMutation.mutate({
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });
  };

  const openGalleryImage = (index: number) => {
    setSelectedImageIndex(index);
    setGalleryModalVisible(true);
  };

  if (businessLoading) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="body" secondary style={{ marginTop: Spacing.md }}>Carregando...</ThemedText>
      </View>
    );
  }

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
        paddingTop: 0,
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
            source={{ uri: business.logoUrl || undefined }}
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
              {business.rating && parseFloat(business.rating) > 0 ? (
                <View style={styles.ratingBadge}>
                  <Feather name="star" size={14} color="#F59E0B" />
                  <ThemedText style={styles.ratingText}>{parseFloat(business.rating).toFixed(1)}</ThemedText>
                  {business.reviews && business.reviews > 0 ? (
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
                <Pressable 
                  key={index} 
                  onPress={() => openGalleryImage(index)}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.galleryImage}
                    contentFit="cover"
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <ThemedText type="h4" style={styles.sectionTitle}>Avaliacoes</ThemedText>
            <Pressable 
              style={[styles.addReviewButton, { backgroundColor: Colors.light.primary }]}
              onPress={() => setShowReviewForm(!showReviewForm)}
            >
              <Feather name={showReviewForm ? "x" : "plus"} size={16} color="#FFFFFF" />
              <ThemedText style={styles.addReviewButtonText}>
                {showReviewForm ? "Cancelar" : "Avaliar"}
              </ThemedText>
            </Pressable>
          </View>

          {showReviewForm ? (
            <View style={[styles.reviewFormCard, { backgroundColor: theme.backgroundDefault }]}>
              <ThemedText type="body" style={{ marginBottom: Spacing.sm, fontWeight: "600" }}>
                Deixe sua avaliacao
              </ThemedText>
              
              <View style={styles.reviewFormField}>
                <ThemedText type="caption" secondary style={{ marginBottom: Spacing.xs }}>Seu nome</ThemedText>
                <TextInput
                  style={[styles.reviewInput, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
                  placeholder="Digite seu nome"
                  placeholderTextColor={theme.textSecondary}
                  value={reviewName}
                  onChangeText={setReviewName}
                />
              </View>

              <View style={styles.reviewFormField}>
                <ThemedText type="caption" secondary style={{ marginBottom: Spacing.xs }}>Nota</ThemedText>
                <StarRating rating={reviewRating} size={28} onSelect={setReviewRating} />
              </View>

              <View style={styles.reviewFormField}>
                <ThemedText type="caption" secondary style={{ marginBottom: Spacing.xs }}>Comentario (opcional)</ThemedText>
                <TextInput
                  style={[styles.reviewInput, styles.reviewTextarea, { backgroundColor: theme.backgroundRoot, color: theme.text }]}
                  placeholder="Conte sua experiencia..."
                  placeholderTextColor={theme.textSecondary}
                  value={reviewComment}
                  onChangeText={setReviewComment}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <Pressable 
                style={[styles.submitReviewButton, { backgroundColor: Colors.light.primary }]}
                onPress={handleSubmitReview}
                disabled={createReviewMutation.isPending}
              >
                {createReviewMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitReviewButtonText}>Enviar Avaliacao</ThemedText>
                )}
              </Pressable>
            </View>
          ) : null}

          {reviewsLoading ? (
            <View style={styles.reviewsLoading}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
            </View>
          ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {reviewsData.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          ) : (
            <View style={[styles.noReviewsCard, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="message-square" size={32} color={theme.textSecondary} />
              <ThemedText type="body" secondary style={{ marginTop: Spacing.sm, textAlign: "center" }}>
                Nenhuma avaliacao ainda. Seja o primeiro a avaliar!
              </ThemedText>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={galleryModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setGalleryModalVisible(false)}
      >
        <View style={styles.galleryModalOverlay}>
          <Pressable 
            style={styles.galleryModalClose}
            onPress={() => setGalleryModalVisible(false)}
          >
            <View style={styles.galleryModalCloseButton}>
              <Feather name="x" size={24} color="#FFFFFF" />
            </View>
          </Pressable>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentOffset={{ x: selectedImageIndex * Dimensions.get("window").width, y: 0 }}
          >
            {business.gallery?.map((imageUrl, index) => (
              <View key={index} style={styles.galleryModalImageContainer}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.galleryModalImage}
                  contentFit="contain"
                />
              </View>
            ))}
          </ScrollView>

          <View style={[styles.galleryModalFooter, { paddingBottom: insets.bottom + Spacing.md }]}>
            <ThemedText style={styles.galleryModalCounter}>
              {selectedImageIndex + 1} / {business.gallery?.length || 0}
            </ThemedText>
          </View>
        </View>
      </Modal>
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
  galleryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
  },
  galleryModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  galleryModalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryModalImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
    alignItems: "center",
    justifyContent: "center",
  },
  galleryModalImage: {
    width: "100%",
    height: "100%",
  },
  galleryModalFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: Spacing.md,
  },
  galleryModalCounter: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  addReviewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addReviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewFormCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  reviewFormField: {
    marginBottom: Spacing.md,
  },
  reviewInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    fontSize: 14,
  },
  reviewTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitReviewButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  submitReviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  reviewsLoading: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  reviewsList: {
    gap: Spacing.md,
  },
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  reviewAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewComment: {
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  noReviewsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
  },
});
