import { ScrollView, View, StyleSheet, Pressable, Dimensions, Share, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { HomeStackParamList } from "@/navigation/HomeStackNavigator";
import { newsData, News } from "@/lib/data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const VibrantColors = {
  purple: "#8B5CF6",
  orange: "#F97316",
  teal: "#14B8A6",
  pink: "#EC4899",
  blue: "#3B82F6",
  green: "#22C55E",
  yellow: "#EAB308",
};

const contentParagraphs = [
  "A tradicional Festa do Divino Pai Eterno reuniu milhares de fieis em Trindade. O evento religioso, um dos maiores do Brasil, contou com celebracoes, procissoes e momentos de fe que emocionaram os participantes.",
  "A devocao ao Divino Pai Eterno e uma das maiores expressoes de fe do povo brasileiro. Milhares de romeiros percorrem o caminho todos os anos, buscando graças e renovando sua espiritualidade.",
  "Durante a festa, diversas atividades religiosas e culturais foram realizadas, incluindo novenas, carreatas e a tradicional procissao dos carros de boi, que atrai visitantes de todas as partes do pais.",
  "O santuario oferece diversas celebracoes e momentos de oracao para os fieis, alem de estrutura de apoio para os visitantes durante todo o periodo de festividades.",
  "A organizacao do evento destacou a importancia da fe e da devocao para a comunidade, ressaltando que a festa e um momento de renovacao espiritual e encontro fraterno entre os fieis.",
  "Para os proximos anos, estao previstas melhorias na infraestrutura de atendimento aos romeiros, com novos espacos de acolhimento e servicos de apoio.",
];

const internalImages = [
  { uri: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800", caption: "Vista do Santuario durante a celebracao" },
  { uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", caption: "Fieis participam da procissao" },
];

const adData = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
    title: "Restaurante Sabor da Fe",
    description: "Comida caseira para o romeiro",
    cta: "Saiba mais",
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=600",
    title: "Pousada Bencao Divina",
    description: "Conforto para sua estadia",
    cta: "Reserve agora",
  },
];

type NoticiaDetailRouteProp = RouteProp<HomeStackParamList, "NoticiaDetail">;

function ActionButton({ icon, onPress, filled = false }: { icon: string; onPress: () => void; filled?: boolean }) {
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
      style={[styles.actionButton, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Feather name={icon as any} size={20} color={filled ? VibrantColors.orange : theme.text} />
    </AnimatedPressable>
  );
}

function AdBlock({ ad }: { ad: typeof adData[0] }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.adBlock, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.adLabel}>
        <ThemedText type="caption" secondary>Anuncio</ThemedText>
      </View>
      <View style={styles.adContent}>
        <Image source={{ uri: ad.image }} style={styles.adImage} contentFit="cover" />
        <View style={styles.adInfo}>
          <ThemedText type="body" style={styles.adTitle}>{ad.title}</ThemedText>
          <ThemedText type="small" secondary>{ad.description}</ThemedText>
          <View style={[styles.adCta, { backgroundColor: VibrantColors.blue + "15" }]}>
            <ThemedText type="small" style={{ color: VibrantColors.blue, fontWeight: "600" }}>{ad.cta}</ThemedText>
          </View>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function InternalImage({ uri, caption }: { uri: string; caption?: string }) {
  return (
    <View style={styles.internalImageContainer}>
      <Image source={{ uri }} style={styles.internalImage} contentFit="cover" />
      {caption ? (
        <ThemedText type="caption" secondary style={styles.imageCaption}>{caption}</ThemedText>
      ) : null}
    </View>
  );
}

function RelatedNewsCard({ news, onPress }: { news: News; onPress: () => void }) {
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
      style={[styles.relatedCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <Image source={{ uri: news.imageUrl }} style={styles.relatedImage} contentFit="cover" />
      <View style={styles.relatedContent}>
        <View style={[styles.relatedBadge, { backgroundColor: news.categoryColor + "20" }]}>
          <ThemedText type="caption" style={{ color: news.categoryColor, fontSize: 10 }}>{news.category}</ThemedText>
        </View>
        <ThemedText type="small" numberOfLines={2} style={styles.relatedTitle}>{news.title}</ThemedText>
        <ThemedText type="caption" secondary numberOfLines={1}>{news.content.slice(0, 50)}...</ThemedText>
      </View>
    </AnimatedPressable>
  );
}

function ShareButton({ icon, label, color }: { icon: string; label: string; color: string }) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.shareButton, { backgroundColor: color + "15" }, animatedStyle]}
    >
      <Feather name={icon as any} size={18} color={color} />
      <ThemedText type="small" style={{ color, marginLeft: Spacing.xs }}>{label}</ThemedText>
    </AnimatedPressable>
  );
}

