import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  image: {
    width: "75%",
    marginVertical: 1.5,
    marginHorizontal: 8,
    borderRadius: 24,
  },
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
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: "#f3f4f6",
    borderBottomLeftRadius: 4,
  },
  // ... (rest of the styles)
});
