import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useTheme } from "@/hooks/useTheme";
import { wp } from "@/lib/dimensions";
import { useChat } from "@/store/useChat";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as MediaLibrary from "expo-media-library";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  ImageLoadEventData,
  Modal,
  NativeSyntheticEvent,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  message: Doc<"messages">;
  isTyping?: boolean;
  isMe: boolean;
};

const downloadImage = async (imageUrl: string) => {
  if (!imageUrl) return;

  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need media library permissions to download the image.");
      return;
    }

    const fileUri = FileSystem.documentDirectory + "downloaded_image.jpg";
    const downloadResumable = FileSystem.createDownloadResumable(
      imageUrl,
      fileUri,
      {}
    );

    const downloaded = await downloadResumable.downloadAsync();

    if (downloaded) {
      try {
        const asset = await MediaLibrary.createAssetAsync(downloaded.uri);
        await MediaLibrary.createAlbumAsync("Downloads", asset, false);
        alert("Image saved to gallery!");
      } catch (error) {
        console.error("Error saving image:", error);
        alert("Failed to save image.");
      }
    }
  } catch (error) {
    console.error("Error downloading image:", error);
    alert("Failed to download image.");
  }
};

function formatDateString(dateString: string): string {
  const dateNumber = Math.floor(Number(dateString));
  const date = new Date(dateNumber);
  const formattedDate = format(date, "h:mm a");
  return formattedDate;
}

