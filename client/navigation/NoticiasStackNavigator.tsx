import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NoticiasScreen from "@/screens/NoticiasScreen";
import NoticiaDetailScreen from "@/screens/NoticiaDetailScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type NoticiasStackParamList = {
  Noticias: undefined;
  NoticiaDetail: { id: string };
};

const Stack = createNativeStackNavigator<NoticiasStackParamList>();

export default function NoticiasStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Noticias"
        component={NoticiasScreen}
        options={{
          headerTitle: "Noticias",
        }}
      />
      <Stack.Screen
        name="NoticiaDetail"
        component={NoticiaDetailScreen}
        options={{
          headerTitle: "",
        }}
      />
    </Stack.Navigator>
  );
}
