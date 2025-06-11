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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1 } from "@/components/ui/typography";
import { useCallback, useEffect, useState } from "react";
import { Link, useRouter } from "expo-router";
import { useAnimationState, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import {
  type ForgotPasswordSchema,
  forgotPasswordSchema,
} from "@/lib/zod-validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/lib/icons/loader";

export default function ForgotPasswordEmailScreen() {
  const { push } = useRouter();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
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
    collapsed: { translateY: -0.05 * windowHeight, scale: 1 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 5 },
  });

  useEffect(() => {
    banner.transitionTo(isKeyboardVisible ? "collapsed" : "expanded");
    cta.transitionTo(isKeyboardVisible ? "raised" : "resting");
  }, [isKeyboardVisible, keyboardHeight]);

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordSchema>({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  });

  // Form submission handler
  const onSubmit = useCallback(
    async (data: ForgotPasswordSchema) => {
      try {
        console.log("Forgot password email:", data.email);

        // Here you would typically call your API to send the reset code
        // Example: await sendPasswordResetCode(data.email);

        // Navigate to check email screen with the email
        push({
          pathname: "/actions/forgot-password/forgot-password-check-email",
          params: { email: data.email },
        });
      } catch (error) {
        console.error("Error sending reset code:", error);
      }
    },
    [push]
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
            Forgot your password?{" "}
            <H1 className="text-neutral-400 font-medium tracking-widest">
              No worries, we'll help you reset it.
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
              {/* Email Input */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      placeholder="Email"
                      className="w-full"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      returnKeyType="go"
                      value={value}
                      onChangeText={(text) => onChange(text.trim())}
                      onBlur={onBlur}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.email.message}
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
                <Text className="text-foreground">Send Reset Code</Text>
              </Button>
            </KeyboardAvoidingView>
          </MotiView>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-foreground">
            Remember your password?{" "}
            <Link href="/sign-in" className="text-primary">
              <Text className="text-primary">Sign in</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
