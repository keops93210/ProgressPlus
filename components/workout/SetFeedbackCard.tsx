import Colors from "@/constants/colors";
import type { SetFeedback } from "@/services/set-feedback.service";
import { View, Text, StyleSheet } from "react-native";

type Props = { feedback: SetFeedback };

export default function SetFeedbackCard({ feedback }: Props) {
  const tone = feedback.tone;
  const accent = tone === "progress" ? Colors.success : tone === "warning" || tone === "intense" ? Colors.danger : Colors.primary;
  const background = tone === "progress" ? "#10271A" : tone === "warning" || tone === "intense" ? "#2A141B" : Colors.primarySoft;

  return (
    <View style={[styles.card, { borderColor: accent, backgroundColor: background }]}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: accent }]} />
        <Text style={[styles.eyebrow, { color: accent }]}>{tone === "progress" ? "PROGRESSION" : tone === "warning" ? "À SURVEILLER" : tone === "intense" ? "INTENSITÉ" : "COACH"}</Text>
      </View>
      <Text style={styles.title}>{feedback.title}</Text>
      <Text style={styles.message}>{feedback.message}</Text>
      <View style={styles.footer}>
        <View style={styles.track}><View style={[styles.fill, { width: `${Math.round(feedback.completionRatio * 100)}%`, backgroundColor: accent }]} /></View>
        <Text style={[styles.percent, { color: accent }]}>{Math.round(feedback.completionRatio * 100)}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, borderWidth: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  eyebrow: { fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 8 },
  message: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5 },
  footer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  track: { flex: 1, height: 5, borderRadius: 3, overflow: "hidden", backgroundColor: Colors.surfaceLight },
  fill: { height: "100%", borderRadius: 3 },
  percent: { minWidth: 36, textAlign: "right", fontSize: 11, fontWeight: "900", fontVariant: ["tabular-nums"] },
});
