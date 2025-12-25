import React, { useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { UserNotification } from "@shared/schema";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NotificationItemProps {
  notification: UserNotification;
  onPress: () => void;
  onDelete: () => void;
}

function NotificationItem({ notification, onPress, onDelete }: NotificationItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getIcon = () => {
    switch (notification.type) {
      case "news": return "file-text";
      case "accommodation": return "home";
      case "tip": return "help-circle";
      case "route": return "map-pin";
      case "promo": return "tag";
      default: return "bell";
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case "news": return "#3B82F6";
      case "accommodation": return "#14B8A6";
      case "tip": return "#F97316";
      case "route": return "#8B5CF6";
      case "promo": return "#EC4899";
      default: return Colors.light.primary;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.notificationItem,
          { backgroundColor: notification.read ? theme.backgroundDefault : theme.backgroundSecondary },
          animatedStyle,
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: getIconColor() + "20" }]}>
          <Feather name={getIcon() as any} size={20} color={getIconColor()} />
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <ThemedText style={[styles.title, !notification.read && styles.unreadTitle]} numberOfLines={1}>
              {notification.title}
            </ThemedText>
            <ThemedText style={styles.time} secondary>
              {formatDate(notification.createdAt)}
            </ThemedText>
          </View>
          <ThemedText style={styles.body} secondary numberOfLines={2}>
            {notification.body}
          </ThemedText>
        </View>
        {!notification.read ? (
          <View style={styles.unreadDot} />
        ) : null}
        <Pressable onPress={onDelete} style={styles.deleteButton} hitSlop={10}>
          <Feather name="x" size={16} color={theme.textSecondary} />
        </Pressable>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = insets.bottom + 60;
  }

  const { data, isLoading, refetch } = useQuery<{ notifications: UserNotification[]; unreadCount: number }>({
    queryKey: ["/api/user", user?.id, "notifications"],
    enabled: !!user?.id,
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("PUT", `/api/user/notifications/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PUT", `/api/user/${user?.id}/notifications/read-all`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications/unread-count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/user/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user", user?.id, "notifications/unread-count"] });
    },
  });

  const handleNotificationPress = useCallback((notification: UserNotification) => {
    if (!notification.read) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.actionType === "navigate" && notification.actionData) {
      try {
        const actionData = JSON.parse(notification.actionData);
        if (actionData.screen) {
          (navigation as any).navigate(actionData.screen, actionData.params);
        }
      } catch (e) {
        console.error("Error parsing action data:", e);
      }
    }
  }, [markReadMutation, navigation]);

  const renderItem = useCallback(({ item }: { item: UserNotification }) => (
    <NotificationItem
      notification={item}
      onPress={() => handleNotificationPress(item)}
      onDelete={() => deleteMutation.mutate(item.id)}
    />
  ), [handleNotificationPress, deleteMutation]);

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  if (!user) {
    return (
      <ThemedView style={styles.centerContainer}>
        <Feather name="bell-off" size={48} color={theme.textSecondary} />
        <ThemedText type="h3" style={styles.emptyTitle}>
          Faca login para ver suas notificacoes
        </ThemedText>
        <ThemedText style={styles.emptySubtitle} secondary>
          Entre na sua conta para receber notificacoes personalizadas
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {unreadCount > 0 ? (
        <Pressable style={styles.markAllButton} onPress={() => markAllReadMutation.mutate()}>
          <Feather name="check-circle" size={16} color={Colors.light.primary} />
          <ThemedText style={styles.markAllText}>
            Marcar todas como lidas ({unreadCount})
          </ThemedText>
        </Pressable>
      ) : null}

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingTop: headerHeight + Spacing.md,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={theme.textSecondary} />
            <ThemedText type="h3" style={styles.emptyTitle}>
              Nenhuma notificacao
            </ThemedText>
            <ThemedText style={styles.emptySubtitle} secondary>
              Voce nao tem notificacoes no momento
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  markAllText: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contentContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
    marginRight: Spacing.xs,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 3,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  emptySubtitle: {
    marginTop: Spacing.sm,
    textAlign: "center",
    fontSize: 15,
  },
});
