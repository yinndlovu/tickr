import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../context/ThemeContext";
import { AppText } from "./AppText";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onSignIn: () => void;
};

const ProfileModal: React.FC<Props> = ({ isVisible, onClose, onSignIn }) => {
  const { theme } = useTheme();

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.card }]}
          onPress={() => {}}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="cloud-outline" size={20} color={theme.primary} />
              <AppText
                variant="bold"
                style={{ color: theme.text, fontSize: 18 }}
              >
                Backup & sync
              </AppText>
            </View>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeButton}
            >
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <AppText
            variant="light"
            style={{ color: theme.subtext, marginTop: 6, lineHeight: 18 }}
          >
            Sign in to back up your trackers and access them on any device.
            Tickr is offline-first — your data stays on this device unless you
            choose to sync.
          </AppText>

          <TouchableOpacity
            onPress={onSignIn}
            style={[styles.signInButton, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            <Ionicons name="log-in-outline" size={18} color="white" />
            <AppText variant="bold" style={{ color: "white" }}>
              Sign in
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            style={[styles.secondaryButton, { borderColor: theme.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Not now"
          >
            <AppText variant="medium" style={{ color: theme.text }}>
              Not now
            </AppText>
          </TouchableOpacity>
        </Pressable>
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
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  signInButton: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
  },
});

export default ProfileModal;
