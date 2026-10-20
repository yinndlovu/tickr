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
import { AppState } from "react-native";

// internal
import { useAuth } from "./AuthContext";
import { useHabits } from "./HabitsContext";
import { getErrorMessage } from "../services/apiClient";
import {
  fetchRemoteState,
  mergeRemoteState,
  replaceRemoteState,
} from "../services/syncService";
import { SyncSnapshot } from "../types/sync";
import { liveHabits, sameLiveHabits } from "../utils/syncMerge";

// types
export type SyncStatus = "idle" | "syncing" | "synced" | "error";
export type SyncChoice = "local" | "cloud";
export type PendingChoice = { local: SyncSnapshot; cloud: SyncSnapshot };

type SyncContextType = {
  status: SyncStatus;
  lastSyncedAt: string | null;
  // set when the account already has data that differs from this device
  pendingChoice: PendingChoice | null;
  isResolving: boolean;
  choiceError: string | null;
  resolveChoice: (keep: SyncChoice) => Promise<void>;
  cancelChoice: () => Promise<void>;
  syncNow: () => Promise<void>;
};

// the account this device's data was last reconciled with; kept across sign-outs
// so signing back into the same account just merges instead of asking again
const LINKED_USER_KEY = "sync.linkedUserId";
const PUSH_DEBOUNCE_MS = 1500;

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthLoaded, signOut } = useAuth();
  const { isHabitsLoaded, revision, getSnapshot, mergeRemote, replaceAll } =
    useHabits();

  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(
    null,
  );
  const [isResolving, setIsResolving] = useState(false);
  const [choiceError, setChoiceError] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);

  // refs let the async flows see current values and notice a sign-out
  const userRef = useRef(user);
  userRef.current = user;
  const pendingRef = useRef(pendingChoice);
  pendingRef.current = pendingChoice;
  const sessionRef = useRef(0);
  const linkedRef = useRef(false);
  const inFlightRef = useRef(false);
  const initialRef = useRef(false);
  const rerunRef = useRef(false);
  const resolvingRef = useRef(false);

  const markSynced = useCallback(() => {
    setStatus("synced");
    setLastSyncedAt(new Date().toISOString());
  }, []);

  const link = useCallback(async (userId: number) => {
    await AsyncStorage.setItem(LINKED_USER_KEY, String(userId)).catch(() => {});
    linkedRef.current = true;
    setIsLinked(true);
  }, []);

  // Full-state merge with the cloud. Safe to repeat and safe after being offline:
  // whatever changed on either side wins per habit. One request at a time; a
  // change that arrives while one is running triggers another round.
  const runSync = useCallback(async () => {
    if (!userRef.current || !linkedRef.current) return;
    if (inFlightRef.current) {
      rerunRef.current = true;
      return;
    }

    const session = sessionRef.current;
    inFlightRef.current = true;
    setStatus("syncing");
    try {
      do {
        rerunRef.current = false;
        const merged = await mergeRemoteState(getSnapshot());
        if (session !== sessionRef.current) return;
        mergeRemote(merged);
      } while (rerunRef.current);
      markSynced();
    } catch {
      if (session === sessionRef.current) setStatus("error");
    } finally {
      if (session === sessionRef.current) inFlightRef.current = false;
    }
  }, [getSnapshot, mergeRemote, markSynced]);

  // First contact between this device and an account.
  const beginInitialSync = useCallback(
    async (userId: number) => {
      const session = sessionRef.current;
      initialRef.current = true;
      setStatus("syncing");
      try {
        const cloud = await fetchRemoteState();
        if (session !== sessionRef.current) return;
        const local = getSnapshot();

        const cloudIsEmpty = liveHabits(cloud.habits).length === 0;
        const nothingToChoose =
          liveHabits(local.habits).length === 0 || sameLiveHabits(local, cloud);

        if (cloudIsEmpty) {
          // new account: this device's data becomes the account's data
          await link(userId);
          await runSync();
        } else if (nothingToChoose) {
          // either this device has nothing to lose or both sides already agree
          mergeRemote(cloud);
          await link(userId);
          await runSync();
        } else {
          setPendingChoice({ local, cloud });
          setStatus("idle");
        }
      } catch {
        if (session === sessionRef.current) setStatus("error");
      } finally {
        if (session === sessionRef.current) initialRef.current = false;
      }
    },
    [getSnapshot, link, mergeRemote, runSync],
  );

  // Brings the device and the account up to date, whichever stage we are at.
  const syncNow = useCallback(async () => {
    const current = userRef.current;
    if (!current) return;

    if (linkedRef.current) {
      await runSync();
      return;
    }
    if (pendingRef.current || initialRef.current) return;

    const session = sessionRef.current;
    const linkedId = await AsyncStorage.getItem(LINKED_USER_KEY).catch(
      () => null,
    );
    if (session !== sessionRef.current) return;

    if (linkedId === String(current.id)) {
      linkedRef.current = true;
      setIsLinked(true);
      await runSync();
      return;
    }
    await beginInitialSync(current.id);
  }, [runSync, beginInitialSync]);

  const resolveChoice = useCallback(
    async (keep: SyncChoice) => {
      const current = userRef.current;
      const pending = pendingRef.current;
      if (!current || !pending || resolvingRef.current) return;

      const session = sessionRef.current;
      resolvingRef.current = true;
      setIsResolving(true);
      setChoiceError(null);
      try {
        if (keep === "local") {
          // cloud becomes this device's data, local is then set to what the cloud stored
          const stored = await replaceRemoteState(getSnapshot());
          if (session !== sessionRef.current) return;
          replaceAll(stored);
        } else {
          // local becomes the cloud's data, the cloud already has it
          replaceAll(pending.cloud);
        }

        await link(current.id);
        setPendingChoice(null);
        markSynced();
        if (keep === "cloud") void runSync();
      } catch (e) {
        if (session === sessionRef.current) {
          setChoiceError(
            getErrorMessage(e, "couldn't finish syncing. please try again."),
          );
        }
      } finally {
        resolvingRef.current = false;
        if (session === sessionRef.current) setIsResolving(false);
      }
    },
    [getSnapshot, replaceAll, link, markSynced, runSync],
  );

  // backing out of the choice means not signing in on this device
  const cancelChoice = useCallback(async () => {
    await signOut();
  }, [signOut]);

  // a new session starts whenever the signed-in account changes
  const userId = user?.id ?? null;
  useEffect(() => {
    if (!isAuthLoaded || !isHabitsLoaded) return;

    sessionRef.current += 1;
    linkedRef.current = false;
    inFlightRef.current = false;
    initialRef.current = false;
    rerunRef.current = false;
    resolvingRef.current = false;
    setIsLinked(false);
    setPendingChoice(null);
    setChoiceError(null);
    setIsResolving(false);
    setStatus("idle");

    if (userId !== null) {
      void syncNow();
    }
  }, [isAuthLoaded, isHabitsLoaded, userId, syncNow]);

  // push changes shortly after the user makes them
  useEffect(() => {
    if (!isLinked || revision === 0) return;
    const timer = setTimeout(() => {
      void runSync();
    }, PUSH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [isLinked, revision, runSync]);

  // pick up changes from other devices and retry anything that failed offline
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void syncNow();
    });
    return () => subscription.remove();
  }, [syncNow]);

  const value = useMemo(
    () => ({
      status,
      lastSyncedAt,
      pendingChoice,
      isResolving,
      choiceError,
      resolveChoice,
      cancelChoice,
      syncNow,
    }),
    [
      status,
      lastSyncedAt,
      pendingChoice,
      isResolving,
      choiceError,
      resolveChoice,
      cancelChoice,
      syncNow,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSync must be used within SyncProvider");
  }
  return context;
};
