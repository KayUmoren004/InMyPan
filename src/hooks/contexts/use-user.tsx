import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import { useRouter } from "expo-router";
import { safeLog } from "@/lib/utils";
import { useEnhancedAuth } from "./use-enhanced-auth";
import { UserProfile } from "@/components/types/user-types";

interface UserContextType {
  user: UserProfile | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { authUser } = useEnhancedAuth();

  const userWithoutFirebaseUser = useMemo(() => {
    return authUser ? { ...authUser, firebaseUser: undefined } : null;
  }, [authUser]);

  console.log("User: ", userWithoutFirebaseUser);

  return (
    <UserContext.Provider value={{ user: userWithoutFirebaseUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};
