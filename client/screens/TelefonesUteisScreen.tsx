import { useState, useMemo } from "react";
import { ScrollView, View, StyleSheet, Pressable, Linking, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { phoneCategories, phoneContacts, PhoneContact, PhoneCategory } from "@/lib/data";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PhoneCardProps {
  contact: PhoneContact;
  category: PhoneCategory | undefined;
  onCall: (phone: string) => void;
}

function PhoneCard({ contact, category, onCall }: PhoneCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const cardColor = contact.isEmergency ? "#FEF2F2" : theme.backgroundDefault;
  const borderColor = contact.isEmergency ? "#FCA5A5" : "transparent";

  return (
    <AnimatedPressable
      onPress={() => onCall(contact.phone)}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[
        styles.phoneCard,
        { backgroundColor: cardColor, borderColor, borderWidth: contact.isEmergency ? 1 : 0 },
        animatedStyle,
      ]}
    >
      <View style={[styles.phoneIcon, { backgroundColor: (category?.color || Colors.light.primary) + "20" }]}>
        <Feather name={contact.icon as any} size={22} color={category?.color || Colors.light.primary} />
      </View>
      <View style={styles.phoneContent}>
        <ThemedText style={styles.phoneName}>{contact.name}</ThemedText>
        {contact.description ? (
          <ThemedText type="caption" secondary numberOfLines={1}>{contact.description}</ThemedText>
        ) : null}
        <ThemedText style={[styles.phoneNumber, { color: category?.color || Colors.light.primary }]}>
          {contact.phone}
        </ThemedText>
      </View>
      <View style={[styles.callButton, { backgroundColor: category?.color || Colors.light.primary }]}>
        <Feather name="phone" size={18} color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
}

interface CategoryHeaderProps {
  category: PhoneCategory;
  count: number;
}

function CategoryHeader({ category, count }: CategoryHeaderProps) {
  return (
    <View style={styles.categoryHeader}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
        <Feather name={category.icon as any} size={16} color={category.color} />
      </View>
      <ThemedText style={[styles.categoryTitle, { color: category.color }]}>{category.name}</ThemedText>
      <ThemedText type="caption" secondary>({count})</ThemedText>
    </View>
  );
}

export default function TelefonesUteisScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const handleCall = async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const phoneUrl = Platform.OS === "web" ? `tel:${cleanPhone}` : `tel:${cleanPhone}`;
    try {
      const canOpen = await Linking.canOpenURL(phoneUrl);
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return phoneContacts;
    const query = searchQuery.toLowerCase().trim();
    return phoneContacts.filter((contact) => {
      const category = phoneCategories.find((c) => c.id === contact.categoryId);
      const categoryName = category?.name.toLowerCase() || "";
      return (
        contact.name.toLowerCase().includes(query) ||
        (contact.description?.toLowerCase().includes(query)) ||
        contact.phone.includes(query) ||
        categoryName.includes(query)
      );
    });
  }, [searchQuery]);

  const emergencyContacts = useMemo(
    () => filteredContacts.filter((c) => c.isEmergency),
    [filteredContacts]
  );

  const groupedContacts = useMemo(() => {
    const groups: { [key: string]: PhoneContact[] } = {};
    filteredContacts.forEach((contact) => {
      if (!contact.isEmergency) {
        if (!groups[contact.categoryId]) {
          groups[contact.categoryId] = [];
        }
        groups[contact.categoryId].push(contact);
      }
    });
    return groups;
  }, [filteredContacts]);

  const getCategoryById = (id: string): PhoneCategory | undefined =>
    phoneCategories.find((c) => c.id === id);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{
        paddingTop: 0,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.searchContainer, { backgroundColor: theme.backgroundDefault }]}>
        <Feather name="search" size={18} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Buscar contato, categoria..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {emergencyContacts.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.emergencyHeader}>
            <Feather name="alert-circle" size={18} color="#EF4444" />
            <ThemedText style={styles.emergencyTitle}>Contatos de Emergencia</ThemedText>
          </View>
          {emergencyContacts.map((contact) => (
            <PhoneCard
              key={contact.id}
              contact={contact}
              category={getCategoryById(contact.categoryId)}
              onCall={handleCall}
            />
          ))}
        </View>
      ) : null}

      {phoneCategories.map((category) => {
        const contacts = groupedContacts[category.id];
        if (!contacts || contacts.length === 0) return null;
        return (
          <View key={category.id} style={styles.section}>
            <CategoryHeader category={category} count={contacts.length} />
            {contacts.map((contact) => (
              <PhoneCard
                key={contact.id}
                contact={contact}
                category={category}
                onCall={handleCall}
              />
            ))}
          </View>
        );
      })}

      {filteredContacts.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="phone-off" size={48} color={theme.textSecondary} />
          <ThemedText type="body" secondary style={styles.emptyText}>
            Nenhum contato encontrado
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <ThemedText type="caption" secondary style={styles.footerText}>
          Em caso de emergencia, ligue imediatamente
        </ThemedText>
        <ThemedText type="caption" secondary style={styles.footerText}>
          Portal do Romeiro - Trindade, GO
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  phoneCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  phoneIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  phoneContent: {
    flex: 1,
  },
  phoneName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  phoneNumber: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 4,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  footer: {
    marginTop: Spacing.xl,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  footerText: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
});
