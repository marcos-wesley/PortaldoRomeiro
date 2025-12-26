import { ScrollView, View, StyleSheet, ActivityIndicator } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface TermsOfUseData {
  titulo: string;
  conteudo: string;
  email: string;
  ultimaAtualizacao: string;
}

export default function TermsOfUseScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const { data, isLoading, error } = useQuery<{ content: TermsOfUseData }>({
    queryKey: ["/api/static-pages/termos-de-uso"],
  });

  const termsData = data?.content;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !termsData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ThemedText type="body" secondary style={styles.errorText}>
          Nao foi possivel carregar os termos de uso.
        </ThemedText>
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="h2" style={styles.title}>
          {termsData.titulo || "Termos de Uso"}
        </ThemedText>

        {termsData.ultimaAtualizacao ? (
          <ThemedText type="caption" secondary style={styles.date}>
            Ultima atualizacao: {formatDate(termsData.ultimaAtualizacao)}
          </ThemedText>
        ) : null}

        <View style={styles.divider} />

        <ThemedText type="body" style={styles.content}>
          {termsData.conteudo}
        </ThemedText>

        {termsData.email ? (
          <View style={[styles.contactSection, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="caption" style={styles.contactTitle}>
              Contato
            </ThemedText>
            <ThemedText type="body" secondary>
              E-mail: {termsData.email}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    textAlign: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  date: {
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: Spacing.lg,
  },
  content: {
    lineHeight: 24,
  },
  contactSection: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  contactTitle: {
    marginBottom: Spacing.sm,
  },
});
