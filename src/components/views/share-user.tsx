import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { UserProfilePhoto } from "./user-profile-photo";
import { Text } from "@/components/ui/text";
import { Pencil } from "lucide-react-native";
import { Share } from "@/lib/icons/share";
import * as Sharing from "expo-sharing";

export function ShareUser() {
  const { authUser } = useEnhancedAuth();
  const { replace } = useRouter();

  const fullName = useMemo(() => {
    const given = authUser?.displayName?.givenName || "";
    const family = authUser?.displayName?.familyName || "";
    return `${given} ${family}`.trim();
  }, [authUser?.displayName?.familyName, authUser?.displayName?.givenName]);

  return (
    <Pressable
      onPress={async () => {
        const canShare = await Sharing.isAvailableAsync();

        const shareUrl = authUser?.username
          ? `https://www.share.inmypan.com/u/${authUser?.username}`
          : `https://www.inmypan.com`;

        if (canShare) {
          await Sharing.shareAsync(shareUrl, {
            dialogTitle: "Share InMyPan",
            mimeType: "text/plain",
          });
        }
      }}
    >
      <View className="flex flex-row items-center justify-between py-2 px-4 bg-muted rounded-lg">
        <View className="flex flex-row items-center justify-start gap-4">
          <UserProfilePhoto className="size-12" />
          <View className="flex flex-col">
            <View className="flex flex-row items-center justify-start 2">
              <Text className="font-bold ">Invite friends to InMyPan</Text>
            </View>
            <Text className="text-sm text-muted-foreground font-mono">
              inMyPan.com/u/{authUser?.username ?? authUser?.email}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center">
          <Share size={20} color="white" />
        </View>
      </View>
    </Pressable>
  );
}
