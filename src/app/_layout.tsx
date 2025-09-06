import "../global.css";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

import {
  type Theme,
  ThemeProvider,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { Platform, View } from "react-native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { AuthNavigationHandler } from "@/components/auth/auth-navigation-handler";
import { DeepLinkingProvider } from "@/hooks/contexts/use-deep-linking-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { colorScheme, isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  const [fontsLoaded, fontError] = useFonts({
    // Geist Mono variants
    "GeistMono-Thin": require("../assets/fonts/geist/mono/GeistMono-Thin.otf"),
    "GeistMono-ThinItalic": require("../assets/fonts/geist/mono/GeistMono-ThinItalic.otf"),
    "GeistMono-ExtraLight": require("../assets/fonts/geist/mono/GeistMono-ExtraLight.otf"),
    "GeistMono-ExtraLightItalic": require("../assets/fonts/geist/mono/GeistMono-ExtraLightItalic.otf"),
    "GeistMono-Light": require("../assets/fonts/geist/mono/GeistMono-Light.otf"),
    "GeistMono-LightItalic": require("../assets/fonts/geist/mono/GeistMono-LightItalic.otf"),
    "GeistMono-Regular": require("../assets/fonts/geist/mono/GeistMono-Regular.otf"),
    "GeistMono-Italic": require("../assets/fonts/geist/mono/GeistMono-Italic.otf"),
    "GeistMono-Medium": require("../assets/fonts/geist/mono/GeistMono-Medium.otf"),
    "GeistMono-MediumItalic": require("../assets/fonts/geist/mono/GeistMono-MediumItalic.otf"),
    "GeistMono-SemiBold": require("../assets/fonts/geist/mono/GeistMono-SemiBold.otf"),
    "GeistMono-SemiBoldItalic": require("../assets/fonts/geist/mono/GeistMono-SemiBoldItalic.otf"),
    "GeistMono-Bold": require("../assets/fonts/geist/mono/GeistMono-Bold.otf"),
    "GeistMono-BoldItalic": require("../assets/fonts/geist/mono/GeistMono-BoldItalic.otf"),
    "GeistMono-ExtraBold": require("../assets/fonts/geist/mono/GeistMono-ExtraBold.otf"),
    "GeistMono-ExtraBoldItalic": require("../assets/fonts/geist/mono/GeistMono-ExtraBoldItalic.otf"),
    "GeistMono-Black": require("../assets/fonts/geist/mono/GeistMono-Black.otf"),
    "GeistMono-BlackItalic": require("../assets/fonts/geist/mono/GeistMono-BlackItalic.otf"),

    // Geist Sans variants
    "Geist-Thin": require("../assets/fonts/geist/sans/Geist-Thin.otf"),
    "Geist-ThinItalic": require("../assets/fonts/geist/sans/Geist-ThinItalic.otf"),
    "Geist-ExtraLight": require("../assets/fonts/geist/sans/Geist-ExtraLight.otf"),
    "Geist-ExtraLightItalic": require("../assets/fonts/geist/sans/Geist-ExtraLightItalic.otf"),
    "Geist-Light": require("../assets/fonts/geist/sans/Geist-Light.otf"),
    "Geist-LightItalic": require("../assets/fonts/geist/sans/Geist-LightItalic.otf"),
    "Geist-Regular": require("../assets/fonts/geist/sans/Geist-Regular.otf"),
    "Geist-RegularItalic": require("../assets/fonts/geist/sans/Geist-RegularItalic.otf"),
    "Geist-Medium": require("../assets/fonts/geist/sans/Geist-Medium.otf"),
    "Geist-MediumItalic": require("../assets/fonts/geist/sans/Geist-MediumItalic.otf"),
    "Geist-SemiBold": require("../assets/fonts/geist/sans/Geist-SemiBold.otf"),
    "Geist-SemiBoldItalic": require("../assets/fonts/geist/sans/Geist-SemiBoldItalic.otf"),
    "Geist-Bold": require("../assets/fonts/geist/sans/Geist-Bold.otf"),
    "Geist-BoldItalic": require("../assets/fonts/geist/sans/Geist-BoldItalic.otf"),
    "Geist-ExtraBold": require("../assets/fonts/geist/sans/Geist-ExtraBold.otf"),
    "Geist-ExtraBoldItalic": require("../assets/fonts/geist/sans/Geist-ExtraBoldItalic.otf"),
    "Geist-Black": require("../assets/fonts/geist/sans/Geist-Black.otf"),
    "Geist-BlackItalic": require("../assets/fonts/geist/sans/Geist-BlackItalic.otf"),
  });

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const queryClient = new QueryClient();

  if (!isColorSchemeLoaded || (!fontsLoaded && !fontError)) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <SafeAreaProvider>
        <DeepLinkingProvider>
          <AuthWrapper>
            <View className={`flex-1 ${isDarkColorScheme ? "dark" : ""}`}>
              <Slot />
              <AuthNavigationHandler />
            </View>
            <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          </AuthWrapper>
        </DeepLinkingProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? React.useEffect
    : React.useLayoutEffect;
