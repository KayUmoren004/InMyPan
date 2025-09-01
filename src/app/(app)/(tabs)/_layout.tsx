import { Tabs, useNavigation, useRouter } from "expo-router";
import { Home, User } from "lucide-react-native";
import { TouchableOpacity, View } from "react-native";
import { Settings } from "@/lib/icons/settings";
import { History } from "@/lib/icons/history";
import { UserRoundPlus } from "@/lib/icons/user-round-plus";

export default function TabLayout() {
  const { push } = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "coral",
        headerShown: false,
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
          tabBarIcon: ({ color }) => <User size={18} color={color} />,
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
