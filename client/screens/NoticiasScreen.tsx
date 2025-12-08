import { FlatList, View, StyleSheet, Pressable, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { NoticiasStackParamList } from "@/navigation/NoticiasStackNavigator";
import { newsData, News } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FeaturedNewsCard({ news, onPress }: { news: News; onPress: () => void }) {
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
        style={styles.featuredCard}
        imageStyle={styles.featuredImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.featuredGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: news.categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category}</ThemedText>
          </View>
          <ThemedText style={styles.featuredTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.featuredDate}>{news.date}</ThemedText>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function NewsListItem({ news, onPress }: { news: News; onPress: () => void }) {
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
      style={[styles.newsItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image source={{ uri: news.imageUrl }} style={styles.newsImage} contentFit="cover" />
      <View style={styles.newsContent}>
        <ThemedText style={[styles.newsCategory, { color: news.categoryColor }]}>
          {news.category}
        </ThemedText>
        <ThemedText style={styles.newsTitle} numberOfLines={2}>
          {news.title}
        </ThemedText>
        <ThemedText type="caption" secondary>{news.date}</ThemedText>
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

  const featuredNews = newsData.find((n) => n.featured) || newsData[0];
  const otherNews = newsData.filter((n) => n.id !== featuredNews.id);

  const handleNewsPress = (newsId: string) => {
    navigation.navigate("NoticiaDetail", { id: newsId });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <FeaturedNewsCard news={featuredNews} onPress={() => handleNewsPress(featuredNews.id)} />
      <ThemedText type="h4" style={styles.sectionTitle}>Todas as Noticias</ThemedText>
    </View>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={otherNews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
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
});
