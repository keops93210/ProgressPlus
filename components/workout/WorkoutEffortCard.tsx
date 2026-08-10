import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

type WorkoutEffortCardProps = {
  rir: number;
  onChangeRir: (rir: number) => void;
};

export default function WorkoutEffortCard({ rir, onChangeRir }: WorkoutEffortCardProps) {
  const rpe = useMemo(() => Math.max(5, Math.min(10, 10 - rir)), [rir]);
  const labels: Record<number, string> = {
    0: "Échec / plus aucune rep",
    1: "Quasi-échec",
    2: "Très difficile mais maîtrisé",
    3: "Difficile, encore quelques reps",
    4: "Bonne marge",
    5: "Très grande marge",
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>EFFORT DE LA SÉRIE</Text>
          <Text style={styles.title}>Combien de reps te restaient ?</Text>
        </View>
        <View style={styles.rpeBadge}>
          <Text style={styles.rpeLabel}>RPE</Text>
          <Text style={styles.rpeValue}>{rpe}</Text>
        </View>
      </View>

      <Text style={styles.helper}>Le RIR indique ta marge. 0 = échec, 2 = environ deux reps en réserve.</Text>

      <View style={styles.options}>
        {[0, 1, 2, 3, 4, 5].map((value) => {
          const active = rir === value;
          return (
            <Pressable key={value} onPress={() => onChangeRir(value)} style={[styles.option, active && styles.optionActive]}>
              <Text style={[styles.optionValue, active && styles.optionValueActive]}>{value}</Text>
              <Text style={[styles.optionCaption, active && styles.optionCaptionActive]}>{value === 0 ? "FAIL" : "RIR"}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.explanation}>
        <Text style={styles.explanationTitle}>{labels[rir]}</Text>
        <Text style={styles.explanationText}>Progress+ utilisera cet effort avec tes reps, ta charge et ta récupération pour décider de la prochaine cible.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 4 },
  rpeBadge: { minWidth: 52, paddingVertical: 7, paddingHorizontal: 9, borderRadius: 13, backgroundColor: Colors.primary + "15", borderWidth: 1, borderColor: Colors.primary + "35", alignItems: "center" },
  rpeLabel: { color: Colors.textSecondary, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
  rpeValue: { color: Colors.primary, fontSize: 20, fontWeight: "900", marginTop: 1 },
  helper: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 8 },
  options: { flexDirection: "row", gap: 7, marginTop: 14 },
  option: { flex: 1, minHeight: 54, borderRadius: 13, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  optionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionValue: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  optionValueActive: { color: "#FFFFFF" },
  optionCaption: { color: Colors.textSecondary, fontSize: 7, fontWeight: "900", marginTop: 1 },
  optionCaptionActive: { color: "#FFFFFF" },
  explanation: { marginTop: 12, padding: 11, borderRadius: 13, backgroundColor: Colors.surfaceLight },
  explanationTitle: { color: Colors.text, fontSize: 12, fontWeight: "900" },
  explanationText: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 3 },
});