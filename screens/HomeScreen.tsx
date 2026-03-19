import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { AppText } from "../components/AppText";

// contents
import HabitPickerModal from "../components/HabitPickerModal";
import CountdownHero from "../components/CountdownHero";
import { Habit } from "../types/habit";
import { formatHabitDuration } from "../services/timeDisplay";

// mock data
const MOCK_HABITS: Habit[] = [
  { id: "1", name: "Sobriety", startDate: "2023-05-12T08:00:00" },
  { id: "2", name: "No Caffeine", startDate: "2024-01-20T06:30:00" },
  { id: "3", name: "Social Media Fast", startDate: "2024-03-01T22:00:00" },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { timeDisplayMode } = usePreferences();

  // use states
  const [isModalVisible, setModalVisible] = useState(false);
  const [mainHabitId, setMainHabitId] = useState<string>("1");

  const mainHabit =
    MOCK_HABITS.find((h) => h.id === mainHabitId) || MOCK_HABITS[0];
  const otherHabits = MOCK_HABITS.filter((h) => h.id !== mainHabitId);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FlatList
        data={otherHabits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <AppText
                variant="bold"
                style={[styles.title, { color: theme.text }]}
              >
                Progress
              </AppText>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => {}}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Profile"
                >
                  <Ionicons
                    name="person-outline"
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Settings")}
                  style={styles.iconButton}
                  accessibilityRole="button"
                  accessibilityLabel="Settings"
                >
                  <Ionicons
                    name="settings-outline"
                    size={24}
                    color={theme.text}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <CountdownHero
              habit={mainHabit}
              onOpenPicker={() => setModalVisible(true)}
            />

            <AppText
              variant="medium"
              style={[styles.sectionLabel, { color: theme.subtext }]}
            >
              OTHER TRACKERS
            </AppText>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, borderColor: theme.accent },
            ]}
          >
            <View>
              <AppText
                variant="bold"
                style={[styles.cardTitle, { color: theme.text }]}
              >
                {item.name}
              </AppText>
              <AppText
                variant="light"
                style={[styles.cardDate, { color: theme.subtext }]}
              >
                {formatHabitDuration(item.startDate, timeDisplayMode).text}
              </AppText>
            </View>
          </View>
        )}
      />

      <HabitPickerModal
        isVisible={isModalVisible}
        habits={MOCK_HABITS}
        currentHabitId={mainHabitId}
        onClose={() => setModalVisible(false)}
        onSelect={(id) => setMainHabitId(id)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
  },
  iconButton: {
    width: 56,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggle: {
    padding: 8,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 12,
    marginTop: 30,
    marginBottom: 10,
  },
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 17,
  },
  cardDate: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default HomeScreen;
