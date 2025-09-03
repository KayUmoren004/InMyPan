"use client";

import { View, ScrollView, TouchableOpacity, Linking } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";

import { useRouter } from "expo-router";
import { Section, SectionItem } from "@/components/ui/section";
import { ChevronLeft } from "@/lib/icons/chevron-left";
import { FileText } from "@/lib/icons/file-text";
import { ExternalLink } from "@/lib/icons/external-link";
import { Mail } from "@/lib/icons/mail";
import { UsersRound } from "@/lib/icons/users-round";

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
        <Section title="Legal">
          <SectionItem
            icon={<FileText size={20} className="text-muted-foreground" />}
            title="Terms of Service"
            onPress={() => openLink("https://inmypan.com/terms")}
            leftIcon={
              <ExternalLink size={20} className="text-muted-foreground" />
            }
          />
          <SectionItem
            icon={<FileText size={20} className="text-muted-foreground" />}
            title="Privacy Policy"
            onPress={() => openLink("https://inmypan.com/privacy")}
            leftIcon={
              <ExternalLink size={20} className="text-muted-foreground" />
            }
          />
        </Section>

        <Section title="Support">
          <SectionItem
            icon={<Mail size={20} className="text-muted-foreground" />}
            title="Contact Us"
            onPress={() => openLink("mailto:support@inmypan.com")}
            leftIcon={
              <ExternalLink size={20} className="text-muted-foreground" />
            }
          />
          <SectionItem
            icon={<UsersRound size={20} className="text-muted-foreground" />}
            title="Community"
            onPress={() => openLink("https://community.inmypan.com")}
            leftIcon={
              <ExternalLink size={20} className="text-muted-foreground" />
            }
          />
        </Section>

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
