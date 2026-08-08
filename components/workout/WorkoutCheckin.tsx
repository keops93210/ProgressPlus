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

const options = [
  { value: 1, label: "Très bas" },
  { value: 2, label: "Bas" },
  { value: 3, label: "Moyen" },
  { value: 4, label: "Bon" },
  { value: 5, label: "Excellent" },
] as const;

function ScorePicker({
  title,
  hint,
  value,
  onChange,
}: {
  title: string;
  hint?: string;
  value: number;
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void;
}) {
  return (
    <View style={styles.question}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionTitle}>{title}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      <View style={styles.options}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, value === option.value && styles.optionActive]}
          >
            <Text style={[styles.optionNumber, value === option.value && styles.optionNumberActive]}>
              {option.value}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.selectedLabel}>{options[value - 1].label}</Text>
    </View>
  );
}

export default function WorkoutCheckin({ onComplete, onContinue }: Props) {
  const [values, setValues] = useState<CheckinValues>({
    sleep: 3,
    energy: 3,
    mood: 3,
    fatigue: 3,
    pain: 1,
  });

  const readyLabel = useMemo(() => {
    const score = Math.round(
      (values.sleep + values.energy + values.mood + (6 - values.fatigue) + (6 - values.pain)) / 5
    );
    if (score >= 4 && values.pain <= 2) return "Tu sembles prêt à pousser 🟢";
    if (score <= 2 || values.pain >= 4) return "On va adapter la séance 🟠";
    return "Séance normale 🟡";
  }, [values]);

  function handleSubmit() {
    const callback = onComplete ?? onContinue;
    callback?.(values);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CHECK-IN</Text>
      <Text style={styles.title}>Comment tu te sens aujourd'hui ?</Text>
      <Text style={styles.subtitle}>
        30 secondes pour que Progress+ adapte ta séance à ton état réel.
      </Text>

      <ScorePicker title="😴 Sommeil" value={values.sleep} onChange={(value) => setValues((v) => ({ ...v, sleep: value }))} />
      <ScorePicker title="⚡ Énergie" value={values.energy} onChange={(value) => setValues((v) => ({ ...v, energy: value }))} />
      <ScorePicker title="😊 Humeur" value={values.mood} onChange={(value) => setValues((v) => ({ ...v, mood: value }))} />
      <ScorePicker title="💪 Fatigue musculaire" hint="5 = très fatigué" value={values.fatigue} onChange={(value) => setValues((v) => ({ ...v, fatigue: value }))} />
      <ScorePicker title="🩹 Douleur / gêne" hint="5 = forte" value={values.pain} onChange={(value) => setValues((v) => ({ ...v, pain: value }))} />

      <View style={styles.result}>
        <Text style={styles.resultText}>{readyLabel}</Text>
      </View>

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>COMMENCER MA SÉANCE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 18,
  },
  eyebrow: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: -10 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: -8 },
  question: { gap: 8 },
  questionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  questionTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  hint: { color: Colors.textMuted, fontSize: 11 },
  options: { flexDirection: "row", gap: 8 },
  option: { flex: 1, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  optionActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optionNumber: { color: Colors.textSecondary, fontSize: 15, fontWeight: "800" },
  optionNumberActive: { color: "#061008" },
  selectedLabel: { color: Colors.textMuted, fontSize: 11 },
  result: { padding: 14, borderRadius: 14, backgroundColor: Colors.background },
  resultText: { color: Colors.text, fontSize: 14, fontWeight: "800", textAlign: "center" },
  button: { minHeight: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: Colors.primary },
  buttonText: { color: "#061008", fontSize: 14, fontWeight: "900", letterSpacing: 0.4 },
});