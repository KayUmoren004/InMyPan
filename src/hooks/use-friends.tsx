"use client";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase-config";
import { useUser } from "@/hooks/contexts/use-user";

export const useFriends = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ["friends", user?.id],
    queryFn: () => {
      if (!user?.id) return [];

      const q = query(
        collection(firestore, `users/${user.id}/friends`),
        where("status", "in", ["accepted", "pending"])
      );

      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const friends = snapshot.docs.map((doc) => doc.data());
          resolve(friends);
          unsubscribe();
        });
      }) as Promise<any[]>;
    },
    enabled: !!user?.id,
  });
};
