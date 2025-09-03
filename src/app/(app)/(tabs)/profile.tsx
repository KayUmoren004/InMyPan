import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { Button } from "@/components/ui/button";
import { useNavigation, useRouter } from "expo-router";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { Share } from "@/lib/icons/share";
import { FlashList, ListRenderItem } from "@shopify/flash-list";
import { UserProfilePhoto } from "@/components/views/user-profile-photo";

// ---------- Mock data ----------
interface MealData {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  timestamp: string;
  likes: number;
}

const generateMockMeals = (startIndex: number, count: number): MealData[] => {
  const mealNames = [
    "Spaghetti Carbonara",
    "Grilled Salmon",
    "Caesar Salad",
    "Beef Tacos",
    "Chicken Tikka Masala",
    "Mushroom Risotto",
    "Thai Green Curry",
    "BBQ Ribs",
    "Margherita Pizza",
    "Sushi Roll",
    "Fish & Chips",
    "Pad Thai",
    "Ramen Bowl",
    "Greek Salad",
    "Chicken Wings",
    "Beef Burger",
    "Vegetable Stir Fry",
    "Lasagna",
  ];

  const descriptions = [
    "Delicious homemade meal",
    "Fresh ingredients",
    "Perfect for dinner",
    "Family recipe",
    "Restaurant quality",
    "Comfort food",
    "Healthy option",
    "Weekend special",
    "Quick and easy",
    "Traditional dish",
  ];

  const imageUrls = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
    "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop",
  ];

  return Array.from({ length: count }, (_, index) => {
    const mealIndex = (startIndex + index) % mealNames.length;
    const descIndex = (startIndex + index) % descriptions.length;
    const imageIndex1 = (startIndex + index) % imageUrls.length;
    const imageIndex2 = (startIndex + index + 1) % imageUrls.length;

    return {
      id: `meal-${startIndex + index}`,
      title: mealNames[mealIndex],
      description: descriptions[descIndex],
      imageUrls: [imageUrls[imageIndex1], imageUrls[imageIndex2]],
      timestamp: `${Math.floor(Math.random() * 24)}h ago`,
      likes: Math.floor(Math.random() * 100) + 1,
    };
  });
};

