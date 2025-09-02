import { Tabs, useNavigation, useRouter } from "expo-router";
import { Home, User } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Settings } from "@/lib/icons/settings";
import { History } from "@/lib/icons/history";
import { UserRoundPlus } from "@/lib/icons/user-round-plus";
import { UserProfilePhoto } from "@/components/views/user-profile-photo";
import { cn } from "@/lib/utils";

export default function TabLayout() {
  const { push } = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "white",
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={18} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <UserProfilePhoto
              className={cn(
                "size-6",
                focused && "size-6 border-white rounded-full border-2"
              )}
            />
          ),
          headerShown: true,

          headerTitle: "",
          headerRight: () => (
            <View className="flex-row items-center gap-4 mr-4">
              <TouchableOpacity onPress={() => push("/history")}>
                <History className="size-4 text-foreground" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => push("/settings")}>
                <Settings className="size-4 text-foreground" />
              </TouchableOpacity>
            </View>
          ),
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => push("/add-user")}
              className="ml-4"
            >
              <UserRoundPlus className="size-4 text-foreground" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
