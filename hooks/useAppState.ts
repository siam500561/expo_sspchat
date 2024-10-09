// app/hooks/useAppState.ts
import { SIAM_ONLINE_ID, SIAM_TYPING_ID } from "@/constants/ids";
import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useStatus } from "./useStatus";

export const useAppState = () => {
  const { handleOnline, handleTyping } = useStatus();

  const [appState, setAppState] = useState<AppStateStatus>(
    AppState.currentState
  );
  const [isInitialRun, setIsInitialRun] = useState(true);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        // App is back to the foreground
        handleOnline(SIAM_ONLINE_ID, true);
      } else if (
        appState === "active" &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to the background
        handleOnline(SIAM_ONLINE_ID, false);
        handleTyping(SIAM_TYPING_ID, false);
      }
      setAppState(nextAppState);
    };

    if (isInitialRun && appState === "active") {
      // Run online logic when the app is first opened only if it's in the foreground
      handleOnline(SIAM_ONLINE_ID, true);
    }

    setIsInitialRun(false);

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cleanup the listener on unmount
    return () => {
      subscription.remove();
    };
  }, [appState, isInitialRun, handleOnline]);

  return null;
};
