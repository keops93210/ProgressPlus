import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { SessionCoachDecision } from "@/services/workout-session-coach.service";

type Props = { decision: SessionCoachDecision };

const TONE = {
  progress: { color: Colors.success, icon: "↗" },
  stable: { color: Colors.primary, icon: "◆" },
  caution: { color: Colors.danger, icon: "!" },
  deload: { color: Colors.danger, icon: "♥" },
} as const;

function actionLabel(action: SessionCoachDecision["nextSessionAction"]) {
  switch (action) {
    case "progress": return "PROGRESSER";
    case "consolidate": return "CONSOLIDER";
    case "reduce": return "RÉDUIRE";
    default: return "RÉCUPÉRER";
  }
}

export function SessionCoachCard({ decision }: Props) {
  const tone = TONE[decision.tone];
  const confidence = Math.round(Math.max(0, Math.min(1, decision.confidence)) * 100);
  const quality = Math.max(0, Math.min(100, Math.round(decision.qualityScore)));

  return (
    <View
      accessible
      accessibilityLabel={`Coach Progress Plus. ${decision.title}. ${decision.message}. Qualité ${quality} sur 100. Confiance ${confidence} pour cent. Action suivante : ${actionLabel(decision.nextSessionAction)}.`}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={[styles.icon, { borderColor: tone.color }]}>
          <Text style={[styles.iconText, { color: tone.color }]}>{tone.icon}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>PROGRESS+ COACH</Text>
          <Text style={styles.title}>{decision.title}</Text>
        </View>
        <View style={styles.confidence}>
          <Text style={styles.confidenceValue}>{confidence}%</Text>
          <Text style={styles.confidenceLabel}>confiance</Text>
        </View>
      </View>
      <Text style={styles.message}>{decision.message}</Text>
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>QUALITÉ DE SÉANCE</Text>
          <Text style={[styles.score, { color: tone.color }]}>{quality}/100</Text>
        </View>
        <View style={[styles.action, { borderColor: tone.color }]}>
          <Text style={[styles.actionText, { color: tone.color }]}>{actionLabel(decision.nextSessionAction)}</Text>
        </View>
      </View>
    </View>
  );
}

export default SessionCoachCard;

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border, gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background },
  iconText: { fontSize: 19, fontWeight: "800" },
  headerText: { flex: 1 },
  eyebrow: { color: Colors.primaryLight, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 19, fontWeight: "800", marginTop: 3 },
  confidence: { alignItems: "flex-end" },
  confidenceValue: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  confidenceLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  message: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 4 },
  footerLabel: { color: Colors.textMuted, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  score: { fontSize: 24, fontWeight: "900", marginTop: 2 },
  action: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7, backgroundColor: Colors.background },
  actionText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.6 },
});
