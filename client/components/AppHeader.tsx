import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";

interface AppHeaderProps extends Partial<NativeStackHeaderProps> {
  userName?: string;
  userAvatar?: string;
  showBackButton?: boolean;
  onSearchPress?: () => void;
  onNotificationsPress?: () => void;
  onAvatarPress?: () => void;
  hasNotifications?: boolean;
}

export function AppHeader({ 
  userName = "Romeiro", 
  userAvatar,
  showBackButton = false,
  navigation,
  onSearchPress,
  onNotificationsPress,
  onAvatarPress,
  hasNotifications = true,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const nav = useNavigation();
  const { user } = useAuth();

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/user", user?.id, "notifications/unread-count"],
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const unreadCount = unreadData?.count ?? 0;

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleAvatarPress = () => {
    if (onAvatarPress) {
      onAvatarPress();
    } else {
      try {
        (nav as any).navigate("Profile");
      } catch {
        (navigation as any)?.navigate?.("Profile");
      }
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.headerBackground }]}>
      {showBackButton && navigation?.canGoBack() ? (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.headerTitleText} />
        </Pressable>
      ) : null}
      
      <View style={[styles.leftSection, showBackButton && styles.leftWithBack]}>
        <Image
          source={require("../../assets/images/portal-logo.webp")}
          style={styles.logoImage}
          contentFit="contain"
        />
      </View>

      <View style={styles.rightSection}>
        <Pressable 
          onPress={onSearchPress} 
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Feather name="search" size={22} color={theme.headerIconColor} />
        </Pressable>
        
        <Pressable 
          onPress={() => {
            if (onNotificationsPress) {
              onNotificationsPress();
            } else {
              try {
                (nav as any).navigate("Notifications");
              } catch {
                (navigation as any)?.navigate?.("Notifications");
              }
            }
          }} 
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Feather name="bell" size={22} color={theme.headerIconColor} />
          {unreadCount > 0 ? (
            <View style={[styles.notificationBadge, { backgroundColor: Colors.light.primary }]}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
        
        <Pressable 
          onPress={handleAvatarPress}
          style={({ pressed }) => [pressed && styles.avatarPressed]}
        >
          <View style={[styles.avatarContainer, { borderColor: theme.avatarBorder, backgroundColor: theme.backgroundSecondary }]}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
                contentFit="cover"
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: theme.backgroundTertiary }]}>
                <Feather name="user" size={18} color={theme.headerIconColor} />
              </View>
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    width: "100%",
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  leftSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  leftWithBack: {
    marginLeft: 0,
  },
  logoImage: {
    width: 200,
    height: 44,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
    position: "relative",
  },
  iconButtonPressed: {
    opacity: 0.6,
  },
  notificationBadge: {
    position: "absolute",
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "700",
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    overflow: "hidden",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPressed: {
    opacity: 0.7,
  },
});
