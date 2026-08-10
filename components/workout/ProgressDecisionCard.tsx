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

export default function ProgressDecisionCard({ decision, onApply }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.eyebrow}>DÉCISION PROGRESS+</Text>
          <Text style={styles.title}>{actionLabels[decision.action]}</Text>
        </View>
        <View style={styles.confidence}>
          <Text style={styles.confidenceValue}>{Math.round(decision.confidence * 100)}%</Text>
          <Text style={styles.confidenceLabel}>confiance</Text>
        </View>
      </View>
      <Text style={styles.reason}>{decision.reason}</Text>
      <View style={styles.targetRow}>
        <View><Text style={styles.label}>Cible</Text><Text style={styles.value}>{decision.recommendedWeight > 0 ? `${decision.recommendedWeight} kg` : "—"}</Text></View>
        <View><Text style={styles.label}>Reps</Text><Text style={styles.value}>{decision.recommendedReps}</Text></View>
        {decision.qualityScore != null && <View><Text style={styles.label}>Qualité</Text><Text style={styles.value}>{decision.qualityScore}/100</Text></View>}
      </View>
      {decision.signals.length > 0 && <View style={styles.signals}><Text style={styles.signalTitle}>Signaux utilisés</Text><Text style={styles.signalText}>{decision.signals.join(" · ")}</Text></View>}
      {onApply && <Pressable onPress={onApply} style={styles.button}><Text style={styles.buttonText}>APPLIQUER LA CIBLE</Text></Pressable>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 17, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary, gap: 11 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  titleWrap: { flex: 1 },
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 4 },
  confidence: { alignItems: "flex-end" },
  confidenceValue: { color: Colors.primary, fontSize: 18, fontWeight: "900" },
  confidenceLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: "700", marginTop: 1 },
  reason: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  targetRow: { flexDirection: "row", gap: 28, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  label: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" },
  value: { color: Colors.text, fontSize: 19, fontWeight: "900", marginTop: 2 },
  signals: { padding: 10, borderRadius: 12, backgroundColor: Colors.surfaceLight },
  signalTitle: { color: Colors.text, fontSize: 10, fontWeight: "900" },
  signalText: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 3 },
  button: { minHeight: 44, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  buttonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
});
