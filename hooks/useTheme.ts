import { useEffect } from "react";
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
  headerBackground: "transparent", // Slightly lighter than background
  text: "#e2e8f0",
  bubbleMe: "#7646ff", // Purple color for dark theme
  bubbleOther: "#2a2a2a", // Slightly lighter than background
  textMe: "#ffffff",
  textOther: "#e2e8f0",
  timeOther: "#a0aec0", // Lighter color for better visibility
  inputBackground: "#1e1e1e", // Same as bubbleOther for consistency
  inputBorder: "#333", // Slightly off-white for dark mode
};

type Theme = typeof lightTheme;

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: darkTheme, // Changed this line to use darkTheme as the default
  toggleTheme: () =>
    set((state) => ({ theme: state.theme.dark ? lightTheme : darkTheme })),
}));

export const useTheme = () => {
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    StatusBar.setBarStyle(theme.dark ? "light-content" : "dark-content");
    StatusBar.setBackgroundColor(theme.headerBackground);
  }, [theme]);

  return { theme, toggleTheme };
};
