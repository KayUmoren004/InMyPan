import { View } from "react-native";
import { Text } from "@/components/ui/text";

// This file is required by Expo Router but will never be displayed
// because we use a custom tabBarButton that navigates to the modal
export default function AddPlaceholder() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text>This should never be visible</Text>
    </View>
  );
}
