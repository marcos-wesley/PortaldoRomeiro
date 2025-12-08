import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NoticiasScreen from "@/screens/NoticiasScreen";
import NoticiaDetailScreen from "@/screens/NoticiaDetailScreen";
import { AppHeader } from "@/components/AppHeader";
import { useTheme } from "@/hooks/useTheme";

export type NoticiasStackParamList = {
  Noticias: undefined;
  NoticiaDetail: { id: string };
};

const Stack = createNativeStackNavigator<NoticiasStackParamList>();

export default function NoticiasStackNavigator() {
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
        name="Noticias"
        component={NoticiasScreen}
        options={{
          header: (props) => <AppHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen name="NoticiaDetail" component={NoticiaDetailScreen} />
    </Stack.Navigator>
  );
}
