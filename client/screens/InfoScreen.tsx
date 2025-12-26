import { ScrollView, View, StyleSheet, Pressable, Linking, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface InfoPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string | null;
  nossaHistoria1: string;
  nossaHistoria2: string;
  quemSomos: string;
  quemSomosImage: string | null;
}

interface AppSetting {
  key: string;
  value: string | null;
}

function getFullImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;
  try {
    const baseUrl = getApiUrl();
    return new URL(imageUrl, baseUrl).href;
  } catch {
    return imageUrl;
  }
}

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


function SocialButton({ icon, onPress, disabled }: { icon: string; onPress: () => void; disabled?: boolean }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (disabled) {
    return null;
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.socialButton, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Feather name={icon as any} size={22} color={theme.text} />
    </AnimatedPressable>
  );
}

export default function InfoScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { data: pageContent } = useQuery<{ content: InfoPageContent | null }>({
    queryKey: ["/api/static-pages/info"],
  });

  const { data: settingsData } = useQuery<{ settings: AppSetting[] }>({
    queryKey: ["/api/public/settings"],
  });

  const content = pageContent?.content;
  const heroTitle = content?.heroTitle || "Portal do Romeiro";
  const heroSubtitle = content?.heroSubtitle || "Sua fonte confiavel de fe, devocao e informacoes";
  const heroImage = content?.heroImage ? getFullImageUrl(content.heroImage) : "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200";
  const nossaHistoria1 = content?.nossaHistoria1 || "Bem-vindo ao Portal do Romeiro - sua fonte confiavel de fe, devocao e informacoes para os visitantes que exploram Trindade-GO, a capital da fe dos goianos. Neste espaco virtual, mergulhe em uma experiencia unica, onde a espiritualidade se encontra com a rica cultura e hospitalidade dessa cidade tao especial.";
  const nossaHistoria2 = content?.nossaHistoria2 || "";
  const quemSomos = content?.quemSomos || "O Portal do Romeiro e mais do que um guia online, e um elo entre os peregrinos e a mistica Capital da fe dos goianos. Nosso compromisso e oferecer informacoes abrangentes e atualizadas para turistas, peregrinos e devotos, permitindo que todos explorem a cidade com confianca.";
  const quemSomosImage = content?.quemSomosImage ? getFullImageUrl(content.quemSomosImage) : "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600";

  const getSettingValue = (key: string): string | null => {
    if (!settingsData?.settings) return null;
    const setting = settingsData.settings.find(s => s.key === key);
    return setting?.value || null;
  };

  const socialInstagram = getSettingValue('social_instagram');
  const socialFacebook = getSettingValue('social_facebook');
  const socialYoutube = getSettingValue('social_youtube');

  const hasSocialLinks = socialInstagram || socialFacebook || socialYoutube;

  const handleOpenLink = async (url: string | null) => {
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch (error) {}
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{ paddingBottom: tabBarHeight + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroBanner}>
        <Image
          source={{ uri: heroImage || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200" }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.2)", "rgba(139, 92, 246, 0.85)"]}
          style={styles.heroGradient}
        >
          <ThemedText style={styles.heroTitle}>{heroTitle}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>{heroSubtitle}</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: VibrantColors.orange + "20" }]}>
              <Feather name="book-open" size={18} color={VibrantColors.orange} />
            </View>
            <ThemedText type="h3">Um pouco sobre nos</ThemedText>
          </View>
          <ThemedText type="body" secondary style={styles.paragraph}>
            {nossaHistoria1}
          </ThemedText>
          {nossaHistoria2 ? (
            <ThemedText type="body" secondary style={styles.paragraph}>
              {nossaHistoria2}
            </ThemedText>
          ) : null}
        </View>

        <View style={[styles.quemSomosCard, { backgroundColor: theme.backgroundDefault }]}>
          <Image
            source={{ uri: quemSomosImage || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600" }}
            style={styles.quemSomosImage}
            contentFit="cover"
          />
          <View style={styles.quemSomosContent}>
            <ThemedText type="h4">Quem Somos</ThemedText>
            <ThemedText type="small" secondary style={styles.quemSomosText}>
              {quemSomos}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="h3" style={styles.sectionTitle}>Nossos Pilares</ThemedText>
          <FlatList
            horizontal
            data={[
              { id: "1", icon: "compass", title: "Nossa Missao", description: "Facilitar a jornada daqueles que buscam experiencias significativas em Trindade, proporcionando um espaco virtual onde a fe se entrelaca com a pratica turistica. Queremos ser a bussola que guia os romeiros.", color: VibrantColors.blue },
              { id: "2", icon: "eye", title: "Nossa Visao", description: "Ser o principal guia online para aqueles que exploram a capital da fe, inspirando a conexao cultural entre os visitantes e a cidade, tornando-nos um ponto de referencia para a vivencia completa.", color: VibrantColors.teal },
              { id: "3", icon: "heart", title: "Nossos Valores", description: "Fe e Respeito, Integridade, Hospitalidade, Colaboracao, Inovacao, Compromisso Social, Cultura e Historia.", color: VibrantColors.pink },
            ]}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.missionCarousel}
            renderItem={({ item }) => (
              <View style={[styles.missionCard, { backgroundColor: theme.backgroundDefault }]}>
                <View style={[styles.missionIcon, { backgroundColor: item.color + "20" }]}>
                  <Feather name={item.icon as any} size={28} color={item.color} />
                </View>
                <ThemedText type="h4" style={styles.missionTitle}>{item.title}</ThemedText>
                <ThemedText type="body" secondary style={styles.missionDescription}>{item.description}</ThemedText>
              </View>
            )}
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
            source={require("@/assets/romeirinho.jpeg")}
            style={styles.mascotImage}
            contentFit="contain"
          />
          <ThemedText type="h3" style={styles.mascotTitle}>Conheca o Romeirinho</ThemedText>
          <ThemedText type="body" secondary style={styles.mascotDescription}>
            Romeirinho e o mascote do Portal do Romeiro, inspirado na figura de um pequeno guia espiritual que nasceu da fe e devocao dos peregrinos de Trindade. Com um coracao generoso e um conhecimento profundo sobre a romaria, Romeirinho esta aqui para ajudar todos os romeiros em sua jornada ao Santuario Basilica do Divino Pai Eterno.
          </ThemedText>
          
          <View style={[styles.mascotInfoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.mascotInfoTitle}>Quem e ele?</ThemedText>
            <ThemedText type="small" secondary>
              Romeirinho simboliza orientacao, apoio e a rica tradicao da peregrinacao, tornando cada visita a Trindade uma experiencia segura, enriquecedora e inesquecivel. Ele e um guia virtual que leva adiante a missao de ajudar os peregrinos a se conectarem profundamente com a experiencia da romaria.
            </ThemedText>
          </View>
          
          <View style={[styles.mascotInfoCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText type="h4" style={styles.mascotInfoTitle}>Sua Historia</ThemedText>
            <ThemedText type="small" secondary>
              Em um vilarejo tranquilo proximo a Trindade, vivia um menino chamado Joao, que tinha uma fe inabalavel. Ele acompanhava seus pais nas romarias ao Santuario e era conhecido por todos como um pequeno guia. Um dia, encontrou uma figura de madeira que chamou de Romeirinho, acreditando que trazia sorte e protecao aos romeiros.
            </ThemedText>
          </View>
        </View>

        {hasSocialLinks ? (
          <View style={styles.ctaSection}>
            <ThemedText type="h3" style={styles.ctaTitle}>Acompanhe as novidades</ThemedText>
            <View style={styles.socialRow}>
              {socialInstagram ? (
                <SocialButton icon="instagram" onPress={() => handleOpenLink(socialInstagram)} />
              ) : null}
              {socialFacebook ? (
                <SocialButton icon="facebook" onPress={() => handleOpenLink(socialFacebook)} />
              ) : null}
              {socialYoutube ? (
                <SocialButton icon="youtube" onPress={() => handleOpenLink(socialYoutube)} />
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <ThemedText type="caption" secondary style={styles.footerText}>
            2024 Portal do Romeiro. Todos os direitos reservados.
          </ThemedText>
          <View style={styles.footerLinks}>
            <Pressable onPress={() => navigation.navigate("PrivacyPolicy")}>
              <ThemedText type="caption" style={styles.footerLink}>Politica de Privacidade</ThemedText>
            </Pressable>
            <ThemedText type="caption" secondary> | </ThemedText>
            <Pressable onPress={() => navigation.navigate("TermsOfUse")}>
              <ThemedText type="caption" style={styles.footerLink}>Termos de Uso</ThemedText>
            </Pressable>
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
  missionCarousel: {
    paddingRight: Spacing.lg,
    gap: Spacing.md,
  },
  missionCard: {
    width: SCREEN_WIDTH * 0.75,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  missionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  missionTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
    fontSize: 18,
  },
  missionDescription: {
    textAlign: "center",
    lineHeight: 24,
  },
  offeringsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: Spacing.md,
  },
  offeringCard: {
    width: "31%",
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
    width: 180,
    height: 180,
    borderRadius: BorderRadius.lg,
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
