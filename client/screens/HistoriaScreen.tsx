import { ScrollView, View, StyleSheet, Pressable, Dimensions, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const cityImages = [
  { id: "1", uri: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600", caption: "Santuario Basilica" },
  { id: "2", uri: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600", caption: "Vista aerea" },
  { id: "3", uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", caption: "Centro historico" },
  { id: "4", uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600", caption: "Praca central" },
];

const cityInfo = [
  { icon: "calendar", label: "Fundacao", value: "1920" },
  { icon: "trending-up", label: "Altitude", value: "761m" },
  { icon: "users", label: "Populacao", value: "129 mil" },
  { icon: "map", label: "Area", value: "719 km2" },
];

const timelineEvents = [
  {
    id: "1",
    year: "1840",
    title: "A Origem",
    description: "Tudo comecou por volta de 1840, quando o casal Constantino e Ana Rosa Xavier encontrou, as margens do Corrego Barro Preto, um medalhao de barro com a imagem da Santissima Trindade coroando a Virgem Maria.",
    image: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=600",
  },
  {
    id: "2",
    year: "1912",
    title: "Crescimento da Romaria",
    description: "Com o passar dos anos, a capela original ficou pequena para receber os fieis. A fe no Divino Pai Eterno atraia multidoes, consolidando a romaria como uma das maiores manifestacoes religiosas do Brasil.",
    image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=600",
  },
  {
    id: "3",
    year: "1943",
    title: "Chegada dos Redentoristas",
    description: "Os missionarios redentoristas assumiram a administracao do santuario, trazendo uma nova fase de organizacao e crescimento para a devocao ao Divino Pai Eterno.",
    image: null,
  },
  {
    id: "4",
    year: "2006",
    title: "Elevacao a Basilica",
    description: "O santuario recebeu o titulo de Basilica Menor concedido pelo Vaticano, reconhecendo sua importancia para a Igreja Catolica no Brasil e no mundo.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
  },
];

const curiosities = [
  {
    id: "1",
    icon: "star",
    title: "Origem do Nome",
    description: "O nome Trindade e uma homenagem direta a Santissima Trindade, cuja imagem foi encontrada no medalhao sagrado.",
  },
  {
    id: "2",
    icon: "users",
    title: "Populacao Flutuante",
    description: "Durante a Romaria, a populacao da cidade pode se multiplicar em ate 20 vezes com a chegada de milhoes de fieis.",
  },
  {
    id: "3",
    icon: "heart",
    title: "Capital da Fe",
    description: "Trindade e conhecida mundialmente como a Capital da Fe, recebendo mais de 3 milhoes de romeiros anualmente.",
  },
];

const economicSectors = [
  { icon: "briefcase", label: "Turismo Religioso" },
  { icon: "shopping-bag", label: "Comercio" },
  { icon: "home", label: "Construcao" },
  { icon: "grid", label: "Servicos" },
];

const exploreLinks = [
  { id: "1", icon: "map-pin", title: "Pontos Turisticos", screen: "Roteiros" },
  { id: "2", icon: "shopping-bag", title: "Guia Comercial", screen: "GuiaComercial" },
  { id: "3", icon: "home", title: "Hospedagens", screen: "Hospedagem" },
];

function InfoBadge({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.infoBadge, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.infoBadgeIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={16} color={Colors.light.primary} />
      </View>
      <View>
        <ThemedText type="caption" secondary>{label}</ThemedText>
        <ThemedText style={styles.infoBadgeValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function ImageMosaic() {
  const { theme } = useTheme();
  return (
    <View style={styles.mosaicContainer}>
      <View style={styles.mosaicHeader}>
        <Feather name="image" size={18} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.mosaicTitle}>Imagens da Cidade</ThemedText>
      </View>
      <FlatList
        horizontal
        data={cityImages}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mosaicList}
        renderItem={({ item }) => (
          <View style={styles.mosaicImageWrapper}>
            <Image source={{ uri: item.uri }} style={styles.mosaicImage} contentFit="cover" />
          </View>
        )}
      />
    </View>
  );
}

function TimelineSection() {
  const { theme } = useTheme();
  return (
    <View style={styles.timelineSection}>
      <View style={styles.sectionHeader}>
        <Feather name="clock" size={18} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.sectionHeaderTitle}>Trindade na Linha do Tempo</ThemedText>
      </View>
      {timelineEvents.map((event, index) => (
        <View key={event.id} style={styles.timelineItem}>
          <View style={styles.timelineLeft}>
            <View style={[styles.timelineDot, { backgroundColor: Colors.light.primary }]} />
            {index < timelineEvents.length - 1 ? (
              <View style={[styles.timelineLine, { backgroundColor: theme.border }]} />
            ) : null}
          </View>
          <View style={[styles.timelineContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.yearBadge, { color: Colors.light.primary }]}>{event.year}</ThemedText>
            <ThemedText type="h4" style={styles.eventTitle}>{event.title}</ThemedText>
            <ThemedText type="small" secondary style={styles.eventDescription}>{event.description}</ThemedText>
            {event.image ? (
              <Image source={{ uri: event.image }} style={styles.eventImage} contentFit="cover" />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function PanoramicImage() {
  return (
    <View style={styles.panoramicContainer}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" }}
        style={styles.panoramicImage}
        contentFit="cover"
      />
      <ThemedText type="caption" secondary style={styles.panoramicCaption}>
        Foto: Prefeitura de Trindade
      </ThemedText>
    </View>
  );
}

function PedraFundamentalSection() {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.sectionHeader}>
        <Feather name="award" size={18} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.sectionHeaderTitle}>Pedra Fundamental</ThemedText>
      </View>
      <ThemedText type="small" secondary style={styles.sectionText}>
        A pedra fundamental representa o marco inicial da construcao do Santuario. Um simbolo de fe e perseveranca que marca o inicio de uma das maiores devoces do Brasil, unindo milhoes de fieis em torno da Santissima Trindade.
      </ThemedText>
    </View>
  );
}

function DevelopmentSection() {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.sectionHeader}>
        <Feather name="trending-up" size={18} color={Colors.light.primary} />
        <ThemedText type="h4" style={styles.sectionHeaderTitle}>Desenvolvimento</ThemedText>
      </View>
      <ThemedText type="small" secondary style={styles.sectionText}>
        Alem do turismo religioso, Trindade se desenvolveu como polo comercial e de servicos, impulsionado pela constante chegada de visitantes e pelo crescimento da regiao metropolitana de Goiania.
      </ThemedText>
      <View style={styles.economicGrid}>
        {economicSectors.map((sector, index) => (
          <View key={index} style={[styles.economicItem, { backgroundColor: Colors.light.primary + "10" }]}>
            <Feather name={sector.icon as any} size={14} color={Colors.light.primary} />
            <ThemedText type="caption" style={styles.economicLabel}>{sector.label}</ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

function CuriositiesSection() {
  const { theme } = useTheme();
  return (
    <View style={styles.curiositiesSection}>
      <ThemedText type="h4" style={styles.curiositiesTitle}>Curiosidades</ThemedText>
      {curiosities.map((item) => (
        <View key={item.id} style={[styles.curiosityCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={[styles.curiosityIcon, { backgroundColor: Colors.light.primary + "15" }]}>
            <Feather name={item.icon as any} size={20} color={Colors.light.primary} />
          </View>
          <View style={styles.curiosityContent}>
            <ThemedText style={styles.curiosityTitle}>{item.title}</ThemedText>
            <ThemedText type="caption" secondary>{item.description}</ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
}

function SanctuaryHighlight() {
  return (
    <View style={styles.sanctuaryContainer}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800" }}
        style={styles.sanctuaryImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(65, 105, 225, 0.9)"]}
        style={styles.sanctuaryGradient}
      >
        <ThemedText style={styles.sanctuaryTitle}>Santuario Basilica</ThemedText>
        <ThemedText style={styles.sanctuaryText}>
          O coracao da devocao ao Divino Pai Eterno, onde milhoes de romeiros renovam sua fe e encontram paz espiritual.
        </ThemedText>
      </LinearGradient>
    </View>
  );
}

function TodaySection() {
  const { theme } = useTheme();
  return (
    <View style={styles.todaySection}>
      <ThemedText type="h3" style={styles.todayTitle}>Trindade Hoje</ThemedText>
      <ThemedText type="body" secondary style={styles.todayText}>
        Uma cidade que respira fe, acolhe com amor e preserva sua historia. Capital da Fe recebe romeiros de todo o Brasil oferecendo uma experiencia unica de espiritualidade.
      </ThemedText>
    </View>
  );
}

function ExploreCard({ icon, title, screen }: { icon: string; title: string; screen: string }) {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        try {
          navigation.navigate(screen);
        } catch (e) {}
      }}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.exploreCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.exploreIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={icon as any} size={24} color={Colors.light.primary} />
      </View>
      <ThemedText type="small" style={styles.exploreLabel}>{title}</ThemedText>
    </AnimatedPressable>
  );
}

function ExploreSection() {
  return (
    <View style={styles.exploreSection}>
      <ThemedText type="h4" style={styles.exploreTitle}>Explore mais</ThemedText>
      <View style={styles.exploreGrid}>
        {exploreLinks.map((link) => (
          <ExploreCard key={link.id} icon={link.icon} title={link.title} screen={link.screen} />
        ))}
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
        paddingTop: headerHeight,
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(65, 105, 225, 0.85)"]}
          style={styles.heroGradient}
        >
          <View style={styles.heroContent}>
            <Feather name="map-pin" size={20} color="#FFFFFF" />
            <ThemedText style={styles.heroTitle}>Historia de Trindade</ThemedText>
            <ThemedText style={styles.heroSubtitle}>A Capital da Fe</ThemedText>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={[styles.introCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="h4" style={styles.introTitle}>Trindade - Goias</ThemedText>
          <ThemedText type="small" secondary style={styles.introText}>
            Conhecida mundialmente como a Capital da Fe, Trindade e um dos principais destinos de turismo religioso do Brasil, lar do Santuario do Divino Pai Eterno.
          </ThemedText>
          <View style={styles.infoGrid}>
            {cityInfo.map((info, index) => (
              <InfoBadge key={index} icon={info.icon} label={info.label} value={info.value} />
            ))}
          </View>
        </View>

        <ImageMosaic />

        <TimelineSection />

        <PanoramicImage />

        <PedraFundamentalSection />

        <DevelopmentSection />

        <CuriositiesSection />

        <SanctuaryHighlight />

        <TodaySection />

        <ExploreSection />

        <View style={styles.footer}>
          <ThemedText type="caption" secondary style={styles.footerText}>
            Portal do Romeiro - A Capital da Fe
          </ThemedText>
          <View style={styles.socialIcons}>
            <Feather name="instagram" size={20} color={theme.textSecondary} style={styles.socialIcon} />
            <Feather name="facebook" size={20} color={theme.textSecondary} style={styles.socialIcon} />
            <Feather name="youtube" size={20} color={theme.textSecondary} style={styles.socialIcon} />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    height: 220,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  heroContent: {
    alignItems: "center",
    paddingBottom: Spacing["2xl"],
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  introCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  introTitle: {
    marginBottom: Spacing.sm,
  },
  introText: {
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  infoBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    width: "48%",
  },
  infoBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  infoBadgeValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  mosaicContainer: {
    marginBottom: Spacing.xl,
  },
  mosaicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  mosaicTitle: {
    marginLeft: Spacing.sm,
  },
  mosaicList: {
    gap: Spacing.sm,
  },
  mosaicImageWrapper: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  mosaicImage: {
    width: 140,
    height: 100,
  },
  timelineSection: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionHeaderTitle: {
    marginLeft: Spacing.sm,
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
    marginBottom: Spacing.md,
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
  panoramicContainer: {
    marginBottom: Spacing.xl,
  },
  panoramicImage: {
    width: "100%",
    height: 160,
    borderRadius: BorderRadius.lg,
  },
  panoramicCaption: {
    textAlign: "center",
    marginTop: Spacing.sm,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  sectionText: {
    lineHeight: 22,
  },
  economicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  economicItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  economicLabel: {
    color: Colors.light.primary,
  },
  curiositiesSection: {
    marginBottom: Spacing.xl,
  },
  curiositiesTitle: {
    marginBottom: Spacing.md,
  },
  curiosityCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  curiosityIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  curiosityContent: {
    flex: 1,
  },
  curiosityTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  sanctuaryContainer: {
    height: 180,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  sanctuaryImage: {
    ...StyleSheet.absoluteFillObject,
  },
  sanctuaryGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  sanctuaryTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  sanctuaryText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 20,
  },
  todaySection: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  todayTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  todayText: {
    textAlign: "center",
    lineHeight: 24,
  },
  exploreSection: {
    marginBottom: Spacing.xl,
  },
  exploreTitle: {
    marginBottom: Spacing.md,
  },
  exploreGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exploreCard: {
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    width: "30%",
  },
  exploreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  exploreLabel: {
    textAlign: "center",
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    marginTop: Spacing.lg,
  },
  footerText: {
    marginBottom: Spacing.md,
  },
  socialIcons: {
    flexDirection: "row",
  },
  socialIcon: {
    marginHorizontal: Spacing.md,
  },
});
