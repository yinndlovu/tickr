import React from "react";
import { View, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// internal
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";

const SettingsScreen: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { timeDisplayMode, setTimeDisplayMode } = usePreferences();
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

        <View
          style={[
            styles.row,
            {
              backgroundColor: theme.card,
              borderColor: theme.accent,
              marginTop: 12,
              alignItems: "flex-start",
            },
          ]}
        >
          <View style={[styles.labelGroup, { paddingTop: 2 }]}>
            <Ionicons name="time-outline" size={20} color={theme.primary} />
            <View style={{ gap: 4 }}>
              <AppText
                variant="medium"
                style={[styles.rowText, { color: theme.text }]}
              >
                Time display
              </AppText>
              <AppText variant="light" style={{ color: theme.subtext, fontSize: 12 }}>
                Choose how progress is shown
              </AppText>
            </View>
          </View>

          <View style={styles.choiceColumn}>
            <TouchableOpacity
              onPress={() => setTimeDisplayMode("days_hours")}
              style={[
                styles.choice,
                {
                  borderColor: theme.accent,
                  backgroundColor:
                    timeDisplayMode === "days_hours"
                      ? theme.primary + "20"
                      : "transparent",
                },
              ]}
            >
              <AppText
                variant="medium"
                style={{ color: timeDisplayMode === "days_hours" ? theme.primary : theme.text }}
              >
                67 days • 3 hrs
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTimeDisplayMode("months_days_hours")}
              style={[
                styles.choice,
                {
                  borderColor: theme.accent,
                  backgroundColor:
                    timeDisplayMode === "months_days_hours"
                      ? theme.primary + "20"
                      : "transparent",
                },
              ]}
            >
              <AppText
                variant="medium"
                style={{
                  color:
                    timeDisplayMode === "months_days_hours"
                      ? theme.primary
                      : theme.text,
                }}
              >
                2 months 5 days • 3 hrs
              </AppText>
            </TouchableOpacity>
          </View>
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
  choiceColumn: {
    gap: 10,
    alignItems: "flex-end",
  },
  choice: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 170,
    alignItems: "center",
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
