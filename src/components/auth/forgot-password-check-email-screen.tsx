import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useKeyboard } from "@/lib/keyboard";
import { AppIcon } from "@/lib/icons/app-icon";
import {
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1 } from "@/components/ui/typography";
import { useCallback, useEffect, useState } from "react";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { useAnimationState, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import {
  type ForgotPasswordCheckEmailSchema,
  forgotPasswordCheckEmailSchema,
} from "@/lib/zod-validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/lib/icons/loader";
import * as Linking from "expo-linking";
import { safeLog } from "@/lib/utils";

type ForgotPasswordCheckEmailParams = {
  mode: "resetPassword";
  oobCode: string;
  apiKey: string;
  continueUrl?: string;
};

export default function ForgotPasswordCheckEmailScreen() {
  const { push } = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { top, bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const url = Linking.useURL();

  const { mode, oobCode, apiKey, continueUrl } =
    useLocalSearchParams<ForgotPasswordCheckEmailParams>();

  safeLog("log", "Processing password reset request");
  safeLog("log", "Resending verification code");

  const [textHeight, setTextHeight] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const onTextLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) =>
      setTextHeight(e.nativeEvent.layout.height),
    []
  );

  const banner = useAnimationState({
    expanded: { translateY: 0, scale: 1 },
    collapsed: { translateY: -0.09 * windowHeight, scale: 1 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 2.8 },
  });

  useEffect(() => {
    banner.transitionTo(isKeyboardVisible ? "collapsed" : "expanded");
    cta.transitionTo(isKeyboardVisible ? "raised" : "resting");
  }, [isKeyboardVisible, keyboardHeight]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Form
  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordCheckEmailSchema>({
    defaultValues: {
      authCode: "",
    },
    resolver: zodResolver(forgotPasswordCheckEmailSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (url) {
      const { hostname, path, queryParams } = Linking.parse(url);

      safeLog(
        "log",
        `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
          queryParams
        )}`
      );

      if (mode === "resetPassword") {
        setValue("authCode", oobCode as string);
        trigger("authCode");
      }
    }
  }, [url, mode, oobCode, apiKey, continueUrl]);

  // Resend code handler
  const handleResendCode = useCallback(async () => {
    try {
      safeLog("log", `Resending code to: ${params.email}`);

      // Here you would typically call your API to resend the code
      // Example: await resendPasswordResetCode(params.email);

      setResendCooldown(60); // 60 second cooldown
      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email."
      );
    } catch (error) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  }, [params.email]);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: ForgotPasswordCheckEmailSchema) => {
      try {
        safeLog(
          "log",
          `Verifying auth code: ${data.authCode}, for email: ${params.email}`
        );

        // Here you would typically call your API to verify the code
        // Example: const isValid = await verifyPasswordResetCode(params.email, data.authCode);

        // For demo purposes, let's assume any 6-digit code is valid
        if (data.authCode.length === 6) {
          // Navigate to password reset screen
          push({
            pathname: "/actions/forgot-password/forgot-password-password",
            params: {
              email: params.email,
              authCode: data.authCode,
            },
          });
        } else {
          Alert.alert("Invalid Code", "Please enter a valid 6-digit code.");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to verify code. Please try again.");
      }
    },
    [push, params.email]
  );

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
            Check your email.{" "}
            <H1 className="text-neutral-400 font-medium tracking-widest">
              We sent a 6-digit code to {params.email}.
            </H1>
          </H1>
        </View>
      </MotiView>

      {/* Bottom */}
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
            className="w-full flex-1"
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              className="my-2 items-center gap-2 w-full"
            >
              {/* Auth Code Input */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="authCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Enter 6-digit code"
                      className="w-full text-center text-2xl tracking-widest"
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      autoComplete="sms-otp"
                      autoCorrect={false}
                      returnKeyType="go"
                      maxLength={6}
                      value={value}
                      onChangeText={(text) =>
                        onChange(text.replace(/[^0-9]/g, ""))
                      }
                      onBlur={onBlur}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                {errors.authCode && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.authCode.message}
                  </Text>
                )}
              </View>

              <Button
                variant="default"
                className="w-full flex-row items-center justify-center mt-4"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting && (
                  <Loader className="size-6 mr-2 animate-spin" />
                )}
                <Text className="text-foreground">Verify Code</Text>
              </Button>

              {/* Resend Code */}
              <View className="w-full items-center">
                {resendCooldown > 0 ? (
                  <Text className="text-neutral-500 text-sm">
                    Resend code in {resendCooldown} seconds
                  </Text>
                ) : (
                  <Button variant="link" onPress={handleResendCode}>
                    <Text className="text-primary">Resend Code</Text>
                  </Button>
                )}
              </View>
            </KeyboardAvoidingView>
          </MotiView>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-foreground">
            Wrong email?{" "}
            <Link
              href="/actions/forgot-password/forgot-password-email"
              className="text-primary"
            >
              <Text className="text-primary">Go back</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
