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
import { servicesData, Service } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ServiceCard({ service, onPress }: { service: Service; onPress: () => void }) {
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
      style={[styles.serviceCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.serviceIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={service.icon as any} size={24} color={Colors.light.primary} />
      </View>
      <View style={styles.serviceContent}>
        <ThemedText type="h4" style={styles.serviceName}>{service.name}</ThemedText>
        <ThemedText type="small" secondary numberOfLines={2}>{service.description}</ThemedText>
        {service.phone ? (
          <View style={styles.serviceInfo}>
            <Feather name="phone" size={12} color={theme.textSecondary} />
            <ThemedText type="caption" secondary style={styles.serviceInfoText}>{service.phone}</ThemedText>
          </View>
        ) : null}
        {service.address ? (
          <View style={styles.serviceInfo}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText type="caption" secondary style={styles.serviceInfoText}>{service.address}</ThemedText>
          </View>
        ) : null}
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

function EmergencyCard() {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleEmergency = () => {
    Linking.openURL("tel:192");
  };

  return (
    <AnimatedPressable
      onPress={handleEmergency}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.emergencyCard, animatedStyle]}
    >
      <View style={styles.emergencyIcon}>
        <Feather name="alert-circle" size={24} color="#FFFFFF" />
      </View>
      <View style={styles.emergencyContent}>
        <ThemedText style={styles.emergencyTitle}>Emergencia</ThemedText>
        <ThemedText style={styles.emergencySubtitle}>SAMU - 192</ThemedText>
      </View>
      <Feather name="phone" size={20} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

export default function ServicosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleServicePress = (service: Service) => {
    if (service.phone) {
      Linking.openURL(`tel:${service.phone.replace(/\D/g, "")}`);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <EmergencyCard />

      <View style={[styles.infoCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="info" size={20} color={Colors.light.primary} />
        <View style={styles.infoContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Servicos para Romeiros</ThemedText>
          <ThemedText type="caption" secondary>
            Encontre os principais servicos disponiveis para ajudar durante sua peregrinacao.
          </ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>Servicos Disponiveis</ThemedText>

      {servicesData.map((service) => (
        <ServiceCard
          key={service.id}
          service={service}
          onPress={() => handleServicePress(service)}
        />
      ))}

      <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.tipHeader}>
          <Feather name="map-pin" size={20} color={Colors.light.primary} />
          <ThemedText type="h4" style={styles.tipTitle}>Ponto de Apoio</ThemedText>
        </View>
        <ThemedText type="small" secondary style={styles.tipText}>
          Existe um posto de atendimento ao romeiro proximo a entrada principal do santuario, funcionando 24 horas durante as festividades.
        </ThemedText>
        <View style={styles.tipDetails}>
          <View style={styles.tipDetail}>
            <Feather name="clock" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" secondary style={styles.tipDetailText}>24 horas</ThemedText>
          </View>
          <View style={styles.tipDetail}>
            <Feather name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText type="caption" secondary style={styles.tipDetailText}>Entrada principal</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  emergencyIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  emergencySubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  serviceContent: {
    flex: 1,
  },
  serviceName: {
    marginBottom: Spacing.xs,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  serviceInfoText: {
    marginLeft: Spacing.xs,
  },
  tipCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  tipHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipTitle: {
    marginLeft: Spacing.sm,
  },
  tipText: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  tipDetails: {
    flexDirection: "row",
  },
  tipDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  tipDetailText: {
    marginLeft: Spacing.xs,
  },
});
