import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useTheme } from "../context/ThemeContext";

// contents
import HabitPickerModal from "../components/HabitPickerModal";
import CountdownHero from "../components/CountdownHero";
import { Habit } from "../types/habit";

// mock data
const MOCK_HABITS: Habit[] = [
  { id: "1", name: "Sobriety", startDate: "2023-05-12T08:00:00" },
  { id: "2", name: "No Caffeine", startDate: "2024-01-20T06:30:00" },
  { id: "3", name: "Social Media Fast", startDate: "2024-03-01T22:00:00" },
];

const HomeScreen: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

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
              <Text style={[styles.title, { color: theme.text }]}>
                Progress
              </Text>
              <TouchableOpacity
                onPress={toggleTheme}
                style={styles.themeToggle}
              >
                <Text style={{ fontSize: 20 }}>
                  {theme.background === "#F8FAFC" ? "🌙" : "☀️"}
                </Text>
              </TouchableOpacity>
            </View>

            <CountdownHero
              habit={mainHabit}
              onOpenPicker={() => setModalVisible(true)}
            />

            <Text style={[styles.sectionLabel, { color: theme.subtext }]}>
              OTHER TRACKERS
            </Text>
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
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.cardDate, { color: theme.subtext }]}>
                Started: {new Date(item.startDate).toLocaleDateString()}
              </Text>
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
  title: {
    fontSize: 28,
    fontWeight: "800",
  },
  themeToggle: {
    padding: 8,
  },
  sectionLabel: {
    alignSelf: "flex-start",
    fontSize: 12,
    fontWeight: "bold",
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
    fontWeight: "600",
  },
  cardDate: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default HomeScreen;
