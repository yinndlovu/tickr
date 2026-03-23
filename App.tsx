import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// contexts
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { HabitsProvider } from "./context/HabitsContext";

// screens
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";

SplashScreen.preventAutoHideAsync();
const Stack = createStackNavigator();

const AppContent = () => {
  const { isDark, theme } = useTheme();

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      </NavigationContainer>

      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
};

export default function App() {
  const { theme } = useTheme();

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
    <View
      style={{ flex: 1, backgroundColor: theme.background }}
      onLayout={onLayoutRootView}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <PreferencesProvider>
            <HabitsProvider>
              <AppContent />
            </HabitsProvider>
          </PreferencesProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
}
