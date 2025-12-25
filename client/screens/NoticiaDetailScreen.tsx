import { ScrollView, View, StyleSheet, Pressable, Dimensions, Share, ActivityIndicator, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useState, useMemo } from "react";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import * as WebBrowser from "expo-web-browser";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

interface BannerItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  link: string | null;
  position: string;
  articlePlacement: string | null;
  order: number;
  published: boolean;
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
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

type NoticiaDetailRouteProp = RouteProp<HomeStackParamList, "NoticiaDetail">;

function ActionButton({ icon, onPress, filled = false }: { icon: string; onPress: () => void; filled?: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.actionButton, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Feather name={icon as any} size={20} color={filled ? "#F97316" : theme.text} />
    </AnimatedPressable>
  );
}

function ShareButton({ icon, label, color }: { icon: string; label: string; color: string }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.shareButton, { backgroundColor: color + "15" }, animatedStyle]}
    >
      <Feather name={icon as any} size={18} color={color} />
      <ThemedText type="small" style={{ color, marginLeft: Spacing.xs }}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

function SponsoredBanner({ banner }: { banner: BannerItem }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = async () => {
    if (banner.link) {
      try {
        await WebBrowser.openBrowserAsync(banner.link);
      } catch (error) {}
    }
  };

  const bannerImageUrl = getFullImageUrl(banner.imageUrl);

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.sponsoredContainer, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.sponsoredHeader}>
        <Feather name="speaker" size={12} color="#4169E1" />
        <ThemedText style={styles.sponsoredLabel}>PUBLICIDADE</ThemedText>
      </View>
      <View style={styles.sponsoredContent}>
        {bannerImageUrl ? (
          <Image source={{ uri: bannerImageUrl }} style={styles.sponsoredImage} contentFit="cover" />
        ) : null}
        <View style={styles.sponsoredInfo}>
          <ThemedText type="body" style={styles.sponsoredTitle}>{banner.title}</ThemedText>
          {banner.description ? (
            <ThemedText type="small" secondary numberOfLines={2} style={styles.sponsoredDescription}>
              {banner.description}
            </ThemedText>
          ) : null}
          {banner.link ? (
            <View style={styles.sponsoredLink}>
              <ThemedText style={styles.sponsoredLinkText}>Saiba mais</ThemedText>
              <Feather name="external-link" size={12} color="#4169E1" />
            </View>
          ) : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

function HtmlContentWithBanner({ html, middleBanner }: { html: string; middleBanner: BannerItem | null }) {
  const { theme } = useTheme();
  
  const parseHtmlToElements = (htmlContent: string): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;
    
    const cleanHtml = htmlContent
      .replace(/<p><br><\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<\/p>\s*<p>/g, '\n\n');
    
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let lastIndex = 0;
    let match;
    
    while ((match = imgRegex.exec(cleanHtml)) !== null) {
      if (match.index > lastIndex) {
        const textBefore = cleanHtml.slice(lastIndex, match.index);
        const cleanText = textBefore
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();
        
        if (cleanText) {
          elements.push(
            <ThemedText key={keyIndex++} type="body" style={[styles.paragraph, { color: theme.text }]}>
              {cleanText}
            </ThemedText>
          );
        }
      }
      
      const inlineImageUrl = getFullImageUrl(match[1]) || match[1];
      elements.push(
        <View key={keyIndex++} style={styles.internalImageContainer}>
          <Image source={{ uri: inlineImageUrl }} style={styles.internalImage} contentFit="cover" />
        </View>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < cleanHtml.length) {
      const remainingText = cleanHtml.slice(lastIndex);
      const cleanText = remainingText
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
      
      if (cleanText) {
        elements.push(
          <ThemedText key={keyIndex++} type="body" style={[styles.paragraph, { color: theme.text }]}>
            {cleanText}
          </ThemedText>
        );
      }
    }
    
    if (elements.length === 0) {
      const plainText = htmlContent.replace(/<[^>]+>/g, '').trim();
      if (plainText) {
        elements.push(
          <ThemedText key={0} type="body" style={[styles.paragraph, { color: theme.text }]}>
            {plainText}
          </ThemedText>
        );
      }
    }
    
    return elements;
  };

  const contentElements = parseHtmlToElements(html);
  
  if (middleBanner && contentElements.length > 1) {
    const middleIndex = Math.floor(contentElements.length / 2);
    const firstHalf = contentElements.slice(0, middleIndex);
    const secondHalf = contentElements.slice(middleIndex);
    
    return (
      <>
        {firstHalf}
        <View style={styles.sponsoredWrapper}>
          <SponsoredBanner banner={middleBanner} />
        </View>
        {secondHalf}
      </>
    );
  }

  return <>{contentElements}</>;
}

export default function NoticiaDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<NoticiaDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [isSaved, setIsSaved] = useState(false);

  const { data, isLoading, error } = useQuery<{ news: NewsItem }>({
    queryKey: ["/api/news", route.params.id],
  });

  const { data: bannersData } = useQuery<{ banners: BannerItem[] }>({
    queryKey: ["/api/banners"],
  });

  const news = data?.news;

  const articleBanners = useMemo(() => {
    if (!bannersData?.banners) return { beginning: null, middle: null, end: null };
    const banners = bannersData.banners.filter(b => 
      b.articlePlacement && b.articlePlacement !== "none"
    );
    return {
      beginning: banners.find(b => b.articlePlacement === "beginning") || null,
      middle: banners.find(b => b.articlePlacement === "middle") || null,
      end: banners.find(b => b.articlePlacement === "end") || null,
    };
  }, [bannersData]);

  const handleShare = async () => {
    if (!news) return;
    try {
      await Share.share({
        message: `${news.title} - Portal do Romeiro`,
        title: news.title,
      });
    } catch (error) {}
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="body" secondary style={styles.loadingText}>Carregando noticia...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !news) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <Feather name="alert-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="body" secondary style={styles.loadingText}>Noticia nao encontrada</ThemedText>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ThemedText style={{ color: Colors.light.primary }}>Voltar</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const categoryColor = getCategoryColor(news.category);
  const imageUrl = getFullImageUrl(news.coverImage) || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category || "Geral"}</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{news.summary}</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaInfo}>
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: "#8B5CF6" + "20" }]}>
              <Feather name="user" size={14} color="#8B5CF6" />
            </View>
            <View>
              <ThemedText type="small" style={styles.authorName}>Redacao Portal</ThemedText>
              <ThemedText type="caption" secondary>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <ActionButton icon="share-2" onPress={handleShare} />
          <ActionButton icon="bookmark" onPress={handleSave} filled={isSaved} />
        </View>
      </View>

      <View style={styles.content}>
        {articleBanners.beginning ? (
          <View style={styles.sponsoredWrapper}>
            <SponsoredBanner banner={articleBanners.beginning} />
          </View>
        ) : null}

        <HtmlContentWithBanner 
          html={news.content} 
          middleBanner={articleBanners.middle} 
        />

        {articleBanners.end ? (
          <View style={styles.sponsoredWrapper}>
            <SponsoredBanner banner={articleBanners.end} />
          </View>
        ) : null}
      </View>

      <View style={styles.footer}>
        <ThemedText type="h4" style={styles.footerTitle}>Compartilhar noticia</ThemedText>
        <View style={styles.shareRow}>
          <ShareButton icon="send" label="WhatsApp" color="#25D366" />
          <ShareButton icon="facebook" label="Facebook" color="#1877F2" />
          <ShareButton icon="twitter" label="Twitter" color="#1DA1F2" />
        </View>

        <ThemedText type="caption" secondary style={styles.copyright}>
          Portal do Romeiro - Todos os direitos reservados
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 320,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
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
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  metaInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  authorName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  paragraph: {
    lineHeight: 26,
    marginBottom: Spacing.lg,
    textAlign: "justify",
  },
  internalImageContainer: {
    marginVertical: Spacing.lg,
  },
  internalImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  footerTitle: {
    marginBottom: Spacing.md,
  },
  shareRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  copyright: {
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  backButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  sponsoredWrapper: {
    marginVertical: Spacing.lg,
  },
  sponsoredContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: "rgba(65, 105, 225, 0.2)",
  },
  sponsoredHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  sponsoredLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#4169E1",
    letterSpacing: 0.5,
  },
  sponsoredContent: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  sponsoredImage: {
    width: 70,
    height: 70,
    borderRadius: BorderRadius.sm,
  },
  sponsoredInfo: {
    flex: 1,
    justifyContent: "center",
  },
  sponsoredTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  sponsoredDescription: {
    lineHeight: 18,
    marginBottom: 6,
  },
  sponsoredLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sponsoredLinkText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4169E1",
  },
});
