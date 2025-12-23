import { ScrollView, View, StyleSheet, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const userData = {
  name: "Marcos Wesley",
  email: "marcos.wesley@exemplo.com",
  phone: "(62) 9 9999-8888",
  city: "Goiania - GO",
  initials: "MW",
};

function ProfileOption({ 
  icon, 
  title, 
  onPress, 
  rightElement,
  iconColor = "#3B82F6",
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
        <ThemedText style={styles.dataValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    // Logout logic would go here
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.avatarSection}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.avatar, { borderColor: "#E0E7FF" }]}>
            <ThemedText style={styles.avatarText}>{userData.initials}</ThemedText>
          </View>
        </View>
        <ThemedText type="h3" style={styles.userName}>{userData.name}</ThemedText>
        <ThemedText type="small" secondary style={styles.userEmail}>{userData.email}</ThemedText>
        <View style={[styles.welcomeBadge, { backgroundColor: "#E0F2FE" }]}>
          <ThemedText style={styles.welcomeBadgeText}>Bem-vindo ao Portal do Romeiro</ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="caption" secondary style={styles.sectionTitle}>DADOS PESSOAIS</ThemedText>
          <Pressable>
            <View style={styles.editButton}>
              <Feather name="edit-2" size={14} color="#3B82F6" />
              <ThemedText style={styles.editButtonText}>Editar</ThemedText>
            </View>
          </Pressable>
        </View>

        <View style={[styles.dataCard, { backgroundColor: theme.backgroundDefault }]}>
          <DataItem icon="user" label="Nome completo" value={userData.name} />
          <DataItem icon="mail" label="E-mail" value={userData.email} />
          <DataItem icon="phone" label="Celular" value={userData.phone} />
          <DataItem icon="map-pin" label="Cidade / Estado" value={userData.city} />
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
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D1D5DB", true: "#3B82F6" }}
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
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
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
    color: "#3B82F6",
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
    color: "#0369A1",
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
    color: "#3B82F6",
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
});
