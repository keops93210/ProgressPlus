import { useEffect, useRef, useState } from "react";
import { AppState, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Minus, Plus, Timer, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

import Colors from "@/constants/colors";
import { useRestTimerStore } from "@/stores/rest-timer.store";

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function GlobalRestTimer() {
  const insets = useSafeAreaInsets();
  const { active, remaining, duration, hydrated, hydrate, sync, add, remove, skip } = useRestTimerStore();
  const [expanded, setExpanded] = useState(false);
  const previousRemaining = useRef<number | null>(null);

  useEffect(() => { void hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [active, sync]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") sync();
    });
    return () => subscription.remove();
  }, [sync]);

  useEffect(() => {
    if (!active || !hydrated) return;
    if (previousRemaining.current !== null && previousRemaining.current > 0 && remaining === 0) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setExpanded(true);
    }
    previousRemaining.current = remaining;
  }, [active, hydrated, remaining]);

  if (!hydrated || !active) return null;

  const progress = duration > 0 ? Math.min(1, remaining / duration) : 0;

  return (
    <View pointerEvents="box-none" style={[styles.layer, { top: insets.top + 8 }]}>
      <View style={styles.shadow}>
        <View style={styles.pill}>
          <Pressable style={styles.main} onPress={() => setExpanded(value => !value)}>
            <View style={styles.iconWrap}>
              <Timer size={19} color="#FFFFFF" strokeWidth={2.5} />
            </View>
            <View style={styles.labels}>
              <Text style={styles.eyebrow}>TEMPS DE REPOS</Text>
              <Text style={styles.time}>{formatTime(remaining)}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
          </Pressable>
          <Pressable style={styles.close} onPress={() => void skip()} hitSlop={10}>
            <X size={18} color={Colors.textSecondary} />
          </Pressable>
        </View>

        {expanded && (
          <View style={styles.expanded}>
            <Text style={styles.expandedTitle}>Encore {formatTime(remaining)} avant la prochaine série</Text>
            <View style={styles.controls}>
              <Pressable style={styles.control} onPress={() => void remove(15)}>
                <Minus size={17} color={Colors.text} />
                <Text style={styles.controlText}>15 s</Text>
              </Pressable>
              <Pressable style={styles.controlPrimary} onPress={() => void add(15)}>
                <Plus size={17} color="#FFFFFF" />
                <Text style={styles.controlPrimaryText}>15 s</Text>
              </Pressable>
              <Pressable style={styles.skip} onPress={() => void skip()}>
                <Text style={styles.skipText}>Passer</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: "absolute", left: 14, right: 14, zIndex: 9999, elevation: 20 },
  shadow: { shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 20 },
  pill: { minHeight: 64, borderRadius: 22, backgroundColor: Colors.text, flexDirection: "row", alignItems: "center", overflow: "hidden" },
  main: { flex: 1, minHeight: 64, flexDirection: "row", alignItems: "center", paddingLeft: 10, paddingRight: 8 },
  iconWrap: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  labels: { marginLeft: 10, minWidth: 92 },
  eyebrow: { color: "#C8C8D2", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  time: { color: "#FFFFFF", fontSize: 24, fontWeight: "900", marginTop: 1 },
  progressTrack: { flex: 1, height: 5, borderRadius: 4, backgroundColor: "#3A3A44", overflow: "hidden", marginLeft: 10 },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  close: { width: 42, alignItems: "center", justifyContent: "center" },
  expanded: { backgroundColor: Colors.surface, padding: 14, borderBottomLeftRadius: 22, borderBottomRightRadius: 22, borderTopWidth: 1, borderTopColor: Colors.border },
  expandedTitle: { color: Colors.text, fontSize: 13, fontWeight: "700", marginBottom: 12 },
  controls: { flexDirection: "row", gap: 8 },
  control: { flex: 1, minHeight: 42, borderRadius: 13, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  controlText: { color: Colors.text, fontWeight: "800", fontSize: 13 },
  controlPrimary: { flex: 1, minHeight: 42, borderRadius: 13, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  controlPrimaryText: { color: "#FFFFFF", fontWeight: "900", fontSize: 13 },
  skip: { paddingHorizontal: 14, minHeight: 42, borderRadius: 13, justifyContent: "center", backgroundColor: Colors.background },
  skipText: { color: Colors.textSecondary, fontWeight: "800", fontSize: 13 },
});
