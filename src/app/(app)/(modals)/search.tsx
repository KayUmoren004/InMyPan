import React, { useState, useMemo } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useUserSearch } from "../../../hooks/use-user-search";
import { useFriends } from "../../../hooks/use-friends"; // Assume you have a hook to get friends
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
import { getFullNameFromProfile, safeLog } from "@/lib/utils";
import { ReusableProfilePhoto } from "@/components/views/reusable-profile-photo";
import { useUser } from "@/hooks/contexts/use-user";

const SearchScreen = () => {
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const { data: friends } = useFriends();
  const friendIds = useMemo(
    () => new Set(friends?.map((f: any) => f.friendId)),
    [friends]
  );

  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useUserSearch(query, friendIds);

  const renderItem = ({ item }: { item: UserProfile }) => {
    const friendStatus = friends?.find(
      (f: any) => f.friendId === item.id
    )?.status;

    const renderButton = () => {
      if (friendStatus === "accepted") {
        return <Text>Friends</Text>;
      }
      if (friendStatus === "pending") {
        return <Text>Requested</Text>;
      }
      return (
        <Pressable onPress={() => sendFriendRequest(user?.id!, item.id)}>
          <Text>Add Friend</Text>
        </Pressable>
      );
    };

    return (
      // <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
      //   {/* <Avatar source={{ uri: item.avatarUrl }} /> */}
      //   <View style={{ flex: 1, marginLeft: 10 }}>
      //     <Text>
      //       {item?.displayName?.givenName} {item?.displayName?.familyName}
      //     </Text>
      //     <Text>@{item.username}</Text>
      //   </View>
      //   {renderButton()}
      // </View>

      <View className="flex-1 flex-row items-center p-10">
        <View className="flex-1 flex-row items-center justify-between">
          <View className="flex-1 flex-row items-center justify-start gap-4">
            <ReusableProfilePhoto user={item} className="size-16" />
            <View>
              <Text className="font-bold text-xl">
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
  };

  return (
    <View style={{ flex: 1 }}>
      <Input
        placeholder="Search for users..."
        value={query}
        onChangeText={setQuery}
        style={{ padding: 10, margin: 10, borderWidth: 1, borderRadius: 5 }}
      />
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
