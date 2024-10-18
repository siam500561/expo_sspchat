import { SIAM_TYPING_ID } from "@/constants/ids";
import { api } from "@/convex/_generated/api";
import { useStatus } from "@/hooks/useStatus";
import { useChat } from "@/store/useChat";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery } from "convex/react";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatInput() {
  const [typedMessage, setTypedMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { reply_message, message_for_update, message_for_update_id } =
    useChat();

  const textInputRef = useRef<TextInput>(null);
  const { handleTyping } = useStatus();

  const sohana_typing = useQuery(api.sohana_typing.get);

  const sendMessage = useMutation(api.message.send);
  const updateMessageMutation = useMutation(api.message.update);

  const onSendMessage = async () => {
    if (typedMessage.trim().length === 0 || isSending) return;
    setIsSending(true);

    const tempMessage = typedMessage;
    const tempReplyMessage = reply_message;
    setTypedMessage("");
    useChat.setState({ reply_message: "", message_for_update: "" });

    try {
      if (message_for_update) {
        await updateMessageMutation({
          _id: message_for_update_id,
          text: tempMessage.trim(),
        });
      } else {
        await sendMessage({
          text: tempMessage.trim(),
          format: "text",
          username: "Siam",
          replyingMessage: tempReplyMessage,
        });
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    } else if (message_for_update && textInputRef.current) {
      setTypedMessage(message_for_update);
      textInputRef.current.focus();
    }
  }, [reply_message, message_for_update]);

  const handleClose = (isReply: boolean) => {
    if (!isReply) {
      // If closing an update, clear the typed message
      setTypedMessage("");
    }
    useChat.setState({ reply_message: "", message_for_update: "" });
  };

  return (
    <View style={styles.container}>
      {!!sohana_typing?.text.length && (
        <Text
          style={{
            fontFamily: "Outfit_400Regular",
            fontSize: 11,
            marginBottom: 6,
            textAlign: "center",
            color: "gray",
          }}
        >
          {sohana_typing?.text}
        </Text>
      )}
      {!!(reply_message.length || message_for_update.length) && (
        <ReplyOrUpdateIndicator onClose={handleClose} />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          placeholder="Message"
          style={styles.textInput}
          value={typedMessage}
          onChangeText={setTypedMessage}
          onSubmitEditing={onSendMessage}
          multiline={true}
        />
        <TouchableOpacity
          onPress={onSendMessage}
          style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
          disabled={isSending}
        >
          <View style={styles.sendButtonInner}>
            {isSending ? (
              <ActivityIndicator size="small" color="#1e1e1e" />
            ) : (
              <Feather name="send" size={16} color="#1e1e1e" />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ReplyOrUpdateIndicator = ({
  onClose,
}: {
  onClose: (isReply: boolean) => void;
}) => {
  const { reply_message, message_for_update } = useChat();
  const isReply = !!reply_message.length;

  return (
    <View style={styles.indicatorContainer}>
      <Entypo name={isReply ? "reply" : "pencil"} size={16} color="gray" />
      <View style={styles.indicatorTextContainer}>
        <Text style={styles.indicatorTitle}>
          {isReply ? "Replying to" : "Update"}:
        </Text>
        <Text numberOfLines={1} style={styles.indicatorMessage}>
          {isReply ? reply_message : message_for_update}
        </Text>
      </View>
      <Ionicons
        name="close"
        size={20}
        color="gray"
        onPress={() => onClose(isReply)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sendButtonDisabled: {
    opacity: 0.5,
  },
  container: {
    padding: 8,
    paddingVertical: 8,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 4,
  },
  textInput: {
    fontFamily: "Outfit_400Regular",
    borderWidth: 1,
    borderRadius: 32,
    borderColor: "#d1d5db",
    padding: 10,
    paddingHorizontal: 16,
    flex: 1,
    backgroundColor: "white",
    maxHeight: 100,
    textAlignVertical: "center",
  },
  sendButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
  },
  sendButtonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#e5e7eb",
    borderRadius: 24,
    padding: 10,
    paddingBottom: 16,
    paddingRight: 16,
    marginBottom: -8,
    zIndex: -1,
  },
  indicatorTextContainer: {
    flex: 1,
    marginLeft: 8,
  },
  indicatorTitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  indicatorMessage: {
    fontSize: 12,
    color: "#4b5563",
    fontFamily: "Outfit_400Regular",
  },
});
