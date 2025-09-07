import { useQuery } from "@tanstack/react-query";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase-config";

const getAlgoliaSecuredKey = httpsCallable(functions, "getAlgoliaSecuredKey");

export const useSecuredSearchKey = () => {
  return useQuery({
    queryKey: ["algolia-secured-key"],
    queryFn: async () => {
      const result = await getAlgoliaSecuredKey();
      return result.data as { key: string };
    },
    // The key is valid for 15 minutes, so we can set a stale time
    // to avoid refetching too often.
    staleTime: 14 * 60 * 1000, // 14 minutes
    refetchInterval: 14 * 60 * 1000, // Refetch every 14 minutes
  });
};
