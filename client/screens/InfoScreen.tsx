import { ScrollView, View, StyleSheet, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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

const infoSections = [
  {
    id: "1",
    title: "Horarios das Missas",
    icon: "clock",
    items: [
      { label: "Segunda a Sexta", value: "06:00, 09:00, 12:00, 15:00, 18:00" },
      { label: "Sabados", value: "06:00, 09:00, 12:00, 15:00, 18:00, 20:00" },
      { label: "Domingos", value: "06:00, 08:00, 10:00, 12:00, 15:00, 18:00, 20:00" },
    ],
  },
  {
    id: "2",
    title: "Horario de Funcionamento",
    icon: "calendar",
    items: [
      { label: "Santuario", value: "05:00 as 22:00" },
      { label: "Loja de Artigos", value: "07:00 as 20:00" },
      { label: "Estacionamento", value: "24 horas" },
    ],
  },
  {
    id: "3",
    title: "Contato",
    icon: "phone",
    items: [
      { label: "Telefone", value: "(62) 3505-0020" },
      { label: "Email", value: "contato@basilicadetrindade.org.br" },
      { label: "Endereco", value: "Praca do Santuario, 1 - Centro, Trindade - GO" },
    ],
  },
];

function InfoCard({ section }: { section: typeof infoSections[0] }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.infoHeader}>
        <View style={[styles.infoIcon, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name={section.icon as any} size={20} color={Colors.light.primary} />
        </View>
        <ThemedText type="h4">{section.title}</ThemedText>
      </View>
      {section.items.map((item, index) => (
        <View
          key={index}
          style={[
            styles.infoItem,
            index < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
          ]}
        >
          <ThemedText type="small" secondary>{item.label}</ThemedText>
          <ThemedText style={styles.infoValue}>{item.value}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function QuickActionButton({ icon, title, onPress }: { icon: string; title: string; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.quickAction, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={20} color={Colors.light.primary} />
      </View>
      <ThemedText style={styles.quickActionText}>{title}</ThemedText>
    </AnimatedPressable>
  );
}

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleCall = () => {
    Linking.openURL("tel:+556235050020");
  };

  const handleMaps = () => {
    Linking.openURL("https://maps.google.com/?q=Basilica+Santuario+Divino+Pai+Eterno+Trindade");
  };

  const handleEmail = () => {
    Linking.openURL("mailto:contato@basilicadetrindade.org.br");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.quickActionsRow}>
        <QuickActionButton icon="phone" title="Ligar" onPress={handleCall} />
        <QuickActionButton icon="map-pin" title="Como Chegar" onPress={handleMaps} />
        <QuickActionButton icon="mail" title="Email" onPress={handleEmail} />
      </View>

      {infoSections.map((section) => (
        <InfoCard key={section.id} section={section} />
      ))}

      <View style={[styles.alertCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="info" size={20} color={Colors.light.primary} />
        <View style={styles.alertContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Informacao Importante</ThemedText>
          <ThemedText type="caption" secondary>
            Durante as festividades, os horarios podem sofrer alteracoes. Consulte sempre a programacao oficial.
          </ThemedText>
        </View>
      </View>

      <View style={[styles.accessibilityCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.accessibilityHeader}>
          <Feather name="users" size={20} color={Colors.light.primary} />
          <ThemedText type="h4" style={styles.accessibilityTitle}>Acessibilidade</ThemedText>
        </View>
        <View style={styles.accessibilityGrid}>
          <View style={styles.accessibilityItem}>
            <Feather name="check-circle" size={16} color={Colors.light.success} />
            <ThemedText type="small" style={styles.accessibilityText}>Cadeira de rodas</ThemedText>
          </View>
          <View style={styles.accessibilityItem}>
            <Feather name="check-circle" size={16} color={Colors.light.success} />
            <ThemedText type="small" style={styles.accessibilityText}>Banheiros adaptados</ThemedText>
          </View>
          <View style={styles.accessibilityItem}>
            <Feather name="check-circle" size={16} color={Colors.light.success} />
            <ThemedText type="small" style={styles.accessibilityText}>Rampas de acesso</ThemedText>
          </View>
          <View style={styles.accessibilityItem}>
            <Feather name="check-circle" size={16} color={Colors.light.success} />
            <ThemedText type="small" style={styles.accessibilityText}>Estacionamento PCD</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  infoItem: {
    paddingVertical: Spacing.md,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: Spacing.xs,
  },
  alertCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  alertContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  accessibilityCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  accessibilityHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  accessibilityTitle: {
    marginLeft: Spacing.md,
  },
  accessibilityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  accessibilityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: Spacing.md,
  },
  accessibilityText: {
    marginLeft: Spacing.sm,
  },
});
