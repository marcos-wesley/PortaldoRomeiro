import { FlatList, View, StyleSheet, Pressable, ImageBackground, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { NoticiasStackParamList } from "@/navigation/NoticiasStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  category: string;
  published: boolean;
  publishedAt: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
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

function FeaturedNewsCard({ news, onPress }: { news: NewsItem; onPress: () => void }) {
  const scale = useSharedValue(1);
  const categoryColor = getCategoryColor(news.category);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUrl = news.coverImage || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={animatedStyle}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.featuredCard}
        imageStyle={styles.featuredImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.featuredGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category || "Geral"}</ThemedText>
          </View>
          <ThemedText style={styles.featuredTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.featuredDate}>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function NewsListItem({ news, onPress }: { news: NewsItem; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const categoryColor = getCategoryColor(news.category);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const imageUrl = news.coverImage || "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.newsItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image source={{ uri: imageUrl }} style={styles.newsImage} contentFit="cover" />
      <View style={styles.newsContent}>
        <ThemedText style={[styles.newsCategory, { color: categoryColor }]}>
          {news.category || "Geral"}
        </ThemedText>
        <ThemedText style={styles.newsTitle} numberOfLines={2}>
          {news.title}
        </ThemedText>
        <ThemedText type="caption" secondary>{formatDate(news.publishedAt || news.createdAt)}</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

export default function NoticiasScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<NoticiasStackParamList>>();

  const { data, isLoading, error } = useQuery<{ news: NewsItem[] }>({
    queryKey: ["/api/news"],
  });

  const newsList = data?.news || [];
  const featuredNews = newsList.length > 0 ? newsList[0] : null;
  const otherNews = newsList.length > 1 ? newsList.slice(1) : [];

  const handleNewsPress = (newsId: string) => {
    navigation.navigate("NoticiaDetail", { id: newsId });
  };

  const renderHeader = () => {
    if (!featuredNews) return null;
    
    return (
      <View style={styles.header}>
        <FeaturedNewsCard news={featuredNews} onPress={() => handleNewsPress(featuredNews.id)} />
        {otherNews.length > 0 ? (
          <ThemedText type="h4" style={styles.sectionTitle}>Todas as Noticias</ThemedText>
        ) : null}
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <ThemedText type="body" secondary style={styles.emptyText}>
        Nenhuma noticia disponivel no momento.
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText type="body" secondary style={styles.loadingText}>Carregando noticias...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText type="body" secondary style={styles.emptyText}>Erro ao carregar noticias.</ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={otherNews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={!featuredNews ? renderEmpty : null}
      renderItem={({ item }) => (
        <NewsListItem news={item} onPress={() => handleNewsPress(item.id)} />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  featuredCard: {
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  featuredImage: {
    borderRadius: BorderRadius.lg,
  },
  featuredGradient: {
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
  featuredTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  featuredDate: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  newsItem: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  newsImage: {
    width: 110,
    height: 90,
  },
  newsContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "center",
  },
  newsCategory: {
    fontSize: 11,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyText: {
    textAlign: "center",
  },
});
