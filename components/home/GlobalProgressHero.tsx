import { ChevronRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

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
  return <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
    <View style={styles.top}><View style={styles.brandRow}><View style={styles.icon}><Sparkles color={Colors.primaryLight} size={18} /></View><View><Text style={styles.eyebrow}>PROGRESS+ SCORE</Text><Text style={styles.title}>{score == null ? "Construisons ton score" : result.label}</Text></View></View><Text style={styles.score}>{score == null ? "—" : score}</Text></View>
    <View style={styles.track}><View style={[styles.fill, { width }]} /></View>
    <View style={styles.pillars}>{items.map(([label, value]) => <View key={label} style={styles.pillar}><Text style={styles.pillarLabel}>{label}</Text><Text style={styles.pillarValue}>{value == null ? "—" : Math.round(value)}</Text></View>)}</View>
    <View style={styles.guidance}><Sparkles size={13} color={Colors.primaryLight} /><Text style={styles.guidanceText}>{guidance}</Text></View>
    <View style={styles.bottom}><View style={styles.metaRow}>{delta != null && delta > 0 ? <TrendingUp size={13} color={Colors.success} /> : delta != null && delta < 0 ? <TrendingDown size={13} color={Colors.danger} /> : null}<Text style={styles.meta}>{result.available}/4 piliers · confiance {result.confidence}%{delta == null ? "" : ` · ${delta > 0 ? "+" : ""}${delta} pts`}</Text></View><ChevronRight color={Colors.primaryLight} size={18} /></View>
  </TouchableOpacity>;
}
const styles = StyleSheet.create({ card: { backgroundColor: Colors.surface, borderRadius: 22, borderWidth: 1, borderColor: Colors.primary, padding: 17 }, top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, brandRow: { flexDirection: "row", alignItems: "center", flex: 1 }, icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center", marginRight: 10 }, eyebrow: { color: Colors.primaryLight, fontSize: 9, fontWeight: "900", letterSpacing: 1.3 }, title: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 3 }, score: { color: Colors.primaryLight, fontSize: 32, fontWeight: "900" }, track: { height: 8, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden", marginTop: 15 }, fill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 }, pillars: { flexDirection: "row", gap: 7, marginTop: 12 }, pillar: { flex: 1, backgroundColor: Colors.background, borderRadius: 10, paddingVertical: 7, alignItems: "center" }, pillarLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: "800" }, pillarValue: { color: Colors.text, fontSize: 13, fontWeight: "900", marginTop: 2 }, guidance: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10, paddingTop: 9, borderTopWidth: 1, borderTopColor: Colors.border }, guidanceText: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800", flex: 1 }, bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 }, metaRow: { flexDirection: "row", alignItems: "center", gap: 4 }, meta: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" } });