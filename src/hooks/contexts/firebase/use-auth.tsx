"use client";

import type React from "react";

import {
  type Auth,
  type User,
  type UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  OAuthProvider,
  type Unsubscribe,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import type * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  initializing: boolean; // Add this to track initial auth state loading
  getCurrentUser: () => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  appleSignIn: (
    input: AppleAuthentication.AppleAuthenticationCredential
  ) => Promise<UserCredential | undefined>;
  checkAuth: (callback: (user: User | null) => void) => Promise<Unsubscribe>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  auth,
}: {
  children: React.ReactNode;
  auth: Auth;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true); // Track initial load
  const authStateUnsubscribe = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    console.log("Setting up Firebase auth state listener");

    authStateUnsubscribe.current = onAuthStateChanged(auth, (user) => {
      console.log(
        "Firebase auth state changed:",
        user ? `User: ${user.uid}` : "No user"
      );
      setUser(user);
      setLoading(false);

      // Only set initializing to false after the first auth state change
      if (initializing) {
        setInitializing(false);
      }
    });

    return () => {
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
      }
    };
  }, [auth, initializing]);

  const appleSignIn = async (
    input: AppleAuthentication.AppleAuthenticationCredential
  ) => {
    const { identityToken, fullName, email } = input;
    if (!identityToken) {
      Alert.alert("Error", "No identity token");
      return;
    }

    const provider = new OAuthProvider("apple.com");
    const credential = provider.credential({
      idToken: identityToken,
    });

    const userCredential = await signInWithCredential(auth, credential);
    return userCredential;
  };

  // Get current user
  const getCurrentUser = async () => {
    return auth.currentUser;
  };

  // Check Auth
  const checkAuth = async (
    callback: (user: User | null) => void
  ): Promise<Unsubscribe> => {
    return onAuthStateChanged(auth, callback);
  };

  const values = useMemo(
    () => ({
      user,
      loading,
      initializing,
      getCurrentUser,
      checkAuth,
      signUp: (email: string, password: string) =>
        createUserWithEmailAndPassword(auth, email, password),
      signIn: (email: string, password: string) =>
        signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
      resetPassword: (email: string) => sendPasswordResetEmail(auth, email),
      appleSignIn,
    }),
    [user, loading, initializing, auth]
  );

  return (
    <AuthContext.Provider value={values}>
      {/* Always render children, but pass initializing state to enhanced auth */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
