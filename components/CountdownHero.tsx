import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { intervalToDuration } from "date-fns";
import { Habit } from "../types/habit";
import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";

interface Props {
  habit: Habit;
  onOpenPicker: () => void;
}

const CountdownHero: React.FC<Props> = ({ habit, onOpenPicker }) => {
  const { theme } = useTheme();

  const getTime = () =>
    intervalToDuration({
      start: new Date(habit.startDate),
      end: new Date(),
    });

  const [duration, setDuration] = useState(getTime());

  useEffect(() => {
    const timer = setInterval(() => setDuration(getTime()), 60000);
    return () => clearInterval(timer);
  }, [habit]);

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <TouchableOpacity style={styles.dropdown} onPress={onOpenPicker}>
        <AppText variant="medium" style={styles.habitTitle}>
          {habit.name} ▾
        </AppText>
      </TouchableOpacity>

      <View style={styles.row}>
        <TimeBlock value={duration.days || 0} label="DAYS" />
        <TimeBlock value={duration.hours || 0} label="HRS" />
      </View>
    </View>
  );
};

const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <View style={{ alignItems: "center" }}>
    <AppText variant="bold" style={styles.timeNum}>
      {value}
    </AppText>
    <AppText variant="light" style={styles.timeLabel}>
      {label}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 30,
    borderRadius: 25,
    width: "92%",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  habitTitle: {
    color: "white",
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    gap: 25,
  },
  timeNum: {
    color: "white",
    fontSize: 52,
  },
  timeLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});

export default CountdownHero;
