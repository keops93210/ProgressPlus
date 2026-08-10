import { supabase } from "@/lib/supabase";
import {
  getProgressionDecision,
  getSuggestedRestSeconds,
  getTrainingQualityScore,
  getEffortZone as getProgressEngineEffortZone,
  normalizeRir,
  type ProgressionDecision,
} from "@/services/progress-engine.service";

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
  suggestedRestSeconds: number;
  qualityScore: number;
  reason: string;
  signals: string[];
}

export function clampRir(rir: number) {
  return Math.max(0, Math.min(5, Math.round(rir)));
}

export function estimate1RM(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return Number((weight * (1 + reps / 30)).toFixed(2));
}

export function getEffortZone(rir: number): TrainingEffortZone {
  return getProgressEngineEffortZone(clampRir(rir));
}

function roundWeight(weight: number) {
  return Math.max(0, Math.round(weight / 2.5) * 2.5);
}

function mapAction(action: ProgressionDecision["action"]): AdaptiveAction {
  if (action === "increase_weight") return "increase_weight";
  if (action === "increase_reps") return "increase_reps";
  if (action === "reduce_load") return "reduce_weight";
  if (action === "deload") return "deload";
  return "hold";
}

function calculateFatigueRisk(rir: number, recoveryScore?: number | null, consecutiveHardSets = 0) {
  let risk = 0;
  if (rir <= 0) risk += 45;
  else if (rir === 1) risk += 32;
  else if (rir === 2) risk += 16;
  if (recoveryScore != null) {
    if (recoveryScore <= 2) risk += 35;
    else if (recoveryScore < 3) risk += 18;
  }
  risk += Math.min(30, Math.max(0, consecutiveHardSets - 1) * 10);
  return Math.min(100, risk);
}

export function decideNextSet(params: {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir: number;
  recoveryScore?: number | null;
  trendPercent?: number | null;
  recentMisses?: number;
  consecutiveHardSets?: number;
}) : AdaptiveSetDecision {
  const weight = Math.max(0, params.weight);
  const reps = Math.max(1, Math.round(params.reps));
  const minReps = Math.max(1, Math.round(params.minReps));
  const maxReps = Math.max(minReps, Math.round(params.maxReps));
  const rir = clampRir(params.rir);
  const recovery = params.recoveryScore == null ? 3.5 : Math.max(1, Math.min(5, params.recoveryScore));
  const fatigueRisk = calculateFatigueRisk(rir, params.recoveryScore, params.consecutiveHardSets ?? 0);
  const decision = getProgressionDecision({
    weight,
    reps,
    minReps,
    maxReps,
    rir,
    readiness: params.recoveryScore,
    trendPercent: params.trendPercent,
    recentMisses: params.recentMisses,
    recentSessions: 3,
    consecutiveHardSets: params.consecutiveHardSets,
    fatigueTrend: fatigueRisk >= 65 ? "rising" : "stable",
  });

  const suggestedRestSeconds = getSuggestedRestSeconds(rir, 120, params.recoveryScore);
  const nextWeight = roundWeight(decision.recommendedWeight || weight);
  const nextReps = Math.max(minReps, Math.min(maxReps, decision.recommendedReps));
  const estimated1rm = estimate1RM(weight, reps);
  const qualityScore = getTrainingQualityScore({
    completedSets: 1,
    plannedSets: 1,
    averageRir: rir,
    readiness: recovery,
    trendPercent: params.trendPercent ?? 0,
  });

  return {
    action: mapAction(decision.action),
    nextWeight,
    nextReps,
    effortZone: getEffortZone(rir),
    estimated1rm,
    confidence: decision.confidence,
    fatigueRisk,
    suggestedRestSeconds,
    qualityScore,
    reason: decision.reason,
    signals: decision.signals,
  };
}

export function getWorkoutQualityScore(params: {
  completedSets: number;
  plannedSets: number;
  averageRir: number;
  recoveryScore?: number | null;
  personalRecords?: number;
}) {
  return getTrainingQualityScore({
    completedSets: params.completedSets,
    plannedSets: params.plannedSets,
    averageRir: params.averageRir,
    readiness: params.recoveryScore,
    personalRecords: params.personalRecords,
  });
}

export async function saveWorkoutEffort(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  rir: number,
  context?: {
    weight?: number;
    reps?: number;
    minReps?: number;
    maxReps?: number;
    recoveryScore?: number | null;
    trendPercent?: number | null;
    recentMisses?: number;
    consecutiveHardSets?: number;
  },
) {
  const safeRir = clampRir(rir);
  const rpe = 10 - safeRir;
  const normalizedRir = normalizeRir(safeRir) ?? safeRir;

  const { error } = await supabase
    .from("workout_sets")
    .update({ rir: safeRir, rpe })
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .eq("set_number", setNumber);

  if (error) throw error;

  const decision = context?.weight != null && context?.reps != null
    ? decideNextSet({
        weight: context.weight,
        reps: context.reps,
        minReps: context.minReps ?? 1,
        maxReps: context.maxReps ?? Math.max(1, context.reps),
        rir: normalizedRir,
        recoveryScore: context.recoveryScore,
        trendPercent: context.trendPercent,
        recentMisses: context.recentMisses,
        consecutiveHardSets: context.consecutiveHardSets,
      })
    : null;

  return { rir: safeRir, rpe, decision };
}
