import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GuiaScreen from "@/screens/GuiaScreen";
import EmpresaDetailScreen from "@/screens/EmpresaDetailScreen";
import { AppHeader } from "@/components/AppHeader";
import { useTheme } from "@/hooks/useTheme";

export type GuiaStackParamList = {
  Guia: undefined;
  EmpresaDetail: { businessId: string };
};

const Stack = createNativeStackNavigator<GuiaStackParamList>();

export default function GuiaStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        header: (props) => <AppHeader {...props} showBackButton={props.navigation.canGoBack()} />,
        contentStyle: {
          backgroundColor: theme.backgroundRoot,
        },
      }}
    >
      <Stack.Screen
        name="Guia"
        component={GuiaScreen}
        options={{
          header: (props) => <AppHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name="EmpresaDetail"
        component={EmpresaDetailScreen}
        options={{
          headerTitle: "Detalhes",
        }}
      />
    </Stack.Navigator>
  );
}
