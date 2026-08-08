import Colors from "@/constants/colors";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type CheckinValues = {
  sleep: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  mood: 1 | 2 | 3 | 4 | 5;
  fatigue: 1 | 2 | 3 | 4 | 5;
  pain: 1 | 2 | 3 | 4 | 5;
};

export type WorkoutCheckInValues = CheckinValues;

type Props = {
  onComplete?: (values: CheckinValues) => void;
  onContinue?: (values: CheckinValues) => void;
};

const options = [1, 2, 3, 4, 5] as const;

type ScorePickerProps = {
  title: string;
  value: 1 | 2 | 3 | 4 | 5;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
  labels?: readonly [string, string, string, string, string];
};

function ScorePicker({ title, value, onChange, labels = ["Très bas", "Bas", "Moyen", "Bon", "Excellent"] }: ScorePickerProps) {
  return (
    <View style={styles.question}>
      <Text style={styles.questionTitle}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable key={option} onPress={() => onChange(option)} style={[styles.option, value === option && styles.optionActive]}>
            <Text style={[styles.optionNumber, value === option && styles.optionNumberActive]}>{option}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.scaleLabels}>
        <Text style={styles.scaleLabel}>{labels[0]}</Text>
        <Text style={styles.scaleLabel}>{labels[4]}</Text>
      </View>
      <Text style={styles.selectedLabel}>{labels[value - 1]}</Text>
    </View>
  );
}

export default function WorkoutCheckIn({ onComplete, onContinue }: Props) {
  const [values, setValues] = useState<CheckinValues>({ sleep: 3, energy: 3, mood: 3, fatigue: 3, pain: 1 });

  const readiness = useMemo(() => {
    // Toutes les échelles sont orientées dans le même sens : 5 = meilleur état.
    const score = (values.sleep + values.energy + values.mood + values.fatigue + values.pain) / 5;
    if (values.pain <= 2 || values.fatigue <= 2 || score <= 2.4) {
      return { label: "On va adapter la séance 🟠", score };
    }
    if (score >= 4.1) return { label: "Très bonnes conditions 🟢", score };
    return { label: "Séance normale 🟡", score };
  }, [values]);

  function handleSubmit() {
    const callback = onComplete ?? onContinue;
    callback?.(values);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CHECK-IN</Text>
      <Text style={styles.title}>Comment tu te sens aujourd'hui ?</Text>
      <Text style={styles.subtitle}>30 secondes pour que Progress+ adapte ta séance à ton état réel.</Text>
      <ScorePicker title="😴 Sommeil" value={values.sleep} onChange={(value) => setValues((v) => ({ ...v, sleep: value }))} />
      <ScorePicker title="⚡ Énergie" value={values.energy} onChange={(value) => setValues((v) => ({ ...v, energy: value }))} />
      <ScorePicker title="😊 Humeur" value={values.mood} onChange={(value) => setValues((v) => ({ ...v, mood: value }))} />
      <ScorePicker title="💪 Fatigue musculaire" labels={["Très fatigué", "Fatigué", "Moyen", "Peu fatigué", "Pas fatigué"]} value={values.fatigue} onChange={(value) => setValues((v) => ({ ...v, fatigue: value }))} />
      <ScorePicker title="🩹 Douleur / gêne" labels={["Très forte", "Forte", "Moyenne", "Faible", "Aucune"]} value={values.pain} onChange={(value) => setValues((v) => ({ ...v, pain: value }))} />
      <View style={styles.result}>
        <Text style={styles.resultText}>{readiness.label}</Text>
        <Text style={styles.resultScore}>Score récupération : {readiness.score.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}/5</Text>
      </View>
      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>COMMENCER MA SÉANCE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: Colors.border, gap: 18 },
  eyebrow: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: -10 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: -8 },
  question: { gap: 8 },
  questionTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  options: { flexDirection: "row", gap: 8 },
  option: { flex: 1, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  optionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionNumber: { color: Colors.textSecondary, fontSize: 15, fontWeight: "800" },
  optionNumberActive: { color: "#FFFFFF" },
  scaleLabels: { flexDirection: "row", justifyContent: "space-between" },
  scaleLabel: { color: Colors.textMuted, fontSize: 11 },
  selectedLabel: { color: Colors.textMuted, fontSize: 11 },
  result: { padding: 14, borderRadius: 14, backgroundColor: Colors.background },
  resultText: { color: Colors.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  resultScore: { color: Colors.textSecondary, fontSize: 11, textAlign: "center", marginTop: 5 },
  button: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary },
  buttonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
});
