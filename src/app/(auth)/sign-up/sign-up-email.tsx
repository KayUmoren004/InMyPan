import SignUpEmailScreen from "@/components/auth/sign-up-email-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function SignUpEmail() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <SignUpEmailScreen />
    </Pressable>
  );
}
