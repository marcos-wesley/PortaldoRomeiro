import React from "react";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getApiUrl } from "@/lib/query-client";

interface AuthAwareHeaderProps extends NativeStackHeaderProps {
  showBackButton: boolean;
}

export function AuthAwareHeader({ showBackButton, navigation, route, options, back }: AuthAwareHeaderProps) {
  const { user } = useAuth();
  
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith("http")) return user.avatarUrl;
    return `${getApiUrl()}${user.avatarUrl}`;
  };

  return (
    <AppHeader 
      navigation={navigation}
      route={route}
      options={options}
      back={back}
      showBackButton={showBackButton} 
      userAvatar={getAvatarUrl()}
      userName={user?.name}
    />
  );
}
