import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import React from "react";
import { Text, View } from "react-native";

export default function ChatHeader() {
  const isSohanaOnline = useQuery(api.online.get)?.sohana?.online;

  return (
    <View className="py-3 px-6 mt-8 items-center">
      <Text className={"font-outfit_medium text-2xl"}>Chats</Text>
      <Text
        className={cn(
          "text-xs font-outfit_regular mt-1",
          isSohanaOnline ? "text-green-500" : "text-red-500"
        )}
      >
        Sohana is {isSohanaOnline ? "online" : "offline"}
      </Text>
    </View>
  );
}
