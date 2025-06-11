import ForgotPasswordCheckEmailScreen from "@/components/auth/forgot-password-check-email-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function ForgotPasswordCheckEmail() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <ForgotPasswordCheckEmailScreen />
    </Pressable>
  );
}