// ---------- Screen ----------
export default function Profile() {
  const { authUser, logout } = useEnhancedAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const scrollViewRef = useRef<FlashList<MealData>>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [meals, setMeals] = useState<MealData[]>(() =>
    generateMockMeals(0, 20)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // === Layout constants for a stable grid ===
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const COLUMNS = 3;
  const H_PADDING = 16; // matches px-4
  const GAP = 4; // gap between cards
  const cardWidth = Math.floor(
    (screenWidth - H_PADDING * 0.5 - GAP * (COLUMNS - 1)) / COLUMNS
  );
  // Use a pleasant portrait aspect; cards remain stable before images load
  const CARD_ASPECT = 4 / 3;
  const cardHeight = Math.round(cardWidth * CARD_ASPECT);
  const V_MARGIN = 0; // we use GAP via columnWrapperStyle instead
  const ROW_HEIGHT = cardHeight + V_MARGIN * 2; // exact per-row height for FlashList

  const fullName = useMemo(() => {
    const given = authUser?.displayName?.givenName || "";
    const family = authUser?.displayName?.familyName || "";
    return `${given} ${family}`.trim() || "Profile";
  }, [authUser?.displayName?.familyName, authUser?.displayName?.givenName]);

  useIsomorphicLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "" });
  }, [navigation]);

  useIsomorphicLayoutEffect(() => {
    const shouldShowTitle = scrollOffset > 100;
    navigation.setOptions({
      headerTitle: shouldShowTitle ? fullName : "",
      headerShadowVisible: false,
    });
  }, [scrollOffset, navigation, fullName]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(event.nativeEvent.contentOffset.y);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => logout() },
    ]);
  };

  // Load more meals (infinite scroll)
  const loadMoreMeals = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    await new Promise((r) => setTimeout(r, 600));
    const currentCount = meals.length;
    const newMeals = generateMockMeals(currentCount, 20);
    setMeals((prev) => [...prev, ...newMeals]);
    setIsLoadingMore(false);
    if (currentCount + newMeals.length >= 200) setHasMore(false);
  }, [isLoadingMore, hasMore, meals.length]);

  // Stable header (no dynamic heights)
  const ListHeaderComponent = useCallback(
    () => (
      <View
        className="items-center justify-center w-full gap-4 py-4" /* stable spacing */
      >
        {/* Profile Image - ensure your UserProfilePhoto renders at a fixed size (e.g., 96–128) */}
        <UserProfilePhoto />

        {/* Full Name */}
        <Text className="text-2xl font-bold text-center font-sans">
          {fullName}
        </Text>

        {/* Bio - keep a fixed max width to prevent reflow */}
        <Text
          className="text-sm text-muted-foreground text-center font-mono"
          numberOfLines={4}
          ellipsizeMode="tail"
          style={{ maxWidth: Math.min(360, screenWidth - 32) }}
        >
          {authUser?.bio}
        </Text>

        {/* Share Profile */}
        <TouchableOpacity className="bg-muted/50 flex-row items-center gap-2 justify-center w-full rounded-md p-4">
          <Share className="text-foreground" size={20} />
          <Text className="text-foreground font-medium">Share Profile</Text>
        </TouchableOpacity>

        {/* Friends & Posts */}
        <View className="w-full flex-row items-center justify-center gap-16 mb-2">
          <NumberLabel number={meals.length} label="Meals" />
          <NumberLabel number={96} label="Friends" />
        </View>
      </View>
    ),
    [fullName, authUser?.bio, meals.length, screenWidth]
  );

  const renderMeal: ListRenderItem<MealData> = useCallback(
    ({ item }) => (
      <View className="mb-2 w-full h-full">
        <MealCard meal={item} width={cardWidth} height={cardHeight} />
      </View>
    ),
    [cardWidth, cardHeight]
  );

  return (
    <View className="flex-1">
      <FlashList
        ref={scrollViewRef}
        data={meals}
        keyExtractor={(m) => m.id}
        renderItem={renderMeal}
        numColumns={COLUMNS}
        // Tell FlashList exactly how tall each ROW is to stop initial jump
        estimatedItemSize={ROW_HEIGHT}
        overrideItemLayout={(layout, _item, _index, _maxColumns) => {
          layout.size = ROW_HEIGHT; // exact row height
          layout.span = 1;
        }}
        estimatedListSize={{ width: screenWidth, height: screenHeight }}
        ListHeaderComponent={ListHeaderComponent}
        ListHeaderComponentStyle={{
          paddingHorizontal: H_PADDING,
          paddingTop: 4,
        }}
        // columnWrapperStyle={{ gap: GAP, paddingHorizontal: H_PADDING }}
        contentContainerStyle={{
          paddingBottom: 20,
          // Do NOT set horizontal padding here and on columnWrapperStyle at the same time
        }}
        onEndReached={loadMoreMeals}
        onEndReachedThreshold={0.25}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={() =>
          isLoadingMore ? (
            <View className="py-4 items-center justify-center">
              <Text className="text-muted-foreground">
                Loading more meals...
              </Text>
            </View>
          ) : !hasMore ? (
            <View className="py-4 items-center justify-center">
              <Text className="text-muted-foreground">
                No more meals to load
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ---------- Small bits ----------
const NumberLabel = ({ number, label }: { number: number; label: string }) => (
  <View className="flex-col items-center justify-center">
    <Text className="text-2xl font-medium text-center font-sans">{number}</Text>
    <Text className="text-sm text-muted-foreground text-center font-mono">
      {label}
    </Text>
  </View>
);

const MealCard = ({
  meal,
  width,
  height,
}: {
  meal: MealData;
  width: number;
  height: number;
}) => {
  const avatarSize = Math.round(width * 0.38);

  return (
    <View
      className="rounded-xl overflow-hidden bg-black"
      style={{ width, height }}
    >
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: meal.imageUrls[0] || "/placeholder.svg" }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />

        {meal.imageUrls[1] && (
          <View
            style={{
              position: "absolute",
              bottom: 6,
              right: 6,
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
              overflow: "hidden",
              borderWidth: 2,
              borderColor: "white",
              elevation: 2,
            }}
          >
            <Image
              source={{ uri: meal.imageUrls[1] || "/placeholder.svg" }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </View>
  );
};
