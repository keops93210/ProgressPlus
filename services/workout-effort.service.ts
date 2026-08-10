import { supabase } from "@/lib/supabase";

export type TrainingEffortZone = "easy" | "productive" | "hard" | "failure";
export type AdaptiveAction = "increase_weight" | "increase_reps" | "hold" | "reduce_weight" | "deload";

export interface AdaptiveSetDecision {
  action: AdaptiveAction;
  nextWeight: number;
  nextReps: number;
  effortZone: TrainingEffortZone;
  estimated1rm: number;
  confidence: number;
  fatigueRisk: number;
  reason: string;
}

export function clampRir(rir: number) {
  return Math.max(0, Math.min(5, Math.round(rir)));
}

export function estimate1RM(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return Number((weight * (1 + reps / 30)).toFixed(2));
}

export function getEffortZone(rir: number): TrainingEffortZone {
  const safeRir = clampRir(rir);
  if (safeRir >= 4) return "easy";
  if (safeRir >= 2) return "productive";
  if (safeRir === 1) return "hard";
  return "failure";
}

function roundWeight(weight: number) {
  return Math.max(0, Math.round(weight / 2.5) * 2.5);
}

export function decideNextSet(params: {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir: number;
  recoveryScore?: number | null;
}) : AdaptiveSetDecision {
  const weight = Math.max(0, params.weight);
  const reps = Math.max(1, Math.round(params.reps));
  const minReps = Math.max(1, Math.round(params.minReps));
  const maxReps = Math.max(minReps, Math.round(params.maxReps));
  const rir = clampRir(params.rir);
  const recovery = params.recoveryScore == null ? 3.5 : Math.max(1, Math.min(5, params.recoveryScore));
  const effortZone = getEffortZone(rir);
  const estimated1rm = estimate1RM(weight, reps);

  let fatigueRisk = 0;
  if (rir <= 1) fatigueRisk += 45;
  else if (rir === 2) fatigueRisk += 20;
  if (recovery <= 2) fatigueRisk += 35;
  else if (recovery < 3) fatigueRisk += 15;
  if (reps < minReps) fatigueRisk += 25;
  fatigueRisk = Math.min(100, fatigueRisk);

  let action: AdaptiveAction = "hold";
  let nextWeight = weight;
  let nextReps = Math.max(minReps, Math.min(maxReps, reps));
  let confidence = 0.78;
  let reason = "Garde la charge et cherche une série propre.";

  if (fatigueRisk >= 75 && recovery <= 2) {
    action = "deload";
    nextWeight = roundWeight(weight * 0.9);
    nextReps = minReps;
    confidence = 0.91;
    reason = "Récupération basse et fatigue élevée : réduis temporairement la charge plutôt que de forcer.";
  } else if (recovery <= 2 && rir <= 1) {
    action = "reduce_weight";
    nextWeight = roundWeight(weight * 0.95);
    nextReps = minReps;
    confidence = 0.9;
    reason = "Tu es proche de l'échec avec une récupération basse : baisse légèrement la charge pour préserver la qualité.";
  } else if (rir <= 1) {
    action = "hold";
    confidence = 0.88;
    reason = "Tu es proche de l'échec : ne surcharge pas la prochaine série, récupère et répète proprement.";
  } else if (reps < minReps) {
    action = "hold";
    nextReps = minReps;
    confidence = 0.9;
    reason = `Tu es sous ${minReps} reps : garde la charge et stabilise la série.`;
  } else if (reps >= maxReps && rir >= 3 && recovery >= 3.5 && weight > 0) {
    action = "increase_weight";
    nextWeight = roundWeight(weight + 2.5);
    nextReps = minReps;
    confidence = recovery >= 4 ? 0.94 : 0.86;
    reason = `Tu atteins ${maxReps} reps avec de la marge : augmente légèrement la charge.`;
  } else if (rir >= 3) {
    action = "increase_reps";
    nextReps = Math.min(maxReps, reps + 1);
    confidence = 0.84;
    reason = "Tu as encore de la marge : gagne une répétition avant d'augmenter la charge.";
  } else if (recovery <= 2.5) {
    action = "hold";
    confidence = 0.82;
    reason = "La récupération est moyenne à faible : consolide plutôt que de forcer la progression.";
  }

  return { action, nextWeight, nextReps, effortZone, estimated1rm, confidence, fatigueRisk, reason };
}

export function getWorkoutQualityScore(params: {
  completedSets: number;
  plannedSets: number;
  averageRir: number;
  recoveryScore?: number | null;
  personalRecords?: number;
}) {
  const completion = Math.min(1, Math.max(0, params.completedSets / Math.max(1, params.plannedSets)));
  const rirQuality = Math.max(0, 1 - Math.abs(params.averageRir - 2.5) / 3.5);
  const recovery = params.recoveryScore == null ? 0.75 : Math.max(0, Math.min(1, params.recoveryScore / 5));
  const prs = Math.min(1, Math.max(0, (params.personalRecords ?? 0) / 3));
  return Math.round(Math.min(100, completion * 45 + rirQuality * 30 + recovery * 15 + prs * 10));
}

export async function saveWorkoutEffort(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  rir: number,
) {
  const safeRir = clampRir(rir);
  const rpe = 10 - safeRir;

  const { error } = await supabase
    .from("workout_sets")
    .update({ rir: safeRir, rpe })
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .eq("set_number", setNumber);

  if (error) throw error;
  return { rir: safeRir, rpe };
}
