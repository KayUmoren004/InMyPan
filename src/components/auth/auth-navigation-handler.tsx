import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "expo-router";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";

const PUBLIC_ROUTES = [
  "/deep-linking",
  "/sign-in",
  "/sign-up/sign-up-email",
  "/sign-up/sign-up-password",
  "/actions/forgot-password/forgot-password-email",
  "/actions/forgot-password/forgot-password-check-email",
  "/actions/forgot-password/forgot-password-password",
];
const INCOMPLETE_PROFILE_ROUTE = "/actions/complete-profile";
const HOME_ROUTE = "/home";

export function AuthNavigationHandler() {
  const { authUser, loading } = useEnhancedAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasNavigated = useRef(false);

  const hasCompleteName = (user: any) => {
    const given = user.displayName?.givenName?.trim() || "";
    const family = user.displayName?.familyName?.trim() || "";
    return given.length > 0 && family.length > 0;
  };

  useEffect(() => {
    if (loading || hasNavigated.current) return;

    console.log("Auth User", authUser);

    if (!authUser && !PUBLIC_ROUTES.includes(pathname)) {
      console.log("No user, redirect to sign-in");
      hasNavigated.current = true;
      router.replace("/sign-in");
    } else if (
      authUser &&
      !hasCompleteName(authUser) &&
      pathname !== INCOMPLETE_PROFILE_ROUTE
    ) {
      console.log("Incomplete profile, redirecting...");
      hasNavigated.current = true;
      router.replace(INCOMPLETE_PROFILE_ROUTE);
    } else if (
      authUser &&
      hasCompleteName(authUser) &&
      pathname.startsWith("/(auth)")
    ) {
      console.log("Logged in user in public route, redirecting home");
      hasNavigated.current = true;
      router.replace(HOME_ROUTE);
    }
  }, [authUser, loading, pathname]);

  useEffect(() => {
    hasNavigated.current = false;
  }, [pathname]);

  return null;
}
