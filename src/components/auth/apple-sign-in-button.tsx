import { useState } from "react";
import { StyleSheet } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useRouter } from "expo-router";

export const AppleSignInButton = () => {
  const [loading, setLoading] = useState(false);
  const { signInWithApple } = useEnhancedAuth();
  const { replace } = useRouter();

  const handleAppleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const result = await signInWithApple();
      if (result) {
        // Explicitly navigate to the protected route after successful sign-in
        replace("/home");
      }
    } catch (error) {
      console.error("Apple Sign-In failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
      cornerRadius={5}
      style={[styles.button, loading && styles.buttonDisabled]}
      onPress={handleAppleSignIn}
    />
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    height: 50,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
