import ChatBubble from "@/components/chat-bubble";
import ChatHeader from "@/components/chat-header";
import ChatInput from "@/components/chat-input";
import { api } from "@/convex/_generated/api";
import { useAppState } from "@/hooks/useAppState";
import usePushNotifications from "@/hooks/usePushNotifications";
import { useTheme } from "@/hooks/useTheme";
import { usePaginatedQuery, useQuery } from "convex/react";
import { Stack } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";

function Chat() {
  useAppState();
  usePushNotifications();

  const { results, loadMore, status } = usePaginatedQuery(
    api.message.get,
    {},
    {
      initialNumItems: 50,
    }
  );

  const sohana_typing = useQuery(api.sohana_typing.get);

  const renderLoader = (theme: any) => {
    if (status === "LoadingMore") {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator color={theme.text} size="small" />
        </View>
      );
    }
    return null;
  };

  const handleLoadMore = () => {
    if (status === "CanLoadMore") {
      loadMore(100);
    }
  };

  const { theme } = useTheme();

  // Set status bar color when the component mounts
  React.useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(theme.headerBackground);
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ChatHeader />

      <View style={styles.messageContainer}>
        {status === "LoadingFirstPage" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.text} size="large" />
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
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => renderLoader(theme)}
            ListHeaderComponent={() => (
              <View>
                {!!sohana_typing?.text.length && (
                  <ChatBubble
                    message={results[0]}
                    isTyping={sohana_typing?.text.length > 0}
                    isMe={false}
                  />
                )}
              </View>
            )}
          />
        )}
      </View>

      <ChatInput sohana_typing={sohana_typing?.text} />
    </View>
  );
}

export default Chat;

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
