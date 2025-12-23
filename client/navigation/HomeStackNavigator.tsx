import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "@/screens/HomeScreen";
import HistoriaScreen from "@/screens/HistoriaScreen";
import TVAoVivoScreen from "@/screens/TVAoVivoScreen";
import RoteirosScreen from "@/screens/RoteirosScreen";
import InfoScreen from "@/screens/InfoScreen";
import HospedagemScreen from "@/screens/HospedagemScreen";
import HospedagemDetailScreen from "@/screens/HospedagemDetailScreen";
import ServicosScreen from "@/screens/ServicosScreen";
import VideosScreen from "@/screens/VideosScreen";
import VideoDetailScreen from "@/screens/VideoDetailScreen";
import NoticiaDetailScreen from "@/screens/NoticiaDetailScreen";
import { AuthAwareHeader } from "@/components/AuthAwareHeader";
import { useTheme } from "@/hooks/useTheme";

export type HomeStackParamList = {
  Home: undefined;
  Historia: undefined;
  TVAoVivo: undefined;
  Roteiros: undefined;
  Info: undefined;
  Hospedagem: undefined;
  HospedagemDetail: { id: string };
  Servicos: undefined;
  Videos: undefined;
  VideoDetail: { id: string };
  NoticiaDetail: { id: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
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
        name="Home"
        component={HomeScreen}
        options={{
          header: (props) => <AuthAwareHeader {...props} showBackButton={false} />,
        }}
      />
      <Stack.Screen name="Historia" component={HistoriaScreen} />
      <Stack.Screen name="TVAoVivo" component={TVAoVivoScreen} />
      <Stack.Screen name="Roteiros" component={RoteirosScreen} />
      <Stack.Screen name="Info" component={InfoScreen} />
      <Stack.Screen name="Hospedagem" component={HospedagemScreen} />
      <Stack.Screen name="HospedagemDetail" component={HospedagemDetailScreen} />
      <Stack.Screen name="Servicos" component={ServicosScreen} />
      <Stack.Screen name="Videos" component={VideosScreen} />
      <Stack.Screen name="VideoDetail" component={VideoDetailScreen} />
      <Stack.Screen name="NoticiaDetail" component={NoticiaDetailScreen} />
    </Stack.Navigator>
  );
}
