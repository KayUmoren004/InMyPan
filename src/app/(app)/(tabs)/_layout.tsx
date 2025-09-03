import { Tabs, useNavigation, useRouter } from "expo-router";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Settings } from "@/lib/icons/settings";
import { History } from "@/lib/icons/history";
import { UserRoundPlus } from "@/lib/icons/user-round-plus";
import { UserProfilePhoto } from "@/components/views/user-profile-photo";
import { cn } from "@/lib/utils";

import { Notebook } from "@/lib/icons/notebook";
import { Plus } from "@/lib/icons/plus";
import { ChartArea } from "@/lib/icons/chart-area";
import { Home } from "@/lib/icons/home";

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
          tabBarIcon: ({ color }) => <Home color={color} className="size-6" />,
        }}
      />
      <Tabs.Screen
        name="logs"
        options={{
          title: "Logs",
          tabBarIcon: ({ color }) => (
            <Notebook color={color} className="size-6" />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          // tabBarIcon: ({ color }) => <Plus color={color} />,
          tabBarButton: () => (
            <Pressable
              onPress={() => console.log("Main")}
              className="flex-1 flex items-center justify-center"
            >
              <View className="p-2 bg-primary rounded-full flex items-center justify-center size-10">
                <Plus className=" text-primary-foreground" />
              </View>
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <ChartArea color={color} className="size-6" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <UserProfilePhoto
              className={cn(
                "size-7 border-2 border-muted rounded-full",
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
                <Settings className="size-4 text-foreground " />
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
