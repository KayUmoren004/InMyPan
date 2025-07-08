import LoginScreen from "@/components/auth/login-screen";
import { Text } from "@/components/ui/text";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable, View } from "react-native";

export default function SignIn() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <LoginScreen />
    </Pressable>
  );
}
