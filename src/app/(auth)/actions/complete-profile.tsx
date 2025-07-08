import CompleteProfileScreen from "@/components/auth/complete-profile-screen";
import { useKeyboard } from "@/lib/keyboard";
import { Pressable } from "react-native";

export default function CompleteProfile() {
  const { dismissKeyboard } = useKeyboard();

  return (
    <Pressable
      onPress={dismissKeyboard}
      className="flex-1 justify-center items-center"
    >
      <CompleteProfileScreen />
    </Pressable>
  );
}
