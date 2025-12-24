import { ScrollView, View, StyleSheet, Pressable, Dimensions, ImageBackground, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useMemo } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { quickActions, QuickAction } from "@/lib/data";
import { getApiUrl } from "@/lib/query-client";

interface HomePageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
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

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  category: string;
  featured: boolean;
  published: boolean;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

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

interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string | null;
  link: string | null;
  position: string;
  order: number;
  published: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
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
  return "https://via.placeholder.com/280x180?text=Video";
}

const categoryColors: Record<string, string> = {
  geral: "#6B7280",
  romaria: "#b22226",
  eventos: "#F97316",
  santuario: "#4169E1",
  comunidade: "#10B981",
  cultura: "#8B5CF6",
};

function getCategoryColor(category: string): string {
  return categoryColors[category?.toLowerCase()] || categoryColors.geral;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Hoje, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1) {
    return `Ontem, ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.md) / 2;
const HERO_HEIGHT = SCREEN_HEIGHT * 0.45;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FullScreenHeroBanner({ headerHeight, content }: { headerHeight: number; content?: HomePageContent | null }) {
  const heroTitle = content?.heroTitle || "Hora de conhecer a";
  const heroSubtitle = content?.heroSubtitle || "capital da fe";
  const heroImage = content?.heroImage ? getFullImageUrl(content.heroImage) : null;

  return (
    <View style={[styles.fullHeroBanner, { height: HERO_HEIGHT }]}>
      {heroImage ? (
        <Image
          source={{ uri: heroImage }}
          style={styles.fullHeroImage}
          contentFit="cover"
          contentPosition="center"
        />
      ) : (
        <Image
          source={require("../assets/images/home-hero.jpg")}
          style={styles.fullHeroImage}
          contentFit="cover"
          contentPosition="center"
        />
      )}
      <LinearGradient
        colors={["transparent", "rgba(255,255,255,0.85)", "#FFFFFF"]}
        locations={[0.3, 0.7, 0.9]}
        style={styles.fullHeroGradient}
      />
      <View style={styles.fullHeroTextContainer}>
        <ThemedText style={styles.fullHeroTitle}>{heroTitle}</ThemedText>
        <ThemedText style={styles.fullHeroHighlight}>{heroSubtitle}</ThemedText>
      </View>
    </View>
  );
}

function HeroBanner({ news, onPress }: { news: NewsItem; onPress: () => void }) {
  const scale = useSharedValue(1);
  const categoryColor = getCategoryColor(news.category);
  const imageUrl = getFullImageUrl(news.coverImage) || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

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
        source={{ uri: imageUrl }}
        style={styles.heroBanner}
        imageStyle={styles.heroBannerImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category}</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.heroDate}>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
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
      style={[styles.quickAction, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + "20" }]}>
        <Feather name={action.icon as any} size={26} color={action.color} />
      </View>
      <ThemedText style={styles.quickActionText}>{action.title}</ThemedText>
    </AnimatedPressable>
  );
}

function FeaturedNewsCard({ news, onPress }: { news: NewsItem; onPress: () => void }) {
  const scale = useSharedValue(1);
  const imageUrl = getFullImageUrl(news.coverImage) || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.featuredNewsCard, animatedStyle]}
    >
      <Image source={{ uri: imageUrl }} style={styles.featuredNewsImage} contentFit="cover" />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={styles.featuredNewsGradient}
      >
        <View style={styles.featuredNewsBadge}>
          <ThemedText style={styles.featuredNewsBadgeText}>Destaque</ThemedText>
        </View>
        <ThemedText style={styles.featuredNewsTitle} numberOfLines={2}>{news.title}</ThemedText>
        <ThemedText style={styles.featuredNewsDate}>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
      </LinearGradient>
    </AnimatedPressable>
  );
}

function NewsListItem({ news, onPress }: { news: NewsItem; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const categoryColor = getCategoryColor(news.category);
  const imageUrl = getFullImageUrl(news.coverImage) || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.newsListItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image source={{ uri: imageUrl }} style={styles.newsListImage} contentFit="cover" />
      <View style={styles.newsListContent}>
        <ThemedText style={[styles.newsListCategory, { color: categoryColor }]}>
          {news.category}
        </ThemedText>
        <ThemedText style={styles.newsListTitle} numberOfLines={2}>
          {news.title}
        </ThemedText>
        <ThemedText type="caption" secondary>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
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
      style={[styles.videoCard, animatedStyle]}
    >
      <View style={styles.videoThumbnailContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.videoThumbnail} contentFit="cover" />
        <View style={styles.playButton}>
          <Feather name="play" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>YouTube</ThemedText>
        </View>
      </View>
      <ThemedText style={styles.videoTitle} numberOfLines={2}>{video.title}</ThemedText>
    </AnimatedPressable>
  );
}

function PartnersSection({ partners }: { partners: Partner[] }) {
  const openWebsite = async (url: string | null) => {
    if (url) {
      try {
        const { openBrowserAsync } = await import("expo-web-browser");
        await openBrowserAsync(url);
      } catch (e) {
        console.error("Error opening URL:", e);
      }
    }
  };

  if (partners.length === 0) return null;

  return (
    <View style={styles.partnersSection}>
      <ThemedText style={styles.partnersSectionTitle}>Nossos Parceiros</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.partnersScroll}
      >
        {partners.map((partner) => (
          <Pressable
            key={partner.id}
            onPress={() => openWebsite(partner.website)}
            style={styles.partnerLogoContainer}
          >
            {partner.logoUrl ? (
              <Image
                source={{ uri: getFullImageUrl(partner.logoUrl) || "" }}
                style={styles.partnerLogo}
                contentFit="contain"
              />
            ) : (
              <View style={styles.partnerLogoPlaceholder}>
                <Feather name="image" size={24} color="#9CA3AF" />
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function HomeBannerAd({ banner }: { banner: Banner }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const openLink = async () => {
    if (banner.link) {
      try {
        const { openBrowserAsync } = await import("expo-web-browser");
        await openBrowserAsync(banner.link);
      } catch (e) {
        console.error("Error opening URL:", e);
      }
    }
  };

  if (!banner.imageUrl) return null;

  return (
    <AnimatedPressable
      onPress={openLink}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[animatedStyle, styles.bannerAdContainer]}
    >
      <Image
        source={{ uri: getFullImageUrl(banner.imageUrl) || "" }}
        style={styles.bannerAdImage}
        contentFit="cover"
      />
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
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: pageContent } = useQuery<{ content: HomePageContent | null }>({
    queryKey: ["/api/static-pages/home"],
  });

  const { data: newsData, isLoading: newsLoading } = useQuery<{ news: NewsItem[] }>({
    queryKey: ["/api/news"],
  });

  const { data: videosData, isLoading: videosLoading } = useQuery<{ videos: VideoItem[] }>({
    queryKey: ["/api/videos"],
  });

  const { data: partnersData } = useQuery<{ partners: Partner[] }>({
    queryKey: ["/api/partners"],
  });

  const { data: bannersData } = useQuery<{ banners: Banner[] }>({
    queryKey: ["/api/banners?position=home"],
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/static-pages/home"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/videos"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
    await queryClient.invalidateQueries({ queryKey: ["/api/banners?position=home"] });
    setRefreshing(false);
  }, [queryClient]);

  const allNews = newsData?.news || [];
  const featuredNews = allNews.find((n) => n.featured) || allNews[0];
  const otherNews = allNews.filter((n) => n.id !== featuredNews?.id);

  const allVideos = videosData?.videos || [];
  const displayVideos = [...allVideos].sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1)).slice(0, 4);

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
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.light.primary}
          colors={[Colors.light.primary]}
        />
      }
    >
      <FullScreenHeroBanner headerHeight={headerHeight} content={pageContent?.content} />

      <View style={styles.content}>
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
          {newsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : featuredNews ? (
            <>
              <FeaturedNewsCard
                news={featuredNews}
                onPress={() => handleNewsPress(featuredNews.id)}
              />
              {otherNews.slice(0, 2).map((news) => (
                <NewsListItem
                  key={news.id}
                  news={news}
                  onPress={() => handleNewsPress(news.id)}
                />
              ))}
            </>
          ) : (
            <ThemedText type="body" secondary style={{ textAlign: "center", padding: Spacing.lg }}>
              Nenhuma noticia disponivel
            </ThemedText>
          )}
        </View>

        {partnersData?.partners && partnersData.partners.length > 0 ? (
          <PartnersSection partners={partnersData.partners} />
        ) : null}

        {bannersData?.banners && bannersData.banners.length > 0 ? (
          <HomeBannerAd banner={bannersData.banners[0]} />
        ) : null}

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
          {videosLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.light.primary} />
            </View>
          ) : displayVideos.length > 0 ? (
            displayVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPress={() => handleVideoPress(video.id)}
              />
            ))
          ) : (
            <ThemedText type="body" secondary style={{ paddingVertical: Spacing.lg }}>
              Nenhum video disponivel
            </ThemedText>
          )}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  fullHeroBanner: {
    width: "100%",
    position: "relative",
  },
  fullHeroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  fullHeroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  fullHeroContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  destaqueBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#D4A04A",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  destaqueBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  fullHeroTextContainer: {
    position: "absolute",
    bottom: Spacing.xl * 2,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  fullHeroTitle: {
    color: "#1F2937",
    fontSize: 26,
    fontWeight: "600",
    lineHeight: 32,
  },
  fullHeroHighlight: {
    color: "#1F2937",
    fontSize: 26,
    fontWeight: "800",
    lineHeight: 32,
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
    marginBottom: Spacing.lg,
    rowGap: Spacing.md,
  },
  quickAction: {
    width: "31%",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
  loadingContainer: {
    padding: Spacing.xl * 2,
    alignItems: "center",
  },
  featuredNewsCard: {
    height: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  featuredNewsImage: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredNewsGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  featuredNewsBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F59E0B",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  featuredNewsBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  featuredNewsTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 26,
    marginBottom: Spacing.xs,
  },
  featuredNewsDate: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  newsListItem: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
    padding: Spacing.sm,
  },
  newsListImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
  },
  newsListContent: {
    flex: 1,
    paddingLeft: Spacing.md,
    justifyContent: "center",
  },
  newsListCategory: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  newsListTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  partnersSection: {
    marginBottom: Spacing.xl,
    backgroundColor: "#F9FAFB",
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  partnersSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  partnersScroll: {
    paddingRight: Spacing.lg,
    gap: Spacing.lg,
  },
  partnerLogoContainer: {
    width: 80,
    height: 50,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  partnerLogo: {
    width: "100%",
    height: "100%",
  },
  partnerLogoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  bannerAdContainer: {
    marginBottom: Spacing.xl,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  bannerAdImage: {
    width: "100%",
    height: 80,
    borderRadius: BorderRadius.md,
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
