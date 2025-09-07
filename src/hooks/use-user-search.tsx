import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  liteClient as algoliasearch,
  Hit,
  SearchResponse,
} from "algoliasearch/lite";
import { useSecuredSearchKey } from "./use-algolia-secured-key";
import { firestore } from "@/lib/firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAt,
  endAt,
} from "firebase/firestore";
import { UserProfile } from "@/components/types/user-types";
import { useUser } from "./contexts/use-user";
import { useFirestore } from "./contexts/firebase/use-firestore";

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useUserSearch = (searchQuery: string, friendIds: Set<string>) => {
  const { user } = useUser();
  const { getDocument } = useFirestore();
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: securedKey, error: keyError } = useSecuredSearchKey();

  const algoliaClient = useMemo(() => {
    if (securedKey?.key) {
      return algoliasearch(
        process.env.EXPO_PUBLIC_ALGOLIA_APP_ID || "",
        process.env.EXPO_PUBLIC_ALGOLIA_API_KEY || ""
      );
    }
    return null;
  }, [securedKey]);

  const algoliaSearch = async () => {
    if (!algoliaClient || !debouncedQuery) {
      return [];
    }
    const { results } = await algoliaClient.search<UserProfile>({
      requests: [
        {
          indexName: "fb_SEARCH",
          query: debouncedQuery,
          hitsPerPage: 20,
        },
      ],
    });

    const hits = (results[0] as SearchResponse<UserProfile>)
      ?.hits as Hit<UserProfile>[];

    return hits.filter(
      (hit: Hit<UserProfile>) =>
        !friendIds.has(hit.objectID) && hit.objectID !== user?.id
    );
  };

  const firestoreSearch = async () => {
    if (!debouncedQuery) {
      return [];
    }

    const usernameQuery = query(
      collection(firestore, "users"),
      orderBy("username"),
      startAt(debouncedQuery.toLowerCase()),
      endAt(debouncedQuery.toLowerCase() + "\uf8ff"),
      limit(10)
    );

    const displayNameQuery = query(
      collection(firestore, "users"),
      orderBy("displayName"),
      startAt(debouncedQuery.toLowerCase()),
      endAt(debouncedQuery.toLowerCase() + "\uf8ff"),
      limit(10)
    );

    const [usernameSnap, displayNameSnap] = await Promise.all([
      getDocs(usernameQuery),
      getDocs(displayNameQuery),
    ]);

    const results: Map<string, UserProfile> = new Map();
    const processSnap = (snap: any) => {
      snap.docs.forEach((doc: any) => {
        if (!friendIds.has(doc.id)) {
          const data = doc.data() as UserProfile;
          results.set(doc.id, { ...data, id: doc.id });
        }
      });
    };

    processSnap(usernameSnap);
    processSnap(displayNameSnap);

    return Array.from(results.values());
  };

  const getUserProfiles = async (profiles: Hit<UserProfile>[]) => {
    const userProfiles = await Promise.all(
      profiles.map(async (profile) => {
        const userProfile = await getDocument("users", profile.objectID);
        return userProfile;
      })
    );

    return userProfiles;
  };

  return useQuery({
    queryKey: ["user-search", debouncedQuery],
    queryFn: async () => {
      const profiles = algoliaClient
        ? await algoliaSearch()
        : await firestoreSearch();
      return (await getUserProfiles(
        profiles as Hit<UserProfile>[]
      )) as UserProfile[];
    },
    enabled: !!debouncedQuery,
  });
};
