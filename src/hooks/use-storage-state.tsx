import * as SecureStore from "expo-secure-store";
import * as React from "react";
import { Platform } from "react-native";
import { safeLog } from "@/lib/utils";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return React.useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      safeLog("error", "Local storage is unavailable");
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<any> {
  // Public
  const [state, setState] = useAsyncState<any>();

  // Get
  React.useEffect(() => {
    if (Platform.OS === "web") {
      try {
        if (typeof localStorage !== "undefined") {
          setState(localStorage.getItem(key));
        }
      } catch (e) {
        safeLog("error", "Local storage is unavailable");
      }
    } else {
      SecureStore.getItemAsync(key).then((value) => {
        if (value !== null) {
          setState(JSON.parse(value));
        } else {
          setState(null); // or set to a default value if null is not appropriate
        }
      });
    }
  }, [key]);

  // Set
  const setValue = React.useCallback(
    (value: any) => {
      setState(value);
      setStorageItemAsync(key, JSON.stringify(value));
    },
    [key]
  );

  return [state, setValue];
}
