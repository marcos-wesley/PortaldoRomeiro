import { ScrollView, View, StyleSheet, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { historyData, HistoryEvent } from "@/lib/data";

function TimelineEvent({ event, isLast }: { event: HistoryEvent; isLast: boolean }) {
  const { theme } = useTheme();

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: Colors.light.primary }]} />
        {!isLast ? <View style={[styles.timelineLine, { backgroundColor: theme.border }]} /> : null}
      </View>
      <View style={[styles.timelineContent, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={[styles.yearBadge, { color: Colors.light.primary }]}>{event.year}</ThemedText>
        <ThemedText type="h4" style={styles.eventTitle}>{event.title}</ThemedText>
        <ThemedText type="small" secondary style={styles.eventDescription}>{event.description}</ThemedText>
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} style={styles.eventImage} contentFit="cover" />
        ) : null}
      </View>
    </View>
  );
}

export default function HistoriaScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800" }}
        style={styles.heroBanner}
      >
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.heroGradient}
        >
          <ThemedText style={styles.heroTitle}>A Historia do Santuario</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Conheca a origem e a trajetoria da devocao ao Divino Pai Eterno
          </ThemedText>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.content}>
        <View style={[styles.introCard, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="book-open" size={24} color={Colors.light.primary} />
          <ThemedText type="body" style={styles.introText}>
            A devocao ao Divino Pai Eterno teve inicio em 1840, quando um casal de lavradores encontrou um medalhao de barro enquanto trabalhava no campo. A imagem representava a Santissima Trindade coroando a Virgem Maria.
          </ThemedText>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>Linha do Tempo</ThemedText>

        <View style={styles.timeline}>
          {historyData.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === historyData.length - 1}
            />
          ))}
        </View>

        <View style={[styles.infoCard, { backgroundColor: Colors.light.highlight }]}>
          <View style={styles.infoHeader}>
            <Feather name="info" size={20} color={Colors.light.primary} />
            <ThemedText type="h4" style={styles.infoTitle}>Voce Sabia?</ThemedText>
          </View>
          <ThemedText type="small" secondary>
            A Romaria de Trindade e considerada uma das maiores manifestacoes de fe catolica do Brasil, recebendo mais de 3 milhoes de romeiros anualmente.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    height: 200,
    width: "100%",
  },
  heroGradient: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
  },
  content: {
    padding: Spacing.lg,
  },
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  introText: {
    flex: 1,
    marginLeft: Spacing.md,
    lineHeight: 24,
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  timeline: {
    marginBottom: Spacing.xl,
  },
  timelineItem: {
    flexDirection: "row",
  },
  timelineLeft: {
    alignItems: "center",
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
  },
  timelineContent: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  yearBadge: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  eventTitle: {
    marginBottom: Spacing.xs,
  },
  eventDescription: {
    lineHeight: 20,
  },
  eventImage: {
    width: "100%",
    height: 120,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  infoCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  infoTitle: {
    marginLeft: Spacing.sm,
  },
});
