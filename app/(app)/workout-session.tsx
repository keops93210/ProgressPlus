import WorkoutProgressCard from "@/components/workout/WorkoutProgressCard";
import WorkoutRepsCard from "@/components/workout/WorkoutRepsCard";
import WorkoutRestCard from "@/components/workout/WorkoutRestCard";
import WorkoutWeightCard from "@/components/workout/WorkoutWeightCard";
import BottomButton from "@/components/ui/BottomButton";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  finishWorkoutSession,
  getWorkoutExercises,
  saveWorkoutSet,
  startWorkoutSession,
} from "@/services/workout-session.service";
import { ProgramExercise } from "@/types/programExercise";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

export default function WorkoutSessionScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(80);
  const [reps, setReps] = useState(8);
  const [restTime, setRestTime] = useState(120);
  const [isResting, setIsResting] = useState(false);
  const [completedVolume, setCompletedVolume] = useState(0);
  const [completedTotalSets, setCompletedTotalSets] = useState(0);

  const exercise = exercises[currentExerciseIndex];
  const totalSets = exercise?.sets ?? 0;
  const completedSets = Array.from(
    { length: Math.max(0, currentSet - 1) },
    (_, index) => index + 1
  );

  useEffect(() => {
    if (!programId || !user) return;

    let cancelled = false;

    async function loadWorkout() {
      try {
        setLoading(true);
        setCurrentExerciseIndex(0);
        setCurrentSet(1);
        setIsResting(false);
        setCompletedVolume(0);
        setCompletedTotalSets(0);

        const data = await getWorkoutExercises(String(programId));
        if (cancelled) return;
        setExercises(data ?? []);

        const session = await startWorkoutSession(user.id, String(programId));
        if (cancelled) return;

        setSessionId(session.id);
        setSessionStartedAt(Date.now());
      } catch (error) {
        console.log("LOAD WORKOUT ERROR =", error);
        Alert.alert("Erreur", "Impossible de charger la séance.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWorkout();

    return () => {
      cancelled = true;
    };
  }, [programId, user]);

  useEffect(() => {
    if (!isResting) return;

    if (restTime <= 0) {
      setIsResting(false);
      setRestTime(120);
      return;
    }

    const timer = setTimeout(() => {
      setRestTime((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isResting, restTime]);

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) return `${remainingSeconds}s`;

    return `${minutes}m${remainingSeconds.toString().padStart(2, "0")}`;
  }

  async function validateSet() {
    if (!exercise || !sessionId || saving) return;

    try {
      setSaving(true);

      await saveWorkoutSet(
        sessionId,
        exercise.exercise_id,
        currentSet,
        weight,
        reps
      );

      const nextVolume = completedVolume + weight * reps;
      const nextTotalSets = completedTotalSets + 1;

      setCompletedVolume(nextVolume);
      setCompletedTotalSets(nextTotalSets);

      if (currentSet < exercise.sets) {
        setCurrentSet((previous) => previous + 1);
        setRestTime(30);
        setIsResting(true);
        return;
      }

      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex((previous) => previous + 1);
        setCurrentSet(1);
        setRestTime(120);
        setIsResting(true);
        return;
      }

      const duration = sessionStartedAt
        ? Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000))
        : 0;

      await finishWorkoutSession(
        sessionId,
        duration,
        nextVolume,
        nextTotalSets
      );

      setIsResting(false);
      Alert.alert("Bravo 🎉", "Séance terminée !");
    } catch (error) {
      console.log("SAVE SET ERROR =", error);
      Alert.alert("Erreur", "Impossible d'enregistrer la série.");
    } finally {
      setSaving(false);
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
            onAdd15={() => setRestTime((time) => time + 15)}
            onRemove15={() =>
              setRestTime((time) => Math.max(0, time - 15))
            }
            onSkip={() => {
              setIsResting(false);
              setRestTime(120);
            }}
          />
        )}

        <WorkoutWeightCard
          weight={weight}
          onIncrease={() => setWeight((value) => value + 2.5)}
          onDecrease={() =>
            setWeight((value) => Math.max(0, value - 2.5))
          }
        />

        <WorkoutRepsCard
          reps={reps}
          onIncrease={() => setReps((value) => value + 1)}
          onDecrease={() => setReps((value) => Math.max(1, value - 1))}
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
          saving
            ? "ENREGISTREMENT..."
            : currentSet === totalSets
              ? currentExerciseIndex === exercises.length - 1
                ? "TERMINER LA SÉANCE"
                : "EXERCICE SUIVANT"
              : "VALIDER LA SÉRIE"
        }
        onPress={validateSet}
        disabled={!exercise || saving}
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
});
