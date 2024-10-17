import ChatBubble from "@/components/chat-bubble";
import ChatHeader from "@/components/chat-header";
import ChatInput from "@/components/chat-input";
import { api } from "@/convex/_generated/api";
import { useAppState } from "@/hooks/useAppState";
import usePushNotifications from "@/hooks/usePushNotifications";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function Index() {
  useAppState();
  usePushNotifications();

  const { results, loadMore, status } = usePaginatedQuery(
    api.message.get,
    {},
    {
      initialNumItems: 50,
    }
  );
  const isSohanaTyping = useQuery(api.typing.get)?.find(
    (user) => user.username === "Sohana"
  )?.typing;

  const renderLoader = () => {
    if (status === "LoadingMore") {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color="black" size="small" />
        </View>
      );
    }
    return null;
  };

  const handleLoadMore = () => {
    if (status === "CanLoadMore") {
      loadMore(20);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ChatHeader />

      <View style={styles.messageContainer}>
        {status === "LoadingFirstPage" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="black" size="large" />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatBubble message={item} isMe={item.username === "Siam"} />
            )}
            showsVerticalScrollIndicator={false}
            inverted
            keyboardShouldPersistTaps="handled"
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderLoader}
            ListHeaderComponent={() => (
              <View>
                {isSohanaTyping && (
                  <ChatBubble
                    message={results[0]}
                    isTyping={isSohanaTyping}
                    isMe={false}
                  />
                )}
              </View>
            )}
          />
        )}
      </View>

      <ChatInput />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  messageContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
