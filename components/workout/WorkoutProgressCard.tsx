import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutProgressCardProps {
  totalSets: number;
  completedSets: number[];
  weight: number;
  reps: number;
}

export default function WorkoutProgressCard({ totalSets, completedSets, weight, reps }: WorkoutProgressCardProps) {
  const completedCount = completedSets.length;
  const currentSet = Math.min(totalSets, completedCount + 1);
  const progress = totalSets > 0 ? Math.min(1, completedCount / totalSets) : 0;
  const remainingSets = Math.max(0, totalSets - completedCount);
  const currentVolume = Math.max(0, weight) * Math.max(0, reps);

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <View style={styles.eyebrowRow}>
            <View style={styles.liveDot} />
            <Text style={styles.eyebrow}>SÉANCE EN COURS</Text>
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
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.summaryRow}>
        <View>
          <Text style={styles.summaryLabel}>MAINTENANT</Text>
          <Text style={styles.summaryValue}>{weight} kg <Text style={styles.summaryMultiply}>×</Text> {reps}</Text>
        </View>
        <View style={styles.summaryRight}>
          <Text style={styles.summaryLabel}>RESTE</Text>
          <Text style={styles.summaryValue}>{remainingSets} série{remainingSets > 1 ? "s" : ""}</Text>
        </View>
      </View>

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
                  {completed ? "Enregistrée" : current ? `${weight} kg × ${reps} reps` : "À venir"}
                </Text>
              </View>
              {completed ? (
                <View style={styles.doneBadge}>
                  <Text style={styles.doneLabel}>FAIT</Text>
                </View>
              ) : current ? (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentLabel}>GO</Text>
                </View>
              ) : upcoming ? (
                <Text style={styles.upcomingLabel}>—</Text>
              ) : null}
            </View>
          );
        })}
      </View>

      <View style={styles.nextBox}>
        <View style={styles.nextCopy}>
          <Text style={styles.nextLabel}>PROCHAINE SÉRIE</Text>
          <Text style={styles.nextHint}>Garde le même niveau ou ajuste selon tes sensations</Text>
        </View>
        <View style={styles.nextMetric}>
          <Text style={styles.nextValue}>{weight}</Text>
          <Text style={styles.nextUnit}>kg</Text>
        </View>
        <View style={styles.nextDivider} />
        <View style={styles.nextMetric}>
          <Text style={styles.nextValue}>{reps}</Text>
          <Text style={styles.nextUnit}>reps</Text>
        </View>
      </View>

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
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 4 },
  counterPill: { flexDirection: "row", alignItems: "baseline", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, backgroundColor: Colors.surfaceLight },
  counterValue: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  counterSlash: { color: Colors.textMuted, fontSize: 15, fontWeight: "800", marginHorizontal: 2 },
  counterTotal: { color: Colors.textSecondary, fontSize: 15, fontWeight: "800" },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 16 },
  progressFill: { height: "100%", borderRadius: 8, backgroundColor: Colors.primary },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryRight: { alignItems: "flex-end" },
  summaryLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 1 },
  summaryValue: { color: Colors.text, fontSize: 15, fontWeight: "900", marginTop: 4 },
  summaryMultiply: { color: Colors.primary },
  setList: { marginTop: 12, gap: 7 },
  setRow: { minHeight: 56, borderRadius: 15, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", backgroundColor: Colors.background, borderWidth: 1, borderColor: "transparent" },
  setRowDone: { backgroundColor: Colors.surfaceLight },
  setRowCurrent: { borderColor: Colors.primary, backgroundColor: Colors.surface },
  setIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight },
  setIconDone: { backgroundColor: Colors.primary },
  setIconCurrent: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.surfaceLight },
  setIconText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "900" },
  setIconTextDone: { color: "#FFFFFF" },
  setIconTextCurrent: { color: Colors.primary },
  setCopy: { flex: 1, marginLeft: 10 },
  setTitle: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  setTitleCurrent: { color: Colors.primary },
  setSubtitle: { color: Colors.textSecondary, fontSize: 11, marginTop: 3, fontWeight: "600" },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.primary },
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