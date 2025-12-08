import { ScrollView, View, StyleSheet, Pressable, Alert } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { guideCategories, prayersData, Prayer } from "@/lib/data";
import { 
  addFavorite, 
  removeFavorite, 
  isFavorite, 
  saveOfflinePrayer, 
  removeOfflinePrayer, 
  isOfflinePrayer,
  getOfflinePrayers,
  OfflinePrayer 
} from "@/lib/storage";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GuideCard({ category, onPress }: { category: typeof guideCategories[0]; onPress: () => void }) {
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
      style={[styles.guideCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={[styles.guideIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={category.icon as any} size={24} color={Colors.light.primary} />
      </View>
      <ThemedText type="h4" style={styles.guideTitle}>{category.title}</ThemedText>
      <ThemedText type="caption" secondary>{category.count} itens</ThemedText>
    </AnimatedPressable>
  );
}

function DailyPrayer() {
  const { theme } = useTheme();

  return (
    <View style={[styles.dailyPrayer, { backgroundColor: theme.backgroundDefault }]}>
      <View style={styles.dailyPrayerHeader}>
        <View style={[styles.dailyPrayerIcon, { backgroundColor: Colors.light.primary + "15" }]}>
          <Feather name="sun" size={20} color={Colors.light.primary} />
        </View>
        <ThemedText type="h4">Oracao do Dia</ThemedText>
      </View>
      <ThemedText style={styles.prayerText}>
        "Pai Eterno, eu vos adoro e vos amo. Guardai-me sob vossa protecao. Derramai sobre mim as vossas bencaos. Dai-me a graca de amar-Vos cada dia mais. Amem."
      </ThemedText>
      <View style={styles.prayerMeta}>
        <ThemedText type="caption" secondary>08 de Dezembro</ThemedText>
      </View>
    </View>
  );
}

function PrayerCard({ 
  prayer, 
  isFav, 
  isOffline, 
  onToggleFavorite, 
  onToggleOffline 
}: { 
  prayer: Prayer; 
  isFav: boolean; 
  isOffline: boolean;
  onToggleFavorite: () => void; 
  onToggleOffline: () => void;
}) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => setExpanded(!expanded)}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.prayerCard, { backgroundColor: theme.backgroundDefault }, animatedStyle]}
    >
      <View style={styles.prayerCardHeader}>
        <View style={styles.prayerCardInfo}>
          <Feather name="book" size={18} color={Colors.light.primary} />
          <ThemedText style={styles.prayerCardTitle}>{prayer.title}</ThemedText>
        </View>
        <View style={styles.prayerCardActions}>
          <Pressable onPress={onToggleOffline} hitSlop={8} style={styles.actionButton}>
            <Feather 
              name={isOffline ? "download" : "download-cloud"} 
              size={18} 
              color={isOffline ? Colors.light.success : theme.textSecondary} 
            />
          </Pressable>
          <Pressable onPress={onToggleFavorite} hitSlop={8} style={styles.actionButton}>
            <Feather 
              name={isFav ? "heart" : "heart"} 
              size={18} 
              color={isFav ? Colors.light.error : theme.textSecondary} 
            />
          </Pressable>
          <Feather 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={18} 
            color={theme.textSecondary} 
          />
        </View>
      </View>
      {expanded ? (
        <View style={styles.prayerCardContent}>
          <ThemedText style={styles.prayerCardText}>{prayer.content}</ThemedText>
          <View style={styles.categoryBadge}>
            <ThemedText type="caption" style={{ color: Colors.light.primary }}>{prayer.category}</ThemedText>
          </View>
        </View>
      ) : null}
    </AnimatedPressable>
  );
}

function OfflinePrayerCard({ prayer, onRemove }: { prayer: OfflinePrayer; onRemove: () => void }) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      style={[styles.prayerCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.prayerCardHeader}>
        <View style={styles.prayerCardInfo}>
          <Feather name="download" size={18} color={Colors.light.success} />
          <ThemedText style={styles.prayerCardTitle}>{prayer.title}</ThemedText>
        </View>
        <View style={styles.prayerCardActions}>
          <Pressable onPress={onRemove} hitSlop={8} style={styles.actionButton}>
            <Feather name="trash-2" size={18} color={Colors.light.error} />
          </Pressable>
          <Feather 
            name={expanded ? "chevron-up" : "chevron-down"} 
            size={18} 
            color={theme.textSecondary} 
          />
        </View>
      </View>
      {expanded ? (
        <View style={styles.prayerCardContent}>
          <ThemedText style={styles.prayerCardText}>{prayer.content}</ThemedText>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function GuiaScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [showPrayers, setShowPrayers] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [offlineSaved, setOfflineSaved] = useState<Record<string, boolean>>({});
  const [offlinePrayers, setOfflinePrayers] = useState<OfflinePrayer[]>([]);

  const loadStates = useCallback(async () => {
    const favStates: Record<string, boolean> = {};
    const offlineStates: Record<string, boolean> = {};
    
    for (const prayer of prayersData) {
      favStates[prayer.id] = await isFavorite(prayer.id, "prayer");
      offlineStates[prayer.id] = await isOfflinePrayer(prayer.id);
    }
    
    setFavorites(favStates);
    setOfflineSaved(offlineStates);
    
    const savedPrayers = await getOfflinePrayers();
    setOfflinePrayers(savedPrayers);
  }, []);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  const handleToggleFavorite = async (prayer: Prayer) => {
    const isFav = favorites[prayer.id];
    let success: boolean;
    if (isFav) {
      success = await removeFavorite(prayer.id, "prayer");
    } else {
      success = await addFavorite({ id: prayer.id, type: "prayer", title: prayer.title });
    }
    if (success) {
      setFavorites((prev) => ({ ...prev, [prayer.id]: !isFav }));
    }
  };

  const handleToggleOffline = async (prayer: Prayer) => {
    const isOffline = offlineSaved[prayer.id];
    let success: boolean;
    if (isOffline) {
      success = await removeOfflinePrayer(prayer.id);
      if (success) {
        Alert.alert("Removido", "Oracao removida do acesso offline.");
      }
    } else {
      success = await saveOfflinePrayer({ 
        id: prayer.id, 
        title: prayer.title, 
        content: prayer.content, 
        category: prayer.category 
      });
      if (success) {
        Alert.alert("Salvo", "Oracao salva para acesso offline.");
      }
    }
    if (success) {
      setOfflineSaved((prev) => ({ ...prev, [prayer.id]: !isOffline }));
      loadStates();
    }
  };

  const handleRemoveOfflinePrayer = async (id: string) => {
    const success = await removeOfflinePrayer(id);
    if (success) {
      setOfflineSaved((prev) => ({ ...prev, [id]: false }));
      loadStates();
    }
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
      <DailyPrayer />

      {offlinePrayers.length > 0 ? (
        <>
          <Pressable 
            style={styles.sectionHeader} 
            onPress={() => setShowOffline(!showOffline)}
          >
            <View style={styles.sectionHeaderLeft}>
              <Feather name="download" size={18} color={Colors.light.success} />
              <ThemedText type="h4" style={styles.sectionHeaderText}>Salvos Offline</ThemedText>
              <View style={styles.countBadge}>
                <ThemedText style={styles.countBadgeText}>{offlinePrayers.length}</ThemedText>
              </View>
            </View>
            <Feather 
              name={showOffline ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={theme.textSecondary} 
            />
          </Pressable>
          
          {showOffline ? (
            <View style={styles.prayersList}>
              {offlinePrayers.map((prayer) => (
                <OfflinePrayerCard 
                  key={prayer.id} 
                  prayer={prayer} 
                  onRemove={() => handleRemoveOfflinePrayer(prayer.id)} 
                />
              ))}
            </View>
          ) : null}
        </>
      ) : null}

      <Pressable 
        style={styles.sectionHeader} 
        onPress={() => setShowPrayers(!showPrayers)}
      >
        <View style={styles.sectionHeaderLeft}>
          <Feather name="book" size={18} color={Colors.light.primary} />
          <ThemedText type="h4" style={styles.sectionHeaderText}>Oracoes</ThemedText>
        </View>
        <Feather 
          name={showPrayers ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.textSecondary} 
        />
      </Pressable>

      {showPrayers ? (
        <View style={styles.prayersList}>
          {prayersData.map((prayer) => (
            <PrayerCard 
              key={prayer.id} 
              prayer={prayer} 
              isFav={favorites[prayer.id] || false}
              isOffline={offlineSaved[prayer.id] || false}
              onToggleFavorite={() => handleToggleFavorite(prayer)}
              onToggleOffline={() => handleToggleOffline(prayer)}
            />
          ))}
        </View>
      ) : null}

      <ThemedText type="h4" style={styles.sectionTitle}>Categorias</ThemedText>

      <View style={styles.categoriesGrid}>
        {guideCategories.map((category) => (
          <GuideCard key={category.id} category={category} onPress={() => {}} />
        ))}
      </View>

      <View style={[styles.tipCard, { backgroundColor: Colors.light.highlight }]}>
        <Feather name="info" size={20} color={Colors.light.primary} />
        <View style={styles.tipContent}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>Dica do Dia</ThemedText>
          <ThemedText type="caption" secondary>
            Reserve um momento de silencio antes de iniciar suas oracoes para melhor conexao espiritual.
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dailyPrayer: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  dailyPrayerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  dailyPrayerIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  prayerText: {
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  prayerMeta: {
    alignItems: "flex-end",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionHeaderText: {
    marginLeft: Spacing.sm,
  },
  countBadge: {
    backgroundColor: Colors.light.success,
    borderRadius: 10,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
  },
  prayersList: {
    marginBottom: Spacing.xl,
  },
  prayerCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  prayerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  prayerCardInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  prayerCardTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: Spacing.sm,
    flex: 1,
  },
  prayerCardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: Spacing.md,
  },
  prayerCardContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  prayerCardText: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.light.primary + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: Spacing.xl,
  },
  guideCard: {
    width: "48%",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  guideTitle: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  tipCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: "flex-start",
  },
  tipContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
});
