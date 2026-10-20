import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { AppText } from "../components/AppText";
import { GOOGLE_ANDROID_CLIENT_ID } from "../configuration/config";

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { registerWithEmail, signInWithGoogle } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        await signInWithGoogle(idToken);
        navigation.goBack();
      } catch (e) {
        setError(e instanceof Error ? e.message : "could not sign up.");
      }
    };

    handleGoogleResponse();
  }, [response, navigation, signInWithGoogle]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError("fill in your name, email and a password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await registerWithEmail(name, email, password);
      navigation.goBack();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "could not create the account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

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
          create account
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView behavior="padding" style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText
            variant="light"
            style={{ color: theme.subtext, marginBottom: 18 }}
          >
            create an account to back up your data and sync across devices.
          </AppText>

          <TouchableOpacity
            onPress={() => promptAsync()}
            disabled={!request}
            style={[
              styles.socialButton,
              { borderColor: theme.accent, backgroundColor: theme.card },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Sign up with Google"
          >
            <Ionicons name="logo-google" size={18} color={theme.text} />
            <AppText variant="medium" style={{ color: theme.text }}>
              sign up with google
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
              name
            </AppText>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError(null);
              }}
              placeholder="Your name"
              placeholderTextColor={theme.subtext}
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
              email
            </AppText>
            <TextInput
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError(null);
              }}
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
                onChangeText={(t) => {
                  setPassword(t);
                  if (error) setError(null);
                }}
                placeholder="Create a password"
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

          {error ? (
            <AppText
              variant="medium"
              style={{ color: "#D64545", marginTop: 12 }}
            >
              {error}
            </AppText>
          ) : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={[
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: isSubmitting ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <AppText variant="bold" style={{ color: "white" }}>
              {isSubmitting ? "creating account…" : "create account"}
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("SignIn")}
            style={styles.switchRow}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in"
          >
            <AppText variant="light" style={{ color: theme.subtext }}>
              already have an account?
            </AppText>
            <AppText variant="bold" style={{ color: theme.primary }}>
              {" "}
              sign in
            </AppText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  kav: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
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
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.8,
  },
  field: {
    gap: 8,
    marginTop: 12,
  },
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
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
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

export default SignUpScreen;
