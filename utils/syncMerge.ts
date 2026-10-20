import { HabitRecord, SyncSnapshot } from "../types/sync";

export const EPOCH_ISO = "1970-01-01T00:00:00.000Z";

// the server can return more than 3 fractional digits, not every JS engine parses them
export const toMillis = (value: string | null | undefined): number => {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }
  const ms = Date.parse(value.replace(/(\.\d{3})\d+/, "$1"));
  return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
};

const normalizeIso = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const ms = toMillis(value);
  return ms === Number.NEGATIVE_INFINITY ? null : new Date(ms).toISOString();
};

// Accepts anything (AsyncStorage content, server response) and returns a clean
// record, or null when it is unusable. Habits saved before syncing existed have
// no updatedAt, they get the epoch so any real edit wins over them.
export const sanitizeRecord = (raw: any): HabitRecord | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const id = String(raw.id ?? "");
  const name = String(raw.name ?? "");
  const startDate = String(raw.startDate ?? "");
  if (!id || !name || !startDate) {
    return null;
  }

  return {
    id,
    name,
    startDate,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    icon: typeof raw.icon === "string" ? raw.icon : undefined,
    updatedAt: normalizeIso(raw.updatedAt) ?? EPOCH_ISO,
    deletedAt: normalizeIso(raw.deletedAt),
  };
};

export const sanitizeSnapshot = (raw: any): SyncSnapshot => ({
  habits: Array.isArray(raw?.habits)
    ? raw.habits
        .map(sanitizeRecord)
        .filter((h: HabitRecord | null): h is HabitRecord => h !== null)
    : [],
  mainHabitId:
    typeof raw?.mainHabitId === "string" && raw.mainHabitId
      ? raw.mainHabitId
      : null,
  mainHabitUpdatedAt: normalizeIso(raw?.mainHabitUpdatedAt),
});

export const liveHabits = (records: HabitRecord[]): HabitRecord[] =>
  records.filter((r) => !r.deletedAt);

// newest first, matches how new habits are added
export const sortRecords = (records: HabitRecord[]): HabitRecord[] =>
  [...records].sort(
    (a, b) =>
      toMillis(b.updatedAt) - toMillis(a.updatedAt) || b.id.localeCompare(a.id),
  );

// Per-habit last-write-wins. On a tie the local copy stays. The main habit is
// resolved the same way using its own timestamp.
export const mergeSnapshots = (
  local: SyncSnapshot,
  remote: SyncSnapshot,
): SyncSnapshot => {
  const byId = new Map<string, HabitRecord>();
  local.habits.forEach((h) => byId.set(h.id, h));
  remote.habits.forEach((r) => {
    const current = byId.get(r.id);
    if (!current || toMillis(r.updatedAt) > toMillis(current.updatedAt)) {
      byId.set(r.id, r);
    }
  });

  const remoteMainWins =
    toMillis(remote.mainHabitUpdatedAt) > toMillis(local.mainHabitUpdatedAt);
  const main = remoteMainWins ? remote : local;

  return {
    habits: sortRecords([...byId.values()]),
    mainHabitId: main.mainHabitId,
    mainHabitUpdatedAt: main.mainHabitUpdatedAt,
  };
};

export const snapshotsEqual = (a: SyncSnapshot, b: SyncSnapshot): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

// same trackers with the same content, ignoring order, timestamps and tombstones
export const sameLiveHabits = (a: SyncSnapshot, b: SyncSnapshot): boolean => {
  const left = liveHabits(a.habits);
  const right = liveHabits(b.habits);
  if (left.length !== right.length) {
    return false;
  }

  const byId = new Map(right.map((h) => [h.id, h]));
  return left.every((h) => {
    const other = byId.get(h.id);
    return (
      !!other &&
      other.name === h.name &&
      other.startDate === h.startDate &&
      (other.notes ?? "") === (h.notes ?? "") &&
      (other.icon ?? "") === (h.icon ?? "")
    );
  });
};
