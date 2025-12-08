import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { guideCategories } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GuideCard({ category, onPress }: { category: typeof guideCategories[0]; onPress: () => void }) {
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
      style={[styles.guideCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.guideIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={category.icon as any} size={24} color={Colors.light.primary} />
      </View>
      <ThemedText type="h4" style={styles.guideTitle}>{category.title}</ThemedText>
      <ThemedText type="caption" secondary>{category.count} itens</ThemedText>
    </AnimatedPressable>
  );
}

function DailyPrayer() {
  const { theme } = useTheme();

  return (
    <View style={[styles.dailyPrayer, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.dailyPrayerHeader}>
        <View style={[styles.dailyPrayerIcon, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="sun" size={20} color={Colors.light.primary} />
        </View>
        <ThemedText type="h4">Oracao do Dia</ThemedText>
      </View>
      <ThemedText style={styles.prayerText}>
        "Pai Eterno, eu vos adoro e vos amo. Guardai-me sob vossa protecao. Derramai sobre mim as vossas bencaos. Dai-me a graca de amar-Vos cada dia mais. Amem."
      </ThemedText>
      <View style={styles.prayerMeta}>
        <ThemedText type="caption" secondary>08 de Dezembro</ThemedText>
      </View>
    </View>
  );
}

export default function GuiaScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <DailyPrayer />

      <ThemedText type="h4" style={styles.sectionTitle}>Categorias</ThemedText>

      <View style={styles.categoriesGrid}>
        {guideCategories.map((category) => (
          <GuideCard key={category.id} category={category} onPress={() => {}} />
        ))}
      </View>

      <View style={[styles.tipCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="info" size={20} color={Colors.light.primary} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Dica do Dia</ThemedText>
          <ThemedText type="caption" secondary>
            Reserve um momento de silencio antes de iniciar suas oracoes para melhor conexao espiritual.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dailyPrayer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dailyPrayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dailyPrayerIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  prayerText: {
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  prayerMeta: {
    alignItems: "flex-end",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  guideCard: {
    width: "48%",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  guideTitle: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  tipCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
