import { Stack } from "expo-router";

export default function AppLayout() {
  return (
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
        name="home"
        options={{
          title: "Home",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile - Stack",
          headerShown: true,
          headerLargeTitle: true,
        }}
      />
    </Stack>
  );
}
