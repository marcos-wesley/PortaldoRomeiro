import { ScrollView, View, StyleSheet, Pressable, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { routesData, Route } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "Facil":
      return Colors.light.success;
    case "Moderado":
      return Colors.light.warning;
    case "Dificil":
      return Colors.light.error;
    default:
      return Colors.light.primary;
  }
}

function RouteCard({ route, onPress }: { route: Route; onPress: () => void }) {
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
      style={animatedStyle}
    >
      <ImageBackground
        source={{ uri: route.imageUrl }}
        style={styles.routeCard}
        imageStyle={styles.routeImage}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.85)"]}
          style={styles.routeGradient}
        >
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(route.difficulty) }]}>
            <ThemedText style={styles.difficultyText}>{route.difficulty}</ThemedText>
          </View>
          <ThemedText style={styles.routeTitle}>{route.name}</ThemedText>
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Feather name="map" size={14} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.routeStatText}>{route.distance}</ThemedText>
            </View>
            <View style={styles.routeStat}>
              <Feather name="clock" size={14} color="rgba(255,255,255,0.8)" />
              <ThemedText style={styles.routeStatText}>{route.duration}</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </AnimatedPressable>
  );
}

function RoutePoints({ route }: { route: Route }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.pointsCard, { backgroundColor: theme.backgroundDefault }]}>
      <ThemedText type="h4" style={styles.pointsTitle}>{route.name}</ThemedText>
      <ThemedText type="caption" secondary style={styles.pointsDescription}>{route.description}</ThemedText>
      <View style={styles.pointsList}>
        {route.points.map((point, index) => (
          <View key={index} style={styles.pointItem}>
            <View style={[styles.pointDot, { backgroundColor: Colors.light.primary }]}>
              <ThemedText style={styles.pointNumber}>{index + 1}</ThemedText>
            </View>
            <ThemedText style={styles.pointText}>{point}</ThemedText>
            {index < route.points.length - 1 ? (
              <View style={[styles.pointLine, { backgroundColor: theme.border }]} />
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default function RoteirosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.introCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="navigation" size={24} color={Colors.light.primary} />
        <View style={styles.introContent}>
          <ThemedText type="h4">Roteiros de Peregrinacao</ThemedText>
          <ThemedText type="small" secondary>
            Escolha o caminho que melhor se adapta ao seu ritmo e prepare-se para uma jornada de fe.
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Rotas Disponiveis</ThemedText>

      {routesData.map((route) => (
        <View key={route.id} style={styles.routeSection}>
          <RouteCard route={route} onPress={() => {}} />
          <RoutePoints route={route} />
        </View>
      ))}

      <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="alert-circle" size={20} color={Colors.light.warning} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Dicas de Seguranca</ThemedText>
          <ThemedText type="caption" secondary>
            Leve agua, use roupas confortaveis, proteja-se do sol e respeite seus limites fisicos durante o percurso.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  introContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  routeSection: {
    marginBottom: Spacing.xl,
  },
  routeCard: {
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  routeImage: {
    borderRadius: BorderRadius.lg,
  },
  routeGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  difficultyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  difficultyText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  routeTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  routeStats: {
    flexDirection: "row",
  },
  routeStat: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  routeStatText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  pointsCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  pointsTitle: {
    marginBottom: Spacing.xs,
  },
  pointsDescription: {
    marginBottom: Spacing.lg,
  },
  pointsList: {
    paddingLeft: Spacing.xs,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    marginBottom: Spacing.md,
  },
  pointDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    zIndex: 1,
  },
  pointNumber: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  pointText: {
    fontSize: 14,
    flex: 1,
  },
  pointLine: {
    position: "absolute",
    left: 11,
    top: 24,
    width: 2,
    height: Spacing.lg,
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
