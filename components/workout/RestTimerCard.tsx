import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface RestTimerCardProps {
  active: boolean;
  remaining: number;
  duration: number;
  onSkip: () => void;
  onAdd: () => void;
  onRemove: () => void;
}

function formatTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function RestTimerCard({
  active,
  remaining,
  duration,
  onSkip,
  onAdd,
  onRemove,
}: RestTimerCardProps) {
  if (!active) return null;

  const progress = duration > 0 ? Math.min(1, Math.max(0, remaining / duration)) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TEMPS DE REPOS</Text>
          <Text style={styles.title}>Récupère avant la prochaine série</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>EN COURS</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timer}>{formatTime(remaining)}</Text>
        <Text style={styles.total}>/ {formatTime(duration)}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={onRemove}>
          <Text style={styles.secondaryText}>−15 s</Text>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipText}>PASSER LE REPOS</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onAdd}>
          <Text style={styles.secondaryText}>+15 s</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.primary,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.7,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 2,
  },
  timer: {
    color: Colors.text,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
  total: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  track: {
    height: 7,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: Colors.background,
  },
  progress: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  secondaryButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: "900",
  },
  skipButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
});
