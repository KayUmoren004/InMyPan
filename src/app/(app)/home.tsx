import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";

export default function Home() {
  const { authUser, updateProfile, logout, linkGoogleAccount } =
    useEnhancedAuth();

  console.log("Profile", authUser);

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold">Home</Text>
    </View>
  );
}
