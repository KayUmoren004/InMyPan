
import React, { useState, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { useUserSearch } from "../../hooks/use-user-search";
import { useFriends } from "../../hooks/use-friends"; // Assume you have a hook to get friends
import { sendFriendRequest, acceptFriendRequest, cancelFriendRequest, unfriend, blockFriend } from "../../lib/friends-actions";
import { UserProfile } from "../../components/types/user-types";

const SearchScreen = () => {
  const [query, setQuery] = useState("");
  const { friends } = useFriends();
  const friendIds = useMemo(() => new Set(friends.map((f: any) => f.friendId)), [friends]);

  const { data: users, isLoading, isError } = useUserSearch(query, friendIds);

  const renderItem = ({ item }: { item: UserProfile }) => {
    const friendStatus = friends.find((f: any) => f.friendId === item.id)?.status;

    const renderButton = () => {
      if (friendStatus === "accepted") {
        return <Text>Friends</Text>;
      }
      if (friendStatus === "pending") {
        return <Text>Requested</Text>;
      }
      return <Pressable onPress={() => sendFriendRequest(item.id)}><Text>Add Friend</Text></Pressable>;
    }

    return (
      <View style={{ flexDirection: "row", alignItems: "center", padding: 10 }}>
        {/* <Avatar source={{ uri: item.avatarUrl }} /> */}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text>{item.displayName}</Text>
          <Text>@{item.username}</Text>
        </View>
        {renderButton()}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <TextInput
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
