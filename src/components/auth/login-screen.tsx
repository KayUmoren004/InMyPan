import { Text } from "@/components/ui/text";
import { View } from "react-native";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { useKeyboard } from "@/lib/keyboard";
import { AppIcon } from "@/lib/icons/app-icon";
import {
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  Alert,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H1 } from "@/components/ui/typography";
import { useCallback, useEffect, useState, useRef } from "react";
import { Link, useRouter } from "expo-router";
import { useAnimationState, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { AppleSignInButton } from "./apple-sign-in-button";
import { PasswordInput } from "../ui/password-input";
import { type LoginSchema, loginSchema } from "@/lib/zod-validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/lib/icons/loader";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { safeLog } from "@/lib/utils";

export default function LoginScreen() {
  const { signIn } = useEnhancedAuth();
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { top, bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const passwordInputRef = useRef<TextInput>(null);
  const { replace } = useRouter();

  const [textHeight, setTextHeight] = useState(0);
  const onTextLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) =>
      setTextHeight(e.nativeEvent.layout.height),
    []
  );
  const banner = useAnimationState({
    expanded: { translateY: 0, scale: 1 },
    collapsed: { translateY: -0.12 * windowHeight, scale: 1 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 2 },
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
  } = useForm<LoginSchema>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // Form submission handler
  const onSubmit = useCallback(
    async (data: LoginSchema) => {
      try {
        const cred = await signIn(data.email, data.password);

        if (cred) {
          replace("/home");
        }
      } catch (error) {
        safeLog("error", "Login error");
        Alert.alert("Error", "Invalid email or password");
      }
    },
    [signIn, replace]
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
            Share your plate, your way.{" "}
            <H1 className="text-neutral-400 font-medium tracking-widest">
              Food tastes better when shared.
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
              {/* Email Input with Controller */}
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
                      returnKeyType="next"
                      value={value}
                      onChangeText={(text) => onChange(text.trim())}
                      onBlur={onBlur}
                      onSubmitEditing={() => passwordInputRef.current?.focus()}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Password Input with Controller */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      ref={passwordInputRef}
                      placeholder="Password"
                      parentClassName="w-full"
                      returnKeyType="go"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <Link
                href="/actions/forgot-password/forgot-password-email"
                className="self-end"
              >
                <Text className="text-primary text-sm">Forgot password?</Text>
              </Link>

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
                <Text className="text-foreground">Sign In</Text>
              </Button>
            </KeyboardAvoidingView>
          </MotiView>

          <View className="w-full flex-2 gap-4">
            <View className="w-full flex-row justify-center items-center gap-2">
              <Separator className="w-1/2" />
              <Text className="text-center">or</Text>
              <Separator className="w-1/2" />
            </View>

            <View className="w-full items-center gap-4">
              <AppleSignInButton />
            </View>
          </View>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up/sign-up-email" className="text-primary">
              <Text className="text-primary">Sign up</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
