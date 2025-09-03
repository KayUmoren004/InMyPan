import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  X,
  ChevronLeft,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn, safeLog } from "@/lib/utils";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { Textarea } from "@/components/ui/textarea";

const editProfileSchema = z.object({
  givenName: z.string().min(3, "First name must be at least 2 characters"),
  familyName: z.string().min(3, "Last name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 2 characters"),
  location: z.string().optional(),
  link: z.string().optional(),
  work: z.string().optional(),
  education: z.string().optional(),
  bio: z.string().max(300, "Bio must be less than 300 characters").optional(),
  profileImage: z.string().nullable(),
});

type EditProfileSchema = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const { authUser, updateProfile } = useEnhancedAuth();
  const navigation = useNavigation();
  const { previousPath, animationTypeForReplace } = useLocalSearchParams<{
    previousPath: string;
    animationTypeForReplace: "pop" | "push";
  }>();

  const { replace } = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<EditProfileSchema>({
    defaultValues: {
      givenName: "",
      familyName: "",
      username: "",
      location: "",
      link: "",
      work: "",
      education: "",
      bio: "",
      profileImage: null,
    },
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
  });

  const profileImage = watch("profileImage");

  useIsomorphicLayoutEffect(() => {
    reset({
      givenName: authUser?.displayName?.givenName || "",
      familyName: authUser?.displayName?.familyName || "",
      username: authUser?.username || "",
      location: authUser?.location || "",
      link: authUser?.link || "",
      work: authUser?.work || "",
      education: authUser?.education || "",
      bio: authUser?.bio || "",
      profileImage: authUser?.photoURL || null,
    });
  }, [authUser]);

  useIsomorphicLayoutEffect(() => {
    navigation.setOptions({
      animationTypeForReplace:
        (animationTypeForReplace as "pop" | "push") || "push",
    });
  }, [animationTypeForReplace, navigation]);

  const getPermission = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      return status;
    }
  }, []);

  const getCameraPermission = useCallback(async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      return status;
    }
  }, []);

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
        setValue("profileImage", result.assets[0].uri, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      safeLog("error", "Error picking profile image");
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  }, [getPermission, setValue]);

  console.log(watch());

  const takePhoto = useCallback(async () => {
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
        setValue("profileImage", result.assets[0].uri, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } catch (error) {
      safeLog("error", "Error capturing profile image");
      Alert.alert("Error", "Failed to capture image. Please try again.");
    }
  }, [getCameraPermission, setValue]);

  // Remove image
  const removeImage = useCallback(() => {
    setValue("profileImage", "", { shouldValidate: true });
  }, [setValue]);

  const onSubmit = async (data: EditProfileSchema) => {
    setIsLoading(true);
    try {
      await updateProfile({
        displayName: {
          givenName: data.givenName,
          familyName: data.familyName,
        },
        photoURL: profileImage,
        username: data.username,
        location: data.location,
        link: data.link,
        work: data.work,
        education: data.education,
        bio: data.bio,
      } as any);

      Alert.alert("Success", "Profile updated successfully!");
      replace(previousPath as string);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClassName = cn(
    "border-0 w-3/4",
    errors.givenName && "border-red-500 dark:border-red-500",
    errors.familyName && "border-red-500 dark:border-red-500",
    errors.username && "border-red-500 dark:border-red-500",
    errors.location && "border-red-500 dark:border-red-500",
    errors.link && "border-red-500 dark:border-red-500",
    errors.work && "border-red-500 dark:border-red-500",
    errors.education && "border-red-500 dark:border-red-500",
    errors.bio && "border-red-500 dark:border-red-500"
  );

  const deletePhoto = () => {
    throw new Error("Not implemented");
  };

  // TODO: Dropdown to handle photo action
  const handlePhotoAction = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel", "Photo Library", "Camera", "Delete Photo"],
        destructiveButtonIndex: 3,
        cancelButtonIndex: 0,
        userInterfaceStyle: "dark",
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          pickImage();
        } else if (buttonIndex === 2) {
          takePhoto();
        } else if (buttonIndex === 3) {
          deletePhoto();
        }
      }
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity
          onPress={() => replace(previousPath as string)}
          className="absolute left-4 z-10"
        >
          <View className="flex-row items-center gap-2">
            <Text>Cancel</Text>
          </View>
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Profile
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading || !isDirty}
          className={cn(
            "absolute right-4 z-10",
            (!isValid || isLoading || !isDirty) && "opacity-50"
          )}
        >
          <View className="flex-row items-center gap-2">
            <Text
              className={cn(
                !isValid || (isLoading && "opacity-50") || !isDirty
              )}
            >
              Save
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Image Section */}
        <View className="items-center py-6 mb-6">
          <View className="relative">
            <View className="size-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full items-center justify-center">
                  <User size={32} color="#9CA3AF" />
                </View>
              )}
            </View>

            <View className="absolute bottom-0 right-0 flex-row">
              <TouchableOpacity
                onPress={handlePhotoAction}
                className="bg-white p-2 rounded-full mr-1"
              >
                <Camera size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">First Name</Text>
            <Controller
              control={control}
              name="givenName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="First Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Last Name</Text>
            <Controller
              control={control}
              name="familyName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Last Name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Username</Text>
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Username"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                  editable={false}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-start justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Bio</Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Textarea
                  placeholder="Bio"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={cn(
                    inputClassName,
                    "shadow-none bg-background py-0 px-3 text-lg"
                  )}
                  maxLength={300}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Location</Text>
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Location"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Link</Text>
            <Controller
              control={control}
              name="link"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Link"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                  textContentType="URL"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Education</Text>
            <Controller
              control={control}
              name="education"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Education"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                />
              )}
            />
          </View>

          <View className="flex flex-1 flex-row items-center justify-start border-y border-neutral-800 p-2">
            <Text className="w-1/4">Work</Text>
            <Controller
              control={control}
              name="work"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Work"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  className={inputClassName}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
