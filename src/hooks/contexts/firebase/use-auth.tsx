import {
  Auth,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  OAuthProvider,
  Unsubscribe,
} from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";

interface AuthContextType {
  user: User | null;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);
  const authStateUnsubscribe = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    authStateUnsubscribe.current = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      if (authStateUnsubscribe.current) {
        authStateUnsubscribe.current();
      }
    };
  }, [auth]);

  const appleSignIn = async (
    input: AppleAuthentication.AppleAuthenticationCredential
  ) => {
    const { identityToken, fullName, email } = input;

    if (!identityToken) {
      // throw new Error("No identity token");
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
    [user, loading, auth]
  );

  return (
    <AuthContext.Provider value={values}>
      {!loading && children}
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
