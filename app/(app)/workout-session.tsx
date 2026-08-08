import WorkoutProgressCard from "@/components/workout/WorkoutProgressCard";
import WorkoutRepsCard from "@/components/workout/WorkoutRepsCard";
import WorkoutRestCard from "@/components/workout/WorkoutRestCard";
import WorkoutWeightCard from "@/components/workout/WorkoutWeightCard";
import LastPerformance from "@/components/workout/LastPerformance";
import WorkoutCheckIn, { WorkoutCheckInValues } from "@/components/workout/WorkoutCheckIn";
import BottomButton from "@/components/ui/BottomButton";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { saveRecoveryCheckin, getRecoveryAdvice } from "@/services/recovery.service";
import {
  finishWorkoutSession,
  getLastPerformance,
  getProgressionRecommendation,
  getWorkoutExercises,
  getWorkoutSession,
  saveWorkoutSet,
  startWorkoutSession,
  ProgressionRecommendation,
} from "@/services/workout-session.service";
import { ProgramExercise } from "@/types/programExercise";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
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
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(8);
  const [restTime, setRestTime] = useState(120);
  const [isResting, setIsResting] = useState(false);
  const [completedVolume, setCompletedVolume] = useState(0);
  const [completedTotalSets, setCompletedTotalSets] = useState(0);
  const [lastPerformance, setLastPerformance] = useState<{ weight: number; reps: number } | null>(null);
  const [lastPerformanceLoading, setLastPerformanceLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<ProgressionRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [readinessMessage, setReadinessMessage] = useState<string | null>(null);

  const exercise = exercises[currentExerciseIndex];
  const totalSets = exercise?.sets ?? 0;
  const completedSets = Array.from({ length: Math.max(0, currentSet - 1) }, (_, index) => index + 1);

  useEffect(() => {
    if (!programId || !user) return;
    let cancelled = false;
    async function loadWorkout() {
      try {
        setLoading(true);
        const data = await getWorkoutExercises(String(programId));
        if (cancelled) return;
        const loadedExercises = data ?? [];
        setExercises(loadedExercises);
        const session = await startWorkoutSession(user.id, String(programId));
        if (cancelled) return;
        setSessionId(session.id);
        setSessionStartedAt(new Date(session.started_at).getTime());
        const sessionWithSets = await getWorkoutSession(session.id);
        if (cancelled) return;
        const savedSets = (sessionWithSets?.workout_sets ?? []).filter((set: any) => set.completed !== false);
        setCompletedVolume(savedSets.reduce((sum: number, set: any) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0));
        setCompletedTotalSets(savedSets.length);
        let resumeExerciseIndex = 0;
        let resumeSet = 1;
        for (let index = 0; index < loadedExercises.length; index += 1) {
          const exerciseSets = savedSets.filter((set: any) => set.exercise_id === loadedExercises[index].exercise_id);
          if (exerciseSets.length < loadedExercises[index].sets) {
            resumeExerciseIndex = index;
            resumeSet = exerciseSets.length + 1;
            break;
          }
          if (index === loadedExercises.length - 1) {
            resumeExerciseIndex = index;
            resumeSet = loadedExercises[index].sets;
          }
        }
        setCurrentExerciseIndex(resumeExerciseIndex);
        setCurrentSet(resumeSet);
        setCheckInDone(savedSets.length > 0 || Boolean(sessionWithSets?.sleep_score));
      } catch (error) {
        console.log("LOAD WORKOUT ERROR =", error);
        Alert.alert("Erreur", "Impossible de charger la séance.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadWorkout();
    return () => { cancelled = true; };
  }, [programId, user]);

  useEffect(() => {
    if (!exercise || !user || !checkInDone) return;
    let cancelled = false;
    async function loadExerciseData() {
      try {
        setLastPerformanceLoading(true);
        setRecommendationLoading(true);
        const [performance, nextRecommendation] = await Promise.all([
          getLastPerformance(user.id, exercise.exercise_id),
          getProgressionRecommendation(user.id, exercise.exercise_id, exercise.min_reps, exercise.max_reps, exercise.sets),
        ]);
        if (cancelled) return;
        setLastPerformance(performance);
        setRecommendation(nextRecommendation);
        if (nextRecommendation.action === "increase_weight") {
          setWeight(nextRecommendation.recommendedWeight);
          setReps(nextRecommendation.recommendedReps);
        } else if (performance) {
          setWeight(performance.weight);
          setReps(Math.min(exercise.max_reps, Math.max(exercise.min_reps, performance.reps)));
        } else {
          setWeight(0);
          setReps(Math.min(8, exercise.max_reps));
        }
      } catch (error) {
        console.log("EXERCISE PROGRESSION ERROR =", error);
      } finally {
        if (!cancelled) {
          setLastPerformanceLoading(false);
          setRecommendationLoading(false);
        }
      }
    }
    loadExerciseData();
    return () => { cancelled = true; };
  }, [exercise?.exercise_id, user?.id, checkInDone]);

  useEffect(() => {
    if (!exercise) return;
    setRestTime(exercise.rest_seconds || 120);
  }, [exercise?.exercise_id]);

  useEffect(() => {
    if (!isResting) return;
    if (restTime <= 0) {
      setIsResting(false);
      setRestTime(exercise?.rest_seconds || 120);
      return;
    }
    const timer = setTimeout(() => setRestTime((previous) => previous - 1), 1000);
    return () => clearTimeout(timer);
  }, [isResting, restTime, exercise?.rest_seconds]);

  async function handleCheckIn(values: WorkoutCheckInValues) {
    if (!sessionId || !user) return;
    try {
      const saved = await saveRecoveryCheckin(user.id, sessionId, values as any);
      const advice = getRecoveryAdvice(saved.recovery_score);
      setReadinessMessage(`${advice.title} — ${advice.message}`);
      setCheckInDone(true);
    } catch (error) {
      console.log("CHECKIN ERROR =", error);
      Alert.alert("Erreur", "Impossible d'enregistrer ton état du jour.");
    }
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes === 0 ? `${remainingSeconds}s` : `${minutes}m${remainingSeconds.toString().padStart(2, "0")}`;
  }

  async function validateSet() {
    if (!exercise || !sessionId || saving) return;
    if (weight <= 0 || reps <= 0) {
      Alert.alert("Série incomplète", "Indique un poids et un nombre de répétitions valides.");
      return;
    }
    try {
      setSaving(true);
      await saveWorkoutSet(sessionId, exercise.exercise_id, currentSet, weight, reps);
      const nextVolume = completedVolume + weight * reps;
      const nextTotalSets = completedTotalSets + 1;
      setCompletedVolume(nextVolume);
      setCompletedTotalSets(nextTotalSets);
      if (currentSet < exercise.sets) {
        setCurrentSet((previous) => previous + 1);
        setRestTime(exercise.rest_seconds || 120);
        setIsResting(true);
        return;
      }
      if (currentExerciseIndex < exercises.length - 1) {
        setCurrentExerciseIndex((previous) => previous + 1);
        setCurrentSet(1);
        setRestTime(exercise.rest_seconds || 120);
        setIsResting(true);
        return;
      }
      const duration = sessionStartedAt ? Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)) : 0;
      await finishWorkoutSession(sessionId, duration, nextVolume, nextTotalSets);
      setIsResting(false);
      Alert.alert("Bravo 🎉", "Séance terminée !");
    } catch (error) {
      console.log("SAVE SET ERROR =", error);
      Alert.alert("Erreur", "Impossible d'enregistrer la série.");
    } finally {
      setSaving(false);
    }
  }

  function applyRecommendation() {
    if (!recommendation) return;
    if (recommendation.recommendedWeight > 0) setWeight(recommendation.recommendedWeight);
    setReps(Math.min(exercise?.max_reps ?? recommendation.recommendedReps, Math.max(exercise?.min_reps ?? recommendation.recommendedReps, recommendation.recommendedReps)));
  }

  if (loading) return <SafeAreaView style={styles.container}><Header title="Chargement..." /></SafeAreaView>;

  if (!checkInDone) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Préparation" subtitle="Avant ta séance" />
        <ScrollView contentContainerStyle={styles.checkinContent} showsVerticalScrollIndicator={false}>
          <WorkoutCheckIn onContinue={handleCheckIn} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={exercise?.exercises.name ?? "Aucun exercice"} subtitle={`Série ${currentSet} / ${totalSets}`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {readinessMessage && <View style={styles.readiness}><Text style={styles.readinessText}>{readinessMessage}</Text></View>}
        {isResting && <WorkoutRestCard time={formatTime(restTime)} onAdd15={() => setRestTime((time) => time + 15)} onRemove15={() => setRestTime((time) => Math.max(0, time - 15))} onSkip={() => { setIsResting(false); setRestTime(exercise?.rest_seconds || 120); }} />}
        <View style={styles.targetCard}>
          <Text style={styles.targetTitle}>Objectif</Text>
          <Text style={styles.targetValue}>{exercise ? `${exercise.min_reps}–${exercise.max_reps} répétitions` : "—"}</Text>
          <Text style={styles.targetRest}>Repos : {formatTime(exercise?.rest_seconds || 120)}</Text>
        </View>
        {!lastPerformanceLoading && lastPerformance && <LastPerformance weight={lastPerformance.weight} reps={lastPerformance.reps} />}
        {!recommendationLoading && recommendation && (
          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}><Text style={styles.recommendationEyebrow}>PROGRESSION+</Text><Text style={styles.recommendationBadge}>{recommendation.action === "increase_weight" ? "↑ POIDS" : recommendation.action === "increase_reps" ? "↑ REPS" : "→ CONSOLIDER"}</Text></View>
            <Text style={styles.recommendationTitle}>{recommendation.action === "increase_weight" ? "Tu peux augmenter la charge 💪" : recommendation.action === "increase_reps" ? "On cherche encore des reps" : "On consolide la charge"}</Text>
            <Text style={styles.recommendationMessage}>{recommendation.message}</Text>
            {recommendation.action !== "start" && <View style={styles.recommendationValues}><View><Text style={styles.recommendationLabel}>Prochaine cible</Text><Text style={styles.recommendationValue}>{recommendation.recommendedWeight > 0 ? `${recommendation.recommendedWeight} kg` : "—"}</Text></View><View><Text style={styles.recommendationLabel}>Reps</Text><Text style={styles.recommendationValue}>{recommendation.recommendedReps}</Text></View></View>}
            {recommendation.action !== "start" && <Text style={styles.recommendationAction} onPress={applyRecommendation}>UTILISER CETTE RECOMMANDATION</Text>}
          </View>
        )}
        <WorkoutWeightCard weight={weight} onIncrease={() => setWeight((value) => value + 2.5)} onDecrease={() => setWeight((value) => Math.max(0, value - 2.5))} />
        <WorkoutRepsCard reps={reps} onIncrease={() => setReps((value) => Math.min(exercise?.max_reps ?? value + 1, value + 1))} onDecrease={() => setReps((value) => Math.max(exercise?.min_reps ?? 1, value - 1))} />
        <WorkoutProgressCard totalSets={totalSets} completedSets={completedSets} weight={weight} reps={reps} />
      </ScrollView>
      <BottomButton title={saving ? "ENREGISTREMENT..." : currentSet === totalSets ? currentExerciseIndex === exercises.length - 1 ? "TERMINER LA SÉANCE" : "EXERCICE SUIVANT" : "VALIDER LA SÉRIE"} onPress={validateSet} disabled={!exercise || saving} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  checkinContent: { paddingTop: 20, paddingBottom: 40 },
  content: { paddingTop: 20, paddingBottom: 40, gap: 20 },
  readiness: { padding: 14, borderRadius: 15, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary },
  readinessText: { color: Colors.text, fontSize: 13, lineHeight: 19, fontWeight: "600" },
  targetCard: { padding: 16, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  targetTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600" },
  targetValue: { color: Colors.text, fontSize: 22, fontWeight: "800", marginTop: 6 },
  targetRest: { color: Colors.textSecondary, fontSize: 14, marginTop: 6 },
  recommendationCard: { padding: 18, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.primary },
  recommendationHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  recommendationEyebrow: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1 },
  recommendationBadge: { color: Colors.textSecondary, fontSize: 11, fontWeight: "800" },
  recommendationTitle: { color: Colors.text, fontSize: 20, fontWeight: "800", marginTop: 10 },
  recommendationMessage: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 7 },
  recommendationValues: { flexDirection: "row", gap: 40, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  recommendationLabel: { color: Colors.textSecondary, fontSize: 12 },
  recommendationValue: { color: Colors.text, fontSize: 22, fontWeight: "800", marginTop: 3 },
  recommendationAction: { color: Colors.primary, fontSize: 12, fontWeight: "900", marginTop: 16, letterSpacing: 0.5 },
});
