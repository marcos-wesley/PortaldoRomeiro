import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GuiaScreen from "@/screens/GuiaScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type GuiaStackParamList = {
  Guia: undefined;
};

const Stack = createNativeStackNavigator<GuiaStackParamList>();

export default function GuiaStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Guia"
        component={GuiaScreen}
        options={{
          headerTitle: "Guia do Romeiro",
        }}
      />
    </Stack.Navigator>
  );
}
