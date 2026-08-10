import Colors from "@/constants/colors";
import { WorkoutSummary } from "@/services/workout-summary.service";
import { Dumbbell, Sparkles, Trophy, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes >= 60
    ? `${Math.floor(minutes / 60)}h ${minutes % 60}min`
    : `${minutes}min${remaining ? ` ${remaining}s` : ""}`;
}

export default function WorkoutSummaryCard({ summary }: { summary: WorkoutSummary }) {
  const positive = summary.volumeChangePercent !== null && summary.volumeChangePercent > 0;
  const negative = summary.volumeChangePercent !== null && summary.volumeChangePercent < 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}><Sparkles color={Colors.primary} size={22} /></View>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>COACH PROGRESS+</Text>
          <Text style={styles.title}>Analyse de ta séance</Text>
        </View>
      </View>

      <Text style={styles.message}>{summary.message}</Text>

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.value}>{formatDuration(summary.durationSeconds)}</Text><Text style={styles.label}>durée</Text></View>
        <View style={styles.divider} />
        <View style={styles.metric}><Text style={styles.value}>{Math.round(summary.volume).toLocaleString("fr-FR")} kg</Text><Text style={styles.label}>volume</Text></View>
        <View style={styles.divider} />
        <View style={styles.metric}><Text style={styles.value}>{summary.totalSets}</Text><Text style={styles.label}>séries</Text></View>
      </View>

      {summary.volumeChangePercent !== null && (
        <View style={styles.trendRow}>
          {positive ? <TrendingUp color={Colors.primary} size={18} /> : negative ? <TrendingDown color={Colors.primary} size={18} /> : <Dumbbell color={Colors.primary} size={18} />}
          <Text style={styles.trendText}>{summary.volumeChangePercent >= 0 ? "+" : ""}{summary.volumeChangePercent}% vs dernière séance</Text>
        </View>
      )}

      {summary.personalRecords > 0 && (
        <View style={styles.prRow}>
          <Trophy color={Colors.primary} size={18} />
          <Text style={styles.prText}>{summary.personalRecords} nouveau{summary.personalRecords > 1 ? "x" : ""} record{summary.personalRecords > 1 ? "s" : ""} détecté{summary.personalRecords > 1 ? "s" : ""}</Text>
        </View>
      )}

      {summary.bestExercise && (
        <View style={styles.bestCard}>
          <Text style={styles.bestEyebrow}>MEILLEURE PERFORMANCE</Text>
          <Text style={styles.bestName} numberOfLines={1}>{summary.bestExercise.name}</Text>
          <Text style={styles.bestValue}>{summary.bestExercise.weight} kg × {summary.bestExercise.reps} · 1RM estimé {summary.bestExercise.estimated1rm} kg</Text>
        </View>
      )}

      <View style={styles.nextCard}>
        <Text style={styles.nextEyebrow}>POUR LA PROCHAINE SÉANCE</Text>
        <Text style={styles.nextText}>{summary.nextSessionAdvice}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 18, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary },
  header: { flexDirection: "row", alignItems: "center" },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: Colors.text, fontSize: 21, fontWeight: "900", marginTop: 3 },
  message: { color: Colors.text, fontSize: 15, lineHeight: 21, fontWeight: "700", marginTop: 16 },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: 18, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  metric: { flex: 1, alignItems: "center" },
  value: { color: Colors.text, fontSize: 15, fontWeight: "900" },
  label: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
  divider: { width: 1, height: 28, backgroundColor: Colors.border },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  trendText: { color: Colors.text, fontSize: 12, fontWeight: "800" },
  prRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  prText: { color: Colors.primary, fontSize: 12, fontWeight: "900" },
  bestCard: { marginTop: 16, padding: 13, borderRadius: 15, backgroundColor: Colors.background },
  bestEyebrow: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  bestName: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 4 },
  bestValue: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  nextCard: { marginTop: 12, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  nextEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  nextText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
