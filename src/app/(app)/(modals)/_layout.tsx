import { router, Stack, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Pressable } from "react-native";
import { X } from "@/lib/icons/x";

export default function ModalLayout() {
  const { back } = useRouter();
  return (
    <Stack
      screenOptions={{
        presentation: "modal",
        headerShown: true,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="capture-modal"
        options={{
          headerTitle: ({}) => (
            <Text className="text-2xl font-extrabold text-primary font-mono">
              InMyPan
            </Text>
          ),
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <X size={20} className="text-foreground" />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
