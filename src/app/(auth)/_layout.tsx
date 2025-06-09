import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User } from "firebase/auth";

import { Redirect, Stack, useRouter, usePathname } from "expo-router";
import { useAuth } from "@/hooks/contexts/firebase/use-auth";
import { useKeyboard } from "@/lib/keyboard";
import { useEffect, useState, useRef } from "react";
import { useFirestore } from "@/hooks/contexts/firebase/use-firestore";
import { defaultUserProfile, useUser } from "@/hooks/contexts/user/use-user";

const AuthLayout = () => {
  const { profile, loading } = useUser();
  const pathname = usePathname();

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  console.log("Profile @AuthLayout", profile);

  return profile?.isLoggedIn === null ? (
    <FetchUser />
  ) : profile?.isLoggedIn ? (
    <Redirect href="/(protected)" />
  ) : (
    <Redirect href="/login" />
  );
};

export default AuthLayout;

const FetchUser = () => {
  const { replace } = useRouter();
  const { getCurrentUser, checkAuth } = useAuth();
  const { getDocument } = useFirestore();
  const { setProfile } = useUser();
  const isMounted = useRef(true);
  const authUnsubscribe = useRef<(() => void) | null>(null);
  const [shouldCompleteProfile, setShouldCompleteProfile] = useState(false);

  useEffect(() => {
    if (shouldCompleteProfile) {
      replace("/actions/complete-profile");
    }
  }, [shouldCompleteProfile, replace]);

  const handleUser = async (user: User | null) => {
    if (!isMounted.current) return;

    if (!user) {
      setProfile({ ...defaultUserProfile, isLoggedIn: false });
      return;
    }

    try {
      const userDoc = await getDocument("users", user.uid);

      if (!isMounted.current) return;

      if (!userDoc) {
        console.log("No user document found.");
        setShouldCompleteProfile(true);
        return;
      }

      setProfile({
        uid: userDoc.uid,
        email: userDoc.email,
        displayName: userDoc.displayName,
        photoURL: userDoc.photoURL,
        createdAt: userDoc.createdAt,
        updatedAt: userDoc.updatedAt,
        isLoggedIn: true,
      });
    } catch (error) {
      console.error("Error @FetchUser.handleUser:", error);
      setProfile({ ...defaultUserProfile, isLoggedIn: false });
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        await handleUser(currentUser);

        const unsubscribe = await checkAuth(handleUser);
        authUnsubscribe.current = unsubscribe;
      } catch (error) {
        console.error("Error @FetchUser.initAuth:", error);
        if (isMounted.current) {
          setProfile({ ...defaultUserProfile, isLoggedIn: false });
        }
      }
    };

    initAuth();

    return () => {
      isMounted.current = false;
      if (authUnsubscribe.current) {
        authUnsubscribe.current();
      }
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" className="text-primary" />
    </View>
  );
};
