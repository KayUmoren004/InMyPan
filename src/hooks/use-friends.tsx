"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "@/lib/firebase-config";
import { useUser } from "@/hooks/contexts/use-user";

export const useFriends = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Set up real-time listener for friends
  useEffect(() => {
    if (!user?.id) {
      setFriends([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const q = query(
      collection(firestore, `users/${user.id}/friends`),
      where("status", "in", ["accepted", "pending"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const friendsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          console.log("Friends data updated:", friendsData);
          setFriends(friendsData);
          setIsLoading(false);

          // Also update the query cache for consistency
          queryClient.setQueryData(["friends", user.id], friendsData);
        } catch (err) {
          console.error("Error processing friends snapshot:", err);
          setError(err as Error);
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error in friends listener:", err);
        setError(err as Error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, queryClient]);

  return {
    data: friends,
    isLoading,
    error,
    refetch: async () => {
      // Invalidate and refetch if needed
      await queryClient.invalidateQueries({ queryKey: ["friends", user?.id] });
      return Promise.resolve();
    },
  };
};
