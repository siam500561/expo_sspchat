import ChatBubble from "@/components/chat-bubble";
import ChatHeader from "@/components/chat-header";
import ChatInput from "@/components/chat-input";
import { api } from "@/convex/_generated/api";
import { useAppState } from "@/hooks/useAppState";
import { useQuery } from "convex/react";
import { Stack } from "expo-router";
import React from "react";
import { ActivityIndicator, FlatList, View } from "react-native";

export default function Index() {
  useAppState();

  const messages = useQuery(api.message.get_mobile);
  const isSohanaTyping = useQuery(api.typing.get)?.find(
    (user) => user.username === "Sohana"
  )?.typing;

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ChatHeader />

      <View className="flex-1 ">
        {messages === undefined ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="black" size={"large"} />
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
