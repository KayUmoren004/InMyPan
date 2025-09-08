import { UserProvider } from "@/hooks/contexts/use-user";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            title: "Home",
            headerShown: false,
          }}
          redirect={true}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(modals)"
          options={{
            presentation: "fullScreenModal",
            headerShown: false,
          }}
        />
      </Stack>
    </UserProvider>
  );
}
