import { StatusBar } from "react-native";
import { create } from "zustand";

const lightTheme = {
  dark: false,
  background: "#ffffff",
  headerBackground: "#f3f4f6",
  text: "#1f2937",
  bubbleMe: "#3b82f6", // Blue color for light theme
  bubbleOther: "#f3f4f6",
  textMe: "#ffffff",
  textOther: "#1f2937",
  timeOther: "#6b7280",
  inputBackground: "#ffffff",
  inputBorder: "#d1d5db",
};

const darkTheme = {
  dark: true,
  background: "#121212", // Premium black
  headerBackground: "#1e1e1e", // Slightly lighter than background
  text: "#e2e8f0",
  bubbleMe: "#8b5cf6", // Purple color for dark theme
  bubbleOther: "#2a2a2a", // Slightly lighter than background
  textMe: "#ffffff",
  textOther: "#e2e8f0",
  timeOther: "#a0aec0", // Lighter color for better visibility
  inputBackground: "#2a2a2a", // Same as bubbleOther for consistency
  inputBorder: "#3f3f3f", // Slightly off-white for dark mode
};

type Theme = typeof lightTheme;

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}
export const useTheme = create<ThemeState>((set) => ({
  theme: lightTheme,
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme.dark ? lightTheme : darkTheme;
      StatusBar.setBarStyle(newTheme.dark ? "light-content" : "dark-content");
      StatusBar.setBackgroundColor(newTheme.headerBackground);
      return { theme: newTheme };
    }),
}));
