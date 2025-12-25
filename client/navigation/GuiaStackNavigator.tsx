import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GuiaScreen from "@/screens/GuiaScreen";
import EmpresaDetailScreen from "@/screens/EmpresaDetailScreen";
import HospedagemDetailScreen from "@/screens/HospedagemDetailScreen";
import { AuthAwareHeader } from "@/components/AuthAwareHeader";
import { useTheme } from "@/hooks/useTheme";

export type GuiaStackParamList = {
  Guia: { initialCategory?: string } | undefined;
  EmpresaDetail: { businessId: string };
  HospedagemDetail: { id: string; checkIn?: string; checkOut?: string };
};

const Stack = createNativeStackNavigator<GuiaStackParamList>();

export default function GuiaStackNavigator() {
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
        name="Guia"
        component={GuiaScreen}
        options={{
          header: (props) => <AuthAwareHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name="EmpresaDetail"
        component={EmpresaDetailScreen}
        options={{
          headerTitle: "Detalhes",
        }}
      />
      <Stack.Screen
        name="HospedagemDetail"
        component={HospedagemDetailScreen}
        options={{
          headerTitle: "Hospedagem",
        }}
      />
    </Stack.Navigator>
  );
}
