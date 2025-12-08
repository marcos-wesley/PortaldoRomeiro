import { ScrollView, View, StyleSheet, Pressable } from "react-native";
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
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { videosData, Video } from "@/lib/data";

type VideoDetailRouteProp = RouteProp<HomeStackParamList, "VideoDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function RelatedVideoCard({ video, onPress }: { video: Video; onPress: () => void }) {
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
      style={[styles.relatedCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.relatedThumbnailContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.relatedThumbnail} contentFit="cover" />
        <View style={styles.playButtonSmall}>
          <Feather name="play" size={14} color="#FFFFFF" />
        </View>
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
        </View>
      </View>
      <View style={styles.relatedContent}>
        <ThemedText style={styles.relatedTitle} numberOfLines={2}>{video.title}</ThemedText>
        <ThemedText type="caption" secondary>{video.date}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function VideoDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<VideoDetailRouteProp>();

  const video = videosData.find((v) => v.id === route.params.id) || videosData[0];
  const relatedVideos = videosData.filter((v) => v.id !== video.id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.playerContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.playerImage} contentFit="cover" />
        <View style={styles.playerOverlay}>
          <Pressable style={styles.playButtonLarge}>
            <Feather name="play" size={36} color="#FFFFFF" />
          </Pressable>
        </View>
        <View style={styles.durationBadgeLarge}>
          <ThemedText style={styles.durationTextLarge}>{video.duration}</ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText type="h3" style={styles.title}>{video.title}</ThemedText>
        <ThemedText type="caption" secondary style={styles.date}>{video.date}</ThemedText>

        <View style={styles.actionsRow}>
          <Pressable style={styles.actionButton}>
            <Feather name="heart" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Curtir</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="share-2" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Compartilhar</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="bookmark" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Salvar</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Feather name="download" size={20} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={styles.actionText}>Baixar</ThemedText>
          </Pressable>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ThemedText type="h4" style={styles.sectionTitle}>Descricao</ThemedText>
        <ThemedText style={styles.description}>{video.description}</ThemedText>
        <ThemedText style={styles.description}>
          Este conteudo faz parte do acervo de videos do Portal do Romeiro, trazendo momentos especiais de fe e devocao para voce acompanhar onde estiver.
        </ThemedText>

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

        <ThemedText type="h4" style={styles.sectionTitle}>Videos Relacionados</ThemedText>

        {relatedVideos.map((relatedVideo) => (
          <RelatedVideoCard key={relatedVideo.id} video={relatedVideo} onPress={() => {}} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadgeLarge: {
    position: "absolute",
    bottom: Spacing.md,
    right: Spacing.md,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  durationTextLarge: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
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
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  actionButton: {
    alignItems: "center",
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
    marginBottom: Spacing.md,
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
