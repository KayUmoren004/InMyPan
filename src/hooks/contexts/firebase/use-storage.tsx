import {
  FirebaseStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { createContext, useContext, useMemo } from "react";
import { storage } from "@/lib/firebase-config";

interface StorageContextType {
  uploadFile: (path: string, file: any) => Promise<string>;
  getFileUrl: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<void>;
  listFiles: (path: string) => Promise<string[]>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const values = useMemo(
    () => ({
      uploadFile: async (path: string, file: any): Promise<string> => {
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
      },
      getFileUrl: async (path: string): Promise<string> => {
        const storageRef = ref(storage, path);
        return getDownloadURL(storageRef);
      },
      deleteFile: async (path: string): Promise<void> => {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
      },
      listFiles: async (path: string): Promise<string[]> => {
        const storageRef = ref(storage, path);
        const result = await listAll(storageRef);
        return Promise.all(result.items.map((item) => getDownloadURL(item)));
      },
    }),
    [storage]
  );

  return (
    <StorageContext.Provider value={values}>{children}</StorageContext.Provider>
  );
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
};
