import { api } from "@/convex/_generated/api";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ChatHeader() {
  const isSohanaOnline = useQuery(api.online.get)?.sohana?.online;
  const { theme, toggleTheme } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.headerBackground }]}
    >
      <Text
        style={[
          styles.statusText,
          isSohanaOnline ? styles.onlineText : styles.offlineText,
        ]}
      >
        Sohana is {isSohanaOnline ? "online" : "offline"}
      </Text>
      <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
        <Ionicons
          name={theme.dark ? "moon" : "sunny"}
          size={20}
          color={theme.text}
        />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    marginTop: 32,
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
  themeToggle: {
    padding: 8,
  },
});
