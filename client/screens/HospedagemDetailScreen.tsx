import { useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Pressable, Linking, ActivityIndicator, TextInput, Modal, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";
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

type HospedagemDetailRouteProp = RouteProp<HomeStackParamList, "HospedagemDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type RoomType = {
  id: string;
  accommodationId: string;
  name: string;
  description: string | null;
  maxGuests: number | null;
  beds: string | null;
  size: number | null;
  pricePerNight: number;
  amenities: string | null;
  imageUrl: string | null;
  gallery: string | null;
  quantity: number | null;
  published: boolean | null;
};

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
  email: string | null;
  website: string | null;
  instagram: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  gallery: string | null;
  rating: string | null;
  reviewsCount: number | null;
  amenities: string | null;
  policies: string | null;
  featured: boolean | null;
};

interface AccommodationReview {
  id: string;
  accommodationId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment?: string | null;
  stayDate?: string | null;
  approved?: boolean | null;
  createdAt: string;
}

function parseJSON<T>(str: string | null): T[] {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}

function getAmenityLabel(amenity: string): string {
  const labels: Record<string, string> = {
    wifi: "Wi-Fi",
    estacionamento: "Estacionamento",
    "ar-condicionado": "Ar Condicionado",
    tv: "TV",
    restaurante: "Restaurante",
    "cafe-da-manha": "Cafe da Manha",
    piscina: "Piscina",
    academia: "Academia",
    frigobar: "Frigobar",
    sacada: "Sacada",
    cofre: "Cofre",
    ventilador: "Ventilador",
    banheira: "Banheira",
  };
  return labels[amenity] || amenity;
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
    banheira: "droplet",
  };
  return icons[amenity] || "check";
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

