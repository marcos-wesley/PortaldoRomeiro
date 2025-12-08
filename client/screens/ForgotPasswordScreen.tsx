import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setError("E-mail invalido");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setIsSuccess(true);
  };

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundSecondary,
      color: theme.text,
      borderColor: error ? Colors.light.error : theme.border,
    },
  ];

  if (isSuccess) {
    return (
      <ThemedView style={styles.container}>
        <View
          style={[
            styles.successContent,
            { paddingTop: headerHeight + Spacing.xl },
          ]}
        >
          <View style={[styles.successIcon, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="mail" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.successTitle}>
            E-mail enviado!
          </ThemedText>
          <ThemedText type="body" secondary style={styles.successText}>
            Se houver uma conta cadastrada com este e-mail, voce recebera as instrucoes para redefinir sua senha.
          </ThemedText>
          <View style={styles.successButton}>
            <Button onPress={() => navigation.goBack()}>
              Voltar para o login
            </Button>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: headerHeight + Spacing.xl, paddingBottom: insets.bottom + Spacing["2xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "20" }]}>
            <Feather name="lock" size={32} color={theme.primary} />
          </View>
          <ThemedText type="h2" style={styles.title}>
            Esqueceu sua senha?
          </ThemedText>
          <ThemedText type="body" secondary style={styles.subtitle}>
            Informe seu e-mail cadastrado e enviaremos as instrucoes para redefinir sua senha.
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              E-mail
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={(text) => {
                setEmail(text.toLowerCase());
                if (error) setError("");
              }}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {error ? (
              <ThemedText type="caption" style={{ color: Colors.light.error }}>
                {error}
              </ThemedText>
            ) : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={!email.includes("@") || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Enviar instrucoes"
            )}
          </Button>
        </View>

        <View style={styles.infoBox}>
          <Feather name="info" size={16} color={theme.textSecondary} />
          <ThemedText type="caption" secondary style={styles.infoText}>
            Verifique tambem sua caixa de spam caso nao encontre o e-mail na caixa de entrada.
          </ThemedText>
        </View>
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    borderWidth: 1,
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "transparent",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  successContent: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  successTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  successButton: {
    width: "100%",
  },
});
