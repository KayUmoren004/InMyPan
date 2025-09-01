import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Image,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useRef, useMemo, useCallback } from "react";
import { useNavigation, useRouter } from "expo-router";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { getInitials } from "@/lib/utils";
import { Share } from "@/lib/icons/share";
import { FlashList } from "@shopify/flash-list";

// Mock meal data interface
interface MealData {
  id: string;
  title: string;
  description: string;
  imageUrls: string[];
  timestamp: string;
  likes: number;
}

// Mock meal data generator
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

export default function Profile() {
  const { authUser, logout, updateProfile } = useEnhancedAuth();
  const router = useRouter();
  const [isProfileVisible, setIsProfileVisible] = useState(true);
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Infinite scrolling state
  const [meals, setMeals] = useState<MealData[]>(() =>
    generateMockMeals(0, 20)
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load more meals for infinite scrolling
  const loadMoreMeals = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const currentCount = meals.length;
    const newMeals = generateMockMeals(currentCount, 20);

    setMeals((prevMeals) => [...prevMeals, ...newMeals]);
    setIsLoadingMore(false);

    // Stop loading more after 200 meals (for demo purposes)
    if (currentCount + newMeals.length >= 200) {
      setHasMore(false);
    }
  }, [meals.length, isLoadingMore, hasMore]);

  const fullName = useMemo(() => {
    const given = authUser?.displayName?.givenName || "";
    const family = authUser?.displayName?.familyName || "";
    return `${given} ${family}`.trim();
  }, [authUser?.displayName?.familyName, authUser?.displayName?.givenName]);

  useIsomorphicLayoutEffect(() => {
    // Initially set empty title
    navigation.setOptions({
      headerTitle: "",
    });
  }, [navigation]);

  // Update header title based on scroll position
  useIsomorphicLayoutEffect(() => {
    const shouldShowTitle = scrollOffset > 100; // Show title after scrolling 100px
    navigation.setOptions({
      headerTitle: shouldShowTitle ? (fullName ? fullName : "Profile") : "",
      headerShadowVisible: false,
    });
  }, [scrollOffset, navigation, authUser, fullName]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollOffset(offsetY);
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const photoUrl = useMemo(() => {
    return authUser?.photoURL;
  }, [authUser?.photoURL]);

  const bio =
    " Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.";

  // Render meal item for FlashList
  const renderMeal = useCallback(({ item }: { item: MealData }) => {
    return <MealCard meal={item} />;
  }, []);

  // Header component for FlashList
  const ListHeaderComponent = useCallback(
    () => (
      <View className="flex-col items-center justify-center gap-4 w-full pb-4">
        <View className="flex-1 items-center justify-center gap-4 w-full">
          {/* Profile Image */}
          <Avatar alt="User's Avatar" className="size-24">
            <AvatarImage source={{ uri: photoUrl }} />
            <AvatarFallback>
              <Text>{getInitials(fullName)}</Text>
            </AvatarFallback>
          </Avatar>

          {/* Full Name */}
          <Text className="text-2xl font-bold text-center font-sans">
            {fullName}
          </Text>

          {/* Bio */}
          <Text
            className="text-sm text-muted-foreground text-center font-mono w-3/4"
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            {bio}
          </Text>
        </View>

        {/* Share Profile */}
        <View className="w-full">
          <TouchableOpacity className="bg-muted/50 flex-row items-center gap-2 justify-center w-full rounded-md p-4">
            <Share className="text-foreground" size={20} />
            <Text className="text-foreground font-medium">Share Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Friends & Posts */}
        <View className="w-full flex-row items-center justify-center gap-16 mb-4">
          <NumberLabel number={meals.length} label="Meals" />
          <NumberLabel number={96} label="Friends" />
        </View>
      </View>
    ),
    [photoUrl, fullName, bio, meals.length]
  );

  return (
    <View className="flex-1 px-4 w-full">
      <FlashList
        data={meals}
        renderItem={renderMeal}
        estimatedItemSize={200}
        numColumns={3}
        ListHeaderComponent={ListHeaderComponent}
        onEndReached={loadMoreMeals}
        onEndReachedThreshold={0.5}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
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

const NumberLabel = ({ number, label }: { number: number; label: string }) => {
  return (
    <View className="flex-col items-center justify-center">
      <Text className="text-2xl font-medium text-center font-sans">
        {number}
      </Text>
      <Text className="text-sm text-muted-foreground text-center font-mono">
        {label}
      </Text>
    </View>
  );
};

const MealCard = ({ meal }: { meal: MealData }) => {
  return (
    <View className=" border-black bg-black rounded-lg overflow-hidden shadow-sm mx-4 my-2 h-48 w-36">
      <View className="relative">
        <Image
          source={{ uri: meal.imageUrls[0] || "/placeholder.svg" }}
          className="w-full h-full bg-gray-100"
          resizeMode="cover"
        />

        {/* Circular User/Secondary Image - positioned like BeReal */}
        {meal.imageUrls[1] && (
          <View className="absolute bottom-1 right-1">
            <View className="w-16 h-16 rounded-full border-2 border-white overflow-hidden bg-gray-100 shadow-lg">
              <Image
                source={{ uri: meal.imageUrls[1] || "/placeholder.svg" }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};
