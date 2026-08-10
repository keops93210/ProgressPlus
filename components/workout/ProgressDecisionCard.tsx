import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { ProgressionDecision } from "@/services/progress-engine.service";

type Props = { decision: ProgressionDecision; onApply?: () => void };

const actionLabels: Record<ProgressionDecision["action"], string> = {
  increase_weight: "AUGMENTER LA CHARGE",
  increase_reps: "AJOUTER UNE REP",
  keep_weight: "CONSOLIDER",
  reduce_load: "RÉDUIRE LÉGÈREMENT",
  deload: "RÉCUPÉRATION RECOMMANDÉE",
};

function getTone(action: ProgressionDecision["action"]) {
  if (action === "increase_weight" || action === "increase_reps") return Colors.success;
  if (action === "reduce_load" || action === "deload") return Colors.danger;
  return Colors.primary;
}

export default function ProgressDecisionCard({ decision, onApply }: Props) {
  const tone = getTone(decision.action);
  const confidence = Math.round(decision.confidence * 100);

  return (
    <View style={[styles.card, { borderColor: tone + "55" }]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.statusDot, { backgroundColor: tone }]} />
            <Text style={[styles.eyebrow, { color: tone }]}>DÉCISION PROGRESS+</Text>
          </View>
          <Text style={styles.title}>{actionLabels[decision.action]}</Text>
        </View>
        <View style={[styles.confidence, { borderColor: tone + "45", backgroundColor: tone + "12" }]}>
          <Text style={[styles.confidenceValue, { color: tone }]}>{confidence}%</Text>
          <Text style={styles.confidenceLabel}>confiance</Text>
        </View>
      </View>

      <Text style={styles.reason}>{decision.reason}</Text>

      <View style={styles.targetCard}>
        <View style={styles.targetMain}>
          <Text style={styles.targetEyebrow}>PROCHAINE CIBLE</Text>
          <Text style={styles.targetValue}>{decision.recommendedWeight > 0 ? `${decision.recommendedWeight} kg` : "—"} <Text style={styles.targetTimes}>× {decision.recommendedReps}</Text></Text>
        </View>
        {decision.qualityScore != null && (
          <View style={styles.quality}>
            <Text style={styles.label}>QUALITÉ</Text>
            <Text style={[styles.qualityValue, { color: tone }]}>{decision.qualityScore}</Text>
          </View>
        )}
      </View>

      {decision.signals.length > 0 && (
        <View style={styles.signals}>
          <Text style={styles.signalTitle}>POURQUOI ?</Text>
          <Text style={styles.signalText}>{decision.signals.join(" · ")}</Text>
        </View>
      )}

      {onApply && (
        <Pressable onPress={onApply} style={({ pressed }) => [styles.button, { backgroundColor: tone }, pressed && styles.buttonPressed]}>
          <Text style={styles.buttonText}>APPLIQUER LA CIBLE</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 17, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, gap: 12 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  titleWrap: { flex: 1 },
  eyebrowRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 5 },
  confidence: { alignItems: "center", minWidth: 64, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  confidenceValue: { fontSize: 17, fontWeight: "900" },
  confidenceLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: "800", marginTop: 1 },
  reason: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  targetCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 13, borderRadius: 15, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  targetMain: { flex: 1 },
  targetEyebrow: { color: Colors.textMuted, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  targetValue: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: 3 },
  targetTimes: { color: Colors.textSecondary, fontSize: 18 },
  quality: { alignItems: "center", paddingLeft: 16, marginLeft: 12, borderLeftWidth: 1, borderLeftColor: Colors.border },
  label: { color: Colors.textMuted, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  qualityValue: { fontSize: 22, fontWeight: "900", marginTop: 2 },
  signals: { padding: 11, borderRadius: 13, backgroundColor: Colors.surfaceLight },
  signalTitle: { color: Colors.text, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  signalText: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 3 },
  button: { minHeight: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  buttonPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  buttonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", letterSpacing: 0.5 },
});
