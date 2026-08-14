import { ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Design from "@/constants/design";

type PillarScores = { transformation: number | null; performance: number | null; recovery: number | null; consistency: number | null };
export type GlobalScoreView = { score: number | null; label: string; confidence: number; available: number; missing: string[]; pillarScores?: PillarScores; previousScore?: number | null };
type Props = { result: GlobalScoreView; onPress?: () => void; performanceScore?: number | null; recoveryScore?: number | null; transformationScore?: number | null; consistencyScore?: number | null };

function getGuidance(items: readonly (readonly [string, number | null])[]) {
  const available = items.filter(([, value]) => typeof value === "number") as [string, number][];
  if (!available.length) return "Complète tes données pour débloquer ton analyse personnalisée.";
  const weakest = [...available].sort((a, b) => a[1] - b[1])[0];
  if (weakest[1] < 60) return `Ton prochain levier : ${weakest[0]}. On peut gagner des points ici.`;
  const strongest = [...available].sort((a, b) => b[1] - a[1])[0];
  return `Point fort : ${strongest[0]}. Continue à progresser sans négliger le reste.`;
}

export function GlobalProgressHero({ result, onPress, performanceScore, recoveryScore, transformationScore, consistencyScore }: Props) {
  const score = result.score == null ? 0 : Math.round(result.score);
  const pillars = result.pillarScores;
  const items = [["Corps", transformationScore ?? pillars?.transformation ?? null], ["Performance", performanceScore ?? pillars?.performance ?? null], ["Récupération", recoveryScore ?? pillars?.recovery ?? null], ["Régularité", consistencyScore ?? pillars?.consistency ?? null]] as const;
  const delta = result.previousScore == null || result.score == null ? null : Math.round(result.score - result.previousScore);
  const guidance = getGuidance(items);

  return <TouchableOpacity style={styles.card} activeOpacity={0.94} onPress={onPress}>
    <View style={styles.glow} />
    <View style={styles.header}>
      <View style={styles.heading}>
        <View style={styles.kickerRow}><View style={styles.spark}><Sparkles color={Design.colors.primaryLight} size={13} /></View><Text style={styles.eyebrow}>PROGRESS+ SCORE</Text></View>
        <Text style={styles.title}>{score ? result.label : "Construisons ton score"}</Text>
        <Text style={styles.subtitle}>Ta progression globale, en un seul regard.</Text>
      </View>
      <View style={styles.scoreRing}><View style={styles.scoreInner}><Text style={styles.score}>{score || "—"}</Text><Text style={styles.scoreCaption}>/100</Text></View></View>
    </View>
    <View style={styles.progressMeta}><Text style={styles.progressLabel}>PROGRESSION</Text><Text style={styles.progressValue}>{score}%</Text></View>
    <View style={styles.track}><View style={[styles.fill, { width: `${score}%` as `${number}%` }]} /></View>
    <View style={styles.pillars}>{items.map(([label, value]) => <View key={label} style={styles.pillar}><Text style={styles.pillarLabel}>{label}</Text><Text style={styles.pillarValue}>{value == null ? "—" : Math.round(value)}</Text><View style={styles.pillarTrack}><View style={[styles.pillarFill, { width: `${Math.min(100, Math.max(0, value ?? 0))}%` as `${number}%` }]} /></View></View>)}</View>
    <View style={styles.insight}>
      <View style={styles.insightIcon}><Sparkles color={Design.colors.primaryLight} size={13} /></View>
      <View style={styles.insightCopy}><Text style={styles.insightLabel}>COACH PROGRESS+</Text><Text style={styles.insightText}>{guidance}</Text></View>
      {delta != null ? <View style={styles.delta}>{delta >= 0 ? <TrendingUp color={Design.colors.success} size={13} /> : <TrendingDown color={Design.colors.danger} size={13} />}<Text style={[styles.deltaText, { color: delta >= 0 ? Design.colors.success : Design.colors.danger }]}>{delta >= 0 ? "+" : ""}{delta}</Text></View> : <ChevronRight color={Design.colors.primaryLight} size={17} />}
    </View>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#15141C", borderRadius: 24, borderWidth: 1, borderColor: "#7047E8", padding: 18, overflow: "hidden", ...Design.elevation.card },
  glow: { position: "absolute", width: 220, height: 220, borderRadius: 110, backgroundColor: "#4B1FA820", top: -125, right: -70 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heading: { flex: 1, paddingRight: 14 },
  kickerRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  spark: { width: 25, height: 25, borderRadius: 8, backgroundColor: "#2A194A", alignItems: "center", justifyContent: "center" },
  eyebrow: { color: Design.colors.primaryLight, ...Design.typography.eyebrow },
  title: { color: "#FFFFFF", fontSize: 20, fontWeight: "900", marginTop: 9 },
  subtitle: { color: "#8E8B99", fontSize: 10, marginTop: 4 },
  scoreRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 8, borderColor: "#7C4EF0", backgroundColor: "#1A1625", alignItems: "center", justifyContent: "center" },
  scoreInner: { alignItems: "center", justifyContent: "center" },
  score: { color: "#FFFFFF", fontSize: 28, fontWeight: "900", lineHeight: 30 },
  scoreCaption: { color: "#9D94B0", fontSize: 9, fontWeight: "800" },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 18 },
  progressLabel: { color: "#777481", fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  progressValue: { color: Design.colors.primaryLight, fontSize: 11, fontWeight: "900" },
  track: { height: 7, backgroundColor: "#292733", borderRadius: 4, overflow: "hidden", marginTop: 6 },
  fill: { height: "100%", backgroundColor: "#8B58F4", borderRadius: 4 },
  pillars: { flexDirection: "row", gap: 8, marginTop: 12 },
  pillar: { flex: 1, backgroundColor: "#0D0D12", borderRadius: 12, padding: 10, borderWidth: 1, borderColor: "#292732" },
  pillarLabel: { color: "#85818D", fontSize: 8, fontWeight: "800" },
  pillarValue: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginTop: 4 },
  pillarTrack: { height: 3, backgroundColor: "#292733", borderRadius: 2, overflow: "hidden", marginTop: 7 },
  pillarFill: { height: "100%", backgroundColor: "#7F4CEB", borderRadius: 2 },
  insight: { marginTop: 12, backgroundColor: "#0D0D12", borderRadius: 14, borderWidth: 1, borderColor: "#282631", padding: 10, flexDirection: "row", alignItems: "center" },
  insightIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: "#24163F", alignItems: "center", justifyContent: "center" },
  insightCopy: { flex: 1, marginLeft: 9 },
  insightLabel: { color: Design.colors.primaryLight, fontSize: 7, fontWeight: "900", letterSpacing: 1 },
  insightText: { color: "#C0BDC7", fontSize: 9, fontWeight: "700", marginTop: 2, lineHeight: 13 },
  delta: { flexDirection: "row", alignItems: "center", gap: 2, marginLeft: 8 },
  deltaText: { fontSize: 10, fontWeight: "900" },
});
