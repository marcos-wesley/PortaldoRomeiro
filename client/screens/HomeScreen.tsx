import { ScrollView, View, StyleSheet, Pressable, ImageBackground, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { quickActions, newsData, videosData, News, Video, QuickAction } from "@/lib/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function WelcomeBanner() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <ImageBackground
        source={require("../../assets/images/basilica-hero.jpg")}
        style={styles.welcomeBanner}
        imageStyle={styles.welcomeBannerImage}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.6)"]}
          style={styles.welcomeGradient}
        >
          <ThemedText style={styles.welcomeTitle}>Hora de conhecer a</ThemedText>
          <ThemedText style={styles.welcomeHighlight}>capital da Fe!</ThemedText>
        </LinearGradient>
      </ImageBackground>
    </Animated.View>
  );
}

function HeroBanner({ news, onPress }: { news: News; onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={animatedStyle}
    >
      <ImageBackground
        source={{ uri: news.imageUrl }}
        style={styles.heroBanner}
        imageStyle={styles.heroBannerImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: news.categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category}</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.heroDate}>{news.date}</ThemedText>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function QuickActionButton({ action, onPress }: { action: QuickAction; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.quickAction, animatedStyle]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + "15" }]}>
        <Feather name={action.icon as any} size={24} color={action.color} />
      </View>
      <ThemedText style={styles.quickActionText}>{action.title}</ThemedText>
    </AnimatedPressable>
  );
}

function NewsCard({ news, onPress, compact = false }: { news: News; onPress: () => void; compact?: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (compact) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.newsCardCompact, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
      >
        <Image source={{ uri: news.imageUrl }} style={styles.newsImageCompact} contentFit="cover" />
        <View style={styles.newsContentCompact}>
          <ThemedText style={[styles.newsCategoryCompact, { color: news.categoryColor }]}>
            {news.category}
          </ThemedText>
          <ThemedText style={styles.newsTitleCompact} numberOfLines={2}>
            {news.title}
          </ThemedText>
          <ThemedText type="caption" secondary>{news.date}</ThemedText>
        </View>
      </AnimatedPressable>
    );
  }

  return null;
}

function VideoCard({ video, onPress }: { video: Video; onPress: () => void }) {
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
      style={[styles.videoCard, animatedStyle]}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image source={{ uri: video.thumbnailUrl }} style={styles.videoThumbnail} contentFit="cover" />
        <View style={styles.playButton}>
          <Feather name="play" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.videoTitle} numberOfLines={2}>{video.title}</ThemedText>
    </AnimatedPressable>
  );
}

function PartnerBanner({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={animatedStyle}
    >
      <LinearGradient
        colors={[Colors.light.primary, "#6366F1"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.partnerBanner}
      >
        <View style={styles.partnerIcon}>
          <Feather name="tv" size={24} color="#FFFFFF" />
        </View>
        <View style={styles.partnerContent}>
          <ThemedText style={styles.partnerTitle}>Seja nosso parceiro</ThemedText>
          <ThemedText style={styles.partnerSubtitle}>
            Divulgue sua marca para milhares de romeiros.
          </ThemedText>
        </View>
        <View style={styles.partnerButton}>
          <ThemedText style={styles.partnerButtonText}>Saiba mais</ThemedText>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function SectionHeader({ title, actionText, onAction }: { title: string; actionText?: string; onAction?: () => void }) {
  const { theme } = useTheme();

  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="h4">{title}</ThemedText>
      {actionText ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <View style={styles.sectionAction}>
            <ThemedText type="link">{actionText}</ThemedText>
            <Feather name="chevron-right" size={16} color={theme.link} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  const featuredNews = newsData.find((n) => n.featured) || newsData[0];
  const otherNews = newsData.filter((n) => !n.featured);

  const handleQuickAction = (screen: string) => {
    navigation.navigate(screen as any);
  };

  const handleNewsPress = (newsId: string) => {
    navigation.navigate("NoticiaDetail", { id: newsId });
  };

  const handleVideoPress = (videoId: string) => {
    navigation.navigate("VideoDetail", { id: videoId });
  };

  const handleViewAllNews = () => {
    navigation.navigate("NoticiasTab" as any);
  };

  const handleViewAllVideos = () => {
    navigation.navigate("Videos");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <WelcomeBanner />

        <SectionHeader
          title="Categorias"
        />

        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              onPress={() => handleQuickAction(action.screen)}
            />
          ))}
        </View>

        <SectionHeader
          title="Ultimas Noticias"
          actionText="Ver todas"
          onAction={handleViewAllNews}
        />

        <View style={styles.newsSection}>
          {otherNews.map((news) => (
            <NewsCard
              key={news.id}
              news={news}
              compact
              onPress={() => handleNewsPress(news.id)}
            />
          ))}
        </View>

        <PartnerBanner onPress={() => {}} />

        <SectionHeader
          title="Videos em Destaque"
          actionText="Ver canal"
          onAction={handleViewAllVideos}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videosScroll}
        >
          {videosData.slice(0, 4).map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onPress={() => handleVideoPress(video.id)}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
  },
  welcomeBanner: {
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  welcomeBannerImage: {
    borderRadius: BorderRadius.lg,
  },
  welcomeGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  welcomeTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeHighlight: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroBanner: {
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  heroBannerImage: {
    borderRadius: BorderRadius.lg,
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  heroDate: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  quickAction: {
    width: "31%",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  newsSection: {
    marginBottom: Spacing.xl,
  },
  newsCardCompact: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  newsImageCompact: {
    width: 100,
    height: 80,
  },
  newsContentCompact: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  newsCategoryCompact: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  newsTitleCompact: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  partnerBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  partnerIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  partnerContent: {
    marginBottom: Spacing.md,
  },
  partnerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  partnerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  partnerButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  partnerButtonText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  videosScroll: {
    paddingRight: Spacing.lg,
  },
  videoCard: {
    width: CARD_WIDTH,
    marginRight: Spacing.md,
  },
  videoThumbnailContainer: {
    position: "relative",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  videoThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: BorderRadius.md,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -18 }, { translateY: -18 }],
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  durationBadge: {
    position: "absolute",
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  durationText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "500",
  },
  videoTitle: {
    fontSize: 13,
    fontWeight: "500",
  },
});
