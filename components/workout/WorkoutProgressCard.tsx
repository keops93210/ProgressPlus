import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";

interface WorkoutProgressCardProps {
  totalSets: number;
  completedSets: number[];
  weight: number;
  reps: number;
}

export default function WorkoutProgressCard({
  totalSets,
  completedSets,
  weight,
  reps,
}: WorkoutProgressCardProps) {
  return (
    <Card>
      <Text style={styles.title}>
        Progression
      </Text>

      {Array.from({ length: totalSets }).map(
        (_, index) => (
          <Text
            key={index}
            style={styles.setRow}
          >
            {completedSets.includes(index + 1)
              ? "✅"
              : "⬜"}{" "}
            Série {index + 1}
          </Text>
        )
      )}

      <View style={styles.separator} />

      <Text style={styles.nextValue}>
        {weight} kg × {reps}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 18,
  },

  setRow: {
    fontSize: 18,
    color: Colors.text,
    marginVertical: 8,
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },

  nextValue: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
});