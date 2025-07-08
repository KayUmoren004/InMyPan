import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "expo-router";
import {
  useEnhancedAuth,
  UserProfile,
} from "@/hooks/contexts/use-enhanced-auth";
import { View, Text, ActivityIndicator } from "react-native";
import { safeLog } from "@/lib/utils";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
  requireCompleteProfile?: boolean;
}

export const AuthGuard = ({
  children,
  fallback,
  requireAuth = true,
  requireCompleteProfile = false,
}: AuthGuardProps) => {
  const { authUser, loading } = useEnhancedAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    if (loading || hasNavigatedRef.current) return;

    // 1. Not logged in
    if (requireAuth && !authUser && pathname !== "/sign-in") {
      safeLog("log", "Unauthenticated, redirecting to sign-in");
      hasNavigatedRef.current = true;
      router.replace("/sign-in");
      return;
    }

    // 2. Already logged in, but on a public page
    if (!requireAuth && authUser && pathname !== "/home") {
      safeLog("log", "Already authenticated, redirecting to home");
      hasNavigatedRef.current = true;
      router.replace("/home");
      return;
    }

    // 3. Logged in but profile incomplete
    const incomplete =
      requireCompleteProfile && authUser && !hasCompleteName(authUser);
    if (incomplete && pathname !== "/actions/complete-profile") {
      safeLog("log", "Incomplete profile, redirecting to complete-profile");
      hasNavigatedRef.current = true;
      router.replace("/actions/complete-profile");
      return;
    }
  }, [authUser, loading, requireAuth, requireCompleteProfile, pathname]);

  // Reset navigation flag when pathname changes
  useEffect(() => {
    hasNavigatedRef.current = false;
  }, [pathname]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2.5">Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

const hasCompleteName = (user: UserProfile) => {
  const given = user.displayName?.givenName?.trim() || "";
  const family = user.displayName?.familyName?.trim() || "";
  return given.length > 0 && family.length > 0;
};
