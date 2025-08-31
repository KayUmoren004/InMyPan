import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import {
  ArrowLeft,
  Bell,
  Palette,
  Shield,
  User,
  HelpCircle,
  Info,
  Moon,
  Sun,
  Smartphone,
  Globe,
  Volume2,
  Eye,
  EyeOff,
  Download,
  Trash2,
} from "lucide-react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        {title}
      </Text>
      {children}
    </View>
  );
}

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  danger?: boolean;
}

function SettingsItem({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
  danger = false,
}: SettingsItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={showSwitch}
      className={`flex-row items-center py-4 px-4 rounded-lg mb-2 ${
        danger ? "bg-red-50 dark:bg-red-900/20" : "bg-background"
      }`}
    >
      <View
        className={`mr-3 ${
          danger ? "text-red-600" : "text-gray-600 dark:text-gray-400"
        }`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className={`font-medium ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-gray-900 dark:text-gray-100"
          }`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </Text>
        )}
      </View>
      {showSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={switchValue ? "#3B82F6" : "#f4f3f4"}
        />
      ) : showChevron ? (
        <Text className="text-gray-400">›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

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

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#6B7280" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">
          Settings
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-4">
        {/* Notifications */}
        <SettingsSection title="Notifications">
          <SettingsItem
            icon={<Bell size={20} />}
            title="Push Notifications"
            subtitle="Receive notifications about updates"
            showSwitch={true}
            switchValue={notificationsEnabled}
            onSwitchChange={setNotificationsEnabled}
          />
          <SettingsItem
            icon={<Volume2 size={20} />}
            title="Sound"
            subtitle="Play sounds for notifications"
            showSwitch={true}
            switchValue={soundEnabled}
            onSwitchChange={setSoundEnabled}
          />
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection title="Appearance">
          <SettingsItem
            icon={<Palette size={20} />}
            title="Theme"
            subtitle={darkMode ? "Dark Mode" : "Light Mode"}
            onPress={() => setDarkMode(!darkMode)}
          />
          <SettingsItem
            icon={darkMode ? <Moon size={20} /> : <Sun size={20} />}
            title="Dark Mode"
            subtitle="Use dark theme"
            showSwitch={true}
            switchValue={darkMode}
            onSwitchChange={setDarkMode}
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsItem
            icon={profileVisible ? <Eye size={20} /> : <EyeOff size={20} />}
            title="Profile Visibility"
            subtitle={
              profileVisible
                ? "Your profile is visible to others"
                : "Your profile is private"
            }
            showSwitch={true}
            switchValue={profileVisible}
            onSwitchChange={setProfileVisible}
          />
          <SettingsItem
            icon={<Shield size={20} />}
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
            onPress={() => router.push("/privacy-settings")}
          />
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem
            icon={<User size={20} />}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => router.push("/edit-profile")}
          />
          <SettingsItem
            icon={<Shield size={20} />}
            title="Change Password"
            subtitle="Update your password"
            onPress={() => router.push("/change-password")}
          />
          <SettingsItem
            icon={<Download size={20} />}
            title="Export Data"
            subtitle="Download your personal data"
            onPress={() => router.push("/export-data")}
          />
        </SettingsSection>

        {/* Support */}
        <SettingsSection title="Support">
          <SettingsItem
            icon={<HelpCircle size={20} />}
            title="Help & Support"
            subtitle="Get help and contact support"
            onPress={() => router.push("/support")}
          />
          <SettingsItem
            icon={<Info size={20} />}
            title="About"
            subtitle="App version and information"
            onPress={() => router.push("/about")}
          />
        </SettingsSection>

        {/* Account Actions */}
        <SettingsSection title="Account Actions">
          <SettingsItem
            icon={<User size={20} />}
            title="Logout"
            subtitle="Sign out of your account"
            onPress={handleLogout}
            danger={false}
          />
          <SettingsItem
            icon={<Trash2 size={20} />}
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            danger={true}
          />
        </SettingsSection>

        {/* App Info */}
        <SettingsSection title="App Information">
          <View className="bg-background rounded-lg p-4">
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Version 1.0.0
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Build 2024.1.1
            </Text>
          </View>
        </SettingsSection>

        {/* Spacer */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
