import React, { useState, useCallback } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput, Modal, ScrollView, Alert, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { Notification } from "@shared/schema";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const notificationTypes = [
  { id: "general", label: "Geral", icon: "bell" },
  { id: "news", label: "Noticias", icon: "file-text" },
  { id: "accommodation", label: "Hospedagem", icon: "home" },
  { id: "tip", label: "Dicas", icon: "help-circle" },
  { id: "route", label: "Roteiros", icon: "map-pin" },
  { id: "promo", label: "Promocoes", icon: "tag" },
];

interface NotificationItemProps {
  notification: Notification;
  onEdit: () => void;
  onDelete: () => void;
  onSend: () => void;
}

function NotificationItem({ notification, onEdit, onDelete, onSend }: NotificationItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Animated.View entering={FadeIn}>
      <AnimatedPressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[styles.notificationCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: Colors.light.primary + "20" }]}>
            <ThemedText style={{ color: Colors.light.primary, fontSize: 12, fontWeight: "600" }}>
              {notificationTypes.find(t => t.id === notification.type)?.label || "Geral"}
            </ThemedText>
          </View>
          <View style={styles.statusContainer}>
            {notification.sent ? (
              <View style={[styles.statusBadge, { backgroundColor: "#22C55E20" }]}>
                <Feather name="check-circle" size={12} color="#22C55E" />
                <ThemedText style={{ color: "#22C55E", fontSize: 11, marginLeft: 4 }}>Enviada</ThemedText>
              </View>
            ) : (
              <View style={[styles.statusBadge, { backgroundColor: "#F9731620" }]}>
                <Feather name="clock" size={12} color="#F97316" />
                <ThemedText style={{ color: "#F97316", fontSize: 11, marginLeft: 4 }}>Pendente</ThemedText>
              </View>
            )}
          </View>
        </View>

        <ThemedText type="h4" style={styles.cardTitle} numberOfLines={1}>
          {notification.title}
        </ThemedText>
        <ThemedText style={styles.cardBody} secondary numberOfLines={2}>
          {notification.body}
        </ThemedText>

        <View style={styles.cardFooter}>
          <ThemedText style={styles.cardDate} secondary>
            {notification.sent ? `Enviada: ${formatDate(notification.sentAt)}` : `Criada: ${formatDate(notification.createdAt)}`}
          </ThemedText>
          <View style={styles.cardActions}>
            {!notification.sent ? (
              <Pressable onPress={onSend} style={[styles.actionButton, { backgroundColor: "#22C55E20" }]}>
                <Feather name="send" size={16} color="#22C55E" />
              </Pressable>
            ) : null}
            <Pressable onPress={onEdit} style={[styles.actionButton, { backgroundColor: Colors.light.primary + "20" }]}>
              <Feather name="edit-2" size={16} color={Colors.light.primary} />
            </Pressable>
            <Pressable onPress={onDelete} style={[styles.actionButton, { backgroundColor: "#EF444420" }]}>
              <Feather name="trash-2" size={16} color="#EF4444" />
            </Pressable>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("general");
  const [sendPush, setSendPush] = useState(true);

  const { data, isLoading, refetch } = useQuery<{ notifications: Notification[] }>({
    queryKey: ["/api/admin/notifications"],
  });

  const { data: statsData } = useQuery<{ notificationsCount: number; devicesCount: number; usersCount: number }>({
    queryKey: ["/api/admin/notifications/stats"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; body: string; type: string; sendPush: boolean }) => {
      return await apiRequest("POST", "/api/admin/notifications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { title: string; body: string; type: string; sendPush: boolean } }) => {
      return await apiRequest("PUT", `/api/admin/notifications/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/admin/notifications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("POST", `/api/admin/notifications/${id}/send`);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/notifications"] });
      Alert.alert("Sucesso", response.message || "Notificacao enviada com sucesso!");
    },
    onError: (error: any) => {
      Alert.alert("Erro", error.message || "Erro ao enviar notificacao");
    },
  });

  const openModal = (notification?: Notification) => {
    if (notification) {
      setEditingNotification(notification);
      setTitle(notification.title);
      setBody(notification.body);
      setType(notification.type || "general");
      setSendPush(notification.sendPush ?? true);
    } else {
      setEditingNotification(null);
      setTitle("");
      setBody("");
      setType("general");
      setSendPush(true);
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingNotification(null);
    setTitle("");
    setBody("");
    setType("general");
    setSendPush(true);
  };

  const handleSave = () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert("Erro", "Preencha todos os campos obrigatorios");
      return;
    }

    const data = { title: title.trim(), body: body.trim(), type, sendPush };

    if (editingNotification) {
      updateMutation.mutate({ id: editingNotification.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (Platform.OS === "web") {
      if (confirm("Tem certeza que deseja excluir esta notificacao?")) {
        deleteMutation.mutate(id);
      }
    } else {
      Alert.alert("Confirmar", "Tem certeza que deseja excluir esta notificacao?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => deleteMutation.mutate(id) },
      ]);
    }
  };

  const handleSend = (id: string) => {
    if (Platform.OS === "web") {
      if (confirm("Enviar esta notificacao para todos os usuarios?")) {
        sendMutation.mutate(id);
      }
    } else {
      Alert.alert("Confirmar", "Enviar esta notificacao para todos os usuarios?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Enviar", onPress: () => sendMutation.mutate(id) },
      ]);
    }
  };

  const renderItem = useCallback(({ item }: { item: Notification }) => (
    <NotificationItem
      notification={item}
      onEdit={() => openModal(item)}
      onDelete={() => handleDelete(item.id)}
      onSend={() => handleSend(item.id)}
    />
  ), []);

  const notifications = data?.notifications ?? [];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="bell" size={20} color={Colors.light.primary} />
          <ThemedText type="h3" style={styles.statNumber}>{statsData?.notificationsCount ?? 0}</ThemedText>
          <ThemedText style={styles.statLabel} secondary>Notificacoes</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="users" size={20} color="#22C55E" />
          <ThemedText type="h3" style={styles.statNumber}>{statsData?.usersCount ?? 0}</ThemedText>
          <ThemedText style={styles.statLabel} secondary>Usuarios</ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="smartphone" size={20} color="#F97316" />
          <ThemedText type="h3" style={styles.statNumber}>{statsData?.devicesCount ?? 0}</ThemedText>
          <ThemedText style={styles.statLabel} secondary>Dispositivos</ThemedText>
        </View>
      </View>

      <View style={styles.headerRow}>
        <ThemedText type="h3">Notificacoes</ThemedText>
        <Pressable 
          onPress={() => openModal()} 
          style={[styles.addButton, { backgroundColor: Colors.light.primary }]}
        >
          <Feather name="plus" size={18} color="#FFFFFF" />
          <ThemedText style={styles.addButtonText}>Nova</ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color={theme.textSecondary} />
            <ThemedText type="h4" style={styles.emptyText}>Nenhuma notificacao criada</ThemedText>
            <ThemedText secondary style={styles.emptySubtext}>Crie uma nova notificacao para enviar aos usuarios</ThemedText>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={closeModal}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
            <ThemedText type="h3">{editingNotification ? "Editar" : "Nova"} Notificacao</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: Spacing.xl * 2 }}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Titulo *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Titulo da notificacao"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Mensagem *</ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.backgroundDefault, color: theme.text }]}
                value={body}
                onChangeText={setBody}
                placeholder="Conteudo da notificacao"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Tipo</ThemedText>
              <View style={styles.typeGrid}>
                {notificationTypes.map((t) => (
                  <Pressable
                    key={t.id}
                    style={[
                      styles.typeChip,
                      { backgroundColor: type === t.id ? Colors.light.primary : theme.backgroundDefault },
                    ]}
                    onPress={() => setType(t.id)}
                  >
                    <Feather name={t.icon as any} size={14} color={type === t.id ? "#FFFFFF" : theme.text} />
                    <ThemedText style={{ color: type === t.id ? "#FFFFFF" : theme.text, fontSize: 12, marginLeft: 4 }}>
                      {t.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={[styles.toggleRow, { backgroundColor: theme.backgroundDefault }]}
              onPress={() => setSendPush(!sendPush)}
            >
              <View style={styles.toggleInfo}>
                <Feather name="smartphone" size={20} color={theme.text} />
                <View style={styles.toggleText}>
                  <ThemedText style={styles.toggleTitle}>Enviar Push</ThemedText>
                  <ThemedText style={styles.toggleSubtitle} secondary>Envia notificacao push para dispositivos</ThemedText>
                </View>
              </View>
              <View style={[styles.toggle, sendPush && styles.toggleActive, { backgroundColor: sendPush ? Colors.light.primary : theme.backgroundTertiary }]}>
                <View style={[styles.toggleKnob, sendPush && styles.toggleKnobActive]} />
              </View>
            </Pressable>

            <Button
              onPress={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
              style={{ marginTop: Spacing.xl }}
            >
              {editingNotification ? "Salvar Alteracoes" : "Criar Notificacao"}
            </Button>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  statNumber: {
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  notificationCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  statusContainer: {
    flexDirection: "row",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  cardDate: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 3,
  },
  emptyText: {
    marginTop: Spacing.lg,
  },
  emptySubtext: {
    marginTop: Spacing.sm,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  toggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: "center",
  },
  toggleActive: {},
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  toggleKnobActive: {
    alignSelf: "flex-end",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
