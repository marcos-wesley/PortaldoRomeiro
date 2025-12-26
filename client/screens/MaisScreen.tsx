import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, CommonActions } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { MaisStackParamList } from "@/navigation/MaisStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VibrantColors = {
  purple: "#8B5CF6",
  orange: "#F97316",
  teal: "#14B8A6",
  pink: "#EC4899",
  blue: "#3B82F6",
  green: "#22C55E",
  coral: "#F87171",
  gray: "#6B7280",
  indigo: "#6366F1",
  cyan: "#06B6D4",
};

const menuItems = [
  { id: "1", icon: "book-open", title: "Historia do Santuario", screen: "Historia", color: VibrantColors.purple },
  { id: "2", icon: "map-pin", title: "Pontos Turisticos", screen: "Roteiros", color: VibrantColors.teal },
  { id: "3", icon: "coffee", title: "Restaurantes", screen: "GuiaRestaurantes", color: VibrantColors.coral },
  { id: "4", icon: "home", title: "Hospedagens", screen: "Hospedagem", color: VibrantColors.blue },
  { id: "5", icon: "help-circle", title: "Dicas do Romeiro", screen: "DicasRomeiro", color: VibrantColors.cyan },
  { id: "6", icon: "phone", title: "Telefones Uteis", screen: "TelefonesUteis", color: VibrantColors.gray },
];

interface RomariaData {
  name: string | null;
  start_date: string | null;
  end_date: string | null;
  message_before: string | null;
  message_during: string | null;
  enabled: string | null;
}

interface MenuItemProps {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
}

function MenuItem({ icon, title, color, onPress }: MenuItemProps) {
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
      style={[styles.menuItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: color + "15" }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <ThemedText style={styles.menuTitle}>{title}</ThemedText>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function RomariaCountdownCard({ data }: { data: RomariaData }) {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "before" as "before" | "during" | "after" });
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    const calculateCountdown = () => {
      if (!data.start_date || !data.end_date) return;
      
      const now = new Date();
      const startDate = new Date(data.start_date + "T00:00:00");
      const endDate = new Date(data.end_date + "T23:59:59");
      
      if (now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdown({ days, hours, minutes, seconds, status: "before" });
      } else if (now >= startDate && now <= endDate) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "during" });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, status: "after" });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [data.start_date, data.end_date]);

  if (countdown.status === "after") return null;

  const isDuring = countdown.status === "during";

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
      >
        <LinearGradient
          colors={isDuring ? ["#22C55E", "#16A34A"] : ["#B91C1C", "#991B1B"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.romariaCard}
        >
          <View style={styles.romariaContent}>
            <View style={styles.romariaIconContainer}>
              <Feather name={isDuring ? "bell" : "clock"} size={28} color="white" />
            </View>
            
            <View style={styles.romariaTextContainer}>
              {isDuring ? (
                <>
                  <ThemedText style={styles.romariaTitle}>Romaria em andamento</ThemedText>
                  <ThemedText style={styles.romariaTheme}>
                    {data.name || "Chamamos: Abba, Pai!"}
                  </ThemedText>
                  <ThemedText style={styles.romariaMessage}>
                    {data.message_during || "Viva esse momento de fe."}
                  </ThemedText>
                </>
              ) : (
                <>
                  <ThemedText style={styles.romariaTitle}>
                    Faltam {countdown.days} dias para a Romaria
                  </ThemedText>
                  <ThemedText style={styles.romariaTheme}>
                    {data.name || "Chamamos: Abba, Pai!"}
                  </ThemedText>
                  <ThemedText style={styles.romariaDates}>
                    De 26 de Junho a 05 de Julho
                  </ThemedText>
                </>
              )}
            </View>
          </View>

          {!isDuring && (
            <View style={styles.countdownContainer}>
              <View style={styles.countdownItem}>
                <ThemedText style={styles.countdownNumber}>{countdown.days}</ThemedText>
                <ThemedText style={styles.countdownLabel}>dias</ThemedText>
              </View>
              <View style={styles.countdownDivider} />
              <View style={styles.countdownItem}>
                <ThemedText style={styles.countdownNumber}>{countdown.hours.toString().padStart(2, "0")}</ThemedText>
                <ThemedText style={styles.countdownLabel}>horas</ThemedText>
              </View>
              <View style={styles.countdownDivider} />
              <View style={styles.countdownItem}>
                <ThemedText style={styles.countdownNumber}>{countdown.minutes.toString().padStart(2, "0")}</ThemedText>
                <ThemedText style={styles.countdownLabel}>min</ThemedText>
              </View>
              <View style={styles.countdownDivider} />
              <View style={styles.countdownItem}>
                <ThemedText style={styles.countdownNumber}>{countdown.seconds.toString().padStart(2, "0")}</ThemedText>
                <ThemedText style={styles.countdownLabel}>seg</ThemedText>
              </View>
            </View>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function MaisScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MaisStackParamList>>();

  const { data: romariaData } = useQuery<RomariaData>({
    queryKey: ["/api/romaria"],
  });

  const handleNavigate = (screen: string) => {
    try {
      if (screen === "GuiaRestaurantes") {
        navigation.dispatch(
          CommonActions.navigate({
            name: "GuiaTab",
            params: {
              screen: "Guia",
              params: { initialCategory: "onde-comer" }
            }
          })
        );
      } else {
        navigation.navigate(screen as any);
      }
    } catch (e) {
    }
  };

  const showRomaria = romariaData && romariaData.enabled === "true";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText type="h2" style={styles.headerTitle}>Informacoes</ThemedText>
        <ThemedText type="body" secondary style={styles.headerSubtitle}>
          Tudo o que voce precisa para sua visita.
        </ThemedText>
      </View>

      <View style={styles.menuList}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            color={item.color}
            onPress={() => handleNavigate(item.screen)}
          />
        ))}
      </View>

      {showRomaria ? (
        <View style={styles.romariaSection}>
          <RomariaCountdownCard data={romariaData} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  menuList: {
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  romariaSection: {
    marginTop: Spacing.xl,
  },
  romariaCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    overflow: "hidden",
  },
  romariaContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  romariaIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  romariaTextContainer: {
    flex: 1,
  },
  romariaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
    marginBottom: 4,
  },
  romariaMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  romariaTheme: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    fontStyle: "italic",
    marginBottom: 2,
  },
  romariaDates: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.85)",
  },
  countdownContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.2)",
  },
  countdownItem: {
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "white",
  },
  countdownLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  countdownDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
