import { ScrollView, View, StyleSheet, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { newsData } from "@/lib/data";

type NoticiaDetailRouteProp = RouteProp<HomeStackParamList, "NoticiaDetail">;

export default function NoticiaDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<NoticiaDetailRouteProp>();

  const news = newsData.find((n) => n.id === route.params.id) || newsData[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={{ uri: news.imageUrl }}
        style={styles.heroImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: news.categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category}</ThemedText>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <ThemedText type="h3" style={styles.title}>{news.title}</ThemedText>
        <ThemedText type="caption" secondary style={styles.date}>{news.date}</ThemedText>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <ThemedText type="body" style={styles.bodyText}>{news.content}</ThemedText>
        <ThemedText type="body" style={styles.bodyText}>
          A devocao ao Divino Pai Eterno e uma das maiores expressoes de fe do povo brasileiro. Milhares de romeiros percorrem o caminho todos os anos, buscando graças e renovando sua espiritualidade.
        </ThemedText>
        <ThemedText type="body" style={styles.bodyText}>
          O santuario oferece diversas celebracoes e momentos de oracao para os fieis, alem de estrutura de apoio para os visitantes durante todo o periodo de festividades.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    height: 280,
    width: "100%",
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
  },
  categoryBadgeText: {
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
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  bodyText: {
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
});
