import { useCallback } from "react";
import { Alert } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider, linkWithCredential } from "firebase/auth";
import { useEnhancedAuth } from "./use-enhanced-auth";
import { safeLog } from "@/lib/utils";

export const useAppleAccountLinking = () => {
  const { authUser, updateProfile } = useEnhancedAuth();

  const linkAppleAccount = useCallback(async (): Promise<boolean> => {
    if (!authUser?.firebaseUser) {
      Alert.alert("Error", "No user signed in");
      return false;
    }

    try {
      // Request Apple authentication for linking
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      if (!appleCredential.identityToken) {
        throw new Error("No identity token received");
      }

      // Create Apple credential
      const provider = new OAuthProvider("apple.com");
      const credential = provider.credential({
        idToken: appleCredential.identityToken,
      });

      // Link the credential to the current user
      await linkWithCredential(authUser.firebaseUser, credential);

      // Update user profile to reflect linked provider
      const currentProviders = authUser.provider?.split(",") || [];
      if (!currentProviders.includes("apple.com")) {
        currentProviders.push("apple.com");
        await updateProfile({
          provider: currentProviders.join(","),
        });
      }

      Alert.alert("Success", "Apple account linked successfully!");
      return true;
    } catch (error: any) {
      safeLog("error", "Apple account linking error");

      if (error.code === "ERR_REQUEST_CANCELED") {
        // User cancelled - no error needed
        return false;
      }

      let errorMessage = "Failed to link Apple account. Please try again.";

      if (error.code === "auth/credential-already-in-use") {
        errorMessage = "This Apple account is already linked to another user.";
      } else if (error.code === "auth/provider-already-linked") {
        errorMessage = "An Apple account is already linked to this user.";
      }

      Alert.alert("Linking Failed", errorMessage);
      return false;
    }
  }, [authUser, updateProfile]);

  return { linkAppleAccount };
};
