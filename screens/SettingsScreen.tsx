import React from "react";
import { View, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// internal
import { useTheme } from "../context/ThemeContext";
import { AppText } from "../components/AppText";

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <AppText
          variant="bold"
          style={[styles.headerTitle, { color: theme.text }]}
        >
          Settings
        </AppText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <View
          style={[
            styles.row,
            { backgroundColor: theme.card, borderColor: theme.accent },
          ]}
        >
          <View style={styles.labelGroup}>
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={20}
              color={theme.primary}
            />
            <AppText
              variant="medium"
              style={[styles.rowText, { color: theme.text }]}
            >
              Dark Mode
            </AppText>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.accent, true: theme.primary }}
          />
        </View>
      </View>

      <AppText variant="light" style={styles.version}>
        Version 1.0.0
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  labelGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowText: {
    fontSize: 16,
  },
  version: {
    textAlign: "center",
    marginTop: "auto",
    marginBottom: 20,
    opacity: 0.5,
  },
});

export default SettingsScreen;
