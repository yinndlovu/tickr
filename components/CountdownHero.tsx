// external
import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";

// internal
import { Habit } from "../types/habit";
import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";
import { usePreferences } from "../context/PreferencesContext";
import { formatHabitDuration } from "../utils/timeDisplay";

// types
interface Props {
  habit: Habit;
  onOpenPicker: () => void;
}

const CountdownHero: React.FC<Props> = ({ habit, onOpenPicker }) => {
  const { theme } = useTheme();
  const { timeDisplayMode } = usePreferences();

  const getTime = () => formatHabitDuration(habit.startDate, timeDisplayMode);
  const [duration, setDuration] = useState(getTime());

  useEffect(() => {
    setDuration(getTime());
    const timer = setInterval(() => setDuration(getTime()), 60000);
    return () => clearInterval(timer);
  }, [habit.startDate, timeDisplayMode]);

  return (
    <View style={[styles.container, { backgroundColor: theme.primary }]}>
      <TouchableOpacity style={styles.dropdown} onPress={onOpenPicker}>
        <AppText variant="medium" style={styles.habitTitle}>
          {habit.name} ▾
        </AppText>
      </TouchableOpacity>

      <View style={styles.row}>
        {timeDisplayMode === "days_hours" ? (
          <>
            <TimeBlock value={duration.parts.days} label="days" />
            <TimeBlock value={duration.parts.hours} label="hrs" />
          </>
        ) : timeDisplayMode === "months_days_hours" ? (
          <>
            {(duration.parts.months ?? 0) > 0 ? (
              <TimeBlock value={duration.parts.months ?? 0} label="months" />
            ) : null}
            <TimeBlock value={duration.parts.days ?? 0} label="days" />
            <TimeBlock value={duration.parts.hours ?? 0} label="hrs" />
          </>
        ) : (
          <>
            {(duration.parts.years ?? 0) > 0 ? (
              <TimeBlock value={duration.parts.years ?? 0} label="years" />
            ) : null}
            {(duration.parts.months ?? 0) > 0 ? (
              <TimeBlock value={duration.parts.months ?? 0} label="months" />
            ) : null}
            <TimeBlock value={duration.parts.days ?? 0} label="days" />
            <TimeBlock value={duration.parts.hours ?? 0} label="hrs" />
          </>
        )}
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
