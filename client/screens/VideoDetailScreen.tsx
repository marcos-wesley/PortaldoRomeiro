import { ScrollView, View, StyleSheet, Pressable, ActivityIndicator, Linking, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useQuery } from "@tanstack/react-query";
import * as WebBrowser from "expo-web-browser";
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

type VideoDetailRouteProp = RouteProp<HomeStackParamList, "VideoDetail">;
type VideoDetailNavigationProp = NativeStackNavigationProp<HomeStackParamList, "VideoDetail">;

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getFullImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const baseUrl = getApiUrl();
  if (baseUrl && imageUrl.startsWith("/")) {
    return `${baseUrl}${imageUrl}`;
  }
  return imageUrl;
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
    return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  return "https://via.placeholder.com/640x360?text=Video";
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function RelatedVideoCard({ video, onPress }: { video: VideoItem; onPress: () => void }) {
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
      style={[styles.relatedCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.relatedThumbnailContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.relatedThumbnail} contentFit="cover" />
        <View style={styles.playButtonSmall}>
          <Feather name="play" size={14} color="#FFFFFF" />
        </View>
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>YouTube</ThemedText>
        </View>
      </View>
      <View style={styles.relatedContent}>
        <ThemedText style={styles.relatedTitle} numberOfLines={2}>{video.title}</ThemedText>
        <ThemedText type="caption" secondary>{formatDate(video.publishedAt || video.createdAt)}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function VideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<VideoDetailRouteProp>();
  const navigation = useNavigation<VideoDetailNavigationProp>();

  const { data: videoData, isLoading: videoLoading } = useQuery<{ video: VideoItem }>({
    queryKey: ["/api/videos", route.params.id],
  });

  const { data: allVideosData } = useQuery<{ videos: VideoItem[] }>({
    queryKey: ["/api/videos"],
  });

  const video = videoData?.video;
  const relatedVideos = (allVideosData?.videos || []).filter((v) => v.id !== route.params.id).slice(0, 5);

  const handlePlayVideo = async () => {
    if (!video) return;
    
    const ytId = extractYouTubeId(video.youtubeUrl);
    if (ytId) {
      const youtubeAppUrl = `youtube://watch?v=${ytId}`;
      const youtubeWebUrl = `https://www.youtube.com/watch?v=${ytId}`;
      
      if (Platform.OS !== "web") {
        try {
          const canOpen = await Linking.canOpenURL(youtubeAppUrl);
          if (canOpen) {
            await Linking.openURL(youtubeAppUrl);
            return;
          }
        } catch (e) {
          // Fall through to web browser
        }
      }
      
      await WebBrowser.openBrowserAsync(youtubeWebUrl);
    } else {
      await WebBrowser.openBrowserAsync(video.youtubeUrl);
    }
  };

  const handleShareVideo = async () => {
    if (!video) return;
    const ytId = extractYouTubeId(video.youtubeUrl);
    const shareUrl = ytId ? `https://youtu.be/${ytId}` : video.youtubeUrl;
    
    if (Platform.OS === "web") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: video.title,
            url: shareUrl,
          });
        } catch (e) {
          // User cancelled or error
        }
      } else {
        await Linking.openURL(shareUrl);
      }
    } else {
      await Linking.openURL(shareUrl);
    }
  };

  const handleRelatedVideoPress = (videoId: string) => {
    navigation.push("VideoDetail", { id: videoId });
  };

  if (videoLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!video) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body" secondary>Video nao encontrado</ThemedText>
      </View>
    );
  }

  const thumbnailUrl = getVideoThumbnail(video);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={handlePlayVideo} style={styles.playerContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.playerImage} contentFit="cover" />
        <View style={styles.playerOverlay}>
          <View style={styles.playButtonLarge}>
            <Feather name="play" size={36} color="#FFFFFF" />
          </View>
        </View>
        <View style={styles.youtubeLabel}>
          <Feather name="youtube" size={16} color="#FFFFFF" />
          <ThemedText style={styles.youtubeLabelText}>Assistir no YouTube</ThemedText>
        </View>
      </Pressable>

      <View style={styles.content}>
        <ThemedText type="h3" style={styles.title}>{video.title}</ThemedText>
        <ThemedText type="caption" secondary style={styles.date}>
          {formatDate(video.publishedAt || video.createdAt)}
          {video.views > 0 ? ` • ${video.views} visualizacoes` : ""}
        </ThemedText>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton} onPress={handlePlayVideo}>
            <Feather name="play-circle" size={20} color={Colors.light.primary} />
            <ThemedText type="small" style={[styles.actionText, { color: Colors.light.primary }]}>Assistir</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleShareVideo}>
            <Feather name="share-2" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Compartilhar</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="bookmark" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Salvar</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {video.description ? (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Descricao</ThemedText>
            <ThemedText style={styles.description}>{video.description}</ThemedText>
          </>
        ) : null}

        <View style={[styles.channelCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.channelAvatar, { backgroundColor: Colors.light.primary + "15" }]}>
            <Feather name="tv" size={24} color={Colors.light.primary} />
          </View>
          <View style={styles.channelInfo}>
            <ThemedText type="h4">TV Portal do Romeiro</ThemedText>
            <ThemedText type="caption" secondary>Canal oficial</ThemedText>
          </View>
          <Pressable style={[styles.subscribeButton, { backgroundColor: Colors.light.primary }]}>
            <ThemedText style={styles.subscribeText}>Seguir</ThemedText>
          </Pressable>
        </View>

        {relatedVideos.length > 0 ? (
          <>
            <ThemedText type="h4" style={styles.sectionTitle}>Videos Relacionados</ThemedText>
            {relatedVideos.map((relatedVideo) => (
              <RelatedVideoCard 
                key={relatedVideo.id} 
                video={relatedVideo} 
                onPress={() => handleRelatedVideoPress(relatedVideo.id)} 
              />
            ))}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  playerContainer: {
    position: "relative",
    height: 240,
  },
  playerImage: {
    width: "100%",
    height: "100%",
  },
  playerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  playButtonLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,0,0,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  youtubeLabel: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(255,0,0,0.9)",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  youtubeLabelText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  date: {
    marginBottom: Spacing.lg,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  actionText: {
    marginTop: Spacing.xs,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  description: {
    lineHeight: 24,
    marginBottom: Spacing.lg,
  },
  channelCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  channelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  channelInfo: {
    flex: 1,
  },
  subscribeButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  subscribeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  relatedCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  relatedThumbnailContainer: {
    position: "relative",
    width: 130,
    height: 85,
  },
  relatedThumbnail: {
    width: "100%",
    height: "100%",
  },
  playButtonSmall: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
  relatedContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  relatedTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
});
