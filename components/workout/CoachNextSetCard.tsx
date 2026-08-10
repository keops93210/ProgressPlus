import { Check, TrendingDown, TrendingUp } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

type CoachNextSetCardProps = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  nextSet: number;
  totalSets: number;
  isPersonalRecord?: boolean;
};

export default function CoachNextSetCard({
  weight,
  reps,
  minReps,
  maxReps,
  nextSet,
  totalSets,
  isPersonalRecord = false,
}: CoachNextSetCardProps) {
  const isAboveTarget = reps >= maxReps;
  const isBelowTarget = reps < minReps;

  const title = isAboveTarget
    ? "Très solide. Garde cette charge."
    : isBelowTarget
      ? "On consolide avant de monter."
      : "Bonne série. On continue proprement.";

  const message = isAboveTarget
    ? `Tu as atteint le haut de la zone à ${weight} kg. Repars sur ${weight} kg pour la prochaine série.`
    : isBelowTarget
      ? `Reste à ${weight} kg et vise au moins ${minReps} reps sur la prochaine série.`
      : `Objectif atteint à ${weight} kg. Essaie de reproduire ${reps} reps sur la prochaine série.`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {isAboveTarget ? (
            <TrendingUp size={17} color={Colors.primary} />
          ) : isBelowTarget ? (
            <TrendingDown size={17} color={Colors.textSecondary} />
          ) : (
            <Check size={17} color={Colors.primary} />
          )}
          <Text style={styles.eyebrow}>COACH PROGRESS+</Text>
        </View>
        <Text style={styles.setLabel}>
          {nextSet <= totalSets ? `SÉRIE ${nextSet}` : "DERNIÈRE SÉRIE"}
        </Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.targetRow}>
        <View>
          <Text style={styles.label}>Dernière série</Text>
          <Text style={styles.value}>{weight} kg × {reps}</Text>
        </View>
        <View style={styles.divider} />
        <View>
          <Text style={styles.label}>Zone</Text>
          <Text style={styles.value}>{minReps}–{maxReps} reps</Text>
        </View>
      </View>

      {isPersonalRecord && (
        <View style={styles.prBadge}>
          <Text style={styles.prText}>🏆 NOUVEAU RECORD PERSONNEL</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  setLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 12 },
  message: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  targetRow: { flexDirection: "row", alignItems: "center", marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  label: { color: Colors.textSecondary, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  value: { color: Colors.text, fontSize: 15, fontWeight: "900", marginTop: 3 },
  divider: { width: 1, height: 30, backgroundColor: Colors.border, marginHorizontal: 18 },
  prBadge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primary + "18" },
  prText: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
});
