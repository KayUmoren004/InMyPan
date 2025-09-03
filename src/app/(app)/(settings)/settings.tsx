"use client";

import { View, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import {
  ChevronLeft,
  Shield,
  Bell,
  CircleDotDashed,
  Info,
  HelpCircle,
  Share,
  Star,
  LogOut,
  Trash,
  Pencil,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { Section, SectionItem } from "@/components/ui/section";
import { UserProfilePhoto } from "@/components/views/user-profile-photo";

export default function Settings() {
  const { logout } = useEnhancedAuth();
  const router = useRouter();

  // Settings state
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [profileVisible, setProfileVisible] = useState(true);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Not implemented",
              "Account deletion will be implemented soon."
            );
          },
        },
      ]
    );
  };

  const { authUser } = useEnhancedAuth();

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 ">
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold ">Settings</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 flex-col px-4 gap-6">
        <Section>
          <EditProfile />
        </Section>

        <Section title="Settings">
          <SectionItem
            title="Privacy"
            icon={<Shield size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/privacy" }}
          />
          <SectionItem
            title="Notifications"
            icon={<Bell size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/notifications" }}
          />
        </Section>

        <Section title="Features">
          <SectionItem
            title="Coming Soon"
            icon={<CircleDotDashed size={20} color="white" />}
            disabled
          />
        </Section>

        <Section title="Under the Hood">
          <SectionItem
            title="About"
            icon={<Info size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/about" }}
          />
          <SectionItem
            title="Help"
            icon={<HelpCircle size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/help" }}
          />
          <SectionItem
            title="Share"
            icon={<Share size={20} color="white" />}
            action={{
              type: "action",
              action: async () => {
                const canShare = await Sharing.isAvailableAsync();

                const shareUrl = authUser?.username
                  ? `https://www.share.inmypan.com/u/${authUser?.username}`
                  : `https://www.inmypan.com`;

                if (canShare) {
                  await Sharing.shareAsync(shareUrl, {
                    dialogTitle: "Share InMyPan",
                    mimeType: "text/plain",
                  });
                }
              },
            }}
          />
          <SectionItem
            title="Rate Us"
            icon={<Star size={20} color="white" />}
            disabled
          />
        </Section>

        <Section title="Account">
          <SectionItem
            title="Log Out"
            icon={<LogOut size={20} color="white" />}
            action={{ type: "action", action: handleLogout }}
            showChevron={false}
          />
          <SectionItem
            title="Delete Account"
            className="bg-destructive/50"
            icon={<Trash size={20} color="white" />}
            action={{ type: "action", action: handleDeleteAccount }}
            showChevron={false}
          />
        </Section>

        {/* App Version */}
        <Text className="text-sm text-muted-foreground text-center">
          Version {process.env.EXPO_PUBLIC_APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function EditProfile() {
  const { authUser } = useEnhancedAuth();
  const { replace } = useRouter();

  const fullName = useMemo(() => {
    const given = authUser?.displayName?.givenName || "";
    const family = authUser?.displayName?.familyName || "";
    return `${given} ${family}`.trim();
  }, [authUser?.displayName?.familyName, authUser?.displayName?.givenName]);

  return (
    <TouchableOpacity
      onPress={() =>
        replace({
          pathname: "/edit-profile",
          params: {
            previousPath: "/settings",
          },
        })
      }
    >
      <View className="flex flex-row items-center justify-between py-2 px-4 ">
        <View className="flex flex-row items-center justify-start gap-4">
          <UserProfilePhoto className="size-20" />
          <View className="flex flex-col">
            <View className="flex flex-row items-center justify-start 2">
              <Text className="font-bold text-xl">{fullName}</Text>
            </View>
            <Text className="text-sm text-muted-foreground">
              {authUser?.username ?? authUser?.email}
            </Text>
          </View>
        </View>

        <View className="flex flex-row items-center justify-center">
          <Pencil size={20} color="white" strokeWidth={0.8} />
        </View>
      </View>
    </TouchableOpacity>
  );
}
