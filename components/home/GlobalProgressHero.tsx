import { ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Design from "@/constants/design";

type PillarScores = { transformation: number | null; performance: number | null; recovery: number | null; consistency: number | null };
export type GlobalScoreView = { score: number | null; label: string; confidence: number; available: number; missing: string[]; pillarScores?: PillarScores; previousScore?: number | null };
type Props = { result: GlobalScoreView; onPress?: () => void; performanceScore?: number | null; recoveryScore?: number | null; transformationScore?: number | null; consistencyScore?: number | null };

function getGuidance(items: readonly (readonly [string, number | null])[]) {
  const available = items.filter(([, value]) => typeof value === "number") as [string, number][];
  if (!available.length) return "Complète tes données pour obtenir une analyse personnalisée.";
  const weakest = [...available].sort((a, b) => a[1] - b[1])[0];
  if (weakest[1] < 55) return `Ton prochain levier : ${weakest[0]}.`;
  const strongest = [...available].sort((a, b) => b[1] - a[1])[0];
  return `Point fort : ${strongest[0]}. Continue à construire ta progression.`;
}

export function GlobalProgressHero({ result, onPress, performanceScore, recoveryScore, transformationScore, consistencyScore }: Props) {
  const score = result.score;
  const pillars = result.pillarScores;
  const items = [
    ["Corps", transformationScore ?? pillars?.transformation ?? null],
    ["Performance", performanceScore ?? pillars?.performance ?? null],
    ["Récupération", recoveryScore ?? pillars?.recovery ?? null],
    ["Régularité", consistencyScore ?? pillars?.consistency ?? null],
  ] as const;
  const width = `${Math.max(0, Math.min(100, score ?? 0))}%` as `${number}%`;
  const delta = result.previousScore == null || score == null ? null : score - result.previousScore;
  const guidance = getGuidance(items);
  const chartHeights = [28, 36, 31, 48, 42, 59, 68];

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.94} onPress={onPress}>
      <View style={styles.heroRow}>
        <View style={styles.heroCopy}>
          <View style={styles.kickerRow}>
            <View style={styles.icon}><Sparkles color={Design.colors.primaryLight} size={16} /></View>
            <Text style={styles.eyebrow}>PROGRESS+ INSIGHT</Text>
          </View>
          <Text style={styles.title}>{score == null ? "Construisons ta progression" : result.label}</Text>
          <Text style={styles.subtitle}>{guidance}</Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={styles.score}>{score == null ? "—" : score}</Text>
          <Text style={styles.scoreUnit}>/100</Text>
        </View>
      </View>

      <View style={styles.track}><View style={[styles.fill, { width }]} /></View>

      <View style={styles.metricGrid}>
        {items.map(([label, value]) => (
          <View key={label} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={styles.metricValue}>{value == null ? "—" : Math.round(value)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.chartKicker}>ÉVOLUTION</Text>
          <Text style={styles.chartTitle}>Ta tendance</Text>
        </View>
        {delta != null ? (
          <View style={styles.delta}>
            {delta >= 0 ? <TrendingUp size={13} color={Design.colors.success} /> : <TrendingDown size={13} color={Design.colors.danger} />}
            <Text style={[styles.deltaText, delta >= 0 ? styles.success : styles.danger]}>{delta >= 0 ? "+" : ""}{delta} pts</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.chart}>
        {chartHeights.map((height, index) => <View key={index} style={styles.chartColumn}><View style={[styles.chartBar, { height }]} /></View>)}
      </View>

      <View style={styles.footer}>
        <Text style={styles.meta}>{result.available}/4 piliers · confiance {result.confidence}%</Text>
        <View style={styles.open}><Text style={styles.openText}>Voir l'analyse</Text><ChevronRight color={Design.colors.primaryLight} size={15} /></View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Design.colors.surface, borderRadius: 22, borderWidth: 1, borderColor: Design.colors.border, padding: 16, ...Design.elevation.card },
  heroRow: { flexDirection: "row", alignItems: "center" },
  heroCopy: { flex: 1, paddingRight: 10 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Design.colors.primarySoft, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: Design.colors.primaryLight, ...Design.typography.eyebrow },
  title: { color: Design.colors.text, ...Design.typography.h3, marginTop: 8 },
  subtitle: { color: Design.colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 4 },
  scoreWrap: { alignItems: "flex-end", justifyContent: "center", minWidth: 72 },
  score: { color: Design.colors.primaryLight, fontSize: 42, lineHeight: 43, fontWeight: "900", letterSpacing: -1.8 },
  scoreUnit: { color: Design.colors.textMuted, fontSize: 9, fontWeight: "800", marginTop: -2 },
  track: { height: 6, backgroundColor: Design.colors.background, borderRadius: 3, overflow: "hidden", marginTop: 14 },
  fill: { height: "100%", backgroundColor: Design.colors.primary, borderRadius: 3 },
  metricGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  metricCard: { width: "48.8%", minHeight: 54, backgroundColor: Design.colors.background, borderRadius: 12, borderWidth: 1, borderColor: Design.colors.border, paddingHorizontal: 12, paddingVertical: 9, justifyContent: "center" },
  metricLabel: { color: Design.colors.textMuted, fontSize: 8, fontWeight: "800" },
  metricValue: { color: Design.colors.text, fontSize: 18, fontWeight: "900", marginTop: 2 },
  chartHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginTop: 15 },
  chartKicker: { color: Design.colors.textMuted, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  chartTitle: { color: Design.colors.text, fontSize: 13, fontWeight: "900", marginTop: 2 },
  delta: { flexDirection: "row", alignItems: "center", gap: 4 },
  deltaText: { fontSize: 10, fontWeight: "900" },
  success: { color: Design.colors.success },
  danger: { color: Design.colors.danger },
  chart: { height: 72, marginTop: 8, flexDirection: "row", alignItems: "flex-end", gap: 5, borderBottomWidth: 1, borderBottomColor: Design.colors.border, paddingHorizontal: 3 },
  chartColumn: { flex: 1, height: "100%", justifyContent: "flex-end" },
  chartBar: { width: "100%", maxWidth: 16, alignSelf: "center", backgroundColor: Design.colors.primary, borderTopLeftRadius: 5, borderTopRightRadius: 5, opacity: 0.88 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 11 },
  meta: { color: Design.colors.textMuted, fontSize: 9, fontWeight: "700" },
  open: { flexDirection: "row", alignItems: "center", gap: 2 },
  openText: { color: Design.colors.primaryLight, fontSize: 10, fontWeight: "900" },
});
