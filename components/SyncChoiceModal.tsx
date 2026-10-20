// external
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// internal
import { useTheme } from "../context/ThemeContext";
import { useSync } from "../context/SyncContext";
import { AppText } from "./AppText";
import { SyncSnapshot } from "../types/sync";
import { liveHabits } from "../utils/syncMerge";

// "3 trackers: no caffeine, running, +1 more"
const describe = (snapshot: SyncSnapshot) => {
  const names = liveHabits(snapshot.habits).map((h) => h.name);
  const count = names.length;
  const label = `${count} ${count === 1 ? "tracker" : "trackers"}`;
  if (count === 0) return label;

  const shown = names.slice(0, 2).join(", ");
  const rest = count - 2;
  return `${label}: ${shown}${rest > 0 ? `, +${rest} more` : ""}`;
};

// Shown after signing in to an account that already has data different from
// this device's. No text inputs, so like ItemActionSheet in fine finance it is a
// plain Modal; the screens that have inputs are transparentModal screens.
const SyncChoiceModal: React.FC = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    pendingChoice,
    isResolving,
    choiceError,
    resolveChoice,
    cancelChoice,
  } = useSync();

  if (!pendingChoice) {
    return null;
  }

  const options = [
    {
      key: "local" as const,
      icon: "phone-portrait-outline" as const,
      title: "keep this device's data",
      detail: describe(pendingChoice.local),
      note: "your account will be replaced with this",
    },
    {
      key: "cloud" as const,
      icon: "cloud-outline" as const,
      title: "keep my account's data",
      detail: describe(pendingChoice.cloud),
      note: "this device will be replaced with this",
    },
  ];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.card,
              paddingBottom: Math.max(insets.bottom + 16, 28),
            },
          ]}
        >
          <AppText variant="bold" style={[styles.title, { color: theme.text }]}>
            which data do you want to keep?
          </AppText>
          <AppText
            variant="light"
            style={[styles.subtitle, { color: theme.subtext }]}
          >
            this account already has trackers saved. pick one version — the
            other one is replaced, and the device and the account end up with
            the same data.
          </AppText>

          {options.map((option) => (
            <TouchableOpacity
              key={option.key}
              onPress={() => resolveChoice(option.key)}
              disabled={isResolving}
              activeOpacity={0.85}
              style={[
                styles.option,
                { borderColor: theme.accent, opacity: isResolving ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={option.title}
            >
              <Ionicons name={option.icon} size={22} color={theme.primary} />
              <View style={styles.optionText}>
                <AppText
                  variant="bold"
                  style={{ color: theme.text, fontSize: 15 }}
                >
                  {option.title}
                </AppText>
                <AppText
                  variant="medium"
                  style={{ color: theme.text, fontSize: 13, marginTop: 2 }}
                  numberOfLines={2}
                >
                  {option.detail}
                </AppText>
                <AppText
                  variant="light"
                  style={{ color: theme.subtext, fontSize: 12, marginTop: 2 }}
                >
                  {option.note}
                </AppText>
              </View>
            </TouchableOpacity>
          ))}

          {isResolving ? (
            <View style={styles.statusRow}>
              <ActivityIndicator color={theme.primary} />
              <AppText variant="light" style={{ color: theme.subtext }}>
                syncing…
              </AppText>
            </View>
          ) : null}

          {choiceError ? (
            <AppText
              variant="medium"
              style={{ color: "#D64545", marginTop: 8, textAlign: "center" }}
            >
              {choiceError}
            </AppText>
          ) : null}

          <TouchableOpacity
            onPress={cancelChoice}
            disabled={isResolving}
            style={[styles.cancel, { backgroundColor: theme.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel and sign out"
          >
            <AppText
              variant="medium"
              style={{ color: theme.subtext, fontSize: 15 }}
            >
              cancel and sign out
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 18,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 18,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  optionText: {
    flex: 1,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 6,
  },
  cancel: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
});

export default SyncChoiceModal;
