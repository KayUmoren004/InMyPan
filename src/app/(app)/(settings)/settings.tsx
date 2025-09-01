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
  ChevronLeft,
  ChevronRight,
  Icon,
  LucideIcon,
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
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import * as Sharing from "expo-sharing";

interface SettingsSectionProps {
  title?: string;
  children?: React.ReactNode;
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
        <SettingsSection>
          <EditProfile />
        </SettingsSection>

        <SettingsSection title="Settings">
          {/* Privacy */}
          <SettingsItem
            title="Privacy"
            icon={<Shield size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/privacy" }}
          />
          {/* Notifications */}
          <SettingsItem
            title="Notifications"
            icon={<Bell size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/notifications" }}
            last
          />
        </SettingsSection>
        <SettingsSection title="Features">
          {/* Coming Soon */}
          <SettingsItem
            title="Coming Soon"
            icon={<CircleDotDashed size={20} color="white" />}
            disabled
            last
          />
        </SettingsSection>
        <SettingsSection title="Under the Hood">
          {/* About */}
          <SettingsItem
            title="About"
            icon={<Info size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/about" }}
          />

          {/* Help */}
          <SettingsItem
            title="Help"
            icon={<HelpCircle size={20} color="white" />}
            action={{ type: "navigate", navigateTo: "/help" }}
          />

          {/* Share */}
          <SettingsItem
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

          {/* Rate Us */}
          <SettingsItem
            title="Rate Us"
            icon={<Star size={20} color="white" />}
            disabled
            last
          />
        </SettingsSection>

        {/* Log Out */}
        <SettingsSection title="Account">
          <SettingsItem
            title="Log Out"
            icon={<LogOut size={20} color="white" />}
            action={{ type: "action", action: handleLogout }}
            chevronHidden
          />

          {/* Delete Account */}
          <SettingsItem
            title="Delete Account"
            className="bg-destructive/50"
            icon={<Trash size={20} color="white" />}
            action={{ type: "action", action: handleDeleteAccount }}
            chevronHidden
            last
          />
        </SettingsSection>

        {/* App Version */}
        <Text className="text-sm text-muted-foreground text-center">
          Version {process.env.EXPO_PUBLIC_APP_VERSION}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const data = [
  { text: "Notifications", systemImage: "bell" },
  { text: "Sound", systemImage: "speaker" },
  { text: "Profile Visibility", systemImage: "eye" },
];

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="flex flex-col gap-2 mb-6">
      <Text className="text-lg text-muted-foreground font-sans">{title}</Text>
      <View className="bg-muted/50 rounded-md">{children}</View>
    </View>
  );
}

interface SettingItemAction {
  type: "navigate" | "action";
  navigateTo?: string;
  action?: () => void;
}

interface SettingsItemProps {
  className?: string;
  title: string;
  titleClassName?: string;
  icon: React.ReactNode;
  iconHidden?: boolean;
  action?: SettingItemAction;
  last?: boolean;
  chevronHidden?: boolean;
  disabled?: boolean;
}

function SettingsItem({
  className,
  title,
  icon,
  action,
  last,
  titleClassName,
  iconHidden,
  chevronHidden,
  disabled,
}: SettingsItemProps) {
  const { push } = useRouter();

  const handlePress = () => {
    if (disabled) return;

    switch (action?.type) {
      case "navigate":
        push(action.navigateTo as string);
        break;
      case "action":
        action.action?.();
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={disabled}>
      <View
        className={cn(
          "flex flex-row items-center justify-between p-4",
          className,
          last && "rounded-b-md",
          !last && "border-b border-muted/50",
          disabled && "opacity-50"
        )}
      >
        <View className="flex flex-row items-center gap-2">
          {!iconHidden && icon}
          <Text className={cn("text-sm text-foreground", titleClassName)}>
            {title}
          </Text>
        </View>
        {!chevronHidden && <ChevronRight size={20} color="white" />}
      </View>
    </TouchableOpacity>
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

  const photoUrl = useMemo(() => {
    return authUser?.photoURL;
  }, [authUser?.photoURL]);

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
          <Avatar alt="User's Avatar" className="size-20">
            <AvatarImage source={{ uri: photoUrl }} />
            <AvatarFallback>
              <Text>{getInitials(fullName)}</Text>
            </AvatarFallback>
          </Avatar>
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
