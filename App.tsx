import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useCallback } from "react";

// contexts
import { ThemeProvider, useTheme } from "./context/ThemeContext";

// screens
import HomeScreen from "./screens/HomeScreen";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { isDark } = useTheme();
  return (
    <>
      <HomeScreen />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    "App-Bold": require("./assets/fonts/Inter-Bold.ttf"),
    "App-Regular": require("./assets/fonts/Inter-Regular.ttf"),
    "App-Medium": require("./assets/fonts/Inter-Medium.ttf"),
    "App-Italic": require("./assets/fonts/Inter-Italic.ttf"),
    "App-Light": require("./assets/fonts/Inter-Light.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
