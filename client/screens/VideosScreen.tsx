import { FlatList, View, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getApiUrl } from "@/lib/query-client";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  youtubeUrl: string;
  thumbnailUrl: string | null;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

function getFullImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  try {
    const baseUrl = getApiUrl();
    return new URL(imageUrl, baseUrl).href;
  } catch {
    return imageUrl;
  }
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

function getVideoThumbnail(video: VideoItem): string {
  if (video.thumbnailUrl) {
    return getFullImageUrl(video.thumbnailUrl) || "";
  }
  const ytId = extractYouTubeId(video.youtubeUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  }
  return "https://via.placeholder.com/320x180?text=Video";
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return "Hoje";
  } else if (diffDays === 1) {
    return "Ontem";
  } else {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
}

function FeaturedVideo({ video, onPress }: { video: VideoItem; onPress: () => void }) {
  const scale = useSharedValue(1);
  const thumbnailUrl = getVideoThumbnail(video);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.featuredVideo, animatedStyle]}
    >
      <Image source={{ uri: thumbnailUrl }} style={styles.featuredImage} contentFit="cover" />
      <View style={styles.featuredOverlay}>
        <View style={styles.playButtonLarge}>
          <Feather name="play" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.featuredInfo}>
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>YouTube</ThemedText>
          </View>
          <ThemedText style={styles.featuredTitle}>{video.title}</ThemedText>
          <ThemedText style={styles.featuredDate}>{formatDate(video.publishedAt || video.createdAt)}</ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function VideoCard({ video, onPress }: { video: VideoItem; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const thumbnailUrl = getVideoThumbnail(video);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.videoCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.videoThumbnail} contentFit="cover" />
        <View style={styles.playButton}>
          <Feather name="play" size={18} color="#FFFFFF" />
        </View>
        <View style={styles.durationBadgeSmall}>
          <ThemedText style={styles.durationTextSmall}>YouTube</ThemedText>
        </View>
      </View>
      <View style={styles.videoContent}>
        <ThemedText style={styles.videoTitle} numberOfLines={2}>{video.title}</ThemedText>
        <ThemedText type="caption" secondary>{formatDate(video.publishedAt || video.createdAt)}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function CategoryChips() {
  const { theme } = useTheme();
  const categories = ["Todos", "Missas", "Documentarios", "Eventos", "Musica"];

  return (
    <View style={styles.categoriesContainer}>
      {categories.map((category, index) => (
        <Pressable
          key={category}
          style={[
            styles.categoryChip,
            index === 0
              ? { backgroundColor: Colors.light.primary }
              : { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <ThemedText
            style={[
              styles.categoryText,
              { color: index === 0 ? "#FFFFFF" : theme.text },
            ]}
          >
            {category}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export default function VideosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error } = useQuery<{ videos: VideoItem[] }>({
    queryKey: ["/api/videos"],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    setRefreshing(false);
  }, [queryClient]);

  const videosList = data?.videos || [];
  const featuredVideo = videosList.find((v) => v.featured) || videosList[0];
  const otherVideos = videosList.filter((v) => v.id !== featuredVideo?.id);

  const handleVideoPress = (videoId: string) => {
    navigation.navigate("VideoDetail", { id: videoId });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {featuredVideo ? (
        <FeaturedVideo video={featuredVideo} onPress={() => handleVideoPress(featuredVideo.id)} />
      ) : null}
      <CategoryChips />
      <ThemedText type="h4" style={styles.sectionTitle}>Todos os Videos</ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>Carregando videos...</ThemedText>
      </View>
    );
  }

  if (error || videosList.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <Feather name="video-off" size={48} color={theme.textSecondary} />
        <ThemedText type="h4" style={styles.emptyTitle}>Nenhum video disponivel</ThemedText>
        <ThemedText secondary style={styles.emptySubtitle}>Em breve novos videos serao publicados</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={otherVideos}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item }) => (
        <VideoCard video={item} onPress={() => handleVideoPress(item.id)} />
      )}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.light.primary}
          colors={[Colors.light.primary]}
          progressViewOffset={headerHeight}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  emptyTitle: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  header: {
    marginBottom: Spacing.md,
  },
  featuredVideo: {
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredInfo: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  durationBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  featuredDate: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.xl,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  videoCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  videoThumbnailContainer: {
    position: "relative",
    width: 140,
    height: 95,
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadgeSmall: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  durationTextSmall: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
  videoContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
});
