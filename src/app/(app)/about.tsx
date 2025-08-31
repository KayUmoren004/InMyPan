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
} from "lucide-react-native";
import { useRouter } from "expo-router";

interface AboutSectionProps {
  title: string;
  children: React.ReactNode;
}

function AboutSection({ title, children }: AboutSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface AboutItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showExternalLink?: boolean;
}

function AboutItem({
  icon,
  title,
  subtitle,
  onPress,
  showExternalLink = false,
}: AboutItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center py-4 px-4 rounded-lg mb-2 bg-background"
    >
      <View className="mr-3 text-gray-600 dark:text-gray-400">{icon}</View>
      <View className="flex-1">
        <Text className="font-medium text-gray-900 dark:text-gray-100">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </Text>
        )}
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
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          About
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* App Info */}
        <AboutSection title="App Information">
          <View className="bg-background rounded-lg p-6 items-center">
            <View className="w-20 h-20 bg-blue-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-2xl font-bold">IM</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              InMyPan
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-4">
              Your personal cooking companion
            </Text>
            <Text className="text-sm text-gray-400 dark:text-gray-500">
              Version 1.0.0 • Build 2024.1.1
            </Text>
          </View>
        </AboutSection>

        {/* Legal */}
        <AboutSection title="Legal">
          <AboutItem
            icon={<FileText size={20} />}
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => openLink("https://example.com/terms")}
            showExternalLink={true}
          />
          <AboutItem
            icon={<Shield size={20} />}
            title="Privacy Policy"
            subtitle="Learn how we protect your data"
            onPress={() => openLink("https://example.com/privacy")}
            showExternalLink={true}
          />
        </AboutSection>

        {/* Support */}
        <AboutSection title="Support">
          <AboutItem
            icon={<Mail size={20} />}
            title="Contact Us"
            subtitle="Get in touch with our support team"
            onPress={() => openLink("mailto:support@inmypan.com")}
            showExternalLink={true}
          />
          <AboutItem
            icon={<Users size={20} />}
            title="Community"
            subtitle="Join our community forum"
            onPress={() => openLink("https://community.inmypan.com")}
            showExternalLink={true}
          />
        </AboutSection>

        {/* Development */}
        <AboutSection title="Development">
          <AboutItem
            icon={<Code size={20} />}
            title="Open Source"
            subtitle="View our source code on GitHub"
            onPress={() => openLink("https://github.com/inmypan/app")}
            showExternalLink={true}
          />
          <AboutItem
            icon={<Heart size={20} />}
            title="Contributors"
            subtitle="Meet the team behind InMyPan"
            onPress={() => router.push("/contributors")}
          />
        </AboutSection>

        {/* Credits */}
        <AboutSection title="Credits">
          <View className="bg-background rounded-lg p-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Built with React Native & Expo
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Icons by Lucide React
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Styling with Tailwind CSS
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Authentication powered by Firebase
            </Text>
          </View>
        </AboutSection>

        {/* Copyright */}
        <AboutSection title="Copyright">
          <View className="bg-background rounded-lg p-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
              © 2024 InMyPan. All rights reserved.
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              Made with ❤️ for food lovers everywhere
            </Text>
          </View>
        </AboutSection>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
