export type ProgressionAction =
  | "increase_weight"
  | "increase_reps"
  | "keep_weight"
  | "reduce_load"
  | "deload";

export type ProgressionDecision = {
  action: ProgressionAction;
  confidence: number;
  recommendedWeight: number;
  recommendedReps: number;
  reason: string;
  signals: string[];
};

export type ProgressEngineInput = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir?: number | null;
  rpe?: number | null;
  readiness?: number | null;
  trendPercent?: number | null;
  recentMisses?: number;
  recentSessions?: number;
  techniqueGood?: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

export function getProgressionDecision(input: ProgressEngineInput): ProgressionDecision {
  const weight = Math.max(0, input.weight);
  const reps = Math.max(0, input.reps);
  const minReps = Math.max(1, input.minReps);
  const maxReps = Math.max(minReps, input.maxReps);
  const rir = input.rir ?? null;
  const readiness = input.readiness ?? null;
  const trend = input.trendPercent ?? 0;
  const misses = Math.max(0, input.recentMisses ?? 0);
  const sessions = Math.max(0, input.recentSessions ?? 0);
  const techniqueGood = input.techniqueGood !== false;
  const signals: string[] = [];

  const veryFatigued = readiness !== null && readiness <= 2;
  const ready = readiness !== null && readiness >= 4.2;
  const nearFailure = rir !== null && rir <= 1;
  const comfortable = rir !== null && rir >= 4;
  const strongTrend = trend >= 3;
  const weakTrend = trend <= -3;

  if (veryFatigued) signals.push("récupération basse");
  if (ready) signals.push("récupération élevée");
  if (nearFailure) signals.push("proche de l'échec");
  if (comfortable) signals.push("marge importante");
  if (strongTrend) signals.push("tendance de force positive");
  if (weakTrend) signals.push("tendance de force négative");
  if (misses > 0) signals.push(`${misses} série(s) sous l'objectif récemment`);
  if (!techniqueGood) signals.push("technique à stabiliser");

  if (weight <= 0) {
    return {
      action: "keep_weight",
      confidence: 0.45,
      recommendedWeight: 0,
      recommendedReps: minReps,
      reason: `Trouve d'abord une charge qui permet ${minReps}–${maxReps} reps propres.`,
      signals,
    };
  }

  if (!techniqueGood || veryFatigued || (nearFailure && weakTrend)) {
    const targetReps = clamp(reps, minReps, maxReps);
    return {
      action: "keep_weight",
      confidence: 0.9,
      recommendedWeight: weight,
      recommendedReps: targetReps,
      reason: !techniqueGood
        ? "La technique doit rester la priorité avant toute surcharge."
        : "Les signaux de fatigue sont trop élevés pour augmenter la charge aujourd'hui.",
      signals,
    };
  }

  if (misses >= 2 && !ready) {
    return {
      action: "reduce_load",
      confidence: 0.82,
      recommendedWeight: Math.max(0, weight - 2.5),
      recommendedReps: minReps,
      reason: "Les performances récentes montrent que la charge actuelle est trop ambitieuse. On réduit légèrement pour reconstruire une progression stable.",
      signals,
    };
  }

  if (reps >= maxReps && (rir === null || rir >= 2) && techniqueGood && !weakTrend) {
    const increment = weight >= 100 ? 2.5 : 2.5;
    return {
      action: "increase_weight",
      confidence: clamp(0.78 + (ready ? 0.1 : 0) + (strongTrend ? 0.07 : 0), 0.5, 0.97),
      recommendedWeight: weight + increment,
      recommendedReps: minReps,
      reason: `Tu atteins le haut de la fourchette avec suffisamment de marge. Passe à ${weight + increment} kg et reconstruis les reps depuis le bas de la zone.`,
      signals,
    };
  }

  if (comfortable && reps < maxReps) {
    return {
      action: "increase_reps",
      confidence: 0.84,
      recommendedWeight: weight,
      recommendedReps: Math.min(maxReps, reps + 1),
      reason: "Tu gardes beaucoup de marge. Ajoute une répétition avant d'augmenter la charge.",
      signals,
    };
  }

  if (weakTrend && sessions >= 2) {
    return {
      action: "keep_weight",
      confidence: 0.86,
      recommendedWeight: weight,
      recommendedReps: clamp(reps, minReps, maxReps),
      reason: "La tendance récente est en baisse. On consolide plutôt que de forcer une surcharge.",
      signals,
    };
  }

  return {
    action: "increase_reps",
    confidence: 0.72,
    recommendedWeight: weight,
    recommendedReps: Math.min(maxReps, Math.max(minReps, reps + 1)),
    reason: "La meilleure prochaine étape est une petite amélioration des répétitions à charge constante.",
    signals,
  };
}

export function getTrainingQualityScore(input: {
  completedSets: number;
  plannedSets: number;
  averageRir?: number | null;
  readiness?: number | null;
  trendPercent?: number | null;
  personalRecords?: number;
}) {
  const completion = input.plannedSets > 0
    ? clamp(input.completedSets / input.plannedSets, 0, 1)
    : 0;
  const rir = input.averageRir == null ? 0.7 : 1 - clamp(Math.abs(input.averageRir - 2.5) / 4, 0, 1);
  const readiness = input.readiness == null ? 0.7 : clamp(input.readiness / 5, 0, 1);
  const trend = input.trendPercent == null ? 0.5 : clamp(0.5 + input.trendPercent / 20, 0, 1);
  const pr = Math.min(1, Math.max(0, input.personalRecords ?? 0) / 2);
  return Math.round(clamp(completion * 35 + rir * 25 + readiness * 20 + trend * 15 + pr * 5, 0, 100));
}
