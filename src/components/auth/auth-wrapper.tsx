import type { ReactNode } from "react";
import { AuthProvider } from "@/hooks/contexts/firebase/use-auth";
import { EnhancedAuthProvider } from "@/hooks/contexts/use-enhanced-auth";
import { FirestoreProvider } from "@/hooks/contexts/firebase/use-firestore";
import { auth } from "@/lib/firebase-config";
import { StorageProvider } from "@/hooks/contexts/firebase/use-storage";

interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return (
    <StorageProvider>
      <FirestoreProvider>
        <AuthProvider auth={auth}>
          <EnhancedAuthProvider auth={auth}>{children}</EnhancedAuthProvider>
        </AuthProvider>
      </FirestoreProvider>
    </StorageProvider>
  );
};
