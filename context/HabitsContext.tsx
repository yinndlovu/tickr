// external
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// internal
import { Habit } from "../types/habit";
import { HabitRecord, SyncSnapshot } from "../types/sync";
import {
  liveHabits,
  mergeSnapshots,
  sanitizeRecord,
  snapshotsEqual,
} from "../utils/syncMerge";

// types
type HabitsContextType = {
  habits: Habit[];
  mainHabitId: string;
  setMainHabitId: (id: string) => void;
  addHabit: (habit: Habit) => void;
  isHabitsLoaded: boolean;
  // goes up on every change the user makes (never on changes coming from sync)
  revision: number;
  getSnapshot: () => SyncSnapshot;
  mergeRemote: (remote: SyncSnapshot) => void;
  replaceAll: (snapshot: SyncSnapshot) => void;
};

type HabitsData = {
  records: HabitRecord[];
  mainHabitId: string;
  mainHabitUpdatedAt: string | null;
  revision: number;
};

// constants
const STORAGE_KEYS = {
  habits: "habits.items",
  mainHabitId: "habits.mainHabitId",
  mainHabitUpdatedAt: "habits.mainHabitUpdatedAt",
} as const;

const EMPTY: HabitsData = {
  records: [],
  mainHabitId: "",
  mainHabitUpdatedAt: null,
  revision: 0,
};

const toSnapshot = (data: HabitsData): SyncSnapshot => ({
  habits: data.records,
  mainHabitId: data.mainHabitId || null,
  mainHabitUpdatedAt: data.mainHabitUpdatedAt,
});

const fromSnapshot = (
  snapshot: SyncSnapshot,
  revision: number,
): HabitsData => ({
  records: snapshot.habits,
  mainHabitId: snapshot.mainHabitId ?? "",
  mainHabitUpdatedAt: snapshot.mainHabitUpdatedAt,
  revision,
});

const HabitsContext = createContext<HabitsContextType | undefined>(undefined);

export const HabitsProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<HabitsData>(EMPTY);
  const [isHabitsLoaded, setIsHabitsLoaded] = useState(false);

  // async sync code reads the latest data through this ref instead of a stale closure
  const dataRef = useRef<HabitsData>(EMPTY);

  const commit = useCallback((update: (prev: HabitsData) => HabitsData) => {
    setData((prev) => {
      const next = update(prev);
      dataRef.current = next;
      return next;
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [storedHabitsJson, storedMainId, storedMainAt] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.habits),
            AsyncStorage.getItem(STORAGE_KEYS.mainHabitId),
            AsyncStorage.getItem(STORAGE_KEYS.mainHabitUpdatedAt),
          ]);

        if (!isMounted) {
          return;
        }

        let records: HabitRecord[] = [];
        if (storedHabitsJson) {
          const parsed = JSON.parse(storedHabitsJson) as unknown;
          if (Array.isArray(parsed)) {
            records = parsed
              .map(sanitizeRecord)
              .filter((h): h is HabitRecord => h !== null);
          }
        }

        commit(() => ({
          records,
          mainHabitId: storedMainId ?? "",
          mainHabitUpdatedAt: storedMainAt || null,
          revision: 0,
        }));
      } catch {
        if (isMounted) {
          commit(() => EMPTY);
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
  }, [commit]);

  const habits = useMemo(() => liveHabits(data.records), [data.records]);

  // keep the main habit pointing at something that exists
  // (derived, so it does not count as a user change and is not synced)
  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    if (habits.length === 0) {
      if (data.mainHabitId) {
        commit((prev) => ({ ...prev, mainHabitId: "" }));
      }
      return;
    }
    if (!data.mainHabitId || !habits.some((h) => h.id === data.mainHabitId)) {
      commit((prev) => ({ ...prev, mainHabitId: habits[0].id }));
    }
  }, [habits, data.mainHabitId, isHabitsLoaded, commit]);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    AsyncStorage.setItem(
      STORAGE_KEYS.habits,
      JSON.stringify(data.records),
    ).catch(() => {});
  }, [data.records, isHabitsLoaded]);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    if (!data.mainHabitId) {
      AsyncStorage.removeItem(STORAGE_KEYS.mainHabitId).catch(() => {});
      return;
    }
    AsyncStorage.setItem(STORAGE_KEYS.mainHabitId, data.mainHabitId).catch(
      () => {},
    );
  }, [data.mainHabitId, isHabitsLoaded]);

  useEffect(() => {
    if (!isHabitsLoaded) {
      return;
    }
    if (!data.mainHabitUpdatedAt) {
      AsyncStorage.removeItem(STORAGE_KEYS.mainHabitUpdatedAt).catch(() => {});
      return;
    }
    AsyncStorage.setItem(
      STORAGE_KEYS.mainHabitUpdatedAt,
      data.mainHabitUpdatedAt,
    ).catch(() => {});
  }, [data.mainHabitUpdatedAt, isHabitsLoaded]);

  const addHabit = useCallback(
    (habit: Habit) => {
      const now = new Date().toISOString();
      const record: HabitRecord = { ...habit, updatedAt: now, deletedAt: null };
      commit((prev) => ({
        records: [record, ...prev.records],
        mainHabitId: prev.mainHabitId || habit.id,
        mainHabitUpdatedAt: prev.mainHabitId ? prev.mainHabitUpdatedAt : now,
        revision: prev.revision + 1,
      }));
    },
    [commit],
  );

  const setMainHabitId = useCallback(
    (id: string) => {
      commit((prev) =>
        prev.mainHabitId === id
          ? prev
          : {
              ...prev,
              mainHabitId: id,
              mainHabitUpdatedAt: new Date().toISOString(),
              revision: prev.revision + 1,
            },
      );
    },
    [commit],
  );

  const getSnapshot = useCallback(() => toSnapshot(dataRef.current), []);

  // last-write-wins merge, keeps anything the user changed while a sync was running
  const mergeRemote = useCallback(
    (remote: SyncSnapshot) => {
      commit((prev) => {
        const local = toSnapshot(prev);
        const merged = mergeSnapshots(local, remote);
        return snapshotsEqual(local, merged)
          ? prev
          : fromSnapshot(merged, prev.revision);
      });
    },
    [commit],
  );

  // overwrite everything with the given state (the "keep cloud / keep device" choice)
  const replaceAll = useCallback(
    (snapshot: SyncSnapshot) => {
      commit((prev) => fromSnapshot(snapshot, prev.revision));
    },
    [commit],
  );

  const value = useMemo(
    () => ({
      habits,
      mainHabitId: data.mainHabitId,
      setMainHabitId,
      addHabit,
      isHabitsLoaded,
      revision: data.revision,
      getSnapshot,
      mergeRemote,
      replaceAll,
    }),
    [
      habits,
      data.mainHabitId,
      data.revision,
      isHabitsLoaded,
      setMainHabitId,
      addHabit,
      getSnapshot,
      mergeRemote,
      replaceAll,
    ],
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
