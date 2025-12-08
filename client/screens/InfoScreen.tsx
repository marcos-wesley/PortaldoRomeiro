import { ScrollView, View, StyleSheet, Pressable, Linking, FlatList, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
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
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VibrantColors = {
  purple: "#8B5CF6",
  orange: "#F97316",
  teal: "#14B8A6",
  pink: "#EC4899",
  blue: "#3B82F6",
  green: "#22C55E",
  coral: "#F87171",
  yellow: "#EAB308",
  indigo: "#6366F1",
  cyan: "#06B6D4",
};

const offerings = [
  { id: "1", icon: "calendar", title: "Informacoes da Romaria", color: VibrantColors.orange },
  { id: "2", icon: "bell", title: "Noticias e Atualizacoes", color: VibrantColors.blue },
  { id: "3", icon: "map-pin", title: "Pontos Turisticos", color: VibrantColors.teal },
  { id: "4", icon: "info", title: "Dicas da Cidade", color: VibrantColors.pink },
  { id: "5", icon: "shopping-bag", title: "Guia Comercial", color: VibrantColors.purple },
  { id: "6", icon: "book", title: "Cultura e Historia", color: VibrantColors.coral },
];

const galleryImages = [
  { id: "1", uri: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=400" },
  { id: "2", uri: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=400" },
  { id: "3", uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
];

function OfferingCard({ icon, title, color }: { icon: string; title: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.offeringCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.offeringIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={22} color={color} />
      </View>
      <ThemedText type="caption" style={styles.offeringTitle}>{title}</ThemedText>
    </View>
  );
}

function MissionCard({ icon, title, description, color }: { icon: string; title: string; description: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.missionCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.missionIcon, { backgroundColor: color + "20" }]}>
        <Feather name={icon as any} size={24} color={color} />
      </View>
      <ThemedText type="h4" style={styles.missionTitle}>{title}</ThemedText>
      <ThemedText type="small" secondary style={styles.missionDescription}>{description}</ThemedText>
    </View>
  );
}

function SocialButton({ icon, onPress }: { icon: string; onPress: () => void }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.socialButton, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Feather name={icon as any} size={22} color={theme.textPrimary} />
    </AnimatedPressable>
  );
}

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleOpenLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {}
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroBanner, { marginTop: headerHeight }]}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(139, 92, 246, 0.85)"]}
          style={styles.heroGradient}
        >
          <ThemedText style={styles.heroTitle}>Portal do Romeiro</ThemedText>
          <ThemedText style={styles.heroSubtitle}>Fe, devocao e informacao na Capital da Fe</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: VibrantColors.orange + "20" }]}>
              <Feather name="book-open" size={18} color={VibrantColors.orange} />
            </View>
            <ThemedText type="h3">Nossa Historia</ThemedText>
          </View>
          <ThemedText type="body" secondary style={styles.paragraph}>
            O Portal do Romeiro nasceu do desejo de conectar o coracao dos fieis a Capital da Fe. Percebemos a necessidade de um guia completo que nao apenas informasse, mas acolhesse cada visitante com o carinho que Trindade oferece.
          </ThemedText>
          <ThemedText type="body" secondary style={styles.paragraph}>
            Nossa jornada comecou com um pequeno blog e hoje somos a principal referencia digital para milhoes de romeiros, unindo tradicao, cultura e tecnologia para servir a Fe.
          </ThemedText>
        </View>

        <View style={[styles.quemSomosCard, { backgroundColor: theme.backgroundDefault }]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600" }}
            style={styles.quemSomosImage}
            contentFit="cover"
          />
          <View style={styles.quemSomosContent}>
            <ThemedText type="h4">Quem Somos</ThemedText>
            <ThemedText type="small" secondary style={styles.quemSomosText}>
              Somos peregrinos servindo peregrinos. Uma equipe apaixonada por Trindade, comprometida em levar informacao confiavel e manter viva a chama da devocao.
            </ThemedText>
          </View>
        </View>

        <View style={styles.missionRow}>
          <MissionCard
            icon="compass"
            title="Nossa Missao"
            description="Orientar e guiar peregrinos com seguranca, devocao e acolhimento, proporcionando a melhor experiencia de fe."
            color={VibrantColors.blue}
          />
          <MissionCard
            icon="eye"
            title="Nossa Visao"
            description="Ser a principal fonte de informacao sobre Trindade e a Romaria, elevando a experiencia de cada visitante."
            color={VibrantColors.teal}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>O que oferecemos</ThemedText>
          <View style={styles.offeringsGrid}>
            {offerings.map((item) => (
              <OfferingCard key={item.id} icon={item.icon} title={item.title} color={item.color} />
            ))}
          </View>
        </View>

        <View style={[styles.mascotSection, { backgroundColor: VibrantColors.cyan + "15" }]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400" }}
            style={styles.mascotImage}
            contentFit="cover"
          />
          <ThemedText type="h3" style={styles.mascotTitle}>Conheca o Romeirinho</ThemedText>
          <ThemedText type="body" secondary style={styles.mascotDescription}>
            Nosso mascote oficial! Ele representa a alegria, a fe e a amizade que todo romeiro encontra em Trindade.
          </ThemedText>
          
          <View style={[styles.mascotInfoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.mascotInfoTitle}>Quem e ele?</ThemedText>
            <ThemedText type="small" secondary>
              O guia virtual mais simpatico do Brasil, sempre pronto para ajudar voce a encontrar o melhor caminho.
            </ThemedText>
          </View>
          
          <View style={[styles.mascotInfoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.mascotInfoTitle}>Sua Historia</ThemedText>
            <ThemedText type="small" secondary>
              Nasceu da necessidade de criar um simbolo que conectasse geracoes e trouxesse a tradicao da Romaria.
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>Galeria</ThemedText>
          <FlatList
            horizontal
            data={galleryImages}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.galleryList}
            renderItem={({ item }) => (
              <View style={styles.galleryImageWrapper}>
                <Image source={{ uri: item.uri }} style={styles.galleryImage} contentFit="cover" />
              </View>
            )}
          />
        </View>

        <View style={styles.ctaSection}>
          <ThemedText type="h3" style={styles.ctaTitle}>Acompanhe as novidades</ThemedText>
          <View style={styles.socialRow}>
            <SocialButton icon="instagram" onPress={() => handleOpenLink("https://instagram.com")} />
            <SocialButton icon="facebook" onPress={() => handleOpenLink("https://facebook.com")} />
            <SocialButton icon="youtube" onPress={() => handleOpenLink("https://youtube.com")} />
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText type="caption" secondary style={styles.footerText}>
            2024 Portal do Romeiro. Todos os direitos reservados.
          </ThemedText>
          <View style={styles.footerLinks}>
            <ThemedText type="caption" style={styles.footerLink}>Politica de Privacidade</ThemedText>
            <ThemedText type="caption" secondary> | </ThemedText>
            <ThemedText type="caption" style={styles.footerLink}>Termos de Uso</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroBanner: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  paragraph: {
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  quemSomosCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  quemSomosImage: {
    width: "100%",
    height: 140,
  },
  quemSomosContent: {
    padding: Spacing.lg,
  },
  quemSomosText: {
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  missionRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  missionCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  missionTitle: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  missionDescription: {
    textAlign: "center",
    lineHeight: 20,
  },
  offeringsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  offeringCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm * 2) / 3,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  offeringIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  offeringTitle: {
    textAlign: "center",
    fontSize: 11,
  },
  mascotSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  mascotImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: Spacing.lg,
  },
  mascotTitle: {
    marginBottom: Spacing.sm,
  },
  mascotDescription: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  mascotInfoCard: {
    width: "100%",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  mascotInfoTitle: {
    marginBottom: Spacing.xs,
  },
  galleryList: {
    gap: Spacing.sm,
  },
  galleryImageWrapper: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  galleryImage: {
    width: 160,
    height: 120,
  },
  ctaSection: {
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  ctaTitle: {
    marginBottom: Spacing.lg,
  },
  socialRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  footerText: {
    marginBottom: Spacing.sm,
  },
  footerLinks: {
    flexDirection: "row",
  },
  footerLink: {
    color: VibrantColors.purple,
  },
});
