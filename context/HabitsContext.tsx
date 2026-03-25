// external
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// internal
import { Habit } from "../types/habit";

// types
type HabitsContextType = {
  habits: Habit[];
  mainHabitId: string;
  setMainHabitId: (id: string) => void;
  addHabit: (habit: Habit) => void;
  isHabitsLoaded: boolean;
};

// constants
const STORAGE_KEYS = {
  habits: "habits.items",
  mainHabitId: "habits.mainHabitId",
} as const;

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [mainHabitId, setMainHabitIdState] = useState<string>("");
  const [isHabitsLoaded, setIsHabitsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedHabitsJson, storedMainId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.habits),
          AsyncStorage.getItem(STORAGE_KEYS.mainHabitId),
        ]);

        if (!isMounted) {
          return;
        }

        if (storedHabitsJson) {
          const parsed = JSON.parse(storedHabitsJson) as unknown;
          if (Array.isArray(parsed)) {
            const cleaned = parsed
              .filter((h) => h && typeof h === "object")
              .map((h: any) => ({
                id: String(h.id ?? ""),
                name: String(h.name ?? ""),
                startDate: String(h.startDate ?? ""),
                notes: typeof h.notes === "string" ? h.notes : undefined,
                icon: typeof h.icon === "string" ? h.icon : undefined,
              }))
              .filter((h) => h.id && h.name && h.startDate);
            setHabits(cleaned);
          }
        }

        if (storedMainId) {
          setMainHabitIdState(storedMainId);
        }
      } catch {
        if (isMounted) {
          setHabits([]);
          setMainHabitIdState("");
        }
      } finally {
        if (isMounted) {
          setIsHabitsLoaded(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    if (habits.length === 0) {
      if (mainHabitId) setMainHabitIdState("");
      return;
    }
    if (!mainHabitId || !habits.some((h) => h.id === mainHabitId)) {
      setMainHabitIdState(habits[0].id);
    }
  }, [habits, mainHabitId, isHabitsLoaded]);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    AsyncStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(habits)).catch(
      () => {},
    );
  }, [habits, isHabitsLoaded]);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    if (!mainHabitId) {
      AsyncStorage.removeItem(STORAGE_KEYS.mainHabitId).catch(() => {});
      return;
    }
    AsyncStorage.setItem(STORAGE_KEYS.mainHabitId, mainHabitId).catch(() => {});
  }, [mainHabitId, isHabitsLoaded]);

  const addHabit = (habit: Habit) => {
    setHabits((prev) => [habit, ...prev]);
    setMainHabitIdState((prevMain) => prevMain || habit.id);
  };

  const setMainHabitId = (id: string) => setMainHabitIdState(id);

  const value = useMemo(
    () => ({ habits, mainHabitId, setMainHabitId, addHabit, isHabitsLoaded }),
    [habits, mainHabitId, isHabitsLoaded],
  );

  return (
    <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within HabitsProvider");
  }
  return context;
};
