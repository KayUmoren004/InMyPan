import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { safeLog } from "@/lib/utils";

export default function Home() {
  const { authUser, updateProfile, logout, linkGoogleAccount } =
    useEnhancedAuth();

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Home</Text>
    </View>
  );
}
