// import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
// import {
//   Auth,
//   getAuth,
//   getReactNativePersistence,
//   initializeAuth,
// } from "firebase/auth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Firestore, getFirestore } from "firebase/firestore";
// import { FirebaseStorage, getStorage } from "firebase/storage";
// import { Database, getDatabase } from "firebase/database";

// export const firebaseConfig = {
//   apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
// };

// const firebase =
//   getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// export default firebase;

// export let app: FirebaseApp;
// export let auth: Auth;
// export let firestore: Firestore;
// export let storage: FirebaseStorage;
// export let realtime: Database;

// if (getApps().length < 1) {
//   app = initializeApp(firebaseConfig);
//   auth = initializeAuth(app, {
//     persistence: getReactNativePersistence(AsyncStorage),
//   });
//   firestore = getFirestore(app);
//   storage = getStorage(app);
//   realtime = getDatabase(app);
// } else {
//   app = getApp();
//   auth = getAuth(app);
//   firestore = getFirestore(app);
//   storage = getStorage(app);
//   realtime = getDatabase(app);
// }

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  type Auth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { type Firestore, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, getStorage } from "firebase/storage";
import { type Database, getDatabase } from "firebase/database";

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App (only once)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with AsyncStorage persistence (only once)
// The key is to ALWAYS use initializeAuth, never getAuth for React Native
const auth: Auth = (() => {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // If auth is already initialized, this will throw an error
    // In that case, we need to get the existing auth instance
    // But this should not happen with proper app lifecycle management
    console.warn("Auth already initialized:", error.message);

    // Import getAuth only if needed as fallback
    const { getAuth } = require("firebase/auth");
    return getAuth(app);
  }
})();

// Initialize other Firebase services
const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const realtime: Database = getDatabase(app);

export { app, auth, firestore, storage, realtime };
export default app;
