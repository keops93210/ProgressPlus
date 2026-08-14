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
  return `Point fort actuel : ${strongest[0]}. Continue sans négliger les autres piliers.`;
}

export function GlobalProgressHero({ result, onPress, performanceScore, recoveryScore, transformationScore, consistencyScore }: Props) {
  const score = result.score;
  const pillars = result.pillarScores;
  const items = [["Corps", transformationScore ?? pillars?.transformation ?? null], ["Performance", performanceScore ?? pillars?.performance ?? null], ["Récupération", recoveryScore ?? pillars?.recovery ?? null], ["Régularité", consistencyScore ?? pillars?.consistency ?? null]] as const;
  const width = `${Math.max(0, Math.min(100, score ?? 0))}%` as `${number}%`;
  const delta = result.previousScore == null || score == null ? null : score - result.previousScore;
  const guidance = getGuidance(items);
  return <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
    <View style={styles.top}>
      <View style={styles.brandRow}>
        <View style={styles.icon}><Sparkles color={Design.colors.primaryLight} size={18} /></View>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>PROGRESS+ SCORE</Text>
          <Text style={styles.title}>{score == null ? "Construisons ton score" : result.label}</Text>
        </View>
      </View>
      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{score == null ? "—" : score}</Text>
        <Text style={styles.scoreCaption}>/ 100</Text>
      </View>
    </View>
    <View style={styles.track}><View style={[styles.fill, { width }]} /></View>
    <View style={styles.pillars}>{items.map(([label, value]) => <View key={label} style={styles.pillar}><Text style={styles.pillarLabel}>{label}</Text><Text style={styles.pillarValue}>{value == null ? "—" : Math.round(value)}</Text></View>)}</View>
    <View style={styles.guidance}><View style={styles.guidanceIcon}><Sparkles size={12} color={Design.colors.primaryLight} /></View><Text style={styles.guidanceText}>{guidance}</Text></View>
    <View style={styles.bottom}><View style={styles.metaRow}>{delta != null && delta > 0 ? <TrendingUp size={13} color={Design.colors.success} /> : delta != null && delta < 0 ? <TrendingDown size={13} color={Design.colors.danger} /> : null}<Text style={styles.meta}>{result.available}/4 piliers · confiance {result.confidence}%{delta == null ? "" : ` · ${delta > 0 ? "+" : ""}${delta} pts`}</Text></View><View style={styles.chevron}><ChevronRight color={Design.colors.primaryLight} size={17} /></View></View>
  </TouchableOpacity>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Design.colors.surface,
    borderRadius: Design.radius.xl,
    borderWidth: 1,
    borderColor: Design.colors.primary,
    padding: Design.spacing.lg,
    ...Design.elevation.card,
  },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  icon: { width: 42, height: 42, borderRadius: Design.radius.md, backgroundColor: Design.colors.primarySoft, alignItems: "center", justifyContent: "center", marginRight: Design.spacing.md },
  heading: { flex: 1 },
  eyebrow: { color: Design.colors.primaryLight, ...Design.typography.eyebrow },
  title: { color: Design.colors.text, ...Design.typography.h3, marginTop: 3 },
  scoreBlock: { alignItems: "flex-end", marginLeft: Design.spacing.md },
  score: { color: Design.colors.primaryLight, ...Design.typography.metricHero },
  scoreCaption: { color: Design.colors.textMuted, fontSize: 9, fontWeight: "800", marginTop: -3 },
  track: { height: 9, backgroundColor: Design.colors.background, borderRadius: 5, overflow: "hidden", marginTop: Design.spacing.lg },
  fill: { height: "100%", backgroundColor: Design.colors.primary, borderRadius: 5 },
  pillars: { flexDirection: "row", gap: Design.spacing.sm, marginTop: Design.spacing.md },
  pillar: { flex: 1, backgroundColor: Design.colors.background, borderRadius: Design.radius.sm, paddingVertical: 9, paddingHorizontal: 4, alignItems: "center", borderWidth: 1, borderColor: Design.colors.border },
  pillarLabel: { color: Design.colors.textMuted, fontSize: 8, fontWeight: "800" },
  pillarValue: { color: Design.colors.text, fontSize: 14, fontWeight: "900", marginTop: 3 },
  guidance: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: Design.spacing.md, paddingTop: Design.spacing.md, borderTopWidth: 1, borderTopColor: Design.colors.border },
  guidanceIcon: { width: 24, height: 24, borderRadius: 8, backgroundColor: Design.colors.primarySoft, alignItems: "center", justifyContent: "center" },
  guidanceText: { color: Design.colors.textSecondary, fontSize: 10, fontWeight: "800", flex: 1, lineHeight: 15 },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: Design.spacing.md },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { color: Design.colors.textMuted, fontSize: 10, fontWeight: "700" },
  chevron: { width: 30, height: 30, borderRadius: 10, backgroundColor: Design.colors.primarySoft, alignItems: "center", justifyContent: "center" },
});
