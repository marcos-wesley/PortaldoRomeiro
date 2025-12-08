import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const scheduleData = [
  { id: "1", time: "06:00", title: "Missa Matutina", status: "past" },
  { id: "2", time: "09:00", title: "Rosario Mariano", status: "past" },
  { id: "3", time: "12:00", title: "Angelus", status: "live" },
  { id: "4", time: "15:00", title: "Hora da Misericordia", status: "upcoming" },
  { id: "5", time: "18:00", title: "Missa Vespertina", status: "upcoming" },
  { id: "6", time: "21:00", title: "Novena do Divino Pai Eterno", status: "upcoming" },
];

function LivePlayer() {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.livePlayer, animatedStyle]}
    >
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800" }}
        style={styles.liveImage}
        contentFit="cover"
      />
      <View style={styles.liveOverlay}>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <ThemedText style={styles.liveText}>AO VIVO</ThemedText>
        </View>
        <View style={styles.playButtonLarge}>
          <Feather name="play" size={32} color="#FFFFFF" />
        </View>
        <View style={styles.liveInfo}>
          <ThemedText style={styles.liveTitle}>Transmissao ao Vivo</ThemedText>
          <ThemedText style={styles.liveSubtitle}>Santuario Basilica do Divino Pai Eterno</ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function ScheduleItem({ item }: { item: typeof scheduleData[0] }) {
  const { theme } = useTheme();
  const isLive = item.status === "live";
  const isPast = item.status === "past";

  return (
    <View
      style={[
        styles.scheduleItem,
        { backgroundColor: isLive ? Colors.light.highlight : theme.backgroundDefault },
      ]}
    >
      <View style={styles.scheduleTime}>
        <ThemedText
          style={[
            styles.timeText,
            { color: isLive ? Colors.light.primary : isPast ? theme.textSecondary : theme.text },
          ]}
        >
          {item.time}
        </ThemedText>
      </View>
      <View style={styles.scheduleContent}>
        <ThemedText
          style={[
            styles.scheduleTitle,
            { opacity: isPast ? 0.5 : 1 },
          ]}
        >
          {item.title}
        </ThemedText>
        {isLive ? (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDotSmall} />
            <ThemedText style={styles.liveIndicatorText}>Ao vivo agora</ThemedText>
          </View>
        ) : null}
      </View>
      {isLive ? (
        <Feather name="play-circle" size={24} color={Colors.light.primary} />
      ) : null}
    </View>
  );
}

export default function TVAoVivoScreen() {
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
      <LivePlayer />

      <View style={styles.channelInfo}>
        <View style={[styles.channelIcon, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="tv" size={20} color={Colors.light.primary} />
        </View>
        <View style={styles.channelText}>
          <ThemedText type="h4">TV Portal do Romeiro</ThemedText>
          <ThemedText type="caption" secondary>Transmissoes 24 horas</ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Programacao de Hoje</ThemedText>

      <View style={styles.schedule}>
        {scheduleData.map((item) => (
          <ScheduleItem key={item.id} item={item} />
        ))}
      </View>

      <View style={[styles.tipCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="bell" size={20} color={Colors.light.primary} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Ative as notificacoes</ThemedText>
          <ThemedText type="caption" secondary>
            Receba alertas quando suas celebracoes favoritas estiverem ao vivo.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  livePlayer: {
    height: 220,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  liveImage: {
    width: "100%",
    height: "100%",
  },
  liveOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  liveBadge: {
    position: "absolute",
    top: Spacing.md,
    left: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF4444",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: Spacing.xs,
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveInfo: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  liveTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  liveSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
  },
  channelInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  channelIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  channelText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  schedule: {
    marginBottom: Spacing.xl,
  },
  scheduleItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  scheduleTime: {
    width: 50,
    marginRight: Spacing.md,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scheduleContent: {
    flex: 1,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  liveDotSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EF4444",
    marginRight: Spacing.xs,
  },
  liveIndicatorText: {
    color: "#EF4444",
    fontSize: 11,
    fontWeight: "600",
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
