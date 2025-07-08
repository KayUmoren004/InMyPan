import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAnimationState, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { PasswordInput } from "../ui/password-input";
import {
  type ForgotPasswordNewPasswordSchema,
  forgotPasswordNewPasswordSchema,
} from "@/lib/zod-validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/lib/icons/loader";

export default function ForgotPasswordPasswordScreen() {
  const { replace } = useRouter();
  const params = useLocalSearchParams<{ email: string; authCode: string }>();
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
    collapsed: { translateY: -0.1 * windowHeight, scale: 1 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 2.35 },
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
  } = useForm<ForgotPasswordNewPasswordSchema>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(forgotPasswordNewPasswordSchema),
    mode: "onChange",
  });

  // Form submission handler
  const onSubmit = useCallback(
    async (data: ForgotPasswordNewPasswordSchema) => {
      try {
        console.log(
          "Resetting password for:",
          params.email,
          "with code:",
          params.authCode
        );

        // Here you would typically call your API to reset the password
        // Example: await resetPassword(params.email, params.authCode, data.password);

        Alert.alert(
          "Password Reset Successful",
          "Your password has been reset successfully. You can now sign in with your new password.",
          [
            {
              text: "Sign In",
              onPress: () => replace("/sign-in"),
            },
          ]
        );
      } catch (error) {
        Alert.alert("Error", "Failed to reset password. Please try again.");
      }
    },
    [params.email, params.authCode, replace]
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
            Create new password.{" "}
            <H1 className="text-neutral-400 font-medium tracking-widest">
              Choose a strong password for your account.
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
              {/* Password Input */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      placeholder="New Password"
                      parentClassName="w-full"
                      returnKeyType="next"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      placeholder="Confirm New Password"
                      parentClassName="w-full"
                      returnKeyType="go"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                {errors.confirmPassword && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </View>

              <Button
                variant="default"
                className="w-full flex-row items-center justify-center mt-2"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting && (
                  <Loader className="size-6 mr-2 animate-spin" />
                )}
                <Text className="text-foreground">Reset Password</Text>
              </Button>
            </KeyboardAvoidingView>
          </MotiView>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-center text-sm text-neutral-500 px-4">
            Make sure your password is at least 8 characters long and includes a
            mix of letters, numbers, and symbols.
          </Text>
        </View>
      </View>
    </View>
  );
}
