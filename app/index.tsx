import ChatBubble from "@/components/chat-bubble";
import ChatHeader from "@/components/chat-header";
import ChatInput from "@/components/chat-input";
import { api } from "@/convex/_generated/api";
import { useAppState } from "@/hooks/useAppState";
import usePushNotifications from "@/hooks/usePushNotifications";
import { useMutation, useQuery } from "convex/react";
import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

export default function Index() {
  useAppState();
  const { expoPushToken, permissionGranted } = usePushNotifications();

  const messages = useQuery(api.message.get_mobile);
  const setExpoTokenMutation = useMutation(api.expoToken.set);
  const isSohanaTyping = useQuery(api.typing.get)?.find(
    (user) => user.username === "Sohana"
  )?.typing;

  useEffect(() => {
    if (expoPushToken && permissionGranted) {
      console.log(expoPushToken);
      setExpoTokenMutation({ token: expoPushToken });
    }
  }, [expoPushToken, permissionGranted]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ChatHeader />

      <View style={styles.messageContainer}>
        {messages === undefined ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="black" size="large" />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ChatBubble message={item} isMe={item.username === "Siam"} />
            )}
            showsVerticalScrollIndicator={false}
            inverted
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            keyboardShouldPersistTaps="handled"
            getItemLayout={(_, index) => ({
              length: 60,
              offset: 60 * index,
              index,
            })}
            scrollEventThrottle={16}
            ListHeaderComponent={() => (
              <View>
                {isSohanaTyping && (
                  <ChatBubble
                    message={messages[0]}
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
});
