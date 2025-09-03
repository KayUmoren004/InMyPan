"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "expo-router";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { safeLog } from "@/lib/utils";

const PUBLIC_ROUTES = [
  "/deep-linking",
  "/sign-in",
  "/sign-up/sign-up-email",
  "/sign-up/sign-up-password",
  "/actions/forgot-password/forgot-password-email",
  "/actions/forgot-password/forgot-password-check-email",
  "/actions/forgot-password/forgot-password-password",
  "/actions/sign-in-email",
];

const INCOMPLETE_PROFILE_ROUTE = "/actions/complete-profile";
const HOME_ROUTE = "/home";

export function AuthNavigationHandler() {
  const { authUser, loading } = useEnhancedAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigated = useRef(false);
  const lastAuthState = useRef<string | null>(null);

  const hasCompleteName = (user: any) => {
    const given = user.displayName?.givenName?.trim() || "";
    const family = user.displayName?.familyName?.trim() || "";
    return given.length > 0 && family.length > 0;
  };

  const isAuthRoute = (path: string) => {
    return path.startsWith("/(auth)") || PUBLIC_ROUTES.includes(path);
  };

  useEffect(() => {
    // Wait for both loading and initializing to complete
    if (loading) return;

    safeLog("log", "Auth navigation handler initialized");
    safeLog("log", "Checking navigation path");
    safeLog("log", "Navigation state check");

    // Create a unique key for the current auth state
    const currentAuthState = authUser
      ? `${authUser.id}-${hasCompleteName(authUser)}`
      : "no-user";

    // Only proceed if auth state has changed or we haven't navigated for this state
    if (lastAuthState.current === currentAuthState && hasNavigated.current) {
      return;
    }

    // No user and not on a public route
    if (!authUser && !PUBLIC_ROUTES.includes(pathname)) {
      safeLog("log", "Redirecting to sign-in");
      hasNavigated.current = true;
      lastAuthState.current = currentAuthState;
      router.replace("/sign-in");
      return;
    }

    // User exists but incomplete profile
    if (
      authUser &&
      !hasCompleteName(authUser) &&
      pathname !== INCOMPLETE_PROFILE_ROUTE
    ) {
      safeLog("log", "Redirecting to complete profile");
      hasNavigated.current = true;
      lastAuthState.current = currentAuthState;
      router.replace(INCOMPLETE_PROFILE_ROUTE);
      return;
    }

    // User exists, complete profile, but on auth route
    if (authUser && hasCompleteName(authUser) && isAuthRoute(pathname)) {
      safeLog("log", "Redirecting authenticated user to home");
      hasNavigated.current = true;
      lastAuthState.current = currentAuthState;
      router.replace(HOME_ROUTE);
      return;
    }

    // Update the last auth state
    lastAuthState.current = currentAuthState;
  }, [authUser, loading, pathname, router]);

  // Reset navigation flag when pathname changes to a non-auth route
  useEffect(() => {
    if (!isAuthRoute(pathname)) {
      hasNavigated.current = false;
    }
  }, [pathname]);

  return null;
}
