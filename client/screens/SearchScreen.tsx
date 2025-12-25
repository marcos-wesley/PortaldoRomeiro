import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, FlatList, SectionList, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SearchResult {
  id: string;
  type: "news" | "accommodation" | "business" | "attraction" | "video";
  title: string;
  subtitle?: string;
  image?: string;
}

interface SearchResultItemProps {
  item: SearchResult;
  onPress: () => void;
}

function SearchResultItem({ item, onPress }: SearchResultItemProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getIcon = () => {
    switch (item.type) {
      case "news": return "file-text";
      case "accommodation": return "home";
      case "business": return "briefcase";
      case "attraction": return "map-pin";
      case "video": return "play-circle";
      default: return "search";
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case "news": return "Noticia";
      case "accommodation": return "Hospedagem";
      case "business": return "Empresa";
      case "attraction": return "Ponto Turistico";
      case "video": return "Video";
      default: return "";
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      style={[styles.resultItem, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.resultImage} contentFit="cover" />
      ) : (
        <View style={[styles.resultIconContainer, { backgroundColor: Colors.light.primary + "20" }]}>
          <Feather name={getIcon() as any} size={20} color={Colors.light.primary} />
        </View>
      )}
      <View style={styles.resultContent}>
        <ThemedText style={styles.resultTitle} numberOfLines={2}>{item.title}</ThemedText>
        <ThemedText style={styles.resultSubtitle} secondary numberOfLines={1}>
          {getTypeLabel()} {item.subtitle ? `- ${item.subtitle}` : ""}
        </ThemedText>
      </View>
      <Feather name="chevron-right" size={20} color={theme.textSecondary} />
    </AnimatedPressable>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const inputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const { data: newsData } = useQuery<{ news: any[] }>({ queryKey: ["/api/news"] });
  const { data: accommodationsData } = useQuery<{ accommodations: any[] }>({ queryKey: ["/api/accommodations"] });
  const { data: businessesData } = useQuery<{ businesses: any[] }>({ queryKey: ["/api/businesses"] });
  const { data: attractionsData } = useQuery<{ attractions: any[] }>({ queryKey: ["/api/attractions"] });
  const { data: videosData } = useQuery<{ videos: any[] }>({ queryKey: ["/api/videos"] });

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    newsData?.news?.forEach((item) => {
      if (item.title?.toLowerCase().includes(query) || item.summary?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: "news",
          title: item.title,
          subtitle: item.category,
          image: item.coverImage,
        });
      }
    });

    accommodationsData?.accommodations?.forEach((item) => {
      if (item.name?.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: "accommodation",
          title: item.name,
          subtitle: item.address,
          image: item.images?.[0],
        });
      }
    });

    businessesData?.businesses?.forEach((item) => {
      if (item.name?.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query) || item.category?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: "business",
          title: item.name,
          subtitle: item.category,
          image: item.logo,
        });
      }
    });

    attractionsData?.attractions?.forEach((item) => {
      if (item.name?.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: "attraction",
          title: item.name,
          subtitle: item.category,
          image: item.images?.[0],
        });
      }
    });

    videosData?.videos?.forEach((item) => {
      if (item.title?.toLowerCase().includes(query) || item.description?.toLowerCase().includes(query)) {
        results.push({
          id: item.id,
          type: "video",
          title: item.title,
          subtitle: item.category,
          image: item.thumbnail,
        });
      }
    });

    return results.slice(0, 30);
  }, [searchQuery, newsData, accommodationsData, businessesData, attractionsData, videosData]);

  const handleResultPress = useCallback((item: SearchResult) => {
    Keyboard.dismiss();
    navigation.goBack();
    setTimeout(() => {
      switch (item.type) {
        case "news":
          (navigation as any).navigate("Main", { 
            screen: "HomeTab", 
            params: { screen: "NoticiaDetail", params: { id: item.id } } 
          });
          break;
        case "accommodation":
          (navigation as any).navigate("Main", { 
            screen: "HomeTab", 
            params: { screen: "HospedagemDetail", params: { id: item.id } } 
          });
          break;
        case "business":
          (navigation as any).navigate("Main", { 
            screen: "GuiaTab", 
            params: { screen: "EmpresaDetail", params: { businessId: item.id } } 
          });
          break;
        case "attraction":
          (navigation as any).navigate("Main", { 
            screen: "MaisTab", 
            params: { screen: "Roteiros" } 
          });
          break;
        case "video":
          (navigation as any).navigate("Main", { 
            screen: "HomeTab", 
            params: { screen: "VideoDetail", params: { id: item.id } } 
          });
          break;
      }
    }, 100);
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: SearchResult }) => (
    <SearchResultItem item={item} onPress={() => handleResultPress(item)} />
  ), [handleResultPress]);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="search" size={20} color={theme.textSecondary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Buscar noticias, hospedagens, empresas..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 ? (
            <Pressable onPress={() => setSearchQuery("")} hitSlop={10}>
              <Feather name="x" size={18} color={theme.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {searchQuery.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="search" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
          <ThemedText type="h3" style={styles.emptyTitle}>
            O que voce procura?
          </ThemedText>
          <ThemedText style={styles.emptySubtitle} secondary>
            Busque por noticias, hospedagens, empresas, pontos turisticos e videos
          </ThemedText>
        </View>
      ) : searchResults.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="inbox" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
          <ThemedText type="h3" style={styles.emptyTitle}>
            Nenhum resultado
          </ThemedText>
          <ThemedText style={styles.emptySubtitle} secondary>
            Nao encontramos nada para "{searchQuery}"
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListHeaderComponent={
            <ThemedText style={styles.resultsCount} secondary>
              {searchResults.length} resultado{searchResults.length !== 1 ? "s" : ""} encontrado{searchResults.length !== 1 ? "s" : ""}
            </ThemedText>
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  resultItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
  },
  resultIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  resultSubtitle: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  emptySubtitle: {
    textAlign: "center",
    lineHeight: 20,
  },
});
