import React from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

import { Spacing, BorderRadius } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";

interface AppHeaderProps extends Partial<NativeStackHeaderProps> {
  userName?: string;
  userAvatar?: string;
  showBackButton?: boolean;
}

export function AppHeader({ 
  userName = "Romeiro", 
  userAvatar,
  showBackButton = false,
  navigation,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.headerBurgundy }]}>
      {showBackButton && navigation?.canGoBack() ? (
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
      
      <View style={[styles.logoContainer, showBackButton && styles.logoWithBack]}>
        <Image
          source={require("../../assets/images/portal-logo.webp")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={styles.rightSection}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={[styles.welcomeText, { color: theme.headerAccent }]}>Bem-vindo</Text>
        </View>
        
        <View style={[styles.avatarContainer, { borderColor: theme.avatarBorder, backgroundColor: theme.headerBurgundy }]}>
          {userAvatar ? (
            <Image
              source={{ uri: userAvatar }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Feather name="user" size={24} color="#FFFFFF" />
            </View>
          )}
        </View>
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
    paddingBottom: Spacing.md,
    width: "100%",
  },
  backButton: {
    marginRight: Spacing.sm,
    padding: Spacing.xs,
  },
  logoContainer: {
    flex: 1,
    alignItems: "flex-start",
  },
  logoWithBack: {
    marginLeft: 0,
  },
  logo: {
    width: 140,
    height: 36,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  userInfo: {
    alignItems: "flex-end",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  welcomeText: {
    fontSize: 13,
  },
  avatarContainer: {
    width: 48,
    height: 48,
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
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
});
