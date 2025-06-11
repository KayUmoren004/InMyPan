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
