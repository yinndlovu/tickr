// external
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { ReactNode, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// contexts
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { AuthProvider } from "./context/AuthContext";
import { HabitsProvider } from "./context/HabitsContext";
import { SyncProvider } from "./context/SyncContext";

// screens
import HomeScreen from "./screens/HomeScreen";
import SettingsScreen from "./screens/SettingsScreen";
import SignInScreen from "./screens/SignInScreen";
import SignUpScreen from "./screens/SignUpScreen";
import NewHabitScreen from "./screens/NewHabitScreen";

// components
import SyncChoiceModal from "./components/SyncChoiceModal";

SplashScreen.preventAutoHideAsync();
const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { isDark, theme } = useTheme();

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen
            name="NewHabit"
            component={NewHabitScreen}
            options={{
              presentation: "transparentModal",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <SyncChoiceModal />
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
};

type NewType = {
  onLayout: () => Promise<void> | void;
  children: ReactNode;
};

const RootView = ({ onLayout, children }: NewType) => {
  const { theme } = useTheme();

  return (
    <View
      style={{ flex: 1, backgroundColor: theme.background }}
      onLayout={onLayout}
    >
      {children}
    </View>
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
    <ThemeProvider>
      <SafeAreaProvider>
        <RootView onLayout={onLayoutRootView}>
          <PreferencesProvider>
            <AuthProvider>
              <HabitsProvider>
                <SyncProvider>
                  <AppContent />
                </SyncProvider>
              </HabitsProvider>
            </AuthProvider>
          </PreferencesProvider>
        </RootView>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
