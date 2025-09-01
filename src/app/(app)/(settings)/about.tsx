import { View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Shield,
  Heart,
  Code,
  Users,
  Mail,
  ChevronLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  title: string;
  children: React.ReactNode;
}

function AboutSection({ title, children }: AboutSectionProps) {
  return (
    <View className="flex flex-col gap-2 mb-6">
      <Text className="text-lg text-muted-foreground font-sans">{title}</Text>
      <View className="bg-muted/50 rounded-md">{children}</View>
    </View>
  );
}

interface AboutItemProps {
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  showExternalLink?: boolean;
  last?: boolean;
  disabled?: boolean;
  className?: string;
}

function AboutItem({
  icon,
  title,
  onPress,
  showExternalLink = false,
  className,
  last,
  disabled,
}: AboutItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={cn(
        "flex flex-row items-center justify-between p-4",
        className,
        last && "rounded-b-md",
        !last && "border-b border-muted/50",
        disabled && "opacity-50"
      )}
    >
      <View className="mr-3 text-gray-600 dark:text-gray-400">{icon}</View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </Text>
      </View>
      {showExternalLink && <ExternalLink size={16} color="#6B7280" />}
    </TouchableOpacity>
  );
}

export default function About() {
  const router = useRouter();

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 ">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold">About</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4 mt-6">
        {/* Legal */}
        <AboutSection title="Legal">
          <AboutItem
            icon={<FileText size={20} />}
            title="Terms of Service"
            onPress={() => openLink("https://inmypan.com/terms")}
            showExternalLink={true}
          />
          <AboutItem
            icon={<Shield size={20} />}
            title="Privacy Policy"
            onPress={() => openLink("https://inmypan.com/privacy")}
            showExternalLink={true}
            last
          />
        </AboutSection>

        {/* Support */}
        <AboutSection title="Support">
          <AboutItem
            icon={<Mail size={20} />}
            title="Contact Us"
            onPress={() => openLink("mailto:support@inmypan.com")}
            showExternalLink={true}
          />
          <AboutItem
            icon={<Users size={20} />}
            title="Community"
            onPress={() => openLink("https://community.inmypan.com")}
            showExternalLink={true}
            last
          />
        </AboutSection>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
      <View className="bg-background rounded-lg p-4">
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} InMyPan. All rights reserved.
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
          Made with ❤️ for everyone
        </Text>
      </View>
    </SafeAreaView>
  );
}
