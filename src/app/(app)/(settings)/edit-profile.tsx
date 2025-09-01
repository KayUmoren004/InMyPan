import { View, ScrollView, TouchableOpacity, Alert, Image } from "react-native";
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
} from "lucide-react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const editProfileSchema = z.object({
  givenName: z.string().min(2, "First name must be at least 2 characters"),
  familyName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(200, "Bio must be less than 200 characters").optional(),
});

type EditProfileSchema = z.infer<typeof editProfileSchema>;

export default function EditProfile() {
  const { authUser, updateProfile } = useEnhancedAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | undefined>(
    authUser?.photoURL || undefined
  );
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EditProfileSchema>({
    defaultValues: {
      givenName: authUser?.displayName?.givenName || "",
      familyName: authUser?.displayName?.familyName || "",
      email: authUser?.email || "",
      phone: "",
      dateOfBirth: "",
      location: "",
      bio: "",
    },
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your photo library."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your camera."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: EditProfileSchema) => {
    setIsLoading(true);
    try {
      await updateProfile({
        displayName: {
          givenName: data.givenName,
          familyName: data.familyName,
        },
        photoURL: profileImage,
      });

      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Profile
        </Text>
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid || isLoading}
        >
          <Save
            size={24}
            color={isValid && !isLoading ? "#3B82F6" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Profile Image Section */}
        <View className="items-center py-6">
          <View className="relative">
            <View className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                onPress={takePhoto}
                className="bg-blue-500 p-2 rounded-full mr-2"
              >
                <Camera size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className="bg-blue-500 p-2 rounded-full"
              >
                <ImageIcon size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setProfileImage(undefined)}
            className="mt-2"
          >
            <Text className="text-red-500 text-sm">Remove photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First Name
            </Text>
            <Controller
              control={control}
              name="givenName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your first name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Name
            </Text>
            <Controller
              control={control}
              name="familyName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your last name"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.familyName?.message}
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number (Optional)
            </Text>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your phone number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date of Birth (Optional)
            </Text>
            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="MM/DD/YYYY"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location (Optional)
            </Text>
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Enter your location"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio (Optional)
            </Text>
            <Controller
              control={control}
              name="bio"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Tell us about yourself..."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  error={errors.bio?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Save Button */}
        <View className="py-6">
          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid || isLoading}
            className="w-full"
          >
            <Text className="text-white font-semibold">
              {isLoading ? "Saving..." : "Save Changes"}
            </Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
