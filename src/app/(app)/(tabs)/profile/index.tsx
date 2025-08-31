import {
  View,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useLayoutEffect, useMemo } from "react";
import { useNavigation, useRouter } from "expo-router";
import { History } from "@/lib/icons/history";
import { Settings } from "@/lib/icons/settings";
import { UserRoundPlus } from "@/lib/icons/user-round-plus";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";

export default function ProfileScreen() {
  const { authUser } = useEnhancedAuth();
  const navigation = useNavigation();
  const { push } = useRouter();

  const fullName = useMemo(() => {
    const given = authUser?.displayName?.givenName || "";
    const family = authUser?.displayName?.familyName || "";
    return `${given} ${family}`.trim();
  }, [authUser?.displayName?.familyName, authUser?.displayName?.givenName]);

  useIsomorphicLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => push("/add-user")} className="ml-4">
          <UserRoundPlus className="size-4 text-foreground" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View className="flex-row items-center gap-4 mr-4">
          <TouchableOpacity onPress={() => push("/history")}>
            <History className="size-4 text-foreground" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => push("/settings")}>
            <Settings className="size-4 text-foreground" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, push]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y > 10) {
      navigation.setOptions({ title: fullName || "Profile" });
    } else {
      navigation.setOptions({ title: "" });
    }
  };

  return (
    <ScrollView
      className="flex-1 px-4"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="py-6">
        <Text className="text-2xl font-bold text-foreground mb-6">Profile</Text>
      </View>
    </ScrollView>
  );
}
