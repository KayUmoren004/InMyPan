import { Text } from "@/components/ui/text";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useEffect } from "react";
import { View } from "react-native";

export default function VerifyEmail() {
  const { verifyEmail } = useEnhancedAuth();

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold">Verify</Text>
      <Text className="text-sm text-gray-500">
        Verify your email to get started with InMyPan
      </Text>
    </View>
  );
}
