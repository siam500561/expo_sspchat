import { SIAM_TYPING_ID } from "@/constants/ids";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useStatus } from "@/hooks/useStatus";
import { useChat } from "@/store/useChat";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import uuid from "react-native-uuid";

export default function ChatInput() {
  const [typedMessage, setTypedMessage] = useState("");
  const { reply_message, message_for_update, message_for_update_id } =
    useChat();

  const textInputRef = useRef<TextInput>(null);
  const { handleTyping } = useStatus();

  const sendMessage = useMutation(api.message.send).withOptimisticUpdate(
    (localStore, args) => {
      const existingMessages = localStore.getQuery(api.message.get_mobile);

      if (existingMessages !== undefined && args.format === "text") {
        const now = Date.now();

        const newMessage: Doc<"messages"> = {
          _id: uuid.v4() as Id<"messages">,
          _creationTime: now,
          format: args.format,
          text: args.text,
          username: args.username,
          replyingMessage: args.replyingMessage,
        };

        // Add new message optimistically
        localStore.setQuery(api.message.get_mobile, {}, [
          newMessage,
          ...existingMessages,
        ]);
      }
    }
  );
  const updateMessageMutation = useMutation(
    api.message.update
  ).withOptimisticUpdate((localStore, args) => {
    const existingMessages = localStore.getQuery(api.message.get_mobile);
    if (existingMessages !== undefined) {
      localStore.setQuery(
        api.message.get_mobile,
        {},
        existingMessages.map((message) => {
          if (message._id === args._id) {
            return { ...message, text: args.text };
          }
          return message;
        })
      );
    }
  });

  const onSendMessage = async () => {
    if (typedMessage.trim().length === 0) return; // Avoid sending empty messages

    // Clear input immediately after pressing send
    const tempMessage = typedMessage;
    const tempReplyMessage = reply_message;
    setTypedMessage("");
    useChat.setState({ reply_message: "", message_for_update: "" });

    // Send or update the message mutation
    {
      message_for_update
        ? await updateMessageMutation({
            _id: message_for_update_id,
            text: tempMessage,
          })
        : await sendMessage({
            text: tempMessage,
            format: "text",
            username: "Siam",
            replyingMessage: tempReplyMessage,
          });
    }
  };

  useEffect(() => {
    if (typedMessage.length === 1) {
      handleTyping(SIAM_TYPING_ID, true);
    } else if (typedMessage.length === 0) {
      handleTyping(SIAM_TYPING_ID, false);
    }
  }, [typedMessage]);

  useEffect(() => {
    if (reply_message && textInputRef.current) {
      textInputRef.current.focus();
      return;
    }

    if (message_for_update && textInputRef.current) {
      setTypedMessage(message_for_update);
      textInputRef.current.focus();
      return;
    }

    if (!message_for_update.length) {
      setTypedMessage("");
    }
  }, [reply_message, message_for_update]);

  return (
    <View className="p-2 py-2">
      {!!(reply_message.length || message_for_update.length) && (
        <ReplyOrUpdateIndicator />
      )}
      <View className="flex-row gap-1">
        <TextInput
          ref={textInputRef}
          placeholder="Message"
          className="font-outfit_regular border rounded-full border-gray-300 p-2.5 px-4 flex-1"
          value={typedMessage}
          onChangeText={setTypedMessage}
          onSubmitEditing={onSendMessage}
        />
        <TouchableOpacity onPress={onSendMessage}>
          <View className="bg-gray-200 rounded-full items-center justify-center size-14">
            <Feather name="send" size={16} color="#121212" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ReplyOrUpdateIndicator = () => {
  const { reply_message, message_for_update } = useChat();
  const onClose = () => {
    useChat.setState({ reply_message: "", message_for_update: "" });
  };

  return (
    <View className="flex-row items-center bg-black/5 p-2 rounded-md mb-2">
      <Entypo
        name={reply_message.length ? "reply" : "pencil"}
        size={24}
        color="gray"
      />
      <View className="flex-1 ml-2">
        <Text className="text-sm font-outfit_regular">
          {reply_message ? "Replying to" : "Update"}:
        </Text>
        <Text
          numberOfLines={1}
          className="text-xs text-gray-600 font-outfit_regular"
        >
          {reply_message.length ? reply_message : message_for_update}
        </Text>
      </View>
      <Ionicons name="close" size={20} color="gray" onPress={onClose} />
    </View>
  );
};
