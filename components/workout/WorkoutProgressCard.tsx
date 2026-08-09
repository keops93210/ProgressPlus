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

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>SÉANCE EN COURS</Text>
          <Text style={styles.title}>Séries</Text>
        </View>
        <Text style={styles.counter}>{completedCount}/{totalSets}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <View style={styles.setList}>
        {Array.from({ length: totalSets }).map((_, index) => {
          const setNumber = index + 1;
          const completed = completedSets.includes(setNumber);
          const current = !completed && setNumber === currentSet;

          return (
            <View key={setNumber} style={[styles.setRow, current && styles.setRowCurrent]}>
              <View style={[styles.setIcon, completed && styles.setIconDone, current && styles.setIconCurrent]}>
                <Text style={[styles.setIconText, (completed || current) && styles.setIconTextActive]}>
                  {completed ? "✓" : setNumber}
                </Text>
              </View>
              <View style={styles.setCopy}>
                <Text style={[styles.setTitle, current && styles.setTitleCurrent]}>
                  Série {setNumber}{current ? " · MAINTENANT" : ""}
                </Text>
                <Text style={styles.setSubtitle}>
                  {completed ? "Série enregistrée" : current ? `${weight} kg × ${reps} reps` : "À venir"}
                </Text>
              </View>
              {completed && <Text style={styles.doneLabel}>FAIT</Text>}
            </View>
          );
        })}
      </View>

      <View style={styles.nextBox}>
        <Text style={styles.nextLabel}>PROCHAINE SÉRIE</Text>
        <Text style={styles.nextValue}>{weight} kg × {reps}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 20, fontWeight: "900", marginTop: 3 },
  counter: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  progressTrack: { height: 7, borderRadius: 6, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 14 },
  progressFill: { height: "100%", borderRadius: 6, backgroundColor: Colors.primary },
  setList: { marginTop: 12, gap: 7 },
  setRow: { minHeight: 54, borderRadius: 14, paddingHorizontal: 10, flexDirection: "row", alignItems: "center", backgroundColor: Colors.background },
  setRowCurrent: { borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.surfaceLight },
  setIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight },
  setIconDone: { backgroundColor: Colors.primary },
  setIconCurrent: { borderWidth: 2, borderColor: Colors.primary, backgroundColor: Colors.surface },
  setIconText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "900" },
  setIconTextActive: { color: "#FFFFFF" },
  setCopy: { flex: 1, marginLeft: 10 },
  setTitle: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  setTitleCurrent: { color: Colors.primary },
  setSubtitle: { color: Colors.textSecondary, fontSize: 11, marginTop: 2, fontWeight: "600" },
  doneLabel: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 0.7 },
  nextBox: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border, alignItems: "center" },
  nextLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  nextValue: { color: Colors.text, fontSize: 27, fontWeight: "900", marginTop: 4 },
});
