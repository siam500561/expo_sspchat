import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { useQuery } from "convex/react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function ChatHeader() {
  const isSohanaOnline = useQuery(api.online.get)?.sohana?.online;
  const { theme, toggleTheme } = useTheme();

  return (
    <TouchableOpacity onPress={toggleTheme} style={styles.container}>
      <Text
        style={[
          styles.statusText,
          { color: theme.text },
          isSohanaOnline ? styles.onlineText : styles.offlineText,
        ]}
      >
        Sohana is {isSohanaOnline ? "online" : "offline"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 42, // Increased from 16 to 60 to move the text down
    paddingBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  onlineText: {
    color: "#22c55e", // green-500
  },
  offlineText: {
    color: "#ef4444", // red-500
  },
});
