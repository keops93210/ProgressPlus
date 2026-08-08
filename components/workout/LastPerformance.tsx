import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface LastPerformanceProps {
  weight: number;
  reps: number;
}

export default function LastPerformance({ weight, reps }: LastPerformanceProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dot} />
        <Text style={styles.eyebrow}>DERNIÈRE PERFORMANCE</Text>
      </View>

      <View style={styles.row}>
        <View>
          <Text style={styles.value}>{weight}</Text>
          <Text style={styles.unit}>KG</Text>
        </View>
        <Text style={styles.multiply}>×</Text>
        <View>
          <Text style={styles.value}>{reps}</Text>
          <Text style={styles.unit}>REPS</Text>
        </View>
      </View>

      <Text style={styles.helper}>Point de départ pour ta prochaine progression.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: Colors.primary,
  },
  eyebrow: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 12,
  },
  value: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  unit: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: -2,
  },
  multiply: {
    color: Colors.textMuted,
    fontSize: 22,
    fontWeight: "700",
  },
  helper: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 14,
  },
});
