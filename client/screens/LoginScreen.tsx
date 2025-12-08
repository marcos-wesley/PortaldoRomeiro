import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return response.json();
    },
    onSuccess: async (data) => {
      await login(data.user, formData.rememberMe);
    },
    onError: (error: Error) => {
      const errorMessage = error.message.includes("401")
        ? "E-mail ou senha incorretos"
        : error.message.includes("400")
        ? "Por favor, verifique os dados informados"
        : "Erro ao fazer login. Tente novamente.";
      setErrors({ general: errorMessage });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      loginMutation.mutate({
        email: formData.email.toLowerCase(),
        password: formData.password,
      });
    }
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: undefined }));
    }
  };

  const isFormValid = formData.email.includes("@") && formData.password.length > 0;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundSecondary,
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing["2xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <ThemedText type="h2" style={styles.title}>
            Entrar
          </ThemedText>
          <ThemedText type="small" secondary style={styles.subtitle}>
            Acesse sua conta no Portal do Romeiro
          </ThemedText>
        </View>

        <View style={styles.socialContainer}>
          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.socialIconContainer, { backgroundColor: "#DB4437" }]}>
              <Feather name="mail" size={18} color="#FFFFFF" />
            </View>
            <ThemedText type="small" style={styles.socialText}>
              Continuar com Google
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.socialIconContainer, { backgroundColor: "#1877F2" }]}>
              <Feather name="facebook" size={18} color="#FFFFFF" />
            </View>
            <ThemedText type="small" style={styles.socialText}>
              Continuar com Facebook
            </ThemedText>
          </Pressable>

          {Platform.OS === "ios" ? (
            <Pressable
              style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary }]}
            >
              <View style={[styles.socialIconContainer, { backgroundColor: "#000000" }]}>
                <Feather name="smartphone" size={18} color="#FFFFFF" />
              </View>
              <ThemedText type="small" style={styles.socialText}>
                Continuar com Apple
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="caption" secondary style={styles.dividerText}>
            ou entre com seu e-mail
          </ThemedText>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
        </View>

        {errors.general ? (
          <View style={[styles.errorBanner, { backgroundColor: Colors.light.error + "20" }]}>
            <Feather name="alert-circle" size={16} color={Colors.light.error} />
            <ThemedText type="small" style={{ color: Colors.light.error, marginLeft: Spacing.sm }}>
              {errors.general}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              E-mail
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={formData.email}
              onChangeText={(text) => updateField("email", text.toLowerCase())}
              placeholder="seuemail@exemplo.com"
              placeholderTextColor={theme.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? (
              <ThemedText type="caption" style={{ color: Colors.light.error }}>
                {errors.email}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Senha
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[inputStyle, styles.passwordInput]}
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
                placeholder="Digite sua senha"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Feather
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
            {errors.password ? (
              <ThemedText type="caption" style={{ color: Colors.light.error }}>
                {errors.password}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.optionsRow}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() => updateField("rememberMe", !formData.rememberMe)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: formData.rememberMe ? theme.primary : "transparent",
                    borderColor: formData.rememberMe ? theme.primary : theme.border,
                  },
                ]}
              >
                {formData.rememberMe ? (
                  <Feather name="check" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <ThemedText type="small" style={styles.checkboxLabel}>
                Lembrar-me
              </ThemedText>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("ForgotPassword" as never)}>
              <ThemedText type="link">Esqueci minha senha</ThemedText>
            </Pressable>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={!isFormValid || loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Entrar"
            )}
          </Button>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" secondary>
            Ainda nao tem conta?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.navigate("Register")}>
            <ThemedText type="link">Cadastrar-se</ThemedText>
          </Pressable>
        </View>

        <View style={styles.trustMessage}>
          <Feather name="shield" size={14} color={theme.textSecondary} />
          <ThemedText type="caption" secondary style={styles.trustText}>
            Seus dados sao protegidos e utilizados apenas para sua experiencia no Portal do Romeiro.
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
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  socialContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  socialIconContainer: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    fontWeight: "500",
    flex: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
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
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: Spacing["5xl"],
  },
  eyeButton: {
    position: "absolute",
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs - 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  checkboxLabel: {
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  trustMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  trustText: {
    flex: 1,
    textAlign: "center",
    lineHeight: 18,
  },
});
