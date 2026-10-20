// internal
import { api } from "./apiClient";
import { SyncSnapshot } from "../types/sync";
import { liveHabits, sanitizeSnapshot } from "../utils/syncMerge";

type Envelope = { success: boolean; message?: string; details?: unknown };

const parse = (data: Envelope): SyncSnapshot => {
  if (!data?.success || !data.details) {
    throw new Error(data?.message ?? "sync failed");
  }
  return sanitizeSnapshot(data.details);
};

// what the cloud has right now
export async function fetchRemoteState(): Promise<SyncSnapshot> {
  const response = await api.get<Envelope>("/sync");
  return parse(response.data);
}

// last-write-wins merge, returns the merged cloud state
export async function mergeRemoteState(
  local: SyncSnapshot,
): Promise<SyncSnapshot> {
  const response = await api.post<Envelope>("/sync", local);
  return parse(response.data);
}

// makes the cloud exactly equal to the device, returns the stored state
export async function replaceRemoteState(
  local: SyncSnapshot,
): Promise<SyncSnapshot> {
  const response = await api.put<Envelope>("/sync", {
    ...local,
    habits: liveHabits(local.habits),
  });
  return parse(response.data);
}
