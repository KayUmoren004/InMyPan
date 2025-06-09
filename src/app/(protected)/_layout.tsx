import { Redirect, usePathname } from "expo-router";
import { useAuth } from "@/hooks/contexts/firebase/use-auth";
import { Slot } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { useFirestore } from "@/hooks/contexts/firebase/use-firestore";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { user: authUser, loading: authLoading } = useAuth();
  const { getDocument } = useFirestore();
  const [dbUser, setDbUser] = useState<any | null>(null); // ← type appropriately
  const [dbLoading, setDbLoading] = useState(false);
  const pathname = usePathname();

  console.log("User @ProtectedLayout", authUser);
  console.log("DB User @ProtectedLayout", dbUser);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!authUser) {
        setDbUser(null);
        return;
      }

      setDbLoading(true);
      const doc = await getDocument("users", authUser.uid);
      if (isMounted) {
        setDbUser(doc ?? null);
        setDbLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [authUser, getDocument]);

  const loading = authLoading || dbLoading;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" className="text-primary" />
      </View>
    );
  }

  if (!authUser) {
    return <Redirect href="/login" />;
  }

  // Allow access to complete-profile route even without dbUser
  if (!dbUser && !pathname.includes("/actions/complete-profile")) {
    return <Redirect href="/actions/complete-profile" />;
  }

  return (
    <SafeAreaView className="bg-background flex-1">
      <Slot />
    </SafeAreaView>
  );
}
