import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { wp } from "@/lib/dimensions";
import { cn } from "@/lib/utils";
import { useChat } from "@/store/useChat";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  ImageLoadEventData,
  NativeSyntheticEvent,
  PanResponder,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  message: Doc<"messages">;
  isTyping?: boolean;
  isMe: boolean;
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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
    },
    onPanResponderMove: (_, gestureState) => {
      if (
        gestureState.dx > 0 ||
        (isMe && !message.imageUrl && gestureState.dx < 0)
      ) {
        translateX.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx >= rightSwipeThreshold) {
        useChat.setState({
          reply_message: message.text,
          message_for_update: "",
          message_for_update_id: "" as any,
        });
      } else if (
        isMe &&
        !message.imageUrl &&
        gestureState.dx <= leftSwipeThreshold
      ) {
        // Handle left swipe action for user's messages (except images)
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
  };

  const handleLongPress = () => {
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

  if (message.imageUrl) {
    return (
      <Image
        source={{ uri: message.imageUrl }}
        style={{ width: "75%", aspectRatio }}
        resizeMode="contain"
        onLoad={handleImageLoad}
        className={cn(
          "rounded-3xl mx-2",
          isMe ? "rounded-br-none self-end" : "rounded-tl-none self-start"
        )}
      />
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
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.7}
      >
        <View
          className={cn(
            "rounded-3xl p-4 my-[0.15rem] mx-2",
            isMe ? "bg-blue-500 rounded-br-none" : "bg-gray-100 rounded-tl-none"
          )}
          style={{ maxWidth: wp(90) }}
        >
          {message.replyingMessage && !isTyping && (
            <View
              className={cn(
                "border-l-2 rounded-3xl p-3 mb-2",
                isMe
                  ? "border-white/90 bg-white/5"
                  : "border-gray-700 bg-black/5"
              )}
            >
              <Text
                className={cn(
                  "font-outfit_regular text-xs",
                  isMe ? "text-white/80" : "text-gray-500"
                )}
              >
                {message.replyingMessage}
              </Text>
            </View>
          )}

          {isTyping ? (
            <View className="flex-row">
              <View
                className={cn(
                  "h-2 w-2 rounded-full bg-gray-400 mr-1 animate-pulse",
                  isMe && "bg-white"
                )}
              />
              <View
                className={cn(
                  "h-2 w-2 rounded-full bg-gray-400 mr-1 animate-pulse",
                  isMe && "bg-white"
                )}
              />
              <View
                className={cn(
                  "h-2 w-2 rounded-full bg-gray-400 mr-1 animate-pulse",
                  isMe && "bg-white"
                )}
              />
            </View>
          ) : (
            <Text
              className={cn(
                "text-lg font-outfit_regular",
                isMe ? "text-white" : "text-gray-800"
              )}
            >
              {message.text}
            </Text>
          )}

          <Text
            className={cn(
              "font-outfit_regular text-[0.675rem] mt-2",
              isMe ? "text-white/70 text-right" : "text-gray-800 text-left",
              isTyping && "hidden"
            )}
          >
            {formatDateString(message._creationTime.toString())}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default ChatBubble;
