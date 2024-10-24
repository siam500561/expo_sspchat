import ChatBubble from "@/components/chat-bubble";
import ChatHeader from "@/components/chat-header";
import ChatInput from "@/components/chat-input";
import { api } from "@/convex/_generated/api";
import { useAppState } from "@/hooks/useAppState";
import usePushNotifications from "@/hooks/usePushNotifications";
import { useTheme } from "@/hooks/useTheme";
import { FlashList } from "@shopify/flash-list";
import { usePaginatedQuery, useQuery } from "convex/react";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

function Chat() {
  useAppState();
  usePushNotifications();

  const { results, loadMore, status } = usePaginatedQuery(
    api.message.get,
    {},
    {
      initialNumItems: 20,
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

  const renderMessage = React.useCallback(
    ({ item, index }: { item: any; index: number }) => {
      const isFirstInGroup =
        index === results.length - 1 ||
        results[index + 1].username !== item.username;
      const isLastInGroup =
        index === 0 || results[index - 1].username !== item.username;

      return (
        <ChatBubble
          message={item}
          isMe={item.username === "Siam"}
          isFirstInGroup={isFirstInGroup}
          isLastInGroup={isLastInGroup}
        />
      );
    },
    [results]
  );

  const ListHeaderComponent = React.useCallback(
    () => (
      <View>
        {!!sohana_typing?.text.length && (
          <ChatBubble
            message={results[0]}
            isTyping={sohana_typing?.text.length > 0}
            isMe={false}
            isFirstInGroup={true}
            isLastInGroup={true}
          />
        )}
      </View>
    ),
    [sohana_typing?.text, results]
  );

  const ListFooterComponent = React.useCallback(
    () => renderLoader(theme),
    [theme, status]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={styles.messageContainer}>
        {status === "LoadingFirstPage" ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={theme.text} size="large" />
          </View>
        ) : (
          <>
            <LinearGradient
              colors={[
                theme.dark ? "rgba(0,0,0,0.95)" : "rgba(255,255,255,0.95)",
                theme.dark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                theme.dark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
                "transparent",
              ]}
              style={styles.gradientOverlay}
            />
            <ChatHeader />
            <FlashList
              data={results}
              renderItem={renderMessage}
              estimatedItemSize={100}
              inverted
              keyboardShouldPersistTaps="handled"
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={ListFooterComponent}
              ListHeaderComponent={ListHeaderComponent}
            />
          </>
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
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 1,
  },
});
