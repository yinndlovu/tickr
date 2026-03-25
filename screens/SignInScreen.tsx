import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

// internal
import { useTheme } from "../context/ThemeContext";
import { AppText } from "../components/AppText";
import { authenticateWithGoogle } from "../services/authService";
import { GOOGLE_ANDROID_CLIENT_ID } from "../configuration/config";

WebBrowser.maybeCompleteAuthSession();

const SignInScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    const handleGoogleResponse = async () => {
      if (response?.type !== "success") return;
      const idToken = response.authentication?.idToken;
      if (!idToken) {
        console.warn("No ID token received");
        return;
      }

      try {
        const data = await authenticateWithGoogle(idToken);
        await AsyncStorage.setItem("token", data.token);
        navigation.goBack();
      } catch (e) {
        console.warn("Google sign-in error", e);
      }
    };

    handleGoogleResponse();
  }, [response, navigation]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText
          variant="bold"
          style={[styles.headerTitle, { color: theme.text }]}
        >
          sign in
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <AppText
          variant="light"
          style={{ color: theme.subtext, marginBottom: 18 }}
        >
          sign in to back up your data and sync across devices.
        </AppText>

        <TouchableOpacity
          onPress={() => promptAsync()}
          disabled={!request}
          style={[
            styles.socialButton,
            { borderColor: theme.accent, backgroundColor: theme.card },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <Ionicons name="logo-google" size={18} color={theme.text} />
          <AppText variant="medium" style={{ color: theme.text }}>
            continue with Google
          </AppText>
        </TouchableOpacity>

        <View style={[styles.dividerRow, { borderColor: theme.accent }]}>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.accent }]}
          />
          <AppText
            variant="light"
            style={{ color: theme.subtext, fontSize: 12 }}
          >
            or
          </AppText>
          <View
            style={[styles.dividerLine, { backgroundColor: theme.accent }]}
          />
        </View>

        <View style={styles.field}>
          <AppText
            variant="medium"
            style={{ color: theme.subtext, fontSize: 12 }}
          >
            email
          </AppText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.subtext}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              { color: theme.text, borderColor: theme.accent },
            ]}
          />
        </View>

        <View style={styles.field}>
          <AppText
            variant="medium"
            style={{ color: theme.subtext, fontSize: 12 }}
          >
            password
          </AppText>
          <View style={[styles.passwordRow, { borderColor: theme.accent }]}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              placeholderTextColor={theme.subtext}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.passwordInput, { color: theme.text }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Hide password" : "Show password"
              }
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={theme.subtext}
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {}}
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          <AppText variant="bold" style={{ color: "white" }}>
            sign in
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate("SignUp")}
          style={styles.switchRow}
          accessibilityRole="button"
          accessibilityLabel="Create account"
        >
          <AppText variant="light" style={{ color: theme.subtext }}>
            don't have an account?
          </AppText>
          <AppText variant="bold" style={{ color: theme.primary }}>
            {" "}
            create one
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20 },
  content: { paddingHorizontal: 20, paddingTop: 10 },
  socialButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 16,
  },
  dividerLine: { flex: 1, height: 1, opacity: 0.8 },
  field: { gap: 8, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  passwordRow: {
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 15 },
  eyeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  switchRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SignInScreen;
