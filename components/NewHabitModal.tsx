import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";
import { Habit } from "../types/habit";
import { parseStartDate } from "../utils/parseStartDate";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onCreate: (habit: Habit) => void;
};

const NewHabitModal: React.FC<Props> = ({ isVisible, onClose, onCreate }) => {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const defaultHint = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const reset = () => {
    setName("");
    setStartDate("");
    setNotes("");
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

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
      id: String(Date.now()),
      name: trimmedName,
      startDate: parsed.date.toISOString(),
      notes: notes.trim() ? notes.trim() : undefined,
    };

    onCreate(habit);
    handleClose();
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <AppText variant="bold" style={{ color: theme.text, fontSize: 18 }}>
              Add tracker
            </AppText>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <AppText
              variant="medium"
              style={{ color: theme.subtext, fontSize: 12 }}
            >
              NAME
            </AppText>
            <TextInput
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError(null);
              }}
              placeholder="e.g. No caffeine"
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
              STARTED
            </AppText>
            <TextInput
              value={startDate}
              onChangeText={(t) => {
                setStartDate(t);
                if (error) setError(null);
              }}
              placeholder={`YYYY-MM-DD (e.g. ${defaultHint})`}
              placeholderTextColor={theme.subtext}
              autoCapitalize="none"
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
              NOTES (OPTIONAL)
            </AppText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything you want to remember…"
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
              Create
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
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

export default NewHabitModal;
