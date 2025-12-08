import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";

interface FormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  city: string;
  state: string;
  receiveNews: boolean;
  acceptedTerms: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  acceptedTerms?: string;
  general?: string;
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    state: "",
    receiveNews: false,
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/auth/register", data);
      return response.json();
    },
    onSuccess: () => {
      Alert.alert(
        "Conta criada!",
        "Sua conta foi criada com sucesso. Bem-vindo ao Portal do Romeiro!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    },
    onError: (error: Error) => {
      const errorMessage = error.message.includes("409")
        ? "Este e-mail já está cadastrado"
        : error.message.includes("400")
        ? "Por favor, verifique os dados informados"
        : "Erro ao criar conta. Tente novamente.";
      setErrors({ general: errorMessage });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = "Você deve aceitar os termos de uso";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      registerMutation.mutate(formData);
    }
  };

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  const handlePhoneChange = (text: string) => {
    updateField("phone", formatPhone(text));
  };

  const isFormValid =
    formData.name.length >= 2 &&
    formData.email.includes("@") &&
    formData.password.length >= 6 &&
    formData.password === formData.confirmPassword &&
    formData.acceptedTerms;

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
            Criar sua conta
          </ThemedText>
          <ThemedText type="small" secondary style={styles.subtitle}>
            Junte-se aos milhares de romeiros
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
              Google
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.socialButton, { backgroundColor: theme.backgroundSecondary }]}
          >
            <View style={[styles.socialIconContainer, { backgroundColor: "#1877F2" }]}>
              <Feather name="facebook" size={18} color="#FFFFFF" />
            </View>
            <ThemedText type="small" style={styles.socialText}>
              Facebook
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
                Apple
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="caption" secondary style={styles.dividerText}>
            ou cadastre com e-mail
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
              Nome completo *
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              placeholder="Seu nome"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="words"
            />
            {errors.name ? (
              <ThemedText type="caption" style={{ color: Colors.light.error }}>
                {errors.name}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              E-mail *
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
              Telefone
            </ThemedText>
            <TextInput
              style={inputStyle}
              value={formData.phone}
              onChangeText={handlePhoneChange}
              placeholder="(00) 00000-0000"
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Senha *
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[inputStyle, styles.passwordInput]}
                value={formData.password}
                onChangeText={(text) => updateField("password", text)}
                placeholder="Mínimo 6 caracteres"
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

          <View style={styles.inputGroup}>
            <ThemedText type="small" style={styles.label}>
              Confirmar senha *
            </ThemedText>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[inputStyle, styles.passwordInput]}
                value={formData.confirmPassword}
                onChangeText={(text) => updateField("confirmPassword", text)}
                placeholder="Digite a senha novamente"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Feather
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={theme.textSecondary}
                />
              </Pressable>
            </View>
            {errors.confirmPassword ? (
              <ThemedText type="caption" style={{ color: Colors.light.error }}>
                {errors.confirmPassword}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText type="small" style={styles.label}>
                Cidade
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={formData.city}
                onChangeText={(text) => updateField("city", text)}
                placeholder="Sua cidade"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <View style={{ width: Spacing.md }} />
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <ThemedText type="small" style={styles.label}>
                Estado
              </ThemedText>
              <TextInput
                style={inputStyle}
                value={formData.state}
                onChangeText={(text) => updateField("state", text.toUpperCase().slice(0, 2))}
                placeholder="UF"
                placeholderTextColor={theme.textSecondary}
                maxLength={2}
                autoCapitalize="characters"
              />
            </View>
          </View>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => updateField("receiveNews", !formData.receiveNews)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: formData.receiveNews ? theme.primary : "transparent",
                  borderColor: formData.receiveNews ? theme.primary : theme.border,
                },
              ]}
            >
              {formData.receiveNews ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <ThemedText type="small" style={styles.checkboxLabel}>
              Desejo receber novidades e atualizações
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.checkboxRow}
            onPress={() => updateField("acceptedTerms", !formData.acceptedTerms)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: formData.acceptedTerms ? theme.primary : "transparent",
                  borderColor: errors.acceptedTerms
                    ? Colors.light.error
                    : formData.acceptedTerms
                    ? theme.primary
                    : theme.border,
                },
              ]}
            >
              {formData.acceptedTerms ? (
                <Feather name="check" size={14} color="#FFFFFF" />
              ) : null}
            </View>
            <ThemedText type="small" style={styles.checkboxLabel}>
              Li e aceito os{" "}
              <ThemedText type="link">Termos de Uso</ThemedText>
              {" "}e a{" "}
              <ThemedText type="link">Política de Privacidade</ThemedText>
              {" "}*
            </ThemedText>
          </Pressable>
          {errors.acceptedTerms ? (
            <ThemedText type="caption" style={{ color: Colors.light.error, marginLeft: Spacing["3xl"] }}>
              {errors.acceptedTerms}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            onPress={handleSubmit}
            disabled={!isFormValid || registerMutation.isPending}
          >
            {registerMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              "Criar conta"
            )}
          </Button>
        </View>

        <View style={styles.footer}>
          <ThemedText type="small" secondary>
            Já tem uma conta?{" "}
          </ThemedText>
          <Pressable onPress={() => navigation.goBack()}>
            <ThemedText type="link">Entrar</ThemedText>
          </Pressable>
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
    width: 72,
    height: 72,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    textAlign: "center",
  },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
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
  rowInputs: {
    flexDirection: "row",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: BorderRadius.xs - 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  checkboxLabel: {
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    marginBottom: Spacing.xl,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
