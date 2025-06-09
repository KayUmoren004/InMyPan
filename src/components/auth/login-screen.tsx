import { AppIcon } from "@/lib/icons/app-icon";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  useWindowDimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1 } from "@/components/ui/typography";
import { JSX, useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import AppleSignInButton from "./apple-sign-in-button";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useKeyboard } from "@/lib/keyboard";
import * as AppleAuthentication from "expo-apple-authentication";

import { MotiView, useAnimationState } from "moti";
import { Easing } from "react-native-reanimated";
import { useAuth } from "@/hooks/contexts/firebase/use-auth";
import { useFirestore } from "@/hooks/contexts/firebase/use-firestore";

export default function LoginScreen() {
  const { appleSignIn } = useAuth();
  const { getDocument } = useFirestore();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { push, replace } = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [textHeight, setTextHeight] = useState(0);
  const onTextLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) =>
      setTextHeight(e.nativeEvent.layout.height),
    []
  );

  const banner = useAnimationState({
    expanded: { translateY: 0, scale: 1 },
    collapsed: { translateY: -0.06 * windowHeight, scale: 1 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 9 },
  });

  useEffect(() => {
    banner.transitionTo(isKeyboardVisible ? "collapsed" : "expanded");
    cta.transitionTo(isKeyboardVisible ? "raised" : "resting");
  }, [isKeyboardVisible, keyboardHeight]);

  // Function to handle apple sign in
  const handleAppleSignIn = async () => {
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!appleCredential.identityToken) {
        Alert.alert("Error", "No identity token");
        return;
      }

      const userCredential = await appleSignIn(appleCredential);
      const userFromCredential = userCredential?.user;

      if (!userFromCredential) {
        Alert.alert(
          "Error",
          "No user credential, you will be navigated to the signup screen",
          [
            {
              text: "Cancel",
              onPress: () => {},
              style: "cancel",
            },
            {
              text: "Sign up",
              onPress: () => {
                replace("/signup/signup-email");
              },
            },
          ]
        );
        return;
      }

      const { uid } = userFromCredential;

      // Check if the user already exists in the database
      const user = await getDocument("users", uid);

      console.log("User", user);

      if (!user || user === null || user === undefined) {
        replace("/signup/signup-email");
        return;
      }

      console.log("Navigating to protected");

      replace("/(protected)");
    } catch (e: any) {
      console.log("Error @ handleAppleSignIn", e);
      if (e.code === "ERR_REQUEST_CANCELED") {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        if (
          e.message
            .trim()
            .includes("auth/account-exists-with-different-credential")
        ) {
          Alert.alert(
            "Error",
            "Account already exists with different credential, please sign in with email"
          );
        } else {
          Alert.alert("Error", "Something went wrong");
        }
      }
    }
  };

  return (
    <View className="flex-1 bg-background w-full">
      {/* Top */}
      <MotiView
        state={banner}
        transition={{
          type: "timing",
          easing: Easing.out(Easing.cubic),
        }}
        className={cn(
          "bg-neutral-900 w-full flex-1 justify-end items-start p-12 gap-6"
        )}
        style={{ paddingTop: top }}
      >
        <AppIcon
          size={150}
          className="absolute left-0"
          style={{ bottom: textHeight + 48 }}
        />

        <View className="w-4/5" onLayout={onTextLayout}>
          <H1 className="text-foreground font-medium tracking-widest leading-relaxed">
            Share your plate, your way.{" "}
            <H1 className="text-neutral-400 font-medium tracking-widest">
              Food tastes better when shared.
            </H1>
          </H1>
        </View>
      </MotiView>

      {/*  Bottom  */}

      <View
        className="w-full flex-1 justify-start items-start p-12 gap-12"
        style={{ paddingBottom: bottom }}
      >
        <View className="w-full flex-1 justify-end items-center gap-12">
          <MotiView
            state={cta}
            transition={{
              type: "timing",
              easing: Easing.out(Easing.cubic),
            }}
            className="w-full"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="my-2 items-center gap-4 w-full"
            >
              <Input placeholder="Email" className="w-full" />

              <Button variant="default" className="w-full" size="lg">
                <Text className="text-foreground">Continue with Email</Text>
              </Button>
            </KeyboardAvoidingView>
          </MotiView>

          <View className="w-full flex-row justify-center items-center gap-2">
            <Separator className="w-1/2" />
            <Text className="text-foreground text-center">or</Text>
            <Separator className="w-1/2" />
          </View>

          <View className="w-full items-center gap-4">
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
              }
              cornerRadius={5}
              style={styles.button}
              onPress={handleAppleSignIn}
            />
          </View>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup/signup-email" className="text-primary">
              <Text className="text-primary">Sign up</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "100%",
    height: 50,
  },
});
