import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import GuiaStackNavigator from "@/navigation/GuiaStackNavigator";
import NoticiasStackNavigator from "@/navigation/NoticiasStackNavigator";
import MaisStackNavigator from "@/navigation/MaisStackNavigator";

export type MainTabParamList = {
  HomeTab: undefined;
  GuiaTab: undefined;
  NoticiasTab: undefined;
  MaisTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_BAR_RED = "#b22226";

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.7)",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: TAB_BAR_RED,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: TAB_BAR_RED }]} />
        ),
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="GuiaTab"
        component={GuiaStackNavigator}
        options={{
          title: "Guia",
          tabBarIcon: ({ color }) => (
            <Feather name="clipboard" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NoticiasTab"
        component={NoticiasStackNavigator}
        options={{
          title: "Noticias",
          tabBarIcon: ({ color }) => (
            <Feather name="file-text" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MaisTab"
        component={MaisStackNavigator}
        options={{
          title: "Mais",
          tabBarIcon: ({ color }) => (
            <Feather name="menu" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
