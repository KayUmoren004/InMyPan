import {
  Database,
  ref,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  off,
  DataSnapshot,
} from "firebase/database";
import { createContext, useContext, useMemo } from "react";
import { realtime } from "@/lib/firebase-config";

interface RealtimeContextType {
  getData: <T = any>(path: string) => Promise<T | null>;
  setData: <T = any>(path: string, data: T) => Promise<void>;
  updateData: <T = any>(path: string, data: Partial<T>) => Promise<void>;
  deleteData: (path: string) => Promise<void>;
  queryData: <T = any>(
    path: string,
    orderBy: string,
    equalToValue: any
  ) => Promise<T[]>;
  subscribeToData: <T = any>(
    path: string,
    callback: (data: T | null) => void
  ) => () => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
);

export const RealtimeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const values = useMemo(
    () => ({
      getData: async <T = any,>(path: string): Promise<T | null> => {
        const dbRef = ref(realtime, path);
        const snapshot = await get(dbRef);
        return snapshot.exists() ? (snapshot.val() as T) : null;
      },
      setData: async <T = any,>(path: string, data: T): Promise<void> => {
        const dbRef = ref(realtime, path);
        await set(dbRef, data);
      },
      updateData: async <T = any,>(
        path: string,
        data: Partial<T>
      ): Promise<void> => {
        const dbRef = ref(realtime, path);
        await update(dbRef, data as object);
      },
      deleteData: async (path: string): Promise<void> => {
        const dbRef = ref(realtime, path);
        await remove(dbRef);
      },
      queryData: async <T = any,>(
        path: string,
        orderBy: string,
        equalToValue: any
      ): Promise<T[]> => {
        const dbRef = ref(realtime, path);
        const dbQuery = query(
          dbRef,
          orderByChild(orderBy),
          equalTo(equalToValue)
        );
        const snapshot = await get(dbQuery);

        if (!snapshot.exists()) return [];

        const data: T[] = [];
        snapshot.forEach((childSnapshot: DataSnapshot) => {
          data.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          } as T);
        });

        return data;
      },
      subscribeToData: <T = any,>(
        path: string,
        callback: (data: T | null) => void
      ): (() => void) => {
        const dbRef = ref(realtime, path);

        const onValueChange = (snapshot: DataSnapshot) => {
          const data = snapshot.exists() ? snapshot.val() : null;
          callback(data as T | null);
        };

        onValue(dbRef, onValueChange);

        // Return cleanup function
        return () => off(dbRef);
      },
    }),
    [realtime]
  );

  return (
    <RealtimeContext.Provider value={values}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }
  return context;
};
