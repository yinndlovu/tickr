import React, { useState } from "react";
import { StyleSheet, View, FlatList, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { usePreferences } from "../context/PreferencesContext";
import { useHabits } from "../context/HabitsContext";
import { AppText } from "../components/AppText";

// contents
import HabitPickerModal from "../components/HabitPickerModal";
import CountdownHero from "../components/CountdownHero";
import NewHabitModal from "../components/NewHabitModal";
import ProfileModal from "../components/ProfileModal";
import { formatHabitDuration } from "../utils/timeDisplay";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { theme, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { timeDisplayMode } = usePreferences();
  const { habits, mainHabitId, setMainHabitId, addHabit } = useHabits();

  // use states
  const [isModalVisible, setModalVisible] = useState(false);
  const [isNewHabitModalVisible, setIsNewHabitModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const mainHabit = habits.find((h) => h.id === mainHabitId) || habits[0];
  const otherHabits = habits.filter((h) => h.id !== mainHabitId);

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
        contentContainerStyle={[
          styles.scrollContent,
          habits.length === 0 && { flexGrow: 1 },
        ]}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.topRow}>
              <AppText
                variant="bold"
                style={[styles.title, { color: theme.text }]}
              >
                progress
              </AppText>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  onPress={() => setIsProfileModalVisible(true)}
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

            {habits.length > 0 && mainHabit ? (
              <CountdownHero
                habit={mainHabit}
                onOpenPicker={() => setModalVisible(true)}
              />
            ) : (
              <View
                style={[
                  styles.emptyHero,
                  { backgroundColor: theme.card, borderColor: theme.accent },
                ]}
              >
                <AppText
                  variant="bold"
                  style={{ color: theme.text, fontSize: 18 }}
                >
                  start tracking something
                </AppText>
                <AppText
                  variant="light"
                  style={{
                    color: theme.subtext,
                    marginTop: 6,
                    textAlign: "center",
                  }}
                >
                  add your first tracker to see your progress here.
                </AppText>
                <TouchableOpacity
                  onPress={() => setIsNewHabitModalVisible(true)}
                  style={[styles.emptyCta, { backgroundColor: theme.primary }]}
                  accessibilityRole="button"
                  accessibilityLabel="Add your first tracker"
                >
                  <Ionicons name="add" size={18} color="white" />
                  <AppText variant="bold" style={{ color: "white" }}>
                    add tracker
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            {habits.length > 0 ? (
              <View style={styles.sectionRow}>
                <AppText
                  variant="medium"
                  style={[
                    styles.sectionRowLabel,
                    { color: theme.subtext },
                  ]}
                >
                  other habits
                </AppText>
                <TouchableOpacity
                  onPress={() => setIsNewHabitModalVisible(true)}
                  style={styles.addButton}
                  accessibilityRole="button"
                  accessibilityLabel="Add tracker"
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={theme.subtext}
                  />
                </TouchableOpacity>
              </View>
            ) : null}
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
        habits={habits}
        currentHabitId={mainHabitId}
        onClose={() => setModalVisible(false)}
        onSelect={(id) => setMainHabitId(id)}
      />

      <NewHabitModal
        isVisible={isNewHabitModalVisible}
        onClose={() => setIsNewHabitModalVisible(false)}
        onCreate={addHabit}
      />

      <ProfileModal
        isVisible={isProfileModalVisible}
        onClose={() => setIsProfileModalVisible(false)}
        onSignIn={() => {
          setIsProfileModalVisible(false);
          navigation.navigate("SignIn");
        }}
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
  sectionRowLabel: {
    fontSize: 12,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 30,
    marginBottom: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyHero: {
    width: "92%",
    borderRadius: 25,
    borderWidth: 1,
    paddingVertical: 26,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  emptyCta: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
