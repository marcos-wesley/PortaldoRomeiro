import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function NotificationBell() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const scale = useSharedValue(1);

  const { data } = useQuery<{ count: number }>({
    queryKey: ["/api/user", user?.id, "notifications/unread-count"],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = data?.count ?? 0;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    (navigation as any).navigate("Notifications");
  };

  if (!user) return null;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.container, animatedStyle]}
    >
      <Feather name="bell" size={22} color={theme.text} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </ThemedText>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
