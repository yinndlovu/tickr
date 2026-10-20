// external
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// internal
import { useTheme } from "../context/ThemeContext";
import { useHabits } from "../context/HabitsContext";
import { AppText } from "../components/AppText";
import { Habit } from "../types/habit";
import { createId } from "../utils/id";
import { parseStartDate } from "../utils/parseStartDate";

const formatYMD = (d: Date) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const NewHabitScreen: React.FC = () => {
  // hook variables
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { addHabit } = useHabits();

  // states
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // handlers
  const handleCreate = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }

    const parsed = parseStartDate(startDate);
    if (!parsed.ok || !parsed.date) {
      setError(parsed.error);
      return;
    }

    const habit: Habit = {
      id: createId(),
      name: trimmedName,
      startDate: parsed.date.toISOString(),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    addHabit(habit);
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior="padding" style={styles.kav}>
        <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom + 16, 40),
            },
          ]}
        >
          <View style={styles.header}>
            <AppText variant="bold" style={{ color: theme.text, fontSize: 18 }}>
              add habit
            </AppText>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
                placeholder="e.g. no caffeine"
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
                started
              </AppText>
              <TouchableOpacity
                onPress={() => setIsDatePickerOpen(true)}
                activeOpacity={0.85}
              >
                <TextInput
                  value={startDate}
                  editable={false}
                  placeholder="yyyy-mm-dd"
                  placeholderTextColor={theme.subtext}
                  autoCapitalize="none"
                  style={[
                    styles.input,
                    { color: theme.text, borderColor: theme.accent },
                  ]}
                />
              </TouchableOpacity>

              {isDatePickerOpen ? (
                <DateTimePicker
                  value={startDate ? new Date(startDate) : new Date()}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  onValueChange={(event, date) => {
                    setStartDate(formatYMD(date));
                    if (error) setError(null);
                  }}
                  onDismiss={() => setIsDatePickerOpen(false)}
                />
              ) : null}
            </View>

            <View style={styles.field}>
              <AppText
                variant="medium"
                style={{ color: theme.subtext, fontSize: 12 }}
              >
                notes (optional)
              </AppText>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="anything you want to remember…"
                placeholderTextColor={theme.subtext}
                multiline
                style={[
                  styles.input,
                  styles.notes,
                  { color: theme.text, borderColor: theme.accent },
                ]}
              />
            </View>

            {error ? (
              <AppText
                variant="medium"
                style={{ color: "#D64545", marginTop: 6 }}
              >
                {error}
              </AppText>
            ) : null}

            <TouchableOpacity
              onPress={handleCreate}
              style={[styles.createButton, { backgroundColor: theme.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Create tracker"
            >
              <AppText variant="bold" style={{ color: "white" }}>
                create
              </AppText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  kav: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
  notes: {
    minHeight: 90,
    textAlignVertical: "top",
  },
  createButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
});

export default NewHabitScreen;
