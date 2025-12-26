import { View, StyleSheet, Pressable, Linking, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PartnerBannerProps {
  type: "business" | "accommodation";
}

export function PartnerBanner({ type }: PartnerBannerProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    const scheme = process.env.EXPO_PUBLIC_SCHEME || "https";
    const baseUrl = Platform.select({
      web: "",
      default: scheme + "://" + (process.env.EXPO_PUBLIC_DOMAIN || ""),
    });
    const path = type === "business" ? "/cadastro.html" : "/cadastro.html#hospedagem";
    Linking.openURL(baseUrl + path).catch(() => {});
  };

  const title = type === "business" 
    ? "Seja nosso parceiro" 
    : "Anuncie sua hospedagem";
  
  const subtitle = type === "business"
    ? "Divulgue sua empresa para milhares de romeiros"
    : "Alcance romeiros de todo o Brasil";

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.iconContainer}>
        <Feather 
          name={type === "business" ? "users" : "home"} 
          size={20} 
          color="#FFFFFF" 
        />
      </View>
      <View style={styles.textContainer}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>
      <View style={styles.button}>
        <ThemedText style={styles.buttonText}>Cadastrar</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  subtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  buttonText: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: "600",
  },
});
