import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, Minus, Plus, Timer, X } from "lucide-react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutRestCardProps {
  time: string;
  onAdd15: () => void;
  onRemove15: () => void;
  onSkip: () => void;
}

function parseTime(value: string) {
  const minuteMatch = value.match(/^(\d+)m(\d+)$/);
  if (minuteMatch) return Number(minuteMatch[1]) * 60 + Number(minuteMatch[2]);
  const secondMatch = value.match(/^(\d+)s$/);
  return secondMatch ? Number(secondMatch[1]) : 0;
}

function formatTime(value: string) {
  const safe = Math.max(0, parseTime(value));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function WorkoutRestCard({ time, onAdd15, onRemove15, onSkip }: WorkoutRestCardProps) {
  const seconds = parseTime(time);
  const progress = Math.max(0, Math.min(1, seconds / 180));

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.icon}>
            <Timer size={16} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Repos</Text>
        </View>
        <Text style={styles.timer}>{formatTime(time)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          accessibilityLabel="Retirer 15 secondes"
          style={styles.adjustButton}
          onPress={onRemove15}
        >
          <Minus size={17} color={Colors.text} />
          <Text style={styles.adjustText}>15 s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Ajouter 15 secondes"
          style={styles.adjustButton}
          onPress={onAdd15}
        >
          <Plus size={17} color={Colors.text} />
          <Text style={styles.adjustText}>15 s</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityLabel="Passer le repos"
          style={styles.skipButton}
          onPress={onSkip}
        >
          <Check size={17} color="#FFFFFF" />
          <Text style={styles.skipText}>Prêt</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hintRow}>
        <Text style={styles.hint}>Le repos démarre automatiquement après chaque série</Text>
        <TouchableOpacity accessibilityLabel="Fermer le minuteur" hitSlop={8} onPress={onSkip}>
          <X size={15} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  title: { color: Colors.text, fontSize: 16, fontWeight: "900" },
  timer: { color: Colors.primary, fontSize: 30, lineHeight: 34, fontWeight: "900", fontVariant: ["tabular-nums"] },
  progressTrack: { height: 5, borderRadius: 3, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 12 },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: Colors.primary },
  controls: { flexDirection: "row", gap: 8, marginTop: 14 },
  adjustButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  adjustText: { color: Colors.text, fontSize: 13, fontWeight: "900" },
  skipButton: { flex: 1.15, minHeight: 44, borderRadius: 12, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  skipText: { color: "#FFFFFF", fontSize: 13, fontWeight: "900" },
  hintRow: { marginTop: 11, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  hint: { flex: 1, color: Colors.textMuted, fontSize: 10, fontWeight: "600" },
});
