"use client";

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
import type { CompleteProfileSchema } from "@/lib/zod-validation";
import { safeLog } from "@/lib/utils";
import type { User as GoogleUser } from "@react-native-google-signin/google-signin";
import { AuthUser, UserProfile } from "@/components/types/user-types";

interface EnhancedAuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    profile?: Partial<UserProfile>
  ) => Promise<UserCredential>;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  linkGoogleAccount: (idToken: string) => Promise<UserCredential>;
  signInWithApple: () => Promise<UserCredential | null>;
  signInWithGoogle: (
    idToken: string,
    user: GoogleUser
  ) => Promise<UserCredential | null>;
  verifyEmail: () => Promise<void>;
  completeProfile: (profile: CompleteProfileSchema) => Promise<void>;
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

  // Session storage
  const [sessionState, setSessionState] = useStorageState("user_session");
  const [sessionLoading, sessionValue] = sessionState;

  // Refs for cleanup and tracking
  const profileUnsubscribe = useRef<Unsubscribe | null>(null);
  const currentUserId = useRef<string | null>(null);

  // Upload profile image
  const uploadProfileImage = useCallback(
    async (image: any, uid: string): Promise<string | null> => {
      try {
        const path = `users/${uid}/profile-image`;
        const url = await uploadFile(path, image);
        return url;
      } catch (error: any) {
        safeLog("error", "Error uploading profile image");
        return null;
      }
    },
    []
  );

  // Create user profile
  const createUserProfile = useCallback(
    async (
      firebaseUser: User,
      additionalData?: Partial<UserProfile>
    ): Promise<UserProfile> => {
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
        username: additionalData?.username || "",
        ...rest,
      };

      await firestoreContext.setDocument("users", firebaseUser.uid, profile);
      return profile;
    },
    [firestoreContext]
  );

  // Sync user profile
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
              safeLog("log", "Loaded existing profile from Firestore");
            } else if (!skipProfileCreation) {
              profile = await createUserProfile(firebaseUser);
              safeLog("log", "Created new profile");
            } else {
              safeLog("log", "Waiting for profile to be created...");
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
            safeLog("error", "Error listening to profile changes");
            setLoading(false);
          }
        );
      } catch (error) {
        safeLog("error", "Error syncing user profile");
        setLoading(false);
      }
    },
    [createUserProfile, setSessionState]
  );

  // Handle Firebase user changes
  useEffect(() => {
    // Wait for base auth to finish initializing
    if (baseAuth.initializing) {
      safeLog("log", "Base auth still initializing...");
      return;
    }

    // If base auth is still loading user state, wait
    if (baseAuth.loading) {
      safeLog("log", "Base auth still loading...");
      return;
    }

    const userId = baseAuth.user?.uid || null;
    safeLog("log", "Enhanced auth processing user change");

    // If user logged out
    if (!baseAuth.user) {
      safeLog("log", "No Firebase user, cleaning up...");
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
      safeLog("log", "User changed, syncing profile for:", userId);
      currentUserId.current = userId;
      syncUserProfile(baseAuth.user);
    }
  }, [baseAuth.user, baseAuth.loading, baseAuth.initializing, syncUserProfile]);

  // Handle stale session cleanup - only run when session storage is loaded
  useEffect(() => {
    if (
      !sessionLoading &&
      sessionValue &&
      !baseAuth.user &&
      !baseAuth.loading &&
      !baseAuth.initializing
    ) {
      safeLog("log", "Clearing stale session");
      setSessionState(null);
    }
  }, [
    sessionLoading,
    sessionValue,
    baseAuth.user,
    baseAuth.loading,
    baseAuth.initializing,
    setSessionState,
  ]);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      profileData?: Partial<UserProfile>
    ): Promise<UserCredential> => {
      const userCredential = await baseAuth.signUp(email, password);
      await createUserProfile(userCredential.user, profileData);

      if (profileData?.photoURL) {
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (e) => {
            safeLog("error", "Error in enhanced auth");
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

      await sendEmailVerification(userCredential.user);
      replace("/actions/verify/verify-email");
      return userCredential;
    },
    [baseAuth.signUp, createUserProfile, uploadProfileImage, firestoreContext]
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<UserCredential> => {
      return baseAuth.signIn(email, password);
    },
    [baseAuth.signIn]
  );

  const signInWithGoogle = useCallback(
    async (
      idToken: string,
      googleUser: GoogleUser
    ): Promise<UserCredential | null> => {
      try {
        const credential = GoogleAuthProvider.credential(idToken);
        try {
          const userCredential = await signInWithCredential(auth, credential);
          // return userCredential;

          const { user } = userCredential;

          const existingProfile = await firestoreContext.getDocument(
            "users",
            user.uid
          );

          if (!existingProfile) {
            const googleProfileData: Partial<UserProfile> = {
              provider: "google.com",
              displayName: {
                givenName: googleUser.user.givenName || "",
                familyName: googleUser.user.familyName || "",
              },
            };

            safeLog("log", "Creating Google profile");
            await createUserProfile(user, googleProfileData);
            await syncUserProfile(user, true);
          } else {
            safeLog("log", "Existing Google user profile found");
            await syncUserProfile(user);
          }

          console.log(
            "Google Sign-In successful, user authenticated:",
            user.uid
          );
          return userCredential;
        } catch (firebaseError: any) {
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

          if (firebaseError.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
            return null;
          }

          throw firebaseError;
        }
      } catch (error: any) {
        safeLog("error", "Google Sign-In error");

        if (error.code === "ERR_REQUEST_CANCELED") {
          safeLog("log", "Google Sign-In cancelled");
          return null;
        }

        let errorMessage = "Google Sign-In failed. Please try again.";
        if (error.code === AuthErrorCodes.NETWORK_REQUEST_FAILED) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.code === AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER) {
          errorMessage = "Too many attempts. Please try again later.";
        }

        Alert.alert("Sign-In Error", errorMessage);
        return null;
      }
    },
    [auth, firestoreContext, syncUserProfile, createUserProfile]
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

      const { photoURL, ...rest } = updates;

      let profileImageUrl: string | null = null;
      if (photoURL) {
        profileImageUrl = await uploadProfileImage(photoURL, authUser.id);
      }

      const updatedData = {
        ...rest,
        photoURL: profileImageUrl ?? "",
        updatedAt: new Date(),
      };

      await firestoreContext.updateDocument("users", authUser.id, updatedData);
    },
    [authUser, firestoreContext]
  );

  const logout = useCallback(async (): Promise<void> => {
    safeLog("log", "Logging out user...");

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
        const appleCredential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        });

        safeLog("log", "Apple sign in successful");

        if (!appleCredential.identityToken) {
          throw new Error("Apple Sign-In failed: No identity token received");
        }

        const provider = new OAuthProvider("apple.com");
        const credential = provider.credential({
          idToken: appleCredential.identityToken,
        });

        try {
          const userCredential = await signInWithCredential(auth, credential);
          const { user } = userCredential;

          const existingProfile = await firestoreContext.getDocument(
            "users",
            user.uid
          );

          if (!existingProfile) {
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

            safeLog("log", "Creating Apple profile");
            await createUserProfile(user, appleProfileData);
            await syncUserProfile(user, true);
          } else {
            safeLog("log", "Existing Apple user profile found");
            await syncUserProfile(user);
          }

          console.log(
            "Apple Sign-In successful, user authenticated:",
            user.uid
          );
          return userCredential;
        } catch (firebaseError: any) {
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

          if (firebaseError.code === AuthErrorCodes.POPUP_CLOSED_BY_USER) {
            return null;
          }

          throw firebaseError;
        }
      } catch (error: any) {
        safeLog("error", "Apple Sign-In error");

        if (error.code === "ERR_REQUEST_CANCELED") {
          safeLog("log", "Apple Sign-In cancelled");
          return null;
        }

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

  const verifyEmail = useCallback(async (): Promise<void> => {
    safeLog("log", "Sending email verification");
    if (!baseAuth.user) {
      throw new Error("No user signed in");
    }
    safeLog("log", "Email verification sent");
    await sendEmailVerification(baseAuth.user);
  }, [baseAuth.user]);

  const completeProfile = useCallback(
    async (profile: CompleteProfileSchema): Promise<void> => {
      const user = (await baseAuth.getCurrentUser()) ?? baseAuth.user;

      if (!user) {
        throw new Error("No user signed in");
      }

      let profileImageUrl: string | null = null;

      if (profile.profileImage) {
        profileImageUrl = await uploadProfileImage(
          profile.profileImage,
          user.uid
        );
      }

      await updateProfile({
        photoURL: profileImageUrl ?? "",
        displayName: {
          givenName: profile.givenName,
          familyName: profile.familyName,
        },
        username: profile.username,
      });

      await syncUserProfile(user);
    },
    [baseAuth.user, updateProfile, uploadProfileImage, syncUserProfile]
  );

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
    loading: loading || baseAuth.initializing, // Include initializing state
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    linkGoogleAccount,
    signInWithApple,
    verifyEmail,
    completeProfile,
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
