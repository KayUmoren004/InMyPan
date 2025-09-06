import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { createContext, useContext, useMemo } from "react";
import { firestore } from "@/lib/firebase-config";

interface FirestoreContextType {
  getDocument: <T = DocumentData>(
    collectionName: string,
    docId: string
  ) => Promise<T | null>;
  getCollection: <T = DocumentData>(collectionName: string) => Promise<T[]>;
  getSubCollection: <T = DocumentData>(paths: string[]) => Promise<T[]>;
  setDocument: <T = DocumentData>(
    collectionName: string,
    docId: string,
    data: T
  ) => Promise<void>;
  updateDocument: <T = DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
  ) => Promise<void>;
  deleteDocument: (collectionName: string, docId: string) => Promise<void>;
  queryCollection: <T = DocumentData>(
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ) => Promise<T[]>;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(
  undefined
);

export const FirestoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const values = useMemo(
    () => ({
      getDocument: async <T = DocumentData,>(
        collectionName: string,
        docId: string
      ): Promise<T | null> => {
        const docRef = doc(firestore, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? (docSnap.data() as T) : null;
      },

      getCollection: async <T = DocumentData,>(
        collectionName: string
      ): Promise<T[]> => {
        const querySnapshot = await getDocs(
          collection(firestore, collectionName)
        );
        return querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
      },

      getSubCollection: async <T = DocumentData,>(
        paths: string[]
      ): Promise<T[]> => {
        const querySnapshot = await getDocs(
          collection(firestore, paths.map((s) => `"${s}"`).join(", "))
        );
        return querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
      },

      setDocument: async <T = DocumentData,>(
        collectionName: string,
        docId: string,
        data: T
      ): Promise<void> => {
        await setDoc(
          doc(firestore, collectionName, docId),
          data as DocumentData
        );
      },
      updateDocument: async <T = DocumentData,>(
        collectionName: string,
        docId: string,
        data: Partial<T>
      ): Promise<void> => {
        await updateDoc(
          doc(firestore, collectionName, docId),
          data as DocumentData
        );
      },
      deleteDocument: async (
        collectionName: string,
        docId: string
      ): Promise<void> => {
        await deleteDoc(doc(firestore, collectionName, docId));
      },
      queryCollection: async <T = DocumentData,>(
        collectionName: string,
        field: string,
        operator: any,
        value: any
      ): Promise<T[]> => {
        const q = query(
          collection(firestore, collectionName),
          where(field, operator, value)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as T)
        );
      },
    }),
    [firestore]
  );

  return (
    <FirestoreContext.Provider value={values}>
      {children}
    </FirestoreContext.Provider>
  );
};

export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) {
    throw new Error("useFirestore must be used within a FirestoreProvider");
  }
  return context;
};
