import { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  runOnJS,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";

const { width } = Dimensions.get("window");

const BRAND_RED = "#b22226";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    iconOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) });
    iconScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.1)) });
    
    glowOpacity.value = withDelay(
      400,
      withSequence(
        withTiming(0.6, { duration: 600 }),
        withTiming(0.3, { duration: 600 })
      )
    );

    textOpacity.value = withDelay(600, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(600, withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }));

    const timeout = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <Animated.View style={[styles.glowEffect, glowAnimatedStyle]} />
          <Animated.View style={iconAnimatedStyle}>
            <Image
              source={require("../../assets/images/splash-icon.png")}
              style={styles.icon}
              contentFit="contain"
              tintColor="#FFFFFF"
            />
          </Animated.View>
        </View>

        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <ThemedText style={styles.tagline}>
            A Capital da Fe na palma da sua mao
          </ThemedText>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>Portal do Romeiro</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_RED,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  glowEffect: {
    position: "absolute",
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  icon: {
    width: width * 0.4,
    height: width * 0.4,
  },
  textContainer: {
    marginTop: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  tagline: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  footer: {
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    letterSpacing: 1,
  },
});
