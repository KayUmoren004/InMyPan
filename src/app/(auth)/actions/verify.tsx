import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function Verify() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Verify</Text>
      <Text className="text-sm text-gray-500">
        Verify your email to get started with InMyPan
      </Text>
    </View>
  );
}
