import { Text } from "@/components/ui/text";
import { View } from "react-native";

export default function ForgotPassword() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Forgot Password</Text>
      <Text className="text-sm text-gray-500">
        Forgot your password? No problem. We'll send you a link to reset it.
      </Text>
    </View>
  );
}
