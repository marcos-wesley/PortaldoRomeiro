import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaisScreen from "@/screens/MaisScreen";
import DicasRomeiroScreen from "@/screens/DicasRomeiroScreen";
import TelefonesUteisScreen from "@/screens/TelefonesUteisScreen";
import HistoriaScreen from "@/screens/HistoriaScreen";
import RoteirosScreen from "@/screens/RoteirosScreen";
import HospedagemScreen from "@/screens/HospedagemScreen";
import HospedagemDetailScreen from "@/screens/HospedagemDetailScreen";
import PrivacyPolicyScreen from "@/screens/PrivacyPolicyScreen";
import TermsOfUseScreen from "@/screens/TermsOfUseScreen";
import { AuthAwareHeader } from "@/components/AuthAwareHeader";
import { useTheme } from "@/hooks/useTheme";

export type MaisStackParamList = {
  Mais: undefined;
  DicasRomeiro: undefined;
  TelefonesUteis: undefined;
  Historia: undefined;
  Roteiros: undefined;
  Restaurantes: undefined;
  Hospedagem: undefined;
  HospedagemDetail: { id: string; checkIn?: string; checkOut?: string };
  HorariosOnibus: undefined;
  PrivacyPolicy: undefined;
  TermsOfUse: undefined;
};

const Stack = createNativeStackNavigator<MaisStackParamList>();

function RestaurantesPlaceholder() {
  const { theme } = useTheme();
  const { ThemedText } = require("@/components/ThemedText");
  const { View, StyleSheet } = require("react-native");
  const { Spacing } = require("@/constants/theme");
  const { useHeaderHeight } = require("@react-navigation/elements");
  const { useSafeAreaInsets } = require("react-native-safe-area-context");
  
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot, paddingTop: headerHeight, paddingHorizontal: Spacing.lg, alignItems: "center", justifyContent: "center" }}>
      <ThemedText type="h3" style={{ textAlign: "center", marginBottom: Spacing.md }}>
        Restaurantes
      </ThemedText>
      <ThemedText type="body" secondary style={{ textAlign: "center" }}>
        Em breve voce encontrara aqui uma lista dos melhores restaurantes de Trindade.
      </ThemedText>
    </View>
  );
}

function HorariosOnibusPlaceholder() {
  const { theme } = useTheme();
  const { ThemedText } = require("@/components/ThemedText");
  const { View, StyleSheet } = require("react-native");
  const { Spacing } = require("@/constants/theme");
  const { useHeaderHeight } = require("@react-navigation/elements");
  const { useSafeAreaInsets } = require("react-native-safe-area-context");
  
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot, paddingTop: headerHeight, paddingHorizontal: Spacing.lg, alignItems: "center", justifyContent: "center" }}>
      <ThemedText type="h3" style={{ textAlign: "center", marginBottom: Spacing.md }}>
        Horarios de Onibus
      </ThemedText>
      <ThemedText type="body" secondary style={{ textAlign: "center" }}>
        Em breve voce encontrara aqui os horarios de onibus para Trindade.
      </ThemedText>
    </View>
  );
}

export default function MaisStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <AuthAwareHeader {...props} showBackButton={props.navigation.canGoBack()} />,
        contentStyle: {
          backgroundColor: theme.backgroundRoot,
        },
      }}
    >
      <Stack.Screen
        name="Mais"
        component={MaisScreen}
        options={{
          header: (props) => <AuthAwareHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name="DicasRomeiro"
        component={DicasRomeiroScreen}
        options={{
          headerTitle: "Dicas do Romeiro",
        }}
      />
      <Stack.Screen
        name="TelefonesUteis"
        component={TelefonesUteisScreen}
        options={{
          headerTitle: "Telefones Uteis",
        }}
      />
      <Stack.Screen
        name="Historia"
        component={HistoriaScreen}
        options={{
          headerTitle: "Historia do Santuario",
        }}
      />
      <Stack.Screen
        name="Roteiros"
        component={RoteirosScreen}
        options={{
          headerTitle: "Pontos Turisticos",
        }}
      />
      <Stack.Screen
        name="Restaurantes"
        component={RestaurantesPlaceholder}
        options={{
          headerTitle: "Restaurantes",
        }}
      />
      <Stack.Screen
        name="Hospedagem"
        component={HospedagemScreen}
        options={{
          headerTitle: "Hospedagens",
        }}
      />
      <Stack.Screen
        name="HospedagemDetail"
        component={HospedagemDetailScreen}
        options={{
          headerTitle: "Detalhes",
        }}
      />
      <Stack.Screen
        name="HorariosOnibus"
        component={HorariosOnibusPlaceholder}
        options={{
          headerTitle: "Horarios de Onibus",
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerTitle: "Politica de Privacidade",
        }}
      />
      <Stack.Screen
        name="TermsOfUse"
        component={TermsOfUseScreen}
        options={{
          headerTitle: "Termos de Uso",
        }}
      />
    </Stack.Navigator>
  );
}
