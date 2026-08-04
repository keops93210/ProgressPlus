import { StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { ProgramExercise } from "@/types/programExercise";

interface Props {
  exercise: ProgramExercise;
  onDelete?: () => void;
}

export default function ExerciseCard({
  exercise,
  onDelete,
}: Props) {
  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.name}>
            {exercise.exercises.name}
          </Text>

          <Text style={styles.muscle}>
            💪 {exercise.exercises.primary_muscle}
          </Text>

          <Text style={styles.details}>
            {exercise.sets} séries •{" "}
            {exercise.min_reps}-{exercise.max_reps} reps
          </Text>

          <Text style={styles.rest}>
            ⏱ {exercise.rest_seconds}s
          </Text>

          {exercise.exercises.equipment ? (
            <Text style={styles.equipment}>
              🏋️ {exercise.exercises.equipment}
            </Text>
          ) : null}
        </View>

        {onDelete ? (
          <Text
            onPress={onDelete}
            style={styles.delete}
          >
            🗑️
          </Text>
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  content: {
    flex: 1,
  },

  name: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "700",
  },

  muscle: {
    color: Colors.primary,
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
  },

  details: {
    color: Colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },

  rest: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontSize: 14,
  },

  equipment: {
    color: Colors.textSecondary,
    marginTop: 4,
    fontSize: 14,
  },

  delete: {
    fontSize: 22,
    padding: 8,
  },
});