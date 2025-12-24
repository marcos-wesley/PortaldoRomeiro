import { ScrollView, View, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

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
  { id: "3", icon: "coffee", title: "Restaurantes", screen: "Restaurantes", color: VibrantColors.coral },
  { id: "4", icon: "home", title: "Hospedagens", screen: "Hospedagem", color: VibrantColors.blue },
  { id: "5", icon: "truck", title: "Horarios de Onibus", screen: "HorariosOnibus", color: VibrantColors.pink },
  { id: "6", icon: "help-circle", title: "Dicas do Romeiro", screen: "DicasRomeiro", color: VibrantColors.cyan },
  { id: "7", icon: "phone", title: "Telefones Uteis", screen: "TelefonesUteis", color: VibrantColors.gray },
];

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

export default function MaisScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<MaisStackParamList>>();

  const handleNavigate = (screen: string) => {
    try {
      navigation.navigate(screen as any);
    } catch (e) {
      // Screen might not exist yet
    }
  };

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
});
