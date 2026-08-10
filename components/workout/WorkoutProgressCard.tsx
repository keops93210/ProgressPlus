import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutProgressCardProps {
  totalSets: number;
  completedSets: number[];
  weight: number;
  reps: number;
  lastWeight?: number | null;
  lastReps?: number | null;
}

export default function WorkoutProgressCard({ totalSets, completedSets, weight, reps, lastWeight, lastReps }: WorkoutProgressCardProps) {
  const completedCount = completedSets.length;
  const currentSet = Math.min(totalSets, completedCount + 1);
  const progress = totalSets > 0 ? Math.min(1, completedCount / totalSets) : 0;
  const remainingSets = Math.max(0, totalSets - completedCount);
  const currentVolume = Math.max(0, weight) * Math.max(0, reps);
  const estimated1RM = weight > 0 && reps > 0 ? weight * (1 + reps / 30) : 0;
  const progressPercent = Math.round(progress * 100);
  const hasPrevious = Number(lastWeight) > 0 && Number(lastReps) > 0;
  const previousVolume = hasPrevious ? Number(lastWeight) * Number(lastReps) : 0;
  const volumeDelta = hasPrevious ? currentVolume - previousVolume : 0;
  const volumeDeltaPercent = hasPrevious && previousVolume > 0 ? Math.round((volumeDelta / previousVolume) * 100) : 0;
  const progressComplete = totalSets > 0 && completedCount >= totalSets;

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <View style={styles.eyebrowRow}>
            <View style={[styles.liveDot, progressComplete && styles.liveDotComplete]} />
            <Text style={styles.eyebrow}>{progressComplete ? "EXERCICE TERMINÉ" : "SÉANCE EN COURS"}</Text>
          </View>
          <Text style={styles.title}>Tes séries</Text>
        </View>
        <View style={styles.counterPill}>
          <Text style={styles.counterValue}>{completedCount}</Text>
          <Text style={styles.counterSlash}>/</Text>
          <Text style={styles.counterTotal}>{totalSets}</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }, progressComplete && styles.progressFillComplete]} />
      </View>
      <Text style={styles.progressCaption}>{progressComplete ? "100% · exercice validé" : `${progressPercent}% de l'exercice terminé`}</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>MAINTENANT</Text>
          <Text style={styles.summaryValue}>{weight} kg <Text style={styles.summaryMultiply}>×</Text> {reps}</Text>
        </View>
        <View style={styles.summaryBlock}>
          <Text style={styles.summaryLabel}>1RM ESTIMÉ</Text>
          <Text style={styles.summaryValue}>{estimated1RM > 0 ? `${Math.round(estimated1RM)} kg` : "—"}</Text>
        </View>
        <View style={[styles.summaryBlock, styles.summaryRight]}>
          <Text style={styles.summaryLabel}>RESTE</Text>
          <Text style={styles.summaryValue}>{remainingSets} série{remainingSets > 1 ? "s" : ""}</Text>
        </View>
      </View>

      {hasPrevious && (
        <View style={styles.comparisonBox}>
          <View style={styles.comparisonCopy}>
            <Text style={styles.comparisonEyebrow}>PAR RAPPORT À LA DERNIÈRE FOIS</Text>
            <Text style={styles.comparisonText}>{lastWeight} kg × {lastReps} reps</Text>
          </View>
          <View style={[styles.deltaBadge, volumeDelta > 0 ? styles.deltaPositive : volumeDelta < 0 ? styles.deltaNegative : styles.deltaNeutral]}>
            <Text style={[styles.deltaValue, volumeDelta > 0 && styles.deltaPositiveText, volumeDelta < 0 && styles.deltaNegativeText]}>{volumeDelta > 0 ? "+" : ""}{volumeDeltaPercent}%</Text>
            <Text style={styles.deltaLabel}>volume</Text>
          </View>
        </View>
      )}

      <View style={styles.setList}>
        {Array.from({ length: totalSets }).map((_, index) => {
          const setNumber = index + 1;
          const completed = completedSets.includes(setNumber);
          const current = !completed && setNumber === currentSet;
          const upcoming = !completed && !current;

          return (
            <View key={setNumber} style={[styles.setRow, current && styles.setRowCurrent, completed && styles.setRowDone]}>
              <View style={[styles.setIcon, completed && styles.setIconDone, current && styles.setIconCurrent]}>
                <Text style={[styles.setIconText, completed && styles.setIconTextDone, current && styles.setIconTextCurrent]}>
                  {completed ? "✓" : setNumber}
                </Text>
              </View>
              <View style={styles.setCopy}>
                <Text style={[styles.setTitle, current && styles.setTitleCurrent]}>
                  Série {setNumber}
                  {current ? "  ·  MAINTENANT" : ""}
                </Text>
                <Text style={styles.setSubtitle}>
                  {completed ? "Série enregistrée" : current ? `${weight} kg × ${reps} reps` : "À venir"}
                </Text>
              </View>
              {completed ? (
                <View style={styles.doneBadge}><Text style={styles.doneLabel}>FAIT</Text></View>
              ) : current ? (
                <View style={styles.currentBadge}><Text style={styles.currentLabel}>GO</Text></View>
              ) : upcoming ? (
                <Text style={styles.upcomingLabel}>—</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      {!progressComplete && (
        <View style={styles.nextBox}>
          <View style={styles.nextCopy}>
            <Text style={styles.nextLabel}>PROCHAINE SÉRIE</Text>
            <Text style={styles.nextHint}>Garde cette cible et ajuste seulement si tes sensations l'exigent.</Text>
          </View>
          <View style={styles.nextMetric}><Text style={styles.nextValue}>{weight}</Text><Text style={styles.nextUnit}>kg</Text></View>
          <View style={styles.nextDivider} />
          <View style={styles.nextMetric}><Text style={styles.nextValue}>{reps}</Text><Text style={styles.nextUnit}>reps</Text></View>
        </View>
      )}

      <View style={styles.volumeRow}>
        <Text style={styles.volumeLabel}>Volume de la série actuelle</Text>
        <Text style={styles.volumeValue}>{currentVolume.toLocaleString("fr-FR")} kg</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleBlock: { flex: 1 },
  eyebrowRow: { flexDirection: "row", alignItems: "center" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 7 },
  liveDotComplete: { backgroundColor: Colors.success },
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  counterPill: { flexDirection: "row", alignItems: "baseline", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: Colors.surfaceLight },
  counterValue: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  counterSlash: { color: Colors.textMuted, fontSize: 15, fontWeight: "800", marginHorizontal: 2 },
  counterTotal: { color: Colors.textSecondary, fontSize: 15, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 16 },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: Colors.primary },
  progressFillComplete: { backgroundColor: Colors.success },
  progressCaption: { color: Colors.textMuted, fontSize: 9, fontWeight: "800", marginTop: 6, textAlign: "right" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryBlock: { flex: 1 },
  summaryRight: { alignItems: "flex-end" },
  summaryLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  summaryValue: { color: Colors.text, fontSize: 14, fontWeight: "900", marginTop: 4 },
  summaryMultiply: { color: Colors.primary },
  comparisonBox: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: Colors.surfaceLight, flexDirection: "row", alignItems: "center" },
  comparisonCopy: { flex: 1 },
  comparisonEyebrow: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  comparisonText: { color: Colors.text, fontSize: 13, fontWeight: "900", marginTop: 4 },
  deltaBadge: { minWidth: 58, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, alignItems: "center" },
  deltaPositive: { backgroundColor: Colors.success + "18" },
  deltaNegative: { backgroundColor: Colors.danger + "16" },
  deltaNeutral: { backgroundColor: Colors.background },
  deltaValue: { color: Colors.text, fontSize: 12, fontWeight: "900" },
  deltaPositiveText: { color: Colors.success },
  deltaNegativeText: { color: Colors.danger },
  deltaLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "800", marginTop: 1 },
  setList: { marginTop: 12, gap: 7 },
  setRow: { minHeight: 56, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", backgroundColor: Colors.background, borderWidth: 1, borderColor: "transparent" },
  setRowDone: { backgroundColor: Colors.surfaceLight },
  setRowCurrent: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  setIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight },
  setIconDone: { backgroundColor: Colors.success },
  setIconCurrent: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.surfaceLight },
  setIconText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "900" },
  setIconTextDone: { color: "#FFFFFF" },
  setIconTextCurrent: { color: Colors.primary },
  setCopy: { flex: 1, marginLeft: 10 },
  setTitle: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  setTitleCurrent: { color: Colors.primary },
  setSubtitle: { color: Colors.textSecondary, fontSize: 11, marginTop: 3, fontWeight: "600" },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.success },
  doneLabel: { color: "#FFFFFF", fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  currentBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.primary },
  currentLabel: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 0.6 },
  upcomingLabel: { color: Colors.textMuted, fontSize: 16, fontWeight: "800", paddingHorizontal: 8 },
  nextBox: { marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceLight, flexDirection: "row", alignItems: "center" },
  nextCopy: { flex: 1 },
  nextLabel: { color: Colors.primary, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  nextHint: { color: Colors.textSecondary, fontSize: 10, lineHeight: 14, marginTop: 4, maxWidth: 180 },
  nextMetric: { alignItems: "center", minWidth: 44 },
  nextValue: { color: Colors.text, fontSize: 19, fontWeight: "900" },
  nextUnit: { color: Colors.textSecondary, fontSize: 9, fontWeight: "800", marginTop: 1 },
  nextDivider: { width: 1, height: 28, backgroundColor: Colors.border, marginHorizontal: 8 },
  volumeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  volumeLabel: { color: Colors.textMuted, fontSize: 10, fontWeight: "700" },
  volumeValue: { color: Colors.textSecondary, fontSize: 11, fontWeight: "900" },
});
