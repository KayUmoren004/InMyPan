import ForgotPasswordPasswordScreen from "@/components/auth/forgot-password-password-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function ForgotPasswordPassword() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <ForgotPasswordPasswordScreen />
    </Pressable>
  );
}
