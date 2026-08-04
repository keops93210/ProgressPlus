import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";

interface LastPerformanceProps {
  weight: number;
  reps: number;
}

export default function LastPerformance({
  weight,
  reps,
}: LastPerformanceProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Dernière séance
      </Text>

      <Text style={styles.value}>
        {weight} kg × {reps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: Colors.surface,
  },

  title: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  value: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: 8,
  },
});
