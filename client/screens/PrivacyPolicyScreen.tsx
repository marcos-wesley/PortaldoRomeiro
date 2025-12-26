import { useState } from "react";
import { ScrollView, View, StyleSheet, ActivityIndicator, useWindowDimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import WebView from "react-native-webview";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface PrivacyPolicyData {
  titulo: string;
  conteudo: string;
  email: string;
  ultimaAtualizacao: string;
}

export default function PrivacyPolicyScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [webViewHeight, setWebViewHeight] = useState(400);

  const { data, isLoading, error } = useQuery<{ content: PrivacyPolicyData }>({
    queryKey: ["/api/static-pages/privacidade"],
  });

  const policyData = data?.content;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (error || !policyData) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
        <ThemedText type="body" secondary style={styles.errorText}>
          Nao foi possivel carregar a politica de privacidade.
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

  const isHtml = policyData.conteudo && (
    policyData.conteudo.includes("<p>") || 
    policyData.conteudo.includes("<br") || 
    policyData.conteudo.includes("<strong>") ||
    policyData.conteudo.includes("<ul>") ||
    policyData.conteudo.includes("<ol>")
  );

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: 15px;
          line-height: 1.6;
          color: ${theme.text};
          margin: 0;
          padding: 0;
          background-color: transparent;
        }
        p { margin-bottom: 12px; }
        h1 { font-size: 24px; font-weight: 700; margin: 20px 0 12px 0; }
        h2 { font-size: 20px; font-weight: 700; margin: 18px 0 10px 0; }
        h3 { font-size: 18px; font-weight: 600; margin: 16px 0 8px 0; }
        h4 { font-size: 16px; font-weight: 600; margin: 14px 0 6px 0; }
        ul, ol { margin: 12px 0; padding-left: 24px; }
        li { margin-bottom: 6px; }
        strong, b { font-weight: 700; }
        em, i { font-style: italic; }
        a { color: ${theme.primary}; text-decoration: underline; }
        .ql-size-small { font-size: 13px; }
        .ql-size-large { font-size: 18px; }
        .ql-size-huge { font-size: 24px; }
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
        .ql-align-justify { text-align: justify; }
        u { text-decoration: underline; }
        s { text-decoration: line-through; }
      </style>
    </head>
    <body>${policyData.conteudo}</body>
    </html>
  `;

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.height) {
        setWebViewHeight(data.height + 20);
      }
    } catch (e) {}
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
          {policyData.titulo || "Politica de Privacidade"}
        </ThemedText>

        {policyData.ultimaAtualizacao ? (
          <ThemedText type="caption" secondary style={styles.date}>
            Ultima atualizacao: {formatDate(policyData.ultimaAtualizacao)}
          </ThemedText>
        ) : null}

        <View style={styles.divider} />

        {isHtml ? (
          <WebView
            source={{ html: htmlContent }}
            style={{ width: width - 64, height: webViewHeight, backgroundColor: "transparent" }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={["*"]}
            onMessage={handleWebViewMessage}
            injectedJavaScript={`
              setTimeout(function() {
                const height = document.body.scrollHeight;
                window.ReactNativeWebView.postMessage(JSON.stringify({ height: height }));
              }, 100);
              true;
            `}
          />
        ) : (
          <ThemedText type="body" style={styles.content}>
            {policyData.conteudo}
          </ThemedText>
        )}

        {policyData.email ? (
          <View style={[styles.contactSection, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText type="caption" style={styles.contactTitle}>
              Contato
            </ThemedText>
            <ThemedText type="body" secondary>
              E-mail: {policyData.email}
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
