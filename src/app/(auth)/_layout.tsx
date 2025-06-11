import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up/sign-up-email" />
      <Stack.Screen name="sign-up/sign-up-password" />
      <Stack.Screen name="actions/forgot-password" />
      <Stack.Screen name="actions/verify" />
      <Stack.Screen name="actions/complete-profile" />
    </Stack>
  );
}
