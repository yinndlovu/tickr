import { Habit } from "./habit";

// A habit as stored on the device and exchanged with the server.
// updatedAt drives last-write-wins; deletedAt is a tombstone so deletions can sync.
export interface HabitRecord extends Habit {
  updatedAt: string;
  deletedAt: string | null;
}

export interface SyncSnapshot {
  habits: HabitRecord[];
  mainHabitId: string | null;
  mainHabitUpdatedAt: string | null;
}
