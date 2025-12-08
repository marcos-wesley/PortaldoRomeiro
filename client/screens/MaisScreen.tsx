import { ScrollView, View, StyleSheet, Pressable, Linking, Alert, Platform } from "react-native";
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
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { MaisStackParamList } from "@/navigation/MaisStackNavigator";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  showChevron?: boolean;
}

function MenuItem({ icon, title, subtitle, onPress, showChevron = true }: MenuItemProps) {
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
      <View style={[styles.menuIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={20} color={Colors.light.primary} />
      </View>
      <View style={styles.menuContent}>
        <ThemedText style={styles.menuTitle}>{title}</ThemedText>
        {subtitle ? <ThemedText type="caption" secondary>{subtitle}</ThemedText> : null}
      </View>
      {showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </AnimatedPressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <ThemedText type="small" secondary style={styles.sectionTitle}>{title}</ThemedText>;
}

export default function MaisScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<MaisStackParamList>>();

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      // Handle error silently
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === "web") {
      await logout();
    } else {
      Alert.alert(
        "Sair da conta",
        "Tem certeza que deseja sair?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Sair", style: "destructive", onPress: () => logout() },
        ]
      );
    }
  };

  const getFirstName = (fullName: string): string => {
    return fullName.split(" ")[0] || fullName;
  };

  const getInitials = (name: string): string => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.profileCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: Colors.light.primary }]}>
          <ThemedText style={styles.avatarText}>
            {user ? getInitials(user.name) : "?"}
          </ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h4">
            Ola, {user ? getFirstName(user.name) : "Romeiro"}!
          </ThemedText>
          <ThemedText type="caption" secondary>{user?.email}</ThemedText>
        </View>
      </View>

      <SectionTitle title="CONTEUDO" />
      <MenuItem icon="bookmark" title="Favoritos" subtitle="Suas noticias e videos salvos" onPress={() => {}} />
      <MenuItem icon="download" title="Downloads" subtitle="Conteudo disponivel offline" onPress={() => {}} />
      <MenuItem icon="clock" title="Historico" subtitle="Conteudo visualizado recentemente" onPress={() => {}} />

      <SectionTitle title="INFORMACOES" />
      <MenuItem icon="compass" title="Dicas do Romeiro" subtitle="Orientacoes para sua romaria" onPress={() => navigation.navigate("DicasRomeiro")} />
      <MenuItem icon="phone" title="Telefones Uteis" subtitle="Numeros importantes e emergencia" onPress={() => navigation.navigate("TelefonesUteis")} />
      <MenuItem icon="map" title="Como Chegar" subtitle="Localizacao e rotas" onPress={() => {}} />
      <MenuItem icon="calendar" title="Agenda" subtitle="Proximos eventos e celebracoes" onPress={() => {}} />

      <SectionTitle title="REDES SOCIAIS" />
      <MenuItem icon="instagram" title="Instagram" subtitle="@portaldoromeiro" onPress={() => handleOpenLink("https://instagram.com")} />
      <MenuItem icon="facebook" title="Facebook" subtitle="Portal do Romeiro" onPress={() => handleOpenLink("https://facebook.com")} />
      <MenuItem icon="youtube" title="YouTube" subtitle="Canal oficial" onPress={() => handleOpenLink("https://youtube.com")} />

      <SectionTitle title="CONFIGURACOES" />
      <MenuItem icon="bell" title="Notificacoes" subtitle="Gerencie seus alertas" onPress={() => {}} />
      <MenuItem icon="settings" title="Preferencias" subtitle="Tema e configuracoes" onPress={() => {}} />
      <MenuItem icon="info" title="Sobre o App" subtitle="Versao 1.0.0" onPress={() => {}} />

      <SectionTitle title="CONTA" />
      <MenuItem icon="log-out" title="Sair" subtitle="Encerrar sessao" onPress={handleLogout} />

      <View style={styles.footer}>
        <ThemedText type="caption" secondary style={styles.footerText}>
          Portal do Romeiro - Fe, Devocao e Informacao
        </ThemedText>
        <ThemedText type="caption" secondary style={styles.footerText}>
          2024 Todos os direitos reservados
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    flex: 1,
  },
  sectionTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  footer: {
    marginTop: Spacing["3xl"],
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
});
