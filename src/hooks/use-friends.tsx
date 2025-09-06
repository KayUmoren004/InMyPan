
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { firestore } from "../../lib/firebase-config";
import { useUser } from "../contexts/use-user"; // Assuming you have a user context

export const useFriends = () => {
  const { user } = useUser();

  return useQuery({
    queryKey: ["friends", user?.uid],
    queryFn: () => {
      if (!user?.uid) return [];

      const q = query(
        collection(firestore, `users/${user.uid}/friends`),
        where("status", "in", ["accepted", "pending"])
      );

      return new Promise((resolve) => {
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const friends = snapshot.docs.map((doc) => doc.data());
          resolve(friends);
          unsubscribe();
        });
      });
    },
    enabled: !!user?.uid,
  });
};
