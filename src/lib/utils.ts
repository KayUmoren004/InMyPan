import { UserProfile } from "@/hooks/contexts/use-enhanced-auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hasNames = (authUser: UserProfile): boolean => {
  const { displayName } = authUser;

  if (!displayName) return false;

  const hasGivenName =
    typeof displayName.givenName === "string" &&
    displayName.givenName.trim().length > 0;
  const hasFamilyName =
    typeof displayName.familyName === "string" &&
    displayName.familyName.trim().length > 0;

  return hasGivenName && hasFamilyName;
};

/**
 * Safe logging utility that only logs in development mode
 * @param type - The type of log ('log' | 'error' | 'warn' | 'info')
 * @param message - The message to log
 * @param data - Optional data to log (will be stripped in production)
 */
export const safeLog = (
  type: "log" | "error" | "warn" | "info",
  message: string,
  data?: unknown
) => {
  if (__DEV__) {
    if (data) {
      console[type](message, data);
    } else {
      console[type](message);
    }
  }
};

/**
 * Get initials from a full name
 * @param fullName - The full name to get initials from
 * @returns The initials
 */
export const getInitials = (fullName: string) => {
  return fullName
    .split(" ")
    .map((name) => name[0].toUpperCase())
    .join("");
};

/**
 * Get a URL for a user's avatar
 * @param photoURL - The user's photo URL
 * @returns The avatar URL
 */
export const getAvatarFallbackURL = (fullName: string) => {
  if (!fullName || fullName.trim().length === 0) {
    return "https://api.dicebear.com/7.x/initials/svg?seed=U";
  }

  return `https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(
    fullName
  )}`;
};
