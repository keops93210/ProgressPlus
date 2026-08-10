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

export default function RestTimerCard({ active, remaining, duration, onSkip, onAdd, onRemove }: RestTimerCardProps) {
  if (!active) return null;

  const progress = duration > 0 ? Math.min(1, Math.max(0, remaining / duration)) : 0;
  const almostReady = duration > 0 && remaining <= Math.max(15, duration * 0.15);

  return (
    <View style={[styles.card, almostReady && styles.cardReady]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.statusDot, almostReady && styles.statusDotReady]} />
            <Text style={styles.eyebrow}>TEMPS DE REPOS</Text>
          </View>
          <Text style={styles.title}>{almostReady ? "Tu peux bientôt repartir" : "Récupère avant la prochaine série"}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{almostReady ? "PRÊT" : "EN COURS"}</Text>
        </View>
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timer}>{formatTime(remaining)}</Text>
        <Text style={styles.total}>/ {formatTime(duration)}</Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.progress, almostReady && styles.progressReady, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{formatTime(duration)} recommandé</Text>
        <Text style={styles.metaText}>{almostReady ? "Derniers instants" : "Récupération active"}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={onRemove} accessibilityLabel="Réduire le repos de 15 secondes">
          <Text style={styles.secondaryText}>−15 s</Text>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={onSkip} accessibilityLabel="Passer le temps de repos">
          <Text style={styles.skipText}>PASSER LE REPOS</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onAdd} accessibilityLabel="Ajouter 15 secondes de repos">
          <Text style={styles.secondaryText}>+15 s</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, gap: 12 },
  cardReady: { borderColor: Colors.success },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  headerCopy: { flex: 1 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.primary },
  statusDotReady: { backgroundColor: Colors.success },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.textSecondary, fontSize: 12, fontWeight: "600", marginTop: 4 },
  badge: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  badgeText: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  timerRow: { flexDirection: "row", alignItems: "baseline", marginTop: 2 },
  timer: { color: Colors.text, fontSize: 42, lineHeight: 48, fontWeight: "900", fontVariant: ["tabular-nums"] },
  total: { color: Colors.textMuted, fontSize: 14, fontWeight: "700", marginLeft: 6 },
  track: { height: 7, overflow: "hidden", borderRadius: 999, backgroundColor: Colors.background },
  progress: { height: "100%", borderRadius: 999, backgroundColor: Colors.primary },
  progressReady: { backgroundColor: Colors.success },
  metaRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  metaText: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" },
  controls: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  secondaryButton: { minHeight: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: Colors.text, fontSize: 12, fontWeight: "900" },
  skipButton: { flex: 1, minHeight: 44, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  skipText: { color: Colors.textOnPrimary, fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
});
