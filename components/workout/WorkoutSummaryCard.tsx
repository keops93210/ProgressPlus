import Colors from "@/constants/colors";
import { WorkoutSummary } from "@/services/workout-summary.service";
import { Dumbbell, ShieldCheck, Sparkles, Trophy, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}min` : `${minutes}min${remaining ? ` ${remaining}s` : ""}`;
}

export default function WorkoutSummaryCard({ summary }: { summary: WorkoutSummary }) {
  const positive = summary.volumeChangePercent !== null && summary.volumeChangePercent > 0;
  const negative = summary.volumeChangePercent !== null && summary.volumeChangePercent < 0;
  const qualityLabel = summary.qualityScore >= 85 ? "Excellente" : summary.qualityScore >= 70 ? "Très bonne" : summary.qualityScore >= 55 ? "Solide" : "À consolider";
  const qualityColor = summary.qualityScore >= 85 ? Colors.success : summary.qualityScore < 55 ? Colors.danger : Colors.primary;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}><Sparkles color={Colors.primary} size={22} /></View>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>COACH PROGRESS+</Text><Text style={styles.title}>Analyse de ta séance</Text></View>
      </View>

      <View style={styles.qualityHero}>
        <View style={styles.qualityCopy}><Text style={styles.qualityEyebrow}>QUALITÉ GLOBALE</Text><Text style={[styles.qualityLabel, { color: qualityColor }]}>{qualityLabel}</Text><Text style={styles.qualityHint}>{summary.hardSets} série{summary.hardSets > 1 ? "s" : ""} très difficile{summary.hardSets > 1 ? "s" : ""}{summary.failureSets > 0 ? ` · ${summary.failureSets} à l'échec` : ""}</Text></View>
        <View style={[styles.scoreCircle, { borderColor: qualityColor }]}><Text style={[styles.score, { color: qualityColor }]}>{summary.qualityScore}</Text><Text style={styles.scoreLabel}>/100</Text></View>
      </View>

      <Text style={styles.message}>{summary.message}</Text>

      <View style={styles.metrics}>
        <View style={styles.metric}><Text style={styles.value}>{formatDuration(summary.durationSeconds)}</Text><Text style={styles.label}>durée</Text></View>
        <View style={styles.divider} />
        <View style={styles.metric}><Text style={styles.value}>{Math.round(summary.volume).toLocaleString("fr-FR")} kg</Text><Text style={styles.label}>volume</Text></View>
        <View style={styles.divider} />
        <View style={styles.metric}><Text style={styles.value}>{summary.totalSets}</Text><Text style={styles.label}>séries</Text></View>
      </View>

      <View style={styles.effortRow}>
        <View style={styles.effortItem}><Text style={styles.effortLabel}>RIR MOYEN</Text><Text style={styles.effortValue}>{summary.averageRir == null ? "—" : summary.averageRir}</Text></View>
        <View style={styles.effortItem}><Text style={styles.effortLabel}>COMPLÉTION</Text><Text style={styles.effortValue}>{summary.completionPercent}%</Text></View>
        <View style={styles.effortItem}><ShieldCheck color={Colors.success} size={17} /><Text style={[styles.effortLabel, { color: Colors.success }]}>COACH</Text></View>
      </View>

      {summary.volumeChangePercent !== null && <View style={styles.trendRow}>{positive ? <TrendingUp color={Colors.success} size={18} /> : negative ? <TrendingDown color={Colors.danger} size={18} /> : <Dumbbell color={Colors.primary} size={18} />}<Text style={[styles.trendText, { color: positive ? Colors.success : negative ? Colors.danger : Colors.text }]}>{summary.volumeChangePercent >= 0 ? "+" : ""}{summary.volumeChangePercent}% vs dernière séance</Text></View>}
      {summary.personalRecords > 0 && <View style={styles.prRow}><Trophy color={Colors.success} size={18} /><Text style={styles.prText}>{summary.personalRecords} nouveau{summary.personalRecords > 1 ? "x" : ""} record{summary.personalRecords > 1 ? "s" : ""} détecté{summary.personalRecords > 1 ? "s" : ""}</Text></View>}

      {summary.bestExercise && <View style={styles.bestCard}><Text style={styles.bestEyebrow}>MEILLEURE PERFORMANCE</Text><Text style={styles.bestName} numberOfLines={1}>{summary.bestExercise.name}</Text><Text style={styles.bestValue}>{summary.bestExercise.weight} kg × {summary.bestExercise.reps} · 1RM estimé {summary.bestExercise.estimated1rm} kg</Text></View>}

      <View style={styles.nextCard}><Text style={styles.nextEyebrow}>POUR LA PROCHAINE SÉANCE</Text><Text style={styles.nextText}>{summary.nextSessionAdvice}</Text></View>
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
  qualityHero: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: 14, borderRadius: 17, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  qualityCopy: { flex: 1 },
  qualityEyebrow: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  qualityLabel: { fontSize: 19, fontWeight: "900", marginTop: 3 },
  qualityHint: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
  scoreCircle: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  score: { fontSize: 20, fontWeight: "900" },
  scoreLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "800", marginTop: -2 },
  message: { color: Colors.text, fontSize: 15, lineHeight: 21, fontWeight: "700", marginTop: 16 },
  metrics: { flexDirection: "row", alignItems: "center", marginTop: 18, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border },
  metric: { flex: 1, alignItems: "center" },
  value: { color: Colors.text, fontSize: 15, fontWeight: "900" },
  label: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
  divider: { width: 1, height: 28, backgroundColor: Colors.border },
  effortRow: { flexDirection: "row", alignItems: "center", marginTop: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: Colors.border },
  effortItem: { flex: 1, alignItems: "center", gap: 3 },
  effortLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 0.7 },
  effortValue: { color: Colors.text, fontSize: 14, fontWeight: "900" },
  trendRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 },
  trendText: { fontSize: 12, fontWeight: "800" },
  prRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  prText: { color: Colors.success, fontSize: 12, fontWeight: "900" },
  bestCard: { marginTop: 16, padding: 13, borderRadius: 15, backgroundColor: Colors.background },
  bestEyebrow: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  bestName: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 4 },
  bestValue: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  nextCard: { marginTop: 12, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  nextEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  nextText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5 },
});