const ChatBubble = (props: Props) => {
  const { isTyping, isMe, message } = props;
  const [aspectRatio, setAspectRatio] = useState(1);
  const translateX = useRef(new Animated.Value(0)).current;
  const rightSwipeThreshold = 70;
  const leftSwipeThreshold = -70;
  const deleteMutation = useMutation(api.message.remove).withOptimisticUpdate(
    (localStore, args) => {
      const existingMessages = localStore.getQuery(api.message.get_mobile);
      if (existingMessages !== undefined) {
        localStore.setQuery(
          api.message.get_mobile,
          {},
          existingMessages.filter((message) => message._id !== args._id)
        );
      }
    }
  );
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const { theme } = useTheme();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0.6)).current;

  // Add this useEffect for the fading animation
  React.useEffect(() => {
    if (isImageLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0.6,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.setValue(1);
    }
  }, [isImageLoading, fadeAnim]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx > 0 || (!message.imageUrl && gestureState.dx < 0)) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx >= rightSwipeThreshold) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        useChat.setState({
          reply_message: message.text,
          message_for_update: "",
          message_for_update_id: "" as any,
        });
      } else if (!message.imageUrl && gestureState.dx <= leftSwipeThreshold) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        useChat.setState({
          reply_message: "",
          message_for_update: message.text,
          message_for_update_id: message._id,
        });
      }

      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        friction: 5,
      }).start();
    },
  });

  const handleImageLoad = (event: NativeSyntheticEvent<ImageLoadEventData>) => {
    const { width, height } = event.nativeEvent.source;
    setAspectRatio(width / height);
    setIsImageLoading(false);
  };

  const handleDelete = () => {
    if (!isMe) return;
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteMutation({
              _id: message._id as Id<"messages">,
              imageId: (message.imageId as Id<"_storage">) || undefined,
            }),
        },
      ]
    );
  };

  const handleImageAction = () => {
    if (isMe) {
      handleDelete();
    } else {
      Alert.alert("Download Photo", "Do you want to download this photo?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Download",
          onPress: () => downloadImage(message.imageUrl!),
        },
      ]);
    }
  };

  const handleImagePress = () => {
    setIsImageModalVisible(true);
  };

  const handleImageLongPress = () => {
    if (isMe) {
      handleDelete();
    } else {
      Alert.alert("Download Photo", "Do you want to download this photo?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Download",
          onPress: () => downloadImage(message.imageUrl!),
        },
      ]);
    }
  };

  if (message.imageUrl) {
    return (
      <>
        <TouchableOpacity
          onPress={handleImagePress}
          onLongPress={handleImageLongPress}
          delayLongPress={500}
          style={[
            styles.imageWrapper,
            isMe ? styles.imageWrapperMe : styles.imageWrapperOther,
          ]}
        >
          <View style={[styles.imageContainer, { aspectRatio }]}>
            {isImageLoading && (
              <Animated.View
                style={[styles.skeletonContainer, { opacity: fadeAnim }]}
              >
                <Ionicons
                  name="image-outline"
                  size={24}
                  color={isMe ? theme.textMe : theme.textOther}
                />
              </Animated.View>
            )}
            <Image
              source={{ uri: message.imageUrl }}
              style={[
                styles.image,
                { aspectRatio },
                isImageLoading && styles.hiddenImage,
              ]}
              resizeMode="cover"
              onLoad={handleImageLoad}
            />
          </View>
        </TouchableOpacity>
        <Modal
          visible={isImageModalVisible}
          transparent={true}
          onRequestClose={() => setIsImageModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackground}
            activeOpacity={1}
            onPress={() => setIsImageModalVisible(false)}
          >
            <Image
              source={{ uri: message.imageUrl }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Modal>
      </>
    );
  }

  return (
    <Animated.View
      {...(message.text ? panResponder.panHandlers : {})}
      style={[
        {
          alignSelf: isMe ? "flex-end" : "flex-start",
          transform: [{ translateX }],
        },
      ]}
    >
      <TouchableOpacity
        onLongPress={handleDelete}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.bubble,
            isMe
              ? [styles.bubbleMe, { backgroundColor: theme.bubbleMe }]
              : [styles.bubbleOther, { backgroundColor: theme.bubbleOther }],
            { maxWidth: wp(90) },
          ]}
        >
          {message.replyingMessage && !isTyping && (
            <View
              style={[
                styles.replyContainer,
                isMe ? styles.replyContainerMe : styles.replyContainerOther,
              ]}
            >
              <Text
                style={[
                  styles.replyText,
                  isMe ? styles.replyTextMe : styles.replyTextOther,
                ]}
              >
                {message.replyingMessage}
              </Text>
            </View>
          )}

          {isTyping ? (
            <View style={styles.typingContainer}>
              <View style={[styles.typingDot, isMe && styles.typingDotMe]} />
              <View style={[styles.typingDot, isMe && styles.typingDotMe]} />
              <View style={[styles.typingDot, isMe && styles.typingDotMe]} />
            </View>
          ) : (
            <Text
              style={[
                styles.messageText,
                isMe
                  ? [styles.messageTextMe, { color: theme.textMe }]
                  : [styles.messageTextOther, { color: theme.textOther }],
              ]}
            >
              {message.text}
            </Text>
          )}

          <Text
            style={[
              styles.timestamp,
              isMe
                ? [styles.timestampMe, { color: theme.textMe }]
                : [styles.timestampOther, { color: theme.timeOther }],
              isTyping && styles.hidden,
            ]}
          >
            {formatDateString(message._creationTime.toString())}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  imageMe: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  imageOther: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  bubble: {
    borderRadius: 20,
    padding: 14,
    marginVertical: 1.5,
    marginHorizontal: 8,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  replyContainer: {
    borderLeftWidth: 2,
    borderRadius: 24,
    padding: 12,
    marginBottom: 8,
  },
  replyContainerMe: {
    borderColor: "rgba(255, 255, 255, 0.9)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  replyContainerOther: {
    borderColor: "#374151",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  replyText: {
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
  },
  replyTextMe: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  replyTextOther: {
    color: "#6b7280",
  },
  typingContainer: {
    flexDirection: "row",
  },
  typingDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#9ca3af",
    marginRight: 4,
  },
  typingDotMe: {
    backgroundColor: "white",
  },
  messageText: {
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
    lineHeight: 24,
  },
  messageTextMe: {
    color: "white",
  },
  messageTextOther: {
    color: "#1f2937",
  },
  timestamp: {
    fontFamily: "Outfit_400Regular",
    fontSize: 10.8,
    marginTop: 8,
  },
  timestampMe: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  timestampOther: {
    color: "#1f2937",
    textAlign: "left",
  },
  hidden: {
    display: "none",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  imageContainerLoading: {
    padding: 0, // Remove padding when loading
  },
  imageWrapper: {
    maxWidth: "75%",
    marginVertical: 1.5,
    marginHorizontal: 8,
  },
  imageWrapperMe: {
    alignSelf: "flex-end",
  },
  imageWrapperOther: {
    alignSelf: "flex-start",
  },
  imageContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  skeletonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  hiddenImage: {
    opacity: 0,
  },
});

export default React.memo(ChatBubble);
