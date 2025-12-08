import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GuiaScreen from "@/screens/GuiaScreen";
import { AppHeader } from "@/components/AppHeader";
import { useTheme } from "@/hooks/useTheme";

export type GuiaStackParamList = {
  Guia: undefined;
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
    </Stack.Navigator>
  );
}