export default function NoticiaDetailScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const route = useRoute<NoticiaDetailRouteProp>();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const [isSaved, setIsSaved] = useState(false);

  const news = newsData.find((n) => n.id === route.params.id) || newsData[0];
  const relatedNews = newsData.filter((n) => n.id !== news.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${news.title} - Portal do Romeiro`,
        title: news.title,
      });
    } catch (error) {}
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleNavigateToNews = (id: string) => {
    navigation.push("NoticiaDetail", { id });
  };

  const renderContent = () => {
    const elements: React.ReactNode[] = [];

    contentParagraphs.forEach((paragraph, index) => {
      elements.push(
        <ThemedText key={`p-${index}`} type="body" style={styles.paragraph}>
          {index === 0 ? news.content : paragraph}
        </ThemedText>
      );

      if (index === 1) {
        elements.push(<AdBlock key="ad-1" ad={adData[0]} />);
      }

      if (index === 2) {
        elements.push(<InternalImage key="img-1" uri={internalImages[0].uri} caption={internalImages[0].caption} />);
      }

      if (index === 4) {
        elements.push(<InternalImage key="img-2" uri={internalImages[1].uri} caption={internalImages[1].caption} />);
      }
    });

    return elements;
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + Spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: news.imageUrl }}
          style={styles.heroImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.8)"]}
          style={styles.heroGradient}
        >
          <View style={[styles.categoryBadge, { backgroundColor: news.categoryColor }]}>
            <ThemedText style={styles.categoryBadgeText}>{news.category}</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>{news.title}</ThemedText>
          <ThemedText style={styles.heroSubtitle}>Uma historia de fe e devocao na Capital da Fe</ThemedText>
        </LinearGradient>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaInfo}>
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: VibrantColors.purple + "20" }]}>
              <Feather name="user" size={14} color={VibrantColors.purple} />
            </View>
            <View>
              <ThemedText type="small" style={styles.authorName}>Redacao Portal</ThemedText>
              <ThemedText type="caption" secondary>{news.date}</ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.actions}>
          <ActionButton icon="share-2" onPress={handleShare} />
          <ActionButton icon={isSaved ? "bookmark" : "bookmark"} onPress={handleSave} filled={isSaved} />
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}

        <AdBlock ad={adData[1]} />
      </View>

      <View style={styles.relatedSection}>
        <View style={styles.sectionHeader}>
          <ThemedText type="h3">Ultimas Noticias</ThemedText>
          <Pressable>
            <ThemedText type="small" style={{ color: VibrantColors.blue }}>Ver todas</ThemedText>
          </Pressable>
        </View>
        <FlatList
          horizontal
          data={relatedNews}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.relatedList}
          renderItem={({ item }) => (
            <RelatedNewsCard news={item} onPress={() => handleNavigateToNews(item.id)} />
          )}
        />
      </View>

      <View style={styles.footer}>
        <ThemedText type="h4" style={styles.footerTitle}>Compartilhar noticia</ThemedText>
        <View style={styles.shareRow}>
          <ShareButton icon="send" label="WhatsApp" color="#25D366" />
          <ShareButton icon="facebook" label="Facebook" color="#1877F2" />
          <ShareButton icon="twitter" label="Twitter" color="#1DA1F2" />
        </View>

        <Pressable style={[styles.allNewsButton, { backgroundColor: VibrantColors.blue }]}>
          <Feather name="grid" size={18} color="#FFFFFF" />
          <ThemedText style={styles.allNewsButtonText}>Ver todas as noticias</ThemedText>
        </Pressable>

        <View style={[styles.footerAd, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText type="caption" secondary style={styles.footerAdLabel}>Espaco publicitario</ThemedText>
          <View style={styles.footerAdContent}>
            <Feather name="image" size={32} color={theme.textSecondary} />
            <ThemedText type="small" secondary style={{ marginTop: Spacing.sm }}>Anuncie aqui</ThemedText>
          </View>
        </View>

        <ThemedText type="caption" secondary style={styles.copyright}>
          Portal do Romeiro - Todos os direitos reservados
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    height: 320,
    width: "100%",
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: Spacing.lg,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  categoryBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  metaInfo: {
    flex: 1,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  authorName: {
    fontWeight: "600",
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  paragraph: {
    lineHeight: 26,
    marginBottom: Spacing.lg,
    textAlign: "justify",
  },
  adBlock: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginVertical: Spacing.lg,
  },
  adLabel: {
    padding: Spacing.sm,
    paddingBottom: 0,
  },
  adContent: {
    flexDirection: "row",
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
  },
  adInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: "center",
  },
  adTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  adCta: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.sm,
  },
  internalImageContainer: {
    marginVertical: Spacing.lg,
  },
  internalImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  imageCaption: {
    marginTop: Spacing.xs,
    textAlign: "center",
    fontStyle: "italic",
  },
  relatedSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  relatedList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  relatedCard: {
    width: 200,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  relatedImage: {
    width: "100%",
    height: 110,
  },
  relatedContent: {
    padding: Spacing.md,
  },
  relatedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },
  relatedTitle: {
    fontWeight: "600",
    marginBottom: 4,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  footerTitle: {
    marginBottom: Spacing.md,
  },
  shareRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  allNewsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  allNewsButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  footerAd: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  footerAdLabel: {
    marginBottom: Spacing.md,
  },
  footerAdContent: {
    alignItems: "center",
  },
  copyright: {
    textAlign: "center",
  },
});
