import WorkoutProgressCard from "@/components/workout/WorkoutProgressCard";
import WorkoutRepsCard from "@/components/workout/WorkoutRepsCard";
import WorkoutWeightCard from "@/components/workout/WorkoutWeightCard";
import LastPerformance from "@/components/workout/LastPerformance";
import CoachNextSetCard from "@/components/workout/CoachNextSetCard";
import WorkoutCheckIn, { WorkoutCheckInValues } from "@/components/workout/WorkoutCheckIn";
import BottomButton from "@/components/ui/BottomButton";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { saveRecoveryCheckin, getRecoveryAdvice } from "@/services/recovery.service";
import { awardWorkoutPoints } from "@/services/ranking.service";
import { useRestTimerStore } from "@/stores/rest-timer.store";
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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, AppState, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CoachLastSet = {
  weight: number;
  reps: number;
  nextSet: number;
  isPersonalRecord: boolean;
};

export default function WorkoutSessionScreen() {
  const { programId } = useLocalSearchParams<{ programId: string }>();
  const { user } = useAuth();
  const { start: startRest } = useRestTimerStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(8);
  const [completedVolume, setCompletedVolume] = useState(0);
  const [completedTotalSets, setCompletedTotalSets] = useState(0);
  const [personalRecordsThisSession, setPersonalRecordsThisSession] = useState(0);
  const [lastPerformance, setLastPerformance] = useState<{ weight: number; reps: number } | null>(null);
  const [lastPerformanceLoading, setLastPerformanceLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<ProgressionRecommendation | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [checkInDone, setCheckInDone] = useState(false);
  const [recoveryScore, setRecoveryScore] = useState<number | null>(null);
  const [readinessMessage, setReadinessMessage] = useState<string | null>(null);
  const [coachLastSet, setCoachLastSet] = useState<CoachLastSet | null>(null);
  const [completed, setCompleted] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);

  const exercise = exercises[currentExerciseIndex];
  const totalSets = exercise?.sets ?? 0;
  const completedSets = Array.from({ length: Math.max(0, currentSet - 1) }, (_, index) => index + 1);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!programId || !userId) return;
    let cancelled = false;
    async function loadWorkout() {
      try {
        setLoading(true);
        const data = await getWorkoutExercises(String(programId));
        if (cancelled) return;
        const loadedExercises = data ?? [];
        setExercises(loadedExercises);
        const session = await startWorkoutSession(userId, String(programId));
        if (cancelled) return;
        setSessionId(session.id);
        setSessionStartedAt(new Date(session.started_at).getTime());
        const sessionWithSets = await getWorkoutSession(session.id);
        if (cancelled) return;
        const savedSets = (sessionWithSets?.workout_sets ?? []).filter((set: any) => set.completed !== false);
        setCompletedVolume(savedSets.reduce((sum: number, set: any) => sum + Number(set.weight || 0) * Number(set.reps || 0), 0));
        setCompletedTotalSets(savedSets.length);
        if (sessionWithSets?.recovery_score != null) setRecoveryScore(Number(sessionWithSets.recovery_score));
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
  }, [programId, userId]);

  useEffect(() => {
    if (!sessionStartedAt || completed) return;

    const updateElapsed = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") updateElapsed();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [sessionStartedAt, completed]);

  useEffect(() => {
    if (!exercise || !userId || !checkInDone) return;
    let cancelled = false;
    async function loadExerciseData() {
      try {
        setLastPerformanceLoading(true);
        setRecommendationLoading(true);
        const [performance, nextRecommendation] = await Promise.all([
          getLastPerformance(userId, exercise.exercise_id),
          getProgressionRecommendation(userId, exercise.exercise_id, exercise.min_reps, exercise.max_reps, exercise.sets),
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
    setCoachLastSet(null);
    return () => { cancelled = true; };
  }, [exercise?.exercise_id, userId, checkInDone]);

  async function handleCheckIn(values: WorkoutCheckInValues) {
    if (!sessionId || !userId) return;
    try {
      const saved = await saveRecoveryCheckin(userId, sessionId, values as any);
      const score = Number(saved.recovery_score);
      setRecoveryScore(score);
      const advice = getRecoveryAdvice(score);
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

  function formatWorkoutDuration(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function getNextSetTarget(completedWeight: number, completedReps: number) {
    if (!exercise) return { weight: completedWeight, reps: completedReps };
    const min = exercise.min_reps;
    const max = exercise.max_reps;
    const lowRecovery = recoveryScore !== null && recoveryScore <= 2;
    const highRecovery = recoveryScore !== null && recoveryScore >= 4.2;

    if (completedReps < min) {
      return { weight: completedWeight, reps: min };
    }

    if (completedReps >= max && highRecovery && completedWeight > 0) {
      return { weight: completedWeight + 2.5, reps: min };
    }

    if (completedReps >= min) {
      return { weight: completedWeight, reps: Math.min(max, completedReps + 1) };
    }

    return { weight: completedWeight, reps: Math.max(min, completedReps) };
  }

  async function validateSet() {
    if (!exercise || !sessionId || saving) return;
    if (weight <= 0 || reps <= 0) {
      Alert.alert("Série incomplète", "Indique un poids et un nombre de répétitions valides.");
      return;
    }
    try {
      setSaving(true);
      const savedSet = await saveWorkoutSet(sessionId, exercise.exercise_id, currentSet, weight, reps);
      const volumeDelta = weight * reps - savedSet.previousWeight * savedSet.previousReps;
      const nextVolume = Math.max(0, completedVolume + volumeDelta);
      const nextTotalSets = completedTotalSets + (savedSet.isNew ? 1 : 0);
      const nextPersonalRecords = personalRecordsThisSession + (savedSet.isPersonalRecord ? 1 : 0);
      setCompletedVolume(nextVolume);
      setCompletedTotalSets(nextTotalSets);
      setPersonalRecordsThisSession(nextPersonalRecords);

      if (currentSet < exercise.sets) {
        const nextSet = currentSet + 1;
        const nextTarget = getNextSetTarget(weight, reps);
        setCoachLastSet({ weight, reps, nextSet, isPersonalRecord: savedSet.isPersonalRecord });
        setWeight(nextTarget.weight);
        setReps(nextTarget.reps);
        setCurrentSet(nextSet);
        await startRest(exercise.rest_seconds || 120);
        return;
      }

      if (currentExerciseIndex < exercises.length - 1) {
        setCoachLastSet(null);
        setCurrentExerciseIndex((previous) => previous + 1);
        setCurrentSet(1);
        await startRest(exercise.rest_seconds || 120);
        return;
      }

      const duration = sessionStartedAt ? Math.max(0, Math.floor((Date.now() - sessionStartedAt) / 1000)) : 0;
      await finishWorkoutSession(sessionId, duration, nextVolume, nextTotalSets);

      if (userId) {
        try {
          const result = await awardWorkoutPoints(userId, { volume: nextVolume, totalSets: nextTotalSets, personalRecords: nextPersonalRecords });
          setEarnedPoints(result.pointsEarned);
        } catch (rankingError) {
          console.log("RANKING AWARD ERROR =", rankingError);
        }
      }

      setCompleted(true);
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

  if (completed) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.completedScreen}>
          <View style={styles.completedIcon}><Text style={styles.completedIconText}>✓</Text></View>
          <Text style={styles.completedEyebrow}>SÉANCE TERMINÉE</Text>
          <Text style={styles.completedTitle}>Beau travail.</Text>
          <Text style={styles.completedText}>Toutes tes séries ont été enregistrées. Ta progression a été mise à jour.</Text>
          <View style={styles.completedStats}>
            <View style={styles.completedStat}><Text style={styles.completedStatValue}>{completedTotalSets}</Text><Text style={styles.completedStatLabel}>séries</Text></View>
            <View style={styles.completedDivider} />
            <View style={styles.completedStat}><Text style={styles.completedStatValue}>{Math.round(completedVolume).toLocaleString("fr-FR")}</Text><Text style={styles.completedStatLabel}>kg volume</Text></View>
            {earnedPoints !== null && <><View style={styles.completedDivider} /><View style={styles.completedStat}><Text style={styles.completedStatValue}>+{earnedPoints}</Text><Text style={styles.completedStatLabel}>points</Text></View></>}
          </View>
          <Pressable style={styles.completedButton} onPress={() => router.replace("/(app)/home")}>
            <Text style={styles.completedButtonText}>RETOUR À L'ACCUEIL</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
      <View style={styles.workoutDurationBar}>
        <View style={styles.workoutDurationCopy}>
          <Text style={styles.workoutDurationLabel}>DURÉE DE LA SÉANCE</Text>
          <Text style={styles.workoutDurationValue}>{formatWorkoutDuration(elapsedSeconds)}</Text>
        </View>
        <View style={styles.workoutDurationMeta}>
          <Text style={styles.workoutDurationMetaValue}>{completedTotalSets}</Text>
          <Text style={styles.workoutDurationMetaLabel}>séries</Text>
        </View>
        <View style={styles.workoutDurationMeta}>
          <Text style={styles.workoutDurationMetaValue}>{Math.round(completedVolume).toLocaleString("fr-FR")}</Text>
          <Text style={styles.workoutDurationMetaLabel}>kg</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {exercise ? (
          <Pressable onPress={() => router.push({ pathname: "/(app)/exercise-detail", params: { id: exercise.exercise_id } })} style={({ pressed }) => [styles.exerciseHero, pressed && styles.exerciseHeroPressed]}>
            <View style={styles.exerciseImageWrap}>
              {exercise.exercises.image_url ? (
                <Image source={{ uri: exercise.exercises.image_url }} style={styles.exerciseImage} resizeMode="cover" />
              ) : (
                <View style={styles.exerciseImageFallback}><Text style={styles.exerciseImageFallbackText}>💪</Text></View>
              )}
            </View>
            <View style={styles.exerciseHeroCopy}>
              <Text style={styles.exerciseHeroEyebrow}>EXERCICE ACTUEL</Text>
              <Text style={styles.exerciseHeroTitle} numberOfLines={2}>{exercise.exercises.name}</Text>
              <Text style={styles.exerciseHeroLink}>Voir la technique et l'anatomie →</Text>
            </View>
          </Pressable>
        ) : null}
        {readinessMessage && <View style={styles.readiness}><Text style={styles.readinessText}>{readinessMessage}</Text></View>}
        {coachLastSet && exercise && (
          <CoachNextSetCard
            weight={coachLastSet.weight}
            reps={coachLastSet.reps}
            minReps={exercise.min_reps}
            maxReps={exercise.max_reps}
            nextSet={coachLastSet.nextSet}
            totalSets={exercise.sets}
            isPersonalRecord={coachLastSet.isPersonalRecord}
            recoveryScore={recoveryScore}
          />
        )}
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
        <WorkoutProgressCard totalSets={totalSets} completedSets={completedSets} weight={weight} reps={reps} lastWeight={coachLastSet?.weight} lastReps={coachLastSet?.reps} />
      </ScrollView>
      <BottomButton title={saving ? "ENREGISTREMENT..." : currentSet === totalSets ? currentExerciseIndex === exercises.length - 1 ? "TERMINER LA SÉANCE" : "EXERCICE SUIVANT" : "VALIDER LA SÉRIE"} onPress={validateSet} disabled={!exercise || saving} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  checkinContent: { paddingTop: 20, paddingBottom: 40 },
  content: { paddingTop: 20, paddingBottom: 40, gap: 20 },
  workoutDurationBar: { flexDirection: "row", alignItems: "center", minHeight: 68, marginTop: 14, paddingHorizontal: 16, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  workoutDurationCopy: { flex: 1 },
  workoutDurationLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  workoutDurationValue: { color: Colors.primary, fontSize: 25, fontWeight: "900", fontVariant: ["tabular-nums"], marginTop: 2 },
  workoutDurationMeta: { minWidth: 58, alignItems: "center", paddingLeft: 12, marginLeft: 8, borderLeftWidth: 1, borderLeftColor: Colors.border },
  workoutDurationMetaValue: { color: Colors.text, fontSize: 16, fontWeight: "900", fontVariant: ["tabular-nums"] },
  workoutDurationMetaLabel: { color: Colors.textSecondary, fontSize: 9, fontWeight: "700", marginTop: 2 },
  exerciseHero: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  exerciseHeroPressed: { opacity: 0.75 },
  exerciseImageWrap: { width: 82, height: 82, borderRadius: 16, overflow: "hidden", backgroundColor: Colors.surfaceLight },
  exerciseImage: { width: "100%", height: "100%" },
  exerciseImageFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  exerciseImageFallbackText: { fontSize: 30 },
  exerciseHeroCopy: { flex: 1, marginLeft: 13 },
  exerciseHeroEyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  exerciseHeroTitle: { color: Colors.text, fontSize: 17, lineHeight: 21, fontWeight: "900", marginTop: 4 },
  exerciseHeroLink: { color: Colors.textMuted, fontSize: 11, fontWeight: "700", marginTop: 6 },
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
  completedScreen: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  completedIcon: { width: 78, height: 78, borderRadius: 39, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  completedIconText: { color: "#FFFFFF", fontSize: 42, fontWeight: "900" },
  completedEyebrow: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1.8 },
  completedTitle: { color: Colors.text, fontSize: 34, fontWeight: "900", marginTop: 6 },
  completedText: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22, textAlign: "center", marginTop: 10, maxWidth: 330 },
  completedStats: { width: "100%", flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 30, paddingVertical: 20, borderRadius: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  completedStat: { flex: 1, alignItems: "center" },
  completedStatValue: { color: Colors.text, fontSize: 21, fontWeight: "900" },
  completedStatLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  completedDivider: { width: 1, height: 34, backgroundColor: Colors.border },
  completedButton: { width: "100%", minHeight: 56, borderRadius: 18, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginTop: 24 },
  completedButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", letterSpacing: 0.5 },
});