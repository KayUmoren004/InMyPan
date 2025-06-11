import SignUpPasswordScreen from "@/components/auth/sign-up-password-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function SignUpPassword() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <SignUpPasswordScreen />
    </Pressable>
  );
}
