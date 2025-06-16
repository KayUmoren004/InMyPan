import {
  type Auth,
  type User,
  type UserCredential,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
  AuthErrorCodes,
  OAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { onSnapshot, doc, type Unsubscribe } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./firebase/use-auth";
import { useFirestore } from "./firebase/use-firestore";
import { firestore } from "@/lib/firebase-config";
import * as AppleAuthentication from "expo-apple-authentication";
import { Alert } from "react-native";
import { useStorageState } from "../use-storage-state";
import { useRouter } from "expo-router";
import { useStorage } from "./firebase/use-storage";

// Types
export interface UserProfile {
  id: string;
  email: string;
  displayName?: {
    givenName?: string;
    familyName?: string;
    middleName?: string;
    nickname?: string;
    namePrefix?: string;
    nameSuffix?: string;
  } | null;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  provider?: string;
  // Add other profile fields as needed
}

interface AuthUser extends UserProfile {
  firebaseUser: User;
}

interface EnhancedAuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    profile?: Partial<UserProfile>
  ) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: (idToken: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  linkGoogleAccount: (idToken: string) => Promise<UserCredential>;
  signInWithApple: () => Promise<UserCredential | null>;
  verifyEmail: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(
  undefined
);

export const EnhancedAuthProvider = ({
  children,
  auth,
}: {
  children: ReactNode;
  auth: Auth;
}) => {
  const baseAuth = useAuth();
  const firestoreContext = useFirestore();
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { replace } = useRouter();
  const { uploadFile } = useStorage();

  // Properly destructure useStorageState - it returns [[loading, value], setter]
  const [sessionState, setSessionState] = useStorageState("user_session");
  const [sessionLoading, sessionValue] = sessionState;

  // Refs for cleanup and tracking
  const profileUnsubscribe = useRef<Unsubscribe | null>(null);
  const isInitialized = useRef(false);
  const currentUserId = useRef<string | null>(null);

  // Upload profile image
  const uploadProfileImage = useCallback(
    async (image: any, uid: string): Promise<string | null> => {
      try {
        const path = `users/${uid}/profile-image`;

        const url = await uploadFile(path, image);

        return url;
      } catch (error: any) {
        console.log("Error @EnhancedAuth.uploadProfileImage: ", error.message);
        return null;
      }
    },
    []
  );

  // Memoize the createUserProfile function
  const createUserProfile = useCallback(
    async (
      firebaseUser: User,
      additionalData?: Partial<UserProfile>
    ): Promise<UserProfile> => {
      // Pull out photoURL from additionalData
      const { photoURL, ...rest } = additionalData || {};

      const profile: UserProfile = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName: additionalData?.displayName || {
          givenName: firebaseUser.displayName ?? "",
          familyName: "",
          middleName: "",
          nickname: "",
          namePrefix: "",
          nameSuffix: "",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        provider: firebaseUser.providerData[0]?.providerId || "email",
        ...rest,
      };

      // console.log("Final profile to be saved:", profile);

      await firestoreContext.setDocument("users", firebaseUser.uid, profile);

      return profile;
    },
    [firestoreContext]
  );

  // Memoize the syncUserProfile function
  const syncUserProfile = useCallback(
    async (firebaseUser: User, skipProfileCreation = false) => {
      try {
        // Clean up existing listener
        if (profileUnsubscribe.current) {
          profileUnsubscribe.current();
          profileUnsubscribe.current = null;
        }

        // Set up real-time profile listener
        const profileRef = doc(firestore, "users", firebaseUser.uid);

        profileUnsubscribe.current = onSnapshot(
          profileRef,
          async (docSnap) => {
            let profile: UserProfile;

            if (docSnap.exists()) {
              const data = docSnap.data();
              profile = {
                id: firebaseUser.uid,
                ...data,
                createdAt: data.createdAt?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || new Date(),
              } as UserProfile;

              console.log("Loaded existing profile from Firestore:", profile);
            } else if (!skipProfileCreation) {
              // Create new profile if it doesn't exist and we're not skipping creation
              profile = await createUserProfile(firebaseUser);
              console.log("Created new profile:", profile);
            } else {
              // If we're skipping profile creation and no profile exists, wait for it to be created
              console.log("Waiting for profile to be created...");
              return;
            }

            const combinedAuthUser: AuthUser = {
              ...profile,
              firebaseUser,
            };

            setAuthUser(combinedAuthUser);

            // Update session state
            const newSessionData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              lastLogin: new Date().toISOString(),
            };

            setSessionState(newSessionData);
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to profile changes:", error);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error("Error syncing user profile:", error);
        setLoading(false);
      }
    },
    [createUserProfile, setSessionState]
  );

  // Handle Firebase user changes
  useEffect(() => {
    // Don't do anything if base auth is still loading
    if (baseAuth.loading) {
      return;
    }

    const userId = baseAuth.user?.uid || null;

    // If user logged out
    if (!baseAuth.user) {
      // Clean up listeners
      if (profileUnsubscribe.current) {
        profileUnsubscribe.current();
        profileUnsubscribe.current = null;
      }

      setAuthUser(null);
      setSessionState(null);
      setLoading(false);
      currentUserId.current = null;
      return;
    }

    // If user changed or this is the first time
    if (currentUserId.current !== userId) {
      currentUserId.current = userId;
      syncUserProfile(baseAuth.user);
    }
  }, [baseAuth.user, baseAuth.loading, syncUserProfile]);

  // Handle stale session cleanup - only run when session storage is loaded
  useEffect(() => {
    if (
      !sessionLoading &&
      sessionValue &&
      !baseAuth.user &&
      !baseAuth.loading
    ) {
      // Session exists in storage but no Firebase user - clear stale session
      setSessionState(null);
    }
  }, [
    sessionLoading,
    sessionValue,
    baseAuth.user,
    baseAuth.loading,
    setSessionState,
  ]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      profileData?: Partial<UserProfile>
    ): Promise<UserCredential> => {
      const userCredential = await baseAuth.signUp(email, password);

      // Save user to firestore
      await createUserProfile(userCredential.user, profileData);

      // Upload profile image
      if (profileData?.photoURL) {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function () {
            resolve(xhr.response);
          };
          xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
          };
          xhr.responseType = "blob";
          xhr.open("GET", profileData.photoURL!, true);
          xhr.send(null);
        });
        const url = await uploadProfileImage(blob, userCredential.user.uid);

        if (url) {
          await firestoreContext.updateDocument(
            "users",
            userCredential.user.uid,
            {
              photoURL: url,
              updatedAt: new Date(),
            }
          );
        }
      }

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Replace with verify email screen
      replace("/actions/verify/verify-email");

      return userCredential;
    },
    [
      baseAuth.signUp,
      createUserProfile,
      syncUserProfile,
      uploadProfileImage,
      firestoreContext,
    ]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserCredential> => {
      return baseAuth.signIn(email, password);
    },
    [baseAuth.signIn]
  );

  const signInWithGoogle = useCallback(
    async (idToken: string): Promise<UserCredential> => {
      const credential = GoogleAuthProvider.credential(idToken);

      try {
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential;
      } catch (error: any) {
        if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
          throw new Error(
            "An account with this email already exists. Please sign in with your original method first, then link your Google account."
          );
        }
        throw error;
      }
    },
    [auth]
  );

  const linkGoogleAccount = useCallback(
    async (idToken: string): Promise<UserCredential> => {
      if (!baseAuth.user) {
        throw new Error("No user signed in");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await linkWithCredential(
        baseAuth.user,
        credential
      );

      // Update profile with linked provider info
      if (authUser) {
        await firestoreContext.updateDocument("users", authUser.id, {
          provider: "email,google",
          updatedAt: new Date(),
        });
      }

      return userCredential;
    },
    [baseAuth.user, authUser, firestoreContext]
  );

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<void> => {
      if (!authUser) {
        throw new Error("No user signed in");
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date(),
      };

      await firestoreContext.updateDocument("users", authUser.id, updatedData);
    },
    [authUser, firestoreContext]
  );

  const logout = useCallback(async (): Promise<void> => {
    // Clean up listeners
    if (profileUnsubscribe.current) {
      profileUnsubscribe.current();
      profileUnsubscribe.current = null;
    }

    // Clear state
    setAuthUser(null);
    setSessionState(null);
    currentUserId.current = null;

    // Sign out from Firebase
    await baseAuth.logout();
  }, [baseAuth.logout, setSessionState]);

  const resetPassword = useCallback(
    async (email: string): Promise<void> => {
      return baseAuth.resetPassword(email);
    },
    [baseAuth.resetPassword]
  );

  const signInWithApple =
    useCallback(async (): Promise<UserCredential | null> => {
      try {
        // Request Apple authentication
        const appleCredential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        console.log("Apple credential", appleCredential);

        // Validate identity token
        if (!appleCredential.identityToken) {
          throw new Error("Apple Sign-In failed: No identity token received");
        }

        // Create Firebase credential
        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({
          idToken: appleCredential.identityToken,
        });

        try {
          // Attempt to sign in with Apple credential
          const userCredential = await signInWithCredential(auth, credential);
          const { user } = userCredential;

          // Check if profile already exists
          const existingProfile = await firestoreContext.getDocument(
            "users",
            user.uid
          );

          if (!existingProfile) {
            // Create profile with Apple name data
            const appleProfileData: Partial<UserProfile> = {
              displayName: {
                givenName: appleCredential.fullName?.givenName || "",
                familyName: appleCredential.fullName?.familyName || "",
                middleName: appleCredential.fullName?.middleName || "",
                nickname: appleCredential.fullName?.nickname || "",
                namePrefix: appleCredential.fullName?.namePrefix || "",
                nameSuffix: appleCredential.fullName?.nameSuffix || "",
              },
              provider: "apple.com",
            };

            console.log("Creating Apple profile with data:", appleProfileData);

            // Create the profile first
            await createUserProfile(user, appleProfileData);

            // Then set up the listener, but skip automatic profile creation since we just created it
            await syncUserProfile(user, true);
          } else {
            console.log("Existing Apple user profile found");
            // Just sync the existing profile
            await syncUserProfile(user);
          }

          console.log(
            "Apple Sign-In successful, user authenticated:",
            user.uid
          );
          return userCredential;
        } catch (firebaseError: any) {
          // Handle account linking scenarios
          if (firebaseError.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
            Alert.alert(
              "Account Already Exists",
              "An account with this email already exists. Would you like to link your Apple account?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Link Account",
                  onPress: async () => {
                    Alert.alert(
                      "Link Account",
                      "Please sign in with your existing account first, then you can link your Apple account in settings."
                    );
                  },
                },
              ]
            );
            return null;
          }

          // Handle other Firebase auth errors
          if (firebaseError.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
            return null;
          }

          throw firebaseError;
        }
      } catch (error: any) {
        console.error("Apple Sign-In error:", error);

        // Handle Apple authentication cancellation
        if (error.code === "ERR_REQUEST_CANCELED") {
          console.log("Apple Sign-In cancelled");
          return null;
        }

        // Handle other errors
        let errorMessage = "Apple Sign-In failed. Please try again.";

        if (error.code === AuthErrorCodes.NETWORK_REQUEST_FAILED) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.code === AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER) {
          errorMessage = "Too many attempts. Please try again later.";
        }

        Alert.alert("Sign-In Error", errorMessage);
        return null;
      }
    }, [auth, firestoreContext, createUserProfile, syncUserProfile]);

  // Verify email
  const verifyEmail = useCallback(async (): Promise<void> => {
    console.log("Sending email verification");
    if (!baseAuth.user) {
      throw new Error("No user signed in");
    }

    // Send email verification
    console.log("Email verification sent");
    await sendEmailVerification(baseAuth.user);
  }, [baseAuth.user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (profileUnsubscribe.current) {
        profileUnsubscribe.current();
      }
    };
  }, []);

  const value: EnhancedAuthContextType = {
    authUser,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    linkGoogleAccount,
    signInWithApple,
    verifyEmail,
  };

  return (
    <EnhancedAuthContext.Provider value={value}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error(
      "useEnhancedAuth must be used within an EnhancedAuthProvider"
    );
  }
  return context;
};
