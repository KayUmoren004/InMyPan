
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import algoliasearch from "algoliasearch/lite";
import { useSecuredSearchKey } from "./use-algolia-secured-key";
import { firestore } from "../../lib/firebase-config";
import { collection, query, where, getDocs, orderBy, limit, startAt, endAt } from "firebase/firestore";
import { UserProfile } from "../../components/types/user-types";

const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  });

  return debouncedValue;
};

export const useUserSearch = (searchQuery: string, friendIds: Set<string>) => {
  const debouncedQuery = useDebounce(searchQuery, 300);
  const { data: securedKey, error: keyError } = useSecuredSearchKey();

  const algoliaClient = useMemo(() => {
    if (securedKey?.key) {
      return algoliasearch("YOUR_ALGOLIA_APP_ID", securedKey.key);
    }
    return null;
  }, [securedKey]);

  const algoliaSearch = async () => {
    if (!algoliaClient || !debouncedQuery) {
      return [];
    }
    const index = algoliaClient.initIndex("users");
    const { hits } = await index.search<UserProfile>(debouncedQuery, {
      hitsPerPage: 20,
    });
    return hits.filter((hit) => !friendIds.has(hit.objectID));
  };

  const firestoreSearch = async () => {
    if (!debouncedQuery) {
      return [];
    }

    const usernameQuery = query(
      collection(firestore, "users"),
      orderBy("username_lower"),
      startAt(debouncedQuery.toLowerCase()),
      endAt(debouncedQuery.toLowerCase() + "\uf8ff"),
      limit(10)
    );

    const displayNameQuery = query(
      collection(firestore, "users"),
      orderBy("displayName_lower"),
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
    }

    processSnap(usernameSnap);
    processSnap(displayNameSnap);

    return Array.from(results.values());
  };

  return useQuery({
    queryKey: ["user-search", debouncedQuery],
    queryFn: algoliaClient ? algoliaSearch : firestoreSearch,
    enabled: !!debouncedQuery,
  });
};