function ReviewCard({ review }: { review: AccommodationReview }) {
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

function RoomCard({ 
  room, 
  nights, 
  onContact 
}: { 
  room: RoomType; 
  nights: number;
  onContact: (room: RoomType) => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const amenities = parseJSON<string>(room.amenities);
  const beds = parseJSON<{ type: string; quantity: number }>(room.beds);
  const totalPrice = room.pricePerNight * nights;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bedsDescription = beds.map(b => {
    const bedType = b.type === "casal" ? "Cama casal" : 
                    b.type === "solteiro" ? "Cama solteiro" : 
                    b.type === "beliche" ? "Beliche" : b.type;
    return `${b.quantity}x ${bedType}`;
  }).join(", ");

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.roomCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      {room.imageUrl ? (
        <Image source={{ uri: room.imageUrl }} style={styles.roomImage} contentFit="cover" />
      ) : (
        <View style={[styles.roomImage, styles.roomImagePlaceholder, { backgroundColor: Colors.light.highlight }]}>
          <Feather name="home" size={32} color={Colors.light.primary} />
        </View>
      )}
      
      <View style={styles.roomContent}>
        <ThemedText type="h4" style={styles.roomName}>{room.name}</ThemedText>
        
        {room.description ? (
          <ThemedText type="small" secondary numberOfLines={2} style={styles.roomDescription}>
            {room.description}
          </ThemedText>
        ) : null}

        <View style={styles.roomDetails}>
          <View style={styles.roomDetail}>
            <Feather name="users" size={14} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.roomDetailText}>
              Ate {room.maxGuests || 2} {(room.maxGuests || 2) === 1 ? "hospede" : "hospedes"}
            </ThemedText>
          </View>
          
          {bedsDescription ? (
            <View style={styles.roomDetail}>
              <Feather name="moon" size={14} color={theme.textSecondary} />
              <ThemedText type="small" secondary style={styles.roomDetailText}>
                {bedsDescription}
              </ThemedText>
            </View>
          ) : null}
          
          {room.size ? (
            <View style={styles.roomDetail}>
              <Feather name="maximize-2" size={14} color={theme.textSecondary} />
              <ThemedText type="small" secondary style={styles.roomDetailText}>
                {room.size} m2
              </ThemedText>
            </View>
          ) : null}
        </View>

        {amenities.length > 0 ? (
          <View style={styles.roomAmenities}>
            {amenities.slice(0, 4).map((amenity) => (
              <View key={amenity} style={[styles.roomAmenityBadge, { backgroundColor: Colors.light.highlight }]}>
                <Feather name={getAmenityIcon(amenity) as any} size={12} color={Colors.light.primary} />
                <ThemedText type="caption" style={styles.roomAmenityText}>
                  {getAmenityLabel(amenity)}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.roomPriceRow}>
          <View>
            <ThemedText style={styles.roomPrice}>
              R$ {(room.pricePerNight / 100).toFixed(0)}
            </ThemedText>
            <ThemedText type="caption" secondary>/noite</ThemedText>
          </View>
          
          <View style={styles.totalPriceContainer}>
            <ThemedText type="caption" secondary>Total {nights} {nights === 1 ? "noite" : "noites"}:</ThemedText>
            <ThemedText style={styles.totalPrice}>
              R$ {(totalPrice / 100).toFixed(0)}
            </ThemedText>
          </View>
        </View>

        <Button 
          onPress={() => onContact(room)}
          style={styles.reserveButton}
        >
          Reservar via WhatsApp
        </Button>
      </View>
    </AnimatedPressable>
  );
}

export default function HospedagemDetailScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const route = useRoute<HospedagemDetailRouteProp>();
  const queryClient = useQueryClient();
  
  const { id, checkIn, checkOut } = route.params;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const effectiveCheckIn = checkIn || today.toISOString().split("T")[0];
  const effectiveCheckOut = checkOut || tomorrow.toISOString().split("T")[0];
  const nights = calculateNights(effectiveCheckIn, effectiveCheckOut);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [galleryModalVisible, setGalleryModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { data, isLoading, error } = useQuery<{ 
    accommodation: AccommodationType; 
    availableRooms: RoomType[];
  }>({
    queryKey: [`/api/accommodations/${id}/availability?checkIn=${effectiveCheckIn}&checkOut=${effectiveCheckOut}`],
  });

  const accommodation = data?.accommodation;
  const rooms = data?.availableRooms || [];
  const amenities = parseJSON<string>(accommodation?.amenities || null);
  const gallery = parseJSON<string>(accommodation?.gallery || null);
  const rating = accommodation?.rating ? parseFloat(accommodation.rating) : 0;

  const { data: reviewsData, isLoading: reviewsLoading } = useQuery<{ reviews: AccommodationReview[] }>({
    queryKey: [`/api/accommodations/${id}/reviews`],
    enabled: !!accommodation,
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { userName: string; rating: number; comment?: string }) => {
      return apiRequest("POST", `/api/accommodations/${id}/reviews`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/accommodations/${id}/reviews`] });
      setShowReviewForm(false);
      setReviewName("");
      setReviewRating(0);
      setReviewComment("");
    },
  });

  const handleSubmitReview = () => {
    if (!reviewName.trim() || reviewRating === 0) return;
    createReviewMutation.mutate({
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim() || undefined,
    });
  };

  const handleContact = (room?: RoomType) => {
    if (!accommodation) return;
    
    const phone = accommodation.whatsapp || accommodation.phone;
    if (!phone) return;
    
    const cleanPhone = phone.replace(/\D/g, "");
    const message = room 
      ? `Ola! Gostaria de reservar o ${room.name} no ${accommodation.name} para ${nights} noite${nights > 1 ? "s" : ""}, de ${formatDisplayDate(effectiveCheckIn)} a ${formatDisplayDate(effectiveCheckOut)}.`
      : `Ola! Gostaria de mais informacoes sobre o ${accommodation.name}.`;
    
    Linking.openURL(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`);
  };

  const handleCall = () => {
    if (!accommodation?.phone) return;
    Linking.openURL(`tel:${accommodation.phone}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText secondary style={styles.loadingText}>Carregando...</ThemedText>
      </View>
    );
  }

  if (error || !accommodation) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="h4" style={styles.errorTitle}>Hospedagem nao encontrada</ThemedText>
        <ThemedText secondary style={styles.errorText}>
          Nao foi possivel carregar os detalhes desta hospedagem.
        </ThemedText>
      </View>
    );
  }

  const typeLabel = accommodation.type === "hotel" ? "Hotel" : 
                    accommodation.type === "pousada" ? "Pousada" : "Hostel";

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {accommodation.coverUrl ? (
          <Image source={{ uri: accommodation.coverUrl }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder, { backgroundColor: Colors.light.highlight }]}>
            <Feather name="home" size={64} color={Colors.light.primary} />
          </View>
        )}

        <View style={styles.typeBadgeHero}>
          <ThemedText type="caption" style={styles.typeBadgeText}>{typeLabel}</ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="h2">{accommodation.name}</ThemedText>
            {rating > 0 ? (
              <View style={styles.ratingRow}>
                <Feather name="star" size={16} color="#F59E0B" />
                <ThemedText style={styles.ratingText}>{rating.toFixed(1)}</ThemedText>
                <ThemedText type="small" secondary>({accommodation.reviewsCount || 0} avaliacoes)</ThemedText>
              </View>
            ) : null}
          </View>

          {accommodation.address ? (
            <View style={styles.locationRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText secondary style={styles.locationText}>
                {accommodation.address}
                {accommodation.neighborhood ? `, ${accommodation.neighborhood}` : ""}
                {accommodation.city ? ` - ${accommodation.city}` : ""}
              </ThemedText>
            </View>
          ) : null}

          <View style={[styles.datesCard, { backgroundColor: Colors.light.highlight }]}>
            <View style={styles.datesInfo}>
              <View style={styles.dateColumn}>
                <ThemedText type="caption" secondary>Check-in</ThemedText>
                <ThemedText style={styles.dateValue}>{formatDisplayDate(effectiveCheckIn)}</ThemedText>
                <ThemedText type="caption" secondary>{accommodation.checkInTime || "14:00"}</ThemedText>
              </View>
              <Feather name="arrow-right" size={20} color={Colors.light.primary} />
              <View style={styles.dateColumn}>
                <ThemedText type="caption" secondary>Check-out</ThemedText>
                <ThemedText style={styles.dateValue}>{formatDisplayDate(effectiveCheckOut)}</ThemedText>
                <ThemedText type="caption" secondary>{accommodation.checkOutTime || "12:00"}</ThemedText>
              </View>
            </View>
            <View style={styles.nightsInfo}>
              <ThemedText style={styles.nightsNumber}>{nights}</ThemedText>
              <ThemedText type="caption" secondary>{nights === 1 ? "noite" : "noites"}</ThemedText>
            </View>
          </View>

          {accommodation.description ? (
            <>
              <ThemedText type="h4" style={styles.sectionTitle}>Sobre</ThemedText>
              <ThemedText style={styles.description}>{accommodation.description}</ThemedText>
            </>
          ) : null}

          {amenities.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.sectionTitle}>Comodidades</ThemedText>
              <View style={styles.amenitiesGrid}>
                {amenities.map((amenity) => (
                  <View key={amenity} style={[styles.amenityItem, { backgroundColor: theme.backgroundDefault }]}>
                    <Feather
                      name={getAmenityIcon(amenity) as any}
                      size={20}
                      color={Colors.light.primary}
                    />
                    <ThemedText style={styles.amenityText}>{getAmenityLabel(amenity)}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          ) : null}

          {gallery.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.sectionTitle}>Galeria de Fotos</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.galleryContainer}
              >
                {gallery.map((imageUrl, index) => (
                  <Pressable 
                    key={index} 
                    onPress={() => {
                      setSelectedImageIndex(index);
                      setGalleryModalVisible(true);
                    }}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.galleryImage}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : null}

          {rooms.length > 0 ? (
            <>
              <ThemedText type="h4" style={styles.sectionTitle}>
                Quartos Disponiveis ({rooms.length})
              </ThemedText>
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  room={room} 
                  nights={nights}
                  onContact={handleContact}
                />
              ))}
            </>
          ) : (
            <View style={[styles.noRoomsCard, { backgroundColor: theme.backgroundDefault }]}>
              <Feather name="x-circle" size={32} color={theme.textSecondary} />
              <ThemedText type="h4" style={styles.noRoomsTitle}>
                Sem disponibilidade
              </ThemedText>
              <ThemedText secondary style={styles.noRoomsText}>
                Nao ha quartos disponiveis para as datas selecionadas. Tente outras datas.
              </ThemedText>
            </View>
          )}

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

          <View style={{ height: tabBarHeight + 80 }} />
        </View>
      </ScrollView>

      {(accommodation.whatsapp || accommodation.phone) ? (
        <View style={[styles.fixedContactBar, { backgroundColor: theme.backgroundDefault, bottom: tabBarHeight }]}>
          <View style={styles.fixedContactButtons}>
            {accommodation.whatsapp ? (
              <Pressable 
                onPress={() => handleContact()}
                style={[styles.fixedContactButton, { backgroundColor: "#25D366" }]}
              >
                <View style={styles.contactButtonContent}>
                  <Feather name="message-circle" size={18} color="#FFFFFF" />
                  <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600", fontSize: 15 }}>
                    WhatsApp
                  </ThemedText>
                </View>
              </Pressable>
            ) : null}
            {accommodation.phone ? (
              <Pressable 
                onPress={handleCall}
                style={[styles.fixedContactButton, { backgroundColor: Colors.light.primary }]}
              >
                <View style={styles.contactButtonContent}>
                  <Feather name="phone" size={18} color="#FFFFFF" />
                  <ThemedText style={{ color: "#FFFFFF", marginLeft: Spacing.sm, fontWeight: "600", fontSize: 15 }}>
                    Ligar
                  </ThemedText>
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}

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
            {gallery.map((imageUrl, index) => (
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
              {selectedImageIndex + 1} / {gallery.length}
            </ThemedText>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  errorTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorText: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  heroImage: {
    width: "100%",
    height: 280,
  },
  heroPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadgeHero: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontWeight: "600",
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
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  locationText: {
    marginLeft: Spacing.xs,
    flex: 1,
  },
  datesCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  datesInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateColumn: {
    alignItems: "center",
    marginHorizontal: Spacing.md,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: Spacing.xs,
  },
  nightsInfo: {
    alignItems: "center",
    paddingLeft: Spacing.lg,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(0,0,0,0.1)",
  },
  nightsNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  roomCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  roomImage: {
    width: "100%",
    height: 140,
  },
  roomImagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  roomContent: {
    padding: Spacing.lg,
  },
  roomName: {
    marginBottom: Spacing.xs,
  },
  roomDescription: {
    marginBottom: Spacing.md,
  },
  roomDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  roomDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  roomDetailText: {
    marginLeft: Spacing.xs,
  },
  roomAmenities: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  roomAmenityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  roomAmenityText: {
    marginLeft: Spacing.xs,
    color: Colors.light.primary,
  },
  roomPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  roomPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  totalPriceContainer: {
    alignItems: "flex-end",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.primary,
  },
  reserveButton: {
    marginTop: Spacing.sm,
  },
  noRoomsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
    marginVertical: Spacing.lg,
  },
  noRoomsTitle: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  noRoomsText: {
    marginTop: Spacing.sm,
    textAlign: "center",
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
  contactButtons: {
    flexDirection: "row",
  },
  contactButton: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
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
    borderRadius: BorderRadius.full,
  },
  addReviewButtonText: {
    color: "#FFFFFF",
    marginLeft: Spacing.xs,
    fontWeight: "600",
    fontSize: 13,
  },
  reviewFormCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  reviewFormField: {
    marginBottom: Spacing.md,
  },
  reviewInput: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 15,
  },
  reviewTextarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  submitReviewButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  submitReviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  reviewsLoading: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  reviewsList: {
    gap: Spacing.sm,
  },
  reviewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
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
    fontWeight: "700",
    fontSize: 16,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewComment: {
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
  noReviewsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: "center",
  },
  fixedContactBar: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  fixedContactButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  fixedContactButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryContainer: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  galleryImage: {
    width: 140,
    height: 100,
    borderRadius: BorderRadius.md,
  },
  galleryModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center",
  },
  galleryModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  galleryModalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  galleryModalImageContainer: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.7,
    justifyContent: "center",
    alignItems: "center",
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
  },
});
