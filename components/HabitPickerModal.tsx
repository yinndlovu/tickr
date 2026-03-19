import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  FlatList,
} from "react-native";

// internal
import { AppText } from "./AppText";
import { useTheme } from "../context/ThemeContext";
import { Habit } from "../types/habit";

interface Props {
  isVisible: boolean;
  habits: Habit[];
  onClose: () => void;
  onSelect: (id: string) => void;
  currentHabitId: string;
}

const HabitPickerModal: React.FC<Props> = ({
  isVisible,
  habits,
  onClose,
  onSelect,
  currentHabitId,
}) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={[styles.sheet, { backgroundColor: theme.card }]}>
          <View style={[styles.handle, { backgroundColor: theme.accent }]} />

          <AppText variant="bold" style={[styles.title, { color: theme.text }]}>
            Switch Main Tracker
          </AppText>

          <FlatList
            data={habits}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isSelected = item.id === currentHabitId;
              return (
                <TouchableOpacity
                  style={[
                    styles.item,
                    isSelected && { backgroundColor: theme.primary + "20" },
                  ]}
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.itemText,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <Text style={{ color: theme.primary }}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
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
    paddingBottom: 40,
    maxHeight: "50%",
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default HabitPickerModal;
