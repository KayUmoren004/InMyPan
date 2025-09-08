import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useUserSearch } from "../../../hooks/use-user-search";
import { useFriends } from "../../../hooks/use-friends";
import {
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  unfriend,
  blockFriend,
} from "../../../lib/friends-actions";
import { UserProfile } from "../../../components/types/user-types";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { cn, getFullNameFromProfile, safeLog } from "@/lib/utils";
import { ReusableProfilePhoto } from "@/components/views/reusable-profile-photo";
import { useUser } from "@/hooks/contexts/use-user";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { Search } from "@/lib/icons/search";

const SearchScreen = () => {
  const { user } = useUser();
  const { refetchAuthUser } = useEnhancedAuth();
  const [query, setQuery] = useState("");
  const { data: friends } = useFriends();

  const friendIds = useMemo(() => {
    console.log("Computing friendIds from friends:", friends);
    return new Set(friends?.map((f: any) => f.friendId) || []);
  }, [friends]);

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUserSearch(query, friendIds);

  // Alert to Unfriend
  const handleUnfriend = (item: UserProfile) => {
    Alert.alert("Unfriend", "Are you sure you want to unfriend this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unfriend",
        style: "destructive",
        onPress: async () => {
          try {
            await unfriend(user?.id!, item.id, refetchAuthUser);
            safeLog("log", "User unfriended successfully");
          } catch (error) {
            safeLog("error", "Failed to unfriend user:", error);
            Alert.alert("Error", "Failed to unfriend user. Please try again.");
          }
        },
      },
    ]);
  };

  const handleCancelFriendRequest = (item: UserProfile) => {
    Alert.alert(
      "Cancel Friend Request",
      "Are you sure you want to cancel this friend request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Friend Request",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelFriendRequest(user?.id!, item.id, refetchAuthUser);
              safeLog("log", "Friend request cancelled successfully");
            } catch (error) {
              safeLog("error", "Failed to cancel friend request:", error);
              Alert.alert(
                "Error",
                "Failed to cancel friend request. Please try again."
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = useCallback(
    ({ item }: { item: UserProfile }) => {
      const friendRecord = friends?.find((f: any) => f.friendId === item.id);
      const friendStatus = friendRecord?.status;

      const renderButton = () => {
        return (
          <Pressable
            onPress={async () => {
              if (friendStatus === "accepted") {
                handleUnfriend(item);
              } else if (friendStatus === "pending") {
                handleCancelFriendRequest(item);
              } else {
                try {
                  await sendFriendRequest(user?.id!, item.id, refetchAuthUser);
                  safeLog("log", "Friend request sent successfully");
                } catch (error) {
                  safeLog("error", "Failed to send friend request:", error);
                  Alert.alert(
                    "Error",
                    "Failed to send friend request. Please try again."
                  );
                }
              }
            }}
            className={cn(
              "bg-muted rounded-full p-1 w-16 items-center justify-center",
              (friendStatus === "pending" || friendStatus === "accepted") &&
                "w-fit px-4"
            )}
          >
            <Text className="text-sm font-medium">
              {friendStatus === "accepted"
                ? "Accepted"
                : friendStatus === "pending"
                ? "Requested"
                : "Add"}
            </Text>
          </Pressable>
        );
      };

      return (
        <View className="flex-1 flex-row items-center p-4">
          <View className="flex-1 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center justify-start gap-2">
              <ReusableProfilePhoto user={item} className="size-16" />
              <View>
                <Text className="font-bold text-lg">
                  {item?.displayName?.givenName}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {item?.username ?? item?.email}
                </Text>
              </View>
            </View>

            <View className="flex flex-row items-center justify-center">
              {renderButton()}
            </View>
          </View>
        </View>
      );
    },
    [
      friends,
      handleUnfriend,
      handleCancelFriendRequest,
      user?.id,
      refetchAuthUser,
    ]
  );

  return (
    <View className="flex-1">
      <View className="relative m-4 overflow-visible">
        <Input
          placeholder="Search for users..."
          value={query}
          onChangeText={setQuery}
          className="pl-10"
        />
        <View className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <Search className="text-muted-foreground" size={16} />
        </View>
      </View>
      {isLoading && <ActivityIndicator />}
      {isError && <Text>Error searching for users.</Text>}
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default SearchScreen;
