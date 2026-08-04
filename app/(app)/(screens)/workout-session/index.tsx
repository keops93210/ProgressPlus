import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomButton from "@/components/ui/BottomButton";
import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Stepper from "@/components/ui/Stepper";
import Colors from "@/constants/colors";

import { getWorkoutExercises } from "@/services/workout-session.service";
import { ProgramExercise } from "@/types/programExercise";

export default function WorkoutSessionScreen() {
  const { programId } = useLocalSearchParams<{
    programId: string;
  }>();

  const [loading, setLoading] = useState(true);

  const [exercises, setExercises] = useState<
    ProgramExercise[]
  >([]);

  const [currentSet, setCurrentSet] = useState(1);

  const [weight, setWeight] = useState(80);

  const [reps, setReps] = useState(8);

  async function loadWorkout() {
    if (!programId) return;

    try {
      setLoading(true);

      const data = await getWorkoutExercises(
        String(programId)
      );

      setExercises(data ?? []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }


  const exercise = exercises[0];
  console.log("EXERCICES =", exercises);
console.log("EXERCICE 0 =", exercise);

  const totalSets = exercise?.sets ?? 0;

  function validateSet() {
    if (currentSet < totalSets) {
      setCurrentSet((prev) => prev + 1);
      return;
    }

    Alert.alert(
      "Bravo 🎉",
      "Exercice terminé !"
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chargement..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={
          exercise?.exercises.name ??
          "Aucun exercice"
        }
        subtitle={`Série ${currentSet} / ${totalSets}`}
      />

      <Card>
        <Text style={styles.muscle}>
          💪 {exercise?.exercises.primary_muscle}
        </Text>

        <View style={styles.separator} />

        <Text style={styles.label}>
          Poids (kg)
        </Text>

        <Stepper
          value={weight}
          onChange={setWeight}
          min={0}
          max={300}
        />

        <Text style={styles.label}>
          Répétitions
        </Text>

        <Stepper
          value={reps}
          onChange={setReps}
          min={1}
          max={30}
        />
      </Card>

      <Card>
        <Text style={styles.nextTitle}>
          Série actuelle
        </Text>

        <Text style={styles.nextValue}>
          {weight} kg × {reps}
        </Text>
      </Card>

      <BottomButton
        title={
          currentSet === totalSets
            ? "TERMINER L'EXERCICE"
            : "VALIDER LA SÉRIE"
        }
        onPress={validateSet}
        disabled={!exercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  muscle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },

  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 20,
  },

  label: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    marginTop: 10,
  },

  nextTitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },

  nextValue: {
    color: Colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 10,
  },
});