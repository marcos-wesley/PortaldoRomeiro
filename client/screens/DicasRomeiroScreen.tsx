import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  tipCategories,
  essentialTips,
  safetyTips,
  healthTips,
  spiritualTips,
  pilgrimChecklist,
  emergencyPhones,
  TipCategory,
  Tip,
  ChecklistItem,
  EmergencyPhone,
} from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CHECKLIST_STORAGE_KEY = "@pilgrim_checklist";

interface CategoryCardProps {
  category: TipCategory;
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={styles.categoryCardWrapper}
    >
      <AnimatedPressable
        onPressIn={() => { scale.value = withSpring(0.95); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={[
          styles.categoryCard,
          { backgroundColor: category.color + "15" },
          animatedStyle,
        ]}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Feather name={category.icon as any} size={20} color="#FFFFFF" />
        </View>
        <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
        <ThemedText type="caption" secondary style={styles.categoryDesc}>
          {category.description}
        </ThemedText>
      </AnimatedPressable>
    </Animated.View>
  );
}

interface TipCardProps {
  tip: Tip;
  color: string;
}

function TipCard({ tip, color }: TipCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.tipCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.tipIcon, { backgroundColor: color + "15" }]}>
        <Feather name={tip.icon as any} size={18} color={color} />
      </View>
      <View style={styles.tipContent}>
        <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
        <ThemedText type="caption" secondary>{tip.description}</ThemedText>
      </View>
    </View>
  );
}

interface ChecklistItemRowProps {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
}

function ChecklistItemRow({ item, checked, onToggle }: ChecklistItemRowProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.checklistItem,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <View style={[styles.checklistIcon, { backgroundColor: Colors.light.primary + "15" }]}>
        <Feather name={item.icon as any} size={16} color={Colors.light.primary} />
      </View>
      <ThemedText style={[styles.checklistLabel, checked && styles.checkedLabel]}>
        {item.label}
      </ThemedText>
      <View
        style={[
          styles.checkbox,
          { borderColor: checked ? Colors.light.success : theme.border },
          checked && { backgroundColor: Colors.light.success },
        ]}
      >
        {checked ? <Feather name="check" size={14} color="#FFFFFF" /> : null}
      </View>
    </AnimatedPressable>
  );
}

interface EmergencyCardProps {
  emergency: EmergencyPhone;
  onCall: () => void;
}

function EmergencyCard({ emergency, onCall }: EmergencyCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onCall}
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.emergencyCard,
        { backgroundColor: Colors.light.error + "10" },
        animatedStyle,
      ]}
    >
      <View style={[styles.emergencyIcon, { backgroundColor: Colors.light.error }]}>
        <Feather name={emergency.icon as any} size={18} color="#FFFFFF" />
      </View>
      <View style={styles.emergencyContent}>
        <ThemedText style={styles.emergencyName}>{emergency.name}</ThemedText>
        <ThemedText type="small" style={{ color: Colors.light.error, fontWeight: "600" }}>
          {emergency.phone}
        </ThemedText>
      </View>
      <View style={[styles.callButton, { backgroundColor: Colors.light.error }]}>
        <Feather name="phone" size={16} color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
}

function SectionHeader({ title, icon, color }: { title: string; icon: string; color: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: color + "15" }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <ThemedText type="h4">{title}</ThemedText>
    </View>
  );
}

