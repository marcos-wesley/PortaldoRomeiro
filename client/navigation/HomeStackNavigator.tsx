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
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

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
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Portal do Romeiro" />,
        }}
      />
      <Stack.Screen
        name="Historia"
        component={HistoriaScreen}
        options={{
          headerTitle: "Historia",
        }}
      />
      <Stack.Screen
        name="TVAoVivo"
        component={TVAoVivoScreen}
        options={{
          headerTitle: "TV Ao Vivo",
        }}
      />
      <Stack.Screen
        name="Roteiros"
        component={RoteirosScreen}
        options={{
          headerTitle: "Roteiros",
        }}
      />
      <Stack.Screen
        name="Info"
        component={InfoScreen}
        options={{
          headerTitle: "Informacoes",
        }}
      />
      <Stack.Screen
        name="Hospedagem"
        component={HospedagemScreen}
        options={{
          headerTitle: "Hospedagem",
        }}
      />
      <Stack.Screen
        name="HospedagemDetail"
        component={HospedagemDetailScreen}
        options={{
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="Servicos"
        component={ServicosScreen}
        options={{
          headerTitle: "Servicos",
        }}
      />
      <Stack.Screen
        name="Videos"
        component={VideosScreen}
        options={{
          headerTitle: "Videos",
        }}
      />
      <Stack.Screen
        name="VideoDetail"
        component={VideoDetailScreen}
        options={{
          headerTitle: "",
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
