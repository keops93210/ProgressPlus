import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SessionCoachDecision } from "@/services/workout-session-coach.service";

type Props = { decision: SessionCoachDecision };

const TONE = {
  progress: { color: "#22C55E", icon: "↗" },
  stable: { color: "#8B5CF6", icon: "◆" },
  caution: { color: "#F43F5E", icon: "!" },
  deload: { color: "#F43F5E", icon: "♥" },
} as const;

export default function SessionCoachCard({ decision }: Props) {
  const tone = TONE[decision.tone];
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.icon, { borderColor: tone.color }]}><Text style={[styles.iconText, { color: tone.color }]}>{tone.icon}</Text></View>
        <View style={styles.headerText}><Text style={styles.eyebrow}>PROGRESS+ COACH</Text><Text style={styles.title}>{decision.title}</Text></View>
        <View style={styles.confidence}><Text style={styles.confidenceValue}>{Math.round(decision.confidence * 100)}%</Text><Text style={styles.confidenceLabel}>confiance</Text></View>
      </View>
      <Text style={styles.message}>{decision.message}</Text>
      <View style={styles.footer}>
        <View><Text style={styles.footerLabel}>QUALITÉ DE SÉANCE</Text><Text style={[styles.score, { color: tone.color }]}>{decision.qualityScore}/100</Text></View>
        <View style={[styles.action, { borderColor: tone.color }]}><Text style={[styles.actionText, { color: tone.color }]}>{decision.nextSessionAction === "progress" ? "PROGRESSER" : decision.nextSessionAction === "consolidate" ? "CONSOLIDER" : decision.nextSessionAction === "reduce" ? "RÉDUIRE" : "RÉCUPÉRER"}</Text></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#17181E", borderRadius: 20, padding: 18, borderWidth: 1, borderColor: "#252731", gap: 16 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 }, icon: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" }, iconText: { fontSize: 19, fontWeight: "800" }, headerText: { flex: 1 },
  eyebrow: { color: "#A78BFA", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 }, title: { color: "#F5F5F7", fontSize: 19, fontWeight: "800", marginTop: 3 }, confidence: { alignItems: "flex-end" }, confidenceValue: { color: "#F5F5F7", fontSize: 15, fontWeight: "800" }, confidenceLabel: { color: "#777985", fontSize: 10, marginTop: 2 },
  message: { color: "#B9BAC3", fontSize: 14, lineHeight: 21 }, footer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 4 }, footerLabel: { color: "#777985", fontSize: 9, fontWeight: "800", letterSpacing: 1 }, score: { fontSize: 24, fontWeight: "900", marginTop: 2 }, action: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 11, paddingVertical: 7 }, actionText: { fontSize: 10, fontWeight: "900", letterSpacing: .6 },
});
