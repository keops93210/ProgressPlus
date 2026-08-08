import { StyleSheet, Text, View } from "react-native";
import { Sparkles, TrendingUp, ShieldCheck } from "lucide-react-native";

import Colors from "@/constants/colors";
import type { CoachMode } from "@/services/coach.service";

interface Props {
  mode: CoachMode;
  weight: number | null;
  reps: number | null;
  reason: string;
}

export default function CoachRecommendationCard({ mode, weight, reps, reason }: Props) {
  const isPush = mode === "PUSH";
  const isHold = mode === "HOLD";
  const Icon = isPush ? TrendingUp : isHold ? ShieldCheck : Sparkles;
  const title = isPush ? "Progress+ te pousse" : isHold ? "Progress+ te protège" : "Progress+ te guide";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}><Icon color={Colors.primary} size={19} /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>COACH PROGRESS+</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {weight !== null && reps !== null ? (
        <View style={styles.target}>
          <Text style={styles.targetLabel}>OBJECTIF RECOMMANDÉ</Text>
          <Text style={styles.targetValue}>{weight} kg × {reps}</Text>
        </View>
      ) : null}

      <Text style={styles.reason}>{reason}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.primary },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 16, fontWeight: "800", marginTop: 2 },
  target: { marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: Colors.background },
  targetLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  targetValue: { color: Colors.primary, fontSize: 25, fontWeight: "900", marginTop: 3 },
  reason: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 11 },
});
