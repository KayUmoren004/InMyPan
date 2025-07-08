import { Text } from "@/components/ui/text";
import { View, TouchableOpacity, Image, TextInput } from "react-native";
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
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAnimationState, MotiView } from "moti";
import { Easing } from "react-native-reanimated";
import { PasswordInput } from "../ui/password-input";
import {
  type SignUpPasswordSchema,
  signUpPasswordSchema,
} from "@/lib/zod-validation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "@/lib/icons/loader";
import { User } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { ContextMenu } from "@expo/ui/swift-ui";
import { Button as ExpoUiButton } from "@expo/ui/swift-ui";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export default function SignUpPasswordScreen() {
  const { signUp } = useEnhancedAuth();
  const params = useLocalSearchParams<{
    email: string;
    givenName: string;
    familyName: string;
  }>();

  const { isKeyboardVisible, keyboardHeight } = useKeyboard();
  const { top, bottom } = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [textHeight, setTextHeight] = useState(0);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Add ref for confirm password input
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const onTextLayout = useCallback(
    (e: { nativeEvent: { layout: { height: number } } }) =>
      setTextHeight(e.nativeEvent.layout.height),
    []
  );

  const banner = useAnimationState({
    expanded: { translateY: 0, scale: 1 },
    collapsed: { translateY: -0.12 * windowHeight, scale: 1 },
  });

  const avatarAnimation = useAnimationState({
    large: { scale: 1 },
    small: { scale: 0.4 },
  });

  const cta = useAnimationState({
    resting: { translateY: 0 },
    raised: { translateY: -(keyboardHeight - bottom) / 2.5 },
  });

  useEffect(() => {
    banner.transitionTo(isKeyboardVisible ? "collapsed" : "expanded");
    avatarAnimation.transitionTo(isKeyboardVisible ? "small" : "large");
    cta.transitionTo(isKeyboardVisible ? "raised" : "resting");
  }, [isKeyboardVisible, keyboardHeight]);

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<SignUpPasswordSchema>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    resolver: zodResolver(signUpPasswordSchema),
    mode: "onChange",
  });

  const getPermission = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return status;
    }
  }, []);

  // Get Camera Permission
  const getCameraPermission = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      return status;
    }
  }, []);

  // Image picker
  const pickImage = useCallback(async () => {
    try {
      const libraryStatus = await getPermission();

      if (libraryStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need permission to access your photo library."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "livePhotos"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  }, []);

  // Capture Image
  const captureImage = useCallback(async () => {
    try {
      const cameraStatus = await getCameraPermission();

      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need permission to access your camera."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images", "livePhotos"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error capturing image:", error);
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  }, []);

  // Form submission handler
  const onSubmit = useCallback(
    async (data: SignUpPasswordSchema) => {
      try {
        const cred = await signUp(params.email, data.password, {
          displayName: {
            givenName: params.givenName,
            familyName: params.familyName,
          },
          provider: "email",
          ...(profileImage && { photoURL: profileImage }),
        });
      } catch (error) {
        console.log("Error @sign-up-password-screen.tsx", error);
        Alert.alert(
          "Sign Up Error",
          "Failed to create account. Please try again."
        );
      }
    },
    [params, profileImage, signUp]
  );

  const getInitials = useCallback(() => {
    // if (!params.givenName || !params.familyName) {
    //   return "U";
    // }

    // return `${params.givenName.charAt(0)}${params.familyName.charAt(0)}`;

    return "GU";
  }, [params]);

  const url = `https://api.dicebear.com/7.x/initials/svg?seed=${getInitials()}`;

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
          "bg-neutral-900 w-full flex-1 justify-end items-start p-12 gap-6",
          profileImage && "py-6"
        )}
        style={{ paddingTop: top }}
      >
        {!profileImage ? (
          <>
            <AppIcon
              size={150}
              className="absolute left-0"
              style={{ bottom: textHeight + 48 }}
            />

            <View className="w-4/5" onLayout={onTextLayout}>
              <H1 className="text-foreground font-medium tracking-widest leading-relaxed">
                Almost there, {params.givenName ?? "You"}.{" "}
                <H1 className="text-neutral-400 font-medium tracking-widest">
                  Secure your account and add a photo.
                </H1>
              </H1>
            </View>
          </>
        ) : (
          <View className="w-full h-full flex-1 justify-end items-center gap-2 ">
            <MotiView
              state={avatarAnimation}
              transition={{
                type: "timing",
                duration: 300,
                easing: Easing.out(Easing.cubic),
              }}
              className="flex-1 items-center justify-center "
            >
              <Avatar
                alt="User's Avatar"
                className="size-96 rounded-full shadow-lg"
              >
                <AvatarImage source={{ uri: profileImage }} />
                <AvatarFallback>
                  <Text>{getInitials()}</Text>
                </AvatarFallback>
              </Avatar>
            </MotiView>

            <View className="w-full items-end">
              <ExpoUiButton
                systemImage="trash"
                role="destructive"
                onPress={() => setProfileImage(null)}
              >
                Clear
              </ExpoUiButton>
            </View>
          </View>
        )}
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
              {/* Profile Photo Upload with Context Menu */}
              {!profileImage && (
                <ContextMenu style={{ alignSelf: "center", marginBottom: 16 }}>
                  <ContextMenu.Items>
                    {profileImage && (
                      <ExpoUiButton
                        systemImage="trash"
                        role="destructive"
                        onPress={() => setProfileImage(null)}
                      >
                        Remove Photo
                      </ExpoUiButton>
                    )}
                    <ExpoUiButton systemImage="camera" onPress={captureImage}>
                      Take Photo
                    </ExpoUiButton>
                    <ExpoUiButton
                      systemImage="photo.on.rectangle"
                      onPress={pickImage}
                    >
                      Choose from Library
                    </ExpoUiButton>
                  </ContextMenu.Items>
                  <ContextMenu.Trigger>
                    <TouchableOpacity className="w-24 h-24 rounded-full bg-neutral-100 border-2 border-neutral-300 items-center justify-center">
                      <Avatar alt="User's Avatar" className="size-24">
                        <AvatarImage
                          source={{
                            uri: url,
                          }}
                        />
                        <AvatarFallback>
                          <Text className="text-xs text-center p-1">
                            Click to add photo
                          </Text>
                        </AvatarFallback>
                      </Avatar>
                    </TouchableOpacity>
                  </ContextMenu.Trigger>
                </ContextMenu>
              )}

              {/* Password Input */}
              <View className="w-full">
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <PasswordInput
                      placeholder="Password"
                      parentClassName="w-full"
                      returnKeyType="next"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      onSubmitEditing={() =>
                        confirmPasswordInputRef.current?.focus()
                      }
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
                      ref={confirmPasswordInputRef}
                      placeholder="Confirm Password"
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
                className="w-full flex-row items-center justify-center mt-4"
                size="lg"
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting || !isValid}
              >
                {isSubmitting && (
                  <Loader className="size-6 mr-2 animate-spin" />
                )}
                <Text className="text-foreground">Create Account</Text>
              </Button>
            </KeyboardAvoidingView>
          </MotiView>
        </View>

        <View className="my-2 w-full flex-2 justify-end items-center gap-4">
          <Text className="text-center text-sm text-neutral-500 px-4">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </Text>
        </View>
      </View>
    </View>
  );
}
