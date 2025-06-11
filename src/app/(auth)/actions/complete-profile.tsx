import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function CompleteProfile() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Complete Profile</Text>
      <Text className="text-sm text-gray-500">
        Complete your profile to get started with InMyPan
      </Text>
    </View>
  );
}
