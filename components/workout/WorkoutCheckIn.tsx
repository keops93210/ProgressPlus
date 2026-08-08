import Colors from "@/constants/colors";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type WorkoutCheckInValues = {
  sleep: number;
  energy: number;
  mood: number;
  fatigue: number;
  pain: number;
};

const options = [1, 2, 3, 4, 5];

function Metric({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricTitle}>{title}</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[styles.option, value === option && styles.optionActive]}
          >
            <Text style={[styles.optionText, value === option && styles.optionTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function WorkoutCheckIn({
  onContinue,
}: {
  onContinue: (values: WorkoutCheckInValues) => void;
}) {
  const [values, setValues] = useState<WorkoutCheckInValues>({
    sleep: 3,
    energy: 3,
    mood: 3,
    fatigue: 3,
    pain: 1,
  });

  const update = (key: keyof WorkoutCheckInValues, value: number) =>
    setValues((current) => ({ ...current, [key]: value }));

  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>CHECK-IN</Text>
      <Text style={styles.title}>Comment tu te sens aujourd'hui ?</Text>
      <Text style={styles.subtitle}>
        10 secondes pour aider Progress+ à adapter ta séance.
      </Text>

      <Metric title="😴 Sommeil" value={values.sleep} onChange={(v) => update("sleep", v)} />
      <Metric title="⚡ Énergie" value={values.energy} onChange={(v) => update("energy", v)} />
      <Metric title="😊 Humeur" value={values.mood} onChange={(v) => update("mood", v)} />
      <Metric title="💪 Fatigue musculaire" value={values.fatigue} onChange={(v) => update("fatigue", v)} />
      <Metric title="🩹 Gêne / douleur" value={values.pain} onChange={(v) => update("pain", v)} />

      <TouchableOpacity style={styles.button} onPress={() => onContinue(values)}>
        <Text style={styles.buttonText}>COMMENCER MA SÉANCE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  title: {
    color: Colors.text,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 7,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 14,
  },
  metric: {
    marginTop: 12,
  },
  metricTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  options: {
    flexDirection: "row",
    gap: 8,
  },
  option: {
    flex: 1,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    color: Colors.textSecondary,
    fontWeight: "800",
  },
  optionTextActive: {
    color: "#041007",
  },
  button: {
    marginTop: 20,
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#041007",
    fontSize: 14,
    fontWeight: "900",
  },
});
