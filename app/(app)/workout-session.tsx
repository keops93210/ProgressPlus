import WorkoutProgressCard from "@/components/workout/WorkoutProgressCard";
import WorkoutRepsCard from "@/components/workout/WorkoutRepsCard";
import WorkoutRestCard from "@/components/workout/WorkoutRestCard";
import WorkoutWeightCard from "@/components/workout/WorkoutWeightCard";
import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomButton from "@/components/ui/BottomButton";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";

import {
  getWorkoutExercises,
  saveWorkoutSet,
  startWorkoutSession,
} from "@/services/workout-session.service";

import { ProgramExercise } from "@/types/programExercise";

export default function WorkoutSessionScreen() {
  const { programId } = useLocalSearchParams<{
    programId: string;
  }>();

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [exercises, setExercises] = useState<ProgramExercise[]>([]);

  const [currentExerciseIndex, setCurrentExerciseIndex] =
    useState(0);

  const [currentSet, setCurrentSet] = useState(1);

  const [weight, setWeight] = useState(80);

  const [reps, setReps] = useState(8);

  const [restTime, setRestTime] = useState(120);

  const [isResting, setIsResting] = useState(false);

  const exercise = exercises[currentExerciseIndex];

  const totalSets = exercise?.sets ?? 0;

  const completedSets = Array.from(
    { length: currentSet - 1 },
    (_, i) => i + 1
  );

  async function loadWorkout() {
    if (!programId || !user) return;

    try {
      setLoading(true);

      const data = await getWorkoutExercises(
        String(programId)
      );

      setExercises(data ?? []);

      const session = await startWorkoutSession(
        user.id,
        String(programId)
      );

      setSessionId(session.id);
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible de charger la séance."
      );
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadWorkout();
    }, [programId])
  );

  useEffect(() => {
    if (!isResting) return;

    if (restTime <= 0) {
      setIsResting(false);
      setRestTime(120);
      return;
    }

    const timer = setTimeout(() => {
      setRestTime((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isResting, restTime]);

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const sec = seconds % 60;

  if (minutes === 0) {
    return `${sec}s`;
  }

  return `${minutes}m${sec
    .toString()
    .padStart(2, "0")}`;
}

  async function validateSet() {
    if (!exercise) return;

    try {
      if (sessionId) {
        await saveWorkoutSet(
          sessionId,
          exercise.exercise_id,
          currentSet,
          weight,
          reps
        );
      }

      if (currentSet < exercise.sets) {
        setCurrentSet((prev) => prev + 1);

        setRestTime(30);
        setIsResting(true);

        return;
      }

      if (
        currentExerciseIndex <
        exercises.length - 1
      ) {
        setCurrentExerciseIndex((prev) => prev + 1);

        setCurrentSet(1);

        setRestTime(120);
        setIsResting(true);

        return;
      }

      Alert.alert(
        "Bravo 🎉",
        "Séance terminée !"
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erreur",
        "Impossible d'enregistrer la série."
      );
    }
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
      title={exercise?.exercises.name ?? "Aucun exercice"}
      subtitle={`Série ${currentSet} / ${totalSets}`}
    />

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
    {isResting && (
<WorkoutRestCard
  time={formatTime(restTime)}
  onAdd15={() =>
    setRestTime((t) => t + 15)
  }
  onRemove15={() =>
    setRestTime((t) => Math.max(0, t - 15))
  }
  onSkip={() => {
    setIsResting(false);
    setRestTime(120);
  }}
  />
)}

<WorkoutWeightCard
  weight={weight}
  onIncrease={() => setWeight((w) => w + 2.5)}
  onDecrease={() =>
    setWeight((w) => Math.max(0, w - 2.5))
  }
/>

<WorkoutRepsCard
  reps={reps}
  onIncrease={() => setReps((r) => r + 1)}
  onDecrease={() =>
    setReps((r) => Math.max(1, r - 1))
  }
/>

<WorkoutProgressCard
  totalSets={totalSets}
  completedSets={completedSets}
  weight={weight}
  reps={reps}
/>
    </ScrollView>

    <BottomButton
      title={
        currentSet === totalSets
          ? currentExerciseIndex === exercises.length - 1
            ? "TERMINER LA SÉANCE"
            : "EXERCICE SUIVANT"
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

  content: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },

  restTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
  },

  restTimer: {
    marginTop: 20,
    fontSize: 52,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },

  nextTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 18,
  },

  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  counterButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  counterValue: {
    flex: 1,
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: Colors.text,
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

  setRow: {
    fontSize: 18,
    color: Colors.text,
    marginVertical: 8,
  },
});