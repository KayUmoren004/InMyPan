import { createContext, useContext, useCallback, ReactNode } from "react";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";

interface DeepLinkingContextValue {
  handleDeepLink: (url: string) => void;
}

const DeepLinkingContext = createContext<DeepLinkingContextValue | undefined>(
  undefined
);

interface DeepLinkingProviderProps {
  children: ReactNode;
}

// ROUTES
const DEEP_LINKING_ROUTES = {
  resetPassword: "/actions/forgot-password/forgot-password-check-email",
  recoverEmail: "/actions/forgot-password/forgot-password-email",
  verifyEmail: "/actions/verify-email/verify-email",
};

export function DeepLinkingProvider({ children }: DeepLinkingProviderProps) {
  const { replace } = useRouter();
  const handleDeepLink = useCallback((url: string) => {
    const { hostname, path, queryParams, scheme } = Linking.parse(url);

    console.log(
      `Deep link received - scheme: ${scheme}, hostname: ${hostname}, path: ${path}, params:`,
      queryParams
    );

    // Add deep linking logic here

    if (
      scheme === "in-my-pan" &&
      hostname === "deep-linking" &&
      queryParams &&
      Object.keys(queryParams).length > 0
    ) {
      console.log("QUERY PARAMS", queryParams);
      const mode = queryParams?.mode;
      if (mode) {
        console.log("mode", mode);
        replace({
          pathname:
            DEEP_LINKING_ROUTES[mode as keyof typeof DEEP_LINKING_ROUTES],
          params: {
            ...queryParams,
          },
        });
      } else replace("/");
    } else {
      console.log("NO QUERY PARAMS");
      replace("/");
    }
  }, []);

  return (
    <DeepLinkingContext.Provider value={{ handleDeepLink }}>
      {children}
    </DeepLinkingContext.Provider>
  );
}

export function useDeepLinkingHandler() {
  const context = useContext(DeepLinkingContext);

  if (!context) {
    throw new Error(
      "useDeepLinkingHandler must be used within a DeepLinkingProvider"
    );
  }

  return context;
}
