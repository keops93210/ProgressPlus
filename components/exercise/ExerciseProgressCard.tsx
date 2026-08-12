import { useEffect, useState } from "react";
import { Activity, Award, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getExerciseProgress, ExerciseProgressSummary } from "@/services/exercise-progress.service";

type Props = {
  exerciseId: string;
};

export default function ExerciseProgressCard({ exerciseId }: Props) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ExerciseProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user || !exerciseId) return;
      try {
        const result = await getExerciseProgress(user.id, exerciseId);
        if (active) setSummary(result.summary);
      } catch (error) {
        console.log("EXERCISE PROGRESS LOAD ERROR =", error);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user, exerciseId]);

  if (loading || !summary || summary.sessionsCount === 0) return null;

  const TrendIcon = summary.trend === "up" ? TrendingUp : summary.trend === "down" ? TrendingDown : Activity;
  const trendLabel = summary.trend === "up" ? "En progression" : summary.trend === "down" ? "À consolider" : "Stable";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>PROGRESSION</Text>
          <Text style={styles.title}>Tes performances</Text>
        </View>
        <View style={styles.trendBadge}>
          <TrendIcon size={16} color={summary.trend === "down" ? Colors.danger : Colors.primary} />
          <Text style={styles.trendText}>{trendLabel}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat label="Meilleur poids" value={`${summary.bestWeight} kg`} />
        <Stat label="Meilleure série" value={`${summary.bestWeight} × ${summary.bestReps}`} />
        <Stat label="1RM estimé" value={`${summary.bestEstimated1rm.toFixed(1)} kg`} />
        <Stat label="Volume max" value={`${Math.round(summary.bestVolume)} kg`} />
      </View>

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <Award size={18} color={Colors.primary} />
        </View>
        <View style={styles.footerCopy}>
          <Text style={styles.footerTitle}>
            {summary.personalRecord ? `PR : ${summary.personalRecord.weight} kg × ${summary.personalRecord.reps}` : "Pas encore de PR enregistré"}
          </Text>
          <Text style={styles.footerText}>
            {summary.trendPercent > 0 ? `+${summary.trendPercent}% de 1RM estimé depuis ta dernière séance.` : summary.trendPercent < 0 ? `${summary.trendPercent}% de 1RM estimé depuis ta dernière séance.` : "Ton niveau est stable depuis ta dernière séance."}
          </Text>
        </View>
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 16, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#FFFFFF", padding: 18 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 16 },
  kicker: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.3 },
  title: { color: Colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 },
  trendBadge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 14, backgroundColor: Colors.surfaceLight, paddingHorizontal: 10, paddingVertical: 8 },
  trendText: { color: Colors.text, fontSize: 11, fontWeight: "900" },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  stat: { width: "48%", minHeight: 68, borderRadius: 15, backgroundColor: Colors.surfaceLight, padding: 11 },
  statLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 5 },
  footer: { flexDirection: "row", alignItems: "center", gap: 11, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  footerIcon: { width: 38, height: 38, borderRadius: 13, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  footerCopy: { flex: 1 },
  footerTitle: { color: Colors.text, fontSize: 13, fontWeight: "900" },
  footerText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
