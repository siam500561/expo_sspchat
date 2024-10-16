import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function ChatHeader() {
  const isSohanaOnline = useQuery(api.online.get)?.sohana?.online;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.statusText,
          isSohanaOnline ? styles.onlineText : styles.offlineText,
        ]}
      >
        Sohana is {isSohanaOnline ? "online" : "offline"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 9,
    paddingHorizontal: 24,
    marginTop: 32,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontFamily: "Outfit_400Regular",
    marginTop: 3,
  },
  onlineText: {
    color: "#22c55e", // green-500
  },
  offlineText: {
    color: "#ef4444", // red-500
  },
});
