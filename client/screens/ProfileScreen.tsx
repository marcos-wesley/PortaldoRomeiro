import { ScrollView, View, StyleSheet, Pressable, Switch, TextInput, Alert, Modal, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getInitials(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function ProfileOption({ 
  icon, 
  title, 
  onPress, 
  rightElement,
  iconColor = Colors.light.primary,
}: { 
  icon: string; 
  title: string; 
  onPress?: () => void;
  rightElement?: React.ReactNode;
  iconColor?: string;
}) {
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
      style={[styles.optionItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: iconColor + "15" }]}>
        <Feather name={icon as any} size={20} color={iconColor} />
      </View>
      <ThemedText style={styles.optionTitle}>{title}</ThemedText>
      {rightElement ? rightElement : (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </AnimatedPressable>
  );
}

function DataItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.dataItem, { borderBottomColor: theme.border }]}>
      <View style={styles.dataIconContainer}>
        <Feather name={icon as any} size={18} color={theme.textSecondary} />
      </View>
      <View style={styles.dataContent}>
        <ThemedText type="caption" secondary>{label}</ThemedText>
        <ThemedText style={styles.dataValue}>{value || "-"}</ThemedText>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const { user, logout, updateUser } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.receiveNews ?? true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || "");
  const [editEmail, setEditEmail] = useState(user?.email || "");
  const [editPhone, setEditPhone] = useState(user?.phone || "");
  const [editCity, setEditCity] = useState(user?.city || "");
  const [editState, setEditState] = useState(user?.state || "");

  const handleLogout = useCallback(async () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Tem certeza que deseja sair?");
      if (confirmed) {
        await logout();
      }
    } else {
      Alert.alert(
        "Sair da conta",
        "Tem certeza que deseja sair?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: async () => {
              await logout();
            },
          },
        ]
      );
    }
  }, [logout]);

  const handleOpenEditModal = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditPhone(user?.phone || "");
    setEditCity(user?.city || "");
    setEditState(user?.state || "");
    setIsEditModalVisible(true);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    if (editName.trim().length < 2) {
      showAlert("Erro", "Nome deve ter pelo menos 2 caracteres");
      return;
    }

    if (!editEmail.includes("@")) {
      showAlert("Erro", "E-mail invalido");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", `/api/user/profile/${user.id}`, {
        name: editName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim() || null,
        city: editCity.trim() || null,
        state: editState.trim() || null,
      });

      const data = await response.json();
      
      if (response.ok) {
        await updateUser(data.user);
        setIsEditModalVisible(false);
        showAlert("Sucesso", "Perfil atualizado com sucesso!");
      } else {
        showAlert("Erro", data.error || "Erro ao atualizar perfil");
      }
    } catch (error) {
      showAlert("Erro", "Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showAlert("Permissao necessaria", "Precisamos de acesso a sua galeria para alterar a foto de perfil");
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64 && user?.id) {
        setIsLoading(true);
        try {
          const asset = result.assets[0];
          const mimeType = asset.mimeType || "image/jpeg";
          const imageData = `data:${mimeType};base64,${asset.base64}`;

          const response = await apiRequest("POST", `/api/user/profile/${user.id}/avatar`, {
            imageData,
          });

          const data = await response.json();

          if (response.ok) {
            await updateUser(data.user);
            showAlert("Sucesso", "Foto atualizada com sucesso!");
          } else {
            showAlert("Erro", data.error || "Erro ao atualizar foto");
          }
        } catch (error) {
          showAlert("Erro", "Erro ao atualizar foto. Tente novamente.");
        } finally {
          setIsLoading(false);
        }
      }
    } catch (error) {
      showAlert("Erro", "Nao foi possivel abrir a galeria de fotos.");
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!user?.id) return;
    
    setNotificationsEnabled(value);
    
    try {
      const response = await apiRequest("PUT", `/api/user/profile/${user.id}`, {
        receiveNews: value,
      });

      const data = await response.json();
      
      if (response.ok) {
        await updateUser(data.user);
      } else {
        setNotificationsEnabled(!value);
      }
    } catch (error) {
      setNotificationsEnabled(!value);
    }
  };

  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null;
    if (user.avatarUrl.startsWith("http")) return user.avatarUrl;
    return `${getApiUrl()}${user.avatarUrl}`;
  };

  const avatarUrl = getAvatarUrl();
  const initials = getInitials(user?.name || "");
  const locationDisplay = [user?.city, user?.state].filter(Boolean).join(" - ") || "-";

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
        contentContainerStyle={{
          paddingTop: headerHeight,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarSection}>
          <Pressable onPress={handlePickImage} style={styles.avatarPressable}>
            <View style={[styles.avatarContainer, { backgroundColor: theme.backgroundDefault }]}>
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.avatarImage}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.avatar, { borderColor: theme.primary }]}>
                  <ThemedText style={styles.avatarText}>{initials}</ThemedText>
                </View>
              )}
            </View>
            <View style={[styles.cameraIconContainer, { backgroundColor: theme.primary }]}>
              <Feather name="camera" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
          <ThemedText type="h3" style={styles.userName}>{user.name}</ThemedText>
          <ThemedText type="small" secondary style={styles.userEmail}>{user.email}</ThemedText>
          <View style={[styles.welcomeBadge, { backgroundColor: theme.highlight }]}>
            <ThemedText style={[styles.welcomeBadgeText, { color: theme.primary }]}>Bem-vindo ao Portal do Romeiro</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="caption" secondary style={styles.sectionTitle}>DADOS PESSOAIS</ThemedText>
            <Pressable onPress={handleOpenEditModal}>
              <View style={styles.editButton}>
                <Feather name="edit-2" size={14} color={theme.primary} />
                <ThemedText style={[styles.editButtonText, { color: theme.primary }]}>Editar</ThemedText>
              </View>
            </Pressable>
          </View>

          <View style={[styles.dataCard, { backgroundColor: theme.backgroundDefault }]}>
            <DataItem icon="user" label="Nome completo" value={user.name} />
            <DataItem icon="mail" label="E-mail" value={user.email} />
            <DataItem icon="phone" label="Celular" value={user.phone || ""} />
            <DataItem icon="map-pin" label="Cidade / Estado" value={locationDisplay} />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" secondary style={styles.sectionTitle}>PREFERENCIAS</ThemedText>

          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="heart"
              title="Meus Favoritos"
              iconColor="#EF4444"
              onPress={() => {}}
            />
            <ProfileOption
              icon="bell"
              title="Notificacoes"
              iconColor="#F59E0B"
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: "#D1D5DB", true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <ProfileOption
              icon="shield"
              title="Privacidade e Seguranca"
              iconColor="#8B5CF6"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="caption" secondary style={styles.sectionTitle}>ADMINISTRACAO</ThemedText>

          <View style={styles.optionsContainer}>
            <ProfileOption
              icon="send"
              title="Gerenciar Notificacoes"
              iconColor="#22C55E"
              onPress={() => navigation.navigate("AdminNotifications")}
            />
          </View>
        </View>

        <View style={styles.logoutSection}>
          <Pressable 
            onPress={handleLogout}
            style={[styles.logoutButton, { backgroundColor: "#FEF2F2" }]}
          >
            <Feather name="log-out" size={20} color="#EF4444" />
            <ThemedText style={styles.logoutButtonText}>Sair da conta</ThemedText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" style={styles.footerTitle}>Portal do Romeiro</ThemedText>
          <ThemedText type="caption" secondary style={styles.footerSubtitle}>
            A Capital da Fe na palma da sua mao
          </ThemedText>
          <ThemedText type="caption" secondary style={styles.footerVersion}>v1.0.0</ThemedText>
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable onPress={() => setIsEditModalVisible(false)}>
              <ThemedText style={[styles.modalHeaderButton, { color: theme.primary }]}>Cancelar</ThemedText>
            </Pressable>
            <ThemedText type="h4">Editar Perfil</ThemedText>
            <Pressable onPress={handleSaveProfile} disabled={isLoading}>
              <ThemedText style={[styles.modalHeaderButton, { color: theme.primary, opacity: isLoading ? 0.5 : 1 }]}>
                {isLoading ? "Salvando..." : "Salvar"}
              </ThemedText>
            </Pressable>
          </View>

          <KeyboardAwareScrollViewCompat
            style={{ flex: 1 }}
            contentContainerStyle={styles.modalContent}
          >
            <View style={styles.inputGroup}>
              <ThemedText type="caption" secondary style={styles.inputLabel}>Nome completo</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Seu nome"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" secondary style={styles.inputLabel}>E-mail</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="seu@email.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" secondary style={styles.inputLabel}>Celular</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" secondary style={styles.inputLabel}>Cidade</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="Sua cidade"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="caption" secondary style={styles.inputLabel}>Estado</ThemedText>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.backgroundDefault, color: theme.text, borderColor: theme.border }]}
                value={editState}
                onChangeText={setEditState}
                placeholder="GO"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="characters"
                maxLength={2}
              />
            </View>
          </KeyboardAwareScrollViewCompat>
        </View>
      </Modal>

      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  avatarPressable: {
    position: "relative",
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: Spacing.md,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userEmail: {
    marginBottom: Spacing.md,
  },
  welcomeBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  welcomeBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    letterSpacing: 1,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  dataCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  dataIconContainer: {
    marginRight: Spacing.md,
  },
  dataContent: {
    flex: 1,
  },
  dataValue: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 2,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  optionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  logoutSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#EF4444",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerTitle: {
    fontWeight: "600",
  },
  footerSubtitle: {
    marginTop: Spacing.xs,
  },
  footerVersion: {
    marginTop: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalHeaderButton: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
