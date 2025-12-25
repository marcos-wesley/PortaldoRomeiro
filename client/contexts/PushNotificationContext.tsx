import React, { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";

let Notifications: any = null;
let Device: any = null;

try {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
  
  if (Notifications && Platform.OS !== "web") {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (e) {
  console.log("Push notifications not available on this platform");
}

import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/query-client";

interface PushNotificationContextType {
  expoPushToken: string | null;
  notification: any | null;
  registerForPushNotifications: () => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

interface PushNotificationProviderProps {
  children: ReactNode;
  navigationRef?: React.RefObject<any>;
}

export function PushNotificationProvider({ children, navigationRef }: PushNotificationProviderProps) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const handleNotificationResponse = useCallback((response: any) => {
    const data = response?.notification?.request?.content?.data;
    
    if (data?.actionType === "navigate" && data?.actionData && navigationRef?.current) {
      try {
        const actionData = typeof data.actionData === "string" 
          ? JSON.parse(data.actionData) 
          : data.actionData;
        
        if (actionData.screen) {
          setTimeout(() => {
            navigationRef.current?.navigate(actionData.screen, actionData.params);
          }, 500);
        }
      } catch (error) {
        console.error("Error parsing notification action:", error);
      }
    }
  }, [navigationRef]);

  const registerForPushNotifications = useCallback(async () => {
    if (Platform.OS === "web" || !Notifications || !Device) {
      console.log("Push notifications not supported on this platform");
      return;
    }

    if (!Device.isDevice) {
      console.log("Must use physical device for Push Notifications");
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? (Constants as any).easConfig?.projectId;

      if (!projectId) {
        console.log("Project ID not found, cannot register for push notifications");
        return;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      setExpoPushToken(token.data);

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#b22226",
        });
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" || !Notifications) return;

    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notif: any) => {
      setNotification(notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current && Notifications) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current && Notifications) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [registerForPushNotifications, handleNotificationResponse]);

  useEffect(() => {
    if (expoPushToken && user?.id) {
      registerDeviceWithServer();
    }
  }, [expoPushToken, user?.id]);

  const registerDeviceWithServer = async () => {
    if (!expoPushToken || !Device) return;

    try {
      await apiRequest("POST", "/api/push/register", {
        userId: user?.id || null,
        pushToken: expoPushToken,
        platform: Platform.OS,
        deviceName: Device.modelName || "Unknown",
      });
    } catch (error) {
      console.error("Error registering push device:", error);
    }
  };

  return (
    <PushNotificationContext.Provider
      value={{
        expoPushToken,
        notification,
        registerForPushNotifications,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error("usePushNotifications must be used within a PushNotificationProvider");
  }
  return context;
}
