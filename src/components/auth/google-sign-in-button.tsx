import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useState } from "react";
import { useRouter } from "expo-router";
import { safeLog } from "@/lib/utils";
import type { User as GoogleUser } from "@react-native-google-signin/google-signin";

export default function GoogleSignInButton() {
  const { signInWithGoogle } = useEnhancedAuth();
  const [loading, setLoading] = useState(false);
  const { replace } = useRouter();

  const handleGoogleSignIn = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo?.data?.idToken) {
        const userCredential = await signInWithGoogle(
          userInfo.data.idToken,
          userInfo.data.user as unknown as GoogleUser
        );
        console.log(userCredential);

        if (userCredential) {
          replace("/home");
        }
      } else {
        safeLog("error", "no ID token present!");
        throw new Error("no ID token present!");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        safeLog("log", "Google Sign-In cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        safeLog("log", "Google Sign-In in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        safeLog("log", "Google Sign-In play services not available");
      } else {
        safeLog("error", "Google Sign-In failed");
      }
    } finally {
      setLoading(false);
    }
  };

  GoogleSignin.configure({
    // scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID || "",
  });

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={handleGoogleSignIn}
    />
  );
}
