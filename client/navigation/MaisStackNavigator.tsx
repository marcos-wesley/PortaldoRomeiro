import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaisScreen from "@/screens/MaisScreen";
import DicasRomeiroScreen from "@/screens/DicasRomeiroScreen";
import { AppHeader } from "@/components/AppHeader";
import { useTheme } from "@/hooks/useTheme";

export type MaisStackParamList = {
  Mais: undefined;
  DicasRomeiro: undefined;
};

const Stack = createNativeStackNavigator<MaisStackParamList>();

export default function MaisStackNavigator() {
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
        name="Mais"
        component={MaisScreen}
        options={{
          header: (props) => <AppHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen
        name="DicasRomeiro"
        component={DicasRomeiroScreen}
        options={{
          headerTitle: "Dicas do Romeiro",
        }}
      />
    </Stack.Navigator>
  );
}