export default function DicasRomeiroScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const saved = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);
      if (saved) {
        setCheckedItems(new Set(JSON.parse(saved)));
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const toggleChecklistItem = async (id: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setCheckedItems(newSet);
    try {
      await AsyncStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify([...newSet]));
    } catch (error) {
      // Handle error silently
    }
  };

  const handleCall = async (phone: string) => {
    const phoneNumber = phone.replace(/[^\d+]/g, "");
    const url = Platform.OS === "ios" ? `telprompt:${phoneNumber}` : `tel:${phoneNumber}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const checkedCount = checkedItems.size;
  const totalItems = pilgrimChecklist.length;
  const progress = totalItems > 0 ? checkedCount / totalItems : 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: 0,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bannerContainer}>
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800" }}
          style={styles.bannerImage}
          contentFit="cover"
        />
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bannerGradient}
        />
        <View style={styles.bannerContent}>
          <ThemedText style={styles.bannerTitle}>Dicas do Romeiro</ThemedText>
          <ThemedText style={styles.bannerSubtitle}>
            Preparado para a caminhada? Confira nossas orientacoes para uma romaria segura e abençoada.
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText type="h4" style={styles.sectionTitle}>Categorias</ThemedText>
        <View style={styles.categoriesGrid}>
          {tipCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </View>

        <SectionHeader title="Dicas Essenciais" icon="star" color={Colors.light.primary} />
        <View style={styles.tipsContainer}>
          {essentialTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} color={Colors.light.primary} />
          ))}
        </View>

        <SectionHeader title="Seguranca" icon="shield" color={Colors.light.error} />
        <View style={styles.tipsContainer}>
          {safetyTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} color={Colors.light.error} />
          ))}
        </View>

        <SectionHeader title="Saude e Bem-estar" icon="heart" color={Colors.light.success} />
        <View style={styles.tipsContainer}>
          {healthTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} color={Colors.light.success} />
          ))}
        </View>

        <SectionHeader title="Espiritualidade" icon="sun" color="#8B5CF6" />
        <View style={styles.tipsContainer}>
          {spiritualTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} color="#8B5CF6" />
          ))}
        </View>

        <View style={styles.checklistSection}>
          <View style={styles.checklistHeader}>
            <View style={styles.checklistHeaderLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: Colors.light.primary + "15" }]}>
                <Feather name="check-square" size={18} color={Colors.light.primary} />
              </View>
              <ThemedText type="h4">Checklist do Romeiro</ThemedText>
            </View>
            <View style={styles.progressBadge}>
              <ThemedText type="caption" style={{ color: Colors.light.primary, fontWeight: "600" }}>
                {checkedCount}/{totalItems}
              </ThemedText>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%`, backgroundColor: Colors.light.success },
                ]}
              />
            </View>
          </View>

          <View style={styles.checklistGrid}>
            {pilgrimChecklist.map((item) => (
              <ChecklistItemRow
                key={item.id}
                item={item}
                checked={checkedItems.has(item.id)}
                onToggle={() => toggleChecklistItem(item.id)}
              />
            ))}
          </View>
        </View>

        <SectionHeader title="Telefones de Emergencia" icon="phone" color={Colors.light.error} />
        <View style={styles.emergencyContainer}>
          {emergencyPhones.map((emergency) => (
            <EmergencyCard
              key={emergency.id}
              emergency={emergency}
              onCall={() => handleCall(emergency.phone)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <View style={[styles.footerCard, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="info" size={20} color={Colors.light.primary} />
            <View style={styles.footerContent}>
              <ThemedText type="small" style={{ fontWeight: "600" }}>
                Tenha uma boa romaria!
              </ThemedText>
              <ThemedText type="caption" secondary>
                Que o Divino Pai Eterno abencoe sua caminhada e proteja voce e sua familia.
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    height: 200,
    position: "relative",
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  bannerContent: {
    position: "absolute",
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.xl,
  },
  categoryCardWrapper: {
    width: "50%",
    padding: Spacing.xs,
  },
  categoryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  categoryDesc: {
    textAlign: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  tipsContainer: {
    marginBottom: Spacing.lg,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  checklistSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  checklistHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBadge: {
    backgroundColor: Colors.light.primary + "15",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  progressContainer: {
    marginBottom: Spacing.md,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  checklistGrid: {
    gap: Spacing.sm,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  checklistIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  checklistLabel: {
    flex: 1,
    fontSize: 15,
  },
  checkedLabel: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  footerContent: {
    flex: 1,
  },
});
