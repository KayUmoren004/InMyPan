import { useDeepLinkingHandler } from "@/hooks/contexts/use-deep-linking-handler";
import { Slot } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect } from "react";

export default function DeepLinkingLayout() {
  const { handleDeepLink } = useDeepLinkingHandler();
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      handleDeepLink(url);
    }
  }, [handleDeepLink, url]);

  return <Slot />;
}
