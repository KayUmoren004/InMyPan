import ForgotPasswordEmailScreen from "@/components/auth/forgot-password-email-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function ForgotPasswordEmail() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <ForgotPasswordEmailScreen />
    </Pressable>
  );
}
