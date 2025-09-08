import { router, Stack, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Pressable } from "react-native";
import { X } from "@/lib/icons/x";
import * as Haptics from "expo-haptics";

export default function ModalLayout() {
  const { back } = useRouter();
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: true,
        headerShadowVisible: false,
        headerTitle: ({}) => (
          <Text className="text-2xl font-extrabold text-primary font-mono">
            InMyPan
          </Text>
        ),
        headerLeft: () => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <X size={20} className="text-foreground" />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen
        name="capture-modal"
        options={{ presentation: "fullScreenModal" }}
      />
      <Stack.Screen name="search" />
    </Stack>
  );
}
