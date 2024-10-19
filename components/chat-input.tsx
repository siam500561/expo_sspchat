import { SIAM_TYPING_ID } from "@/constants/ids";
import { api } from "@/convex/_generated/api";
import { useStatus } from "@/hooks/useStatus";
import { useChat } from "@/store/useChat";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation } from "convex/react";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ChatInput({
  sohana_typing,
}: {
  sohana_typing: string | undefined;
}) {
  const [typedMessage, setTypedMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedImages, setSelectedImages] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { reply_message, message_for_update, message_for_update_id } =
    useChat();

  const textInputRef = useRef<TextInput>(null);
  const { handleTyping } = useStatus();

  const sendMessage = useMutation(api.message.send);
  const updateMessageMutation = useMutation(api.message.update);
  const generateUploadUrl = useMutation(api.message.generateUploadUrl);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true, // Enable multiple selection
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
      setPreviewUrls([
        ...previewUrls,
        ...result.assets.map((asset) => asset.uri),
      ]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewUrls];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedImages(newImages);
    setPreviewUrls(newPreviews);
  };

  const onSendMessage = async () => {
    if (
      selectedImages.length === 0 &&
      (typedMessage.trim().length === 0 || isSending)
    )
      return;
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
      } else if (selectedImages.length > 0) {
        for (const image of selectedImages) {
          const postUrl = await generateUploadUrl();
          // Convert the image file to a Blob
          const response = await fetch(image.uri);
          const blob = await response.blob();

          // Upload the image to the generated URL
          const result = await fetch(postUrl, {
            method: "POST",
            headers: { "Content-Type": image.mimeType as string },
            body: blob,
          });

          const { storageId } = await result.json();

          await sendMessage({
            text: "",
            format: "image",
            username: "Siam",
            replyingMessage: tempReplyMessage,
            imageId: storageId,
          });
        }
        setSelectedImages([]);
        setPreviewUrls([]);
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
      {!!!!sohana_typing?.length && (
        <Text
          style={{
            fontFamily: "Outfit_400Regular",
            fontSize: 11,
            marginBottom: 6,
            textAlign: "center",
            color: "gray",
          }}
        >
          {sohana_typing}
        </Text>
      )}

      {previewUrls.length > 0 && (
        <View style={styles.imagePreviewContainer}>
          {previewUrls.map((url, index) => (
            <View key={index} style={styles.imagePreviewWrapper}>
              <Image source={{ uri: url }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {!!(reply_message.length || message_for_update.length) && (
        <ReplyOrUpdateIndicator onClose={handleClose} />
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          onPress={pickImage}
          style={styles.imagePickerButton}
          disabled={!!typedMessage.length}
        >
          <Ionicons name="image" size={24} color="#4b5563" />
        </TouchableOpacity>
        <TextInput
          ref={textInputRef}
          placeholder="Message"
          style={styles.textInput}
          value={typedMessage}
          onChangeText={setTypedMessage}
          onSubmitEditing={onSendMessage}
          multiline={true}
          editable={selectedImages.length === 0}
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
  imagePreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  imagePreviewWrapper: {
    position: "relative",
    margin: 2,
    marginHorizontal: 5,
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 4,
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
  },
  imagePickerButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
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
