import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type TimeDisplayMode = "days_hours" | "months_days_hours";

type PreferencesContextType = {
  timeDisplayMode: TimeDisplayMode;
  setTimeDisplayMode: (mode: TimeDisplayMode) => void;
  isPreferencesLoaded: boolean;
};

const STORAGE_KEYS = {
  timeDisplayMode: "preferences.timeDisplayMode",
} as const;

const PreferencesContext = createContext<PreferencesContextType | undefined>(
  undefined,
);

export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [timeDisplayMode, setTimeDisplayModeState] =
    useState<TimeDisplayMode>("days_hours");
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.timeDisplayMode);
        if (!isMounted) return;
        if (stored === "days_hours" || stored === "months_days_hours") {
          setTimeDisplayModeState(stored);
        }
      } finally {
        if (isMounted) setIsPreferencesLoaded(true);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const setTimeDisplayMode = (mode: TimeDisplayMode) => {
    setTimeDisplayModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.timeDisplayMode, mode).catch(() => {});
  };

  return (
    <PreferencesContext.Provider
      value={{ timeDisplayMode, setTimeDisplayMode, isPreferencesLoaded }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context)
    throw new Error("usePreferences must be used within PreferencesProvider");
  return context;
};
