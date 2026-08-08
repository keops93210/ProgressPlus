import { supabase } from "@/lib/supabase";

export type CoachMode = "PUSH" | "NORMAL" | "HOLD";

export interface ExerciseRecommendation {
  exerciseId: string;
  recommendedWeight: number | null;
  recommendedReps: number | null;
  confidence: "low" | "medium" | "high";
  reason: string;
}

export interface ReadinessInput {
  sleep: number;
  energy: number;
  mood: number;
  fatigue: number;
  pain: number;
}

export function getReadinessScore(input: ReadinessInput) {
  const raw = (input.sleep + input.energy + input.mood + (6 - input.fatigue) + (6 - input.pain)) / 5;
  return Math.round(raw * 10) / 10;
}

export function getCoachMode(readiness: number): CoachMode {
  if (readiness >= 4) return "PUSH";
  if (readiness >= 2.8) return "NORMAL";
  return "HOLD";
}

export function recommendNextWeight(input: {
  lastWeight: number;
  lastReps: number;
  targetMinReps: number;
  targetMaxReps: number;
  readiness: number;
}) {
  const { lastWeight, lastReps, targetMinReps, targetMaxReps, readiness } = input;
  if (!lastWeight || !lastReps) return null;

  if (readiness < 2.8) {
    return { weight: lastWeight, reps: Math.min(lastReps, targetMaxReps), action: "HOLD" as CoachMode };
  }

  if (lastReps >= targetMaxReps) {
    const increment = lastWeight >= 60 ? 2.5 : lastWeight >= 30 ? 1.25 : 1;
    return { weight: lastWeight + increment, reps: targetMinReps, action: "PUSH" as CoachMode };
  }

  return { weight: lastWeight, reps: Math.min(targetMaxReps, lastReps + 1), action: "NORMAL" as CoachMode };
}

export async function getExerciseRecommendation(input: {
  userId: string;
  exerciseId: string;
  targetMinReps: number;
  targetMaxReps: number;
  readiness: number;
}): Promise<ExerciseRecommendation> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("weight, reps, created_at")
    .eq("user_id", input.userId)
    .eq("exercise_id", input.exerciseId)
    .not("weight", "is", null)
    .not("reps", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    return {
      exerciseId: input.exerciseId,
      recommendedWeight: null,
      recommendedReps: input.targetMinReps,
      confidence: "low",
      reason: "Pas encore assez d'historique. Commence avec une charge maîtrisée.",
    };
  }

  const recommendation = recommendNextWeight({
    lastWeight: Number(data.weight),
    lastReps: Number(data.reps),
    targetMinReps: input.targetMinReps,
    targetMaxReps: input.targetMaxReps,
    readiness: input.readiness,
  });

  if (!recommendation) {
    return {
      exerciseId: input.exerciseId,
      recommendedWeight: null,
      recommendedReps: input.targetMinReps,
      confidence: "low",
      reason: "Aucune performance exploitable pour le moment.",
    };
  }

  const confidence = input.readiness >= 4 ? "high" : input.readiness >= 2.8 ? "medium" : "low";
  const reason = recommendation.action === "PUSH"
    ? "Ta dernière série a atteint le haut de la fourchette et ta récupération est bonne."
    : recommendation.action === "HOLD"
      ? "Ta récupération est faible : on conserve une charge maîtrisée aujourd'hui."
      : "On consolide la charge avant d'augmenter le poids.";

  return {
    exerciseId: input.exerciseId,
    recommendedWeight: recommendation.weight,
    recommendedReps: recommendation.reps,
    confidence,
    reason,
  };
}
