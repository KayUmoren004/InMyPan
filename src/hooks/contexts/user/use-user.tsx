import { User } from "firebase/auth";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useAuth } from "../firebase/use-auth";
import { useFirestore } from "../firebase/use-firestore";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
  isLoggedIn?: boolean | null;
  // Add any additional user profile fields here
}

interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const defaultUserProfile: UserProfile = {
  uid: "",
  email: "",
  displayName: "",
  photoURL: "",
  createdAt: "",
  updatedAt: "",
  isLoggedIn: null,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { getDocument, setDocument, updateDocument } = useFirestore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const isUpdating = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isMounted.current || isUpdating.current) return;

      try {
        isUpdating.current = true;
        setLoading(true);

        if (!user) {
          if (isMounted.current) {
            setProfile({ ...defaultUserProfile, isLoggedIn: false });
          }
          return;
        }

        const userProfile = await getDocument<UserProfile>("users", user.uid);

        if (!isMounted.current) return;

        if (!userProfile) {
          // Don't create a new profile here, let the complete-profile flow handle it
          setProfile({ ...defaultUserProfile, isLoggedIn: false });
        } else {
          setProfile({
            ...userProfile,
            isLoggedIn: true,
          });
        }
      } catch (err) {
        if (isMounted.current) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch user profile")
          );
          setProfile({ ...defaultUserProfile, isLoggedIn: false });
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
          isUpdating.current = false;
        }
      }
    };

    fetchUserProfile();
  }, [user, getDocument]);

  const updateProfile = useMemo(() => {
    return async (data: Partial<UserProfile>) => {
      if (!user || !profile) {
        throw new Error("No user logged in");
      }

      if (!isMounted.current || isUpdating.current) return;

      try {
        isUpdating.current = true;
        const updates = {
          ...data,
          updatedAt: new Date().toISOString(),
        };

        await updateDocument("users", user.uid, updates);

        if (isMounted.current) {
          setProfile((prev) => (prev ? { ...prev, ...updates } : null));
        }
      } finally {
        isUpdating.current = false;
      }
    };
  }, [user, profile, updateDocument]);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      error,
      setProfile,
      updateProfile,
    }),
    [user, profile, loading, error, updateProfile]
  );

  return (
    <UserContext.Provider value={value}>
      {!loading && children}
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
