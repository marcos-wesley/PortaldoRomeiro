import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MaisScreen from "@/screens/MaisScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type MaisStackParamList = {
  Mais: undefined;
};

const Stack = createNativeStackNavigator<MaisStackParamList>();

export default function MaisStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Mais"
        component={MaisScreen}
        options={{
          headerTitle: () => <HeaderTitle />,
        }}
      />
    </Stack.Navigator>
  );
}
