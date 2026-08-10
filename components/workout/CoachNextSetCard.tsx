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
  recoveryScore?: number | null;
};

export default function CoachNextSetCard({
  weight,
  reps,
  minReps,
  maxReps,
  nextSet,
  totalSets,
  isPersonalRecord = false,
  recoveryScore,
}: CoachNextSetCardProps) {
  const isAboveTarget = reps >= maxReps;
  const isBelowTarget = reps < minReps;
  const recoveryLow = typeof recoveryScore === "number" && recoveryScore <= 2;
  const recoveryHigh = typeof recoveryScore === "number" && recoveryScore >= 4.2;

  const shouldIncreaseWeight = isAboveTarget && recoveryHigh && weight > 0;
  const shouldConsolidate = recoveryLow || isBelowTarget;

  const nextWeight = shouldIncreaseWeight ? weight + 2.5 : weight;
  const nextReps = shouldConsolidate
    ? Math.min(maxReps, Math.max(minReps, isBelowTarget ? minReps : reps))
    : shouldIncreaseWeight
      ? minReps
      : Math.min(maxReps, reps + 1);

  const decision = shouldIncreaseWeight
    ? "MONTER"
    : shouldConsolidate
      ? "CONSOLIDER"
      : "MAINTENIR";

  const title = recoveryLow
    ? "On consolide aujourd'hui."
    : isAboveTarget && recoveryHigh
      ? "Tu as gagné le droit de monter."
      : isAboveTarget
        ? "Très solide. On garde la charge."
        : isBelowTarget
          ? "On consolide avant de monter."
          : "Bonne série. On continue proprement.";

  const message = recoveryLow
    ? `Ta récupération est basse. Garde ${weight} kg et reste dans une zone maîtrisée, sans chercher à forcer.`
    : isAboveTarget && recoveryHigh
      ? `${maxReps} reps atteintes avec une bonne récupération. Progress+ augmente légèrement la charge pour la prochaine série.`
      : isAboveTarget
        ? `Tu as atteint le haut de la zone à ${weight} kg. On garde cette charge pour sécuriser la progression.`
        : isBelowTarget
          ? `La série est sous la zone. Reste à ${weight} kg et vise au moins ${minReps} reps.`
          : `Objectif atteint à ${weight} kg. On cherche ${nextReps} reps sur la prochaine série.`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          {recoveryLow ? (
            <TrendingDown size={17} color={Colors.textSecondary} />
          ) : isAboveTarget ? (
            <TrendingUp size={17} color={Colors.primary} />
          ) : (
            <Check size={17} color={Colors.primary} />
          )}
          <Text style={styles.eyebrow}>COACH PROGRESS+</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.decisionBadge, shouldIncreaseWeight && styles.decisionBadgePrimary]}>
            <Text style={[styles.decisionText, shouldIncreaseWeight && styles.decisionTextPrimary]}>{decision}</Text>
          </View>
          <Text style={styles.setLabel}>{nextSet <= totalSets ? `SÉRIE ${nextSet}/${totalSets}` : "DERNIÈRE SÉRIE"}</Text>
        </View>
      </View>

      <View style={styles.setProgress}>
        {Array.from({ length: Math.max(1, totalSets) }).map((_, index) => {
          const setNumber = index + 1;
          const isCompleted = setNumber < nextSet;
          const isCurrent = setNumber === nextSet;
          return (
            <View
              key={setNumber}
              style={[
                styles.setDot,
                isCompleted && styles.setDotCompleted,
                isCurrent && styles.setDotCurrent,
              ]}
            />
          );
        })}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      <View style={styles.nextTarget}>
        <View style={styles.nextTargetCopy}>
          <Text style={styles.nextTargetEyebrow}>PROCHAINE CIBLE</Text>
          <Text style={styles.nextTargetValue}>{nextWeight} kg × {nextReps}</Text>
          <Text style={styles.nextTargetHint}>Préparée automatiquement par Progress+</Text>
        </View>
      </View>

      <View style={styles.targetRow}>
        <View style={styles.metricBlock}>
          <Text style={styles.label}>Dernière série</Text>
          <Text style={styles.value}>{weight} kg × {reps}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.metricBlock}>
          <Text style={styles.label}>Zone</Text>
          <Text style={styles.value}>{minReps}–{maxReps} reps</Text>
        </View>
        {typeof recoveryScore === "number" && (
          <>
            <View style={styles.divider} />
            <View style={styles.metricBlock}>
              <Text style={styles.label}>Récup.</Text>
              <Text style={styles.value}>{recoveryScore.toFixed(1)}/5</Text>
            </View>
          </>
        )}
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
  card: { borderRadius: 20, padding: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginBottom: 14 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 7 },
  decisionBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 999, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  decisionBadgePrimary: { backgroundColor: Colors.primary + "18", borderColor: Colors.primary + "45" },
  decisionText: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  decisionTextPrimary: { color: Colors.primary },
  setLabel: { color: Colors.textSecondary, fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
  setProgress: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 13 },
  setDot: { flex: 1, height: 4, borderRadius: 999, backgroundColor: Colors.border },
  setDotCompleted: { backgroundColor: Colors.primary + "65" },
  setDotCurrent: { backgroundColor: Colors.primary, height: 6 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 12 },
  message: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  nextTarget: { marginTop: 14, borderRadius: 16, backgroundColor: Colors.primary + "12", borderWidth: 1, borderColor: Colors.primary + "35", padding: 14 },
  nextTargetCopy: { alignItems: "center" },
  nextTargetEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  nextTargetValue: { color: Colors.text, fontSize: 26, fontWeight: "900", marginTop: 4 },
  nextTargetHint: { color: Colors.textSecondary, fontSize: 10, fontWeight: "600", marginTop: 3 },
  targetRow: { flexDirection: "row", alignItems: "center", marginTop: 14, paddingTop: 13, borderTopWidth: 1, borderTopColor: Colors.border },
  metricBlock: { flexShrink: 1 },
  label: { color: Colors.textSecondary, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  value: { color: Colors.text, fontSize: 13, fontWeight: "900", marginTop: 3 },
  divider: { width: 1, height: 30, backgroundColor: Colors.border, marginHorizontal: 10 },
  prBadge: { alignSelf: "flex-start", marginTop: 12, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primary + "18" },
  prText: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.6 },
});
