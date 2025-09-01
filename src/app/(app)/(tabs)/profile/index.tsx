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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

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

  const photoUrl = useMemo(() => {
    return authUser?.photoURL;
  }, [authUser?.photoURL]);

  return (
    <ScrollView
      className="flex-1 px-4"
      scrollEventThrottle={16}
      onScroll={handleScroll}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="flex-1 items-center justify-center gap-4">
        {/* Profile Image */}
        <Avatar alt="User's Avatar">
          <AvatarImage source={{ uri: photoUrl }} />
          <AvatarFallback>
            <Text>{getInitials(fullName)}</Text>
          </AvatarFallback>
        </Avatar>

        {/* Full Name */}
        <Text className="text-2xl font-medium text-center font-sans">
          {fullName}
        </Text>

        {/* Bio TODO: Implement Todo */}
        <Text className="text-sm text-muted-foreground text-center font-mono">
          Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque
          faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi
          pretium tellus duis convallis. Tempus leo eu aenean sed diam urna
          tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas.
          Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut
          hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent
          per conubia nostra inceptos himenaeos.
        </Text>
      </View>
    </ScrollView>
  );
}
