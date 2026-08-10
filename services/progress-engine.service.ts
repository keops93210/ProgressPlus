export type ProgressionAction =
  | "increase_weight"
  | "increase_reps"
  | "keep_weight"
  | "reduce_load"
  | "deload";

export type EffortZone = "easy" | "productive" | "hard" | "failure";

export type ProgressionDecision = {
  action: ProgressionAction;
  confidence: number;
  recommendedWeight: number;
  recommendedReps: number;
  reason: string;
  signals: string[];
  effortZone?: EffortZone;
  qualityScore?: number;
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
  fatigueTrend?: "improving" | "stable" | "rising";
  consecutiveHardSets?: number;
};

export type LiveSetState = {
  setNumber: number;
  plannedSets: number;
  completedSets: number;
  weight: number;
  reps: number;
  rir: number;
  minReps: number;
  maxReps: number;
  readiness?: number | null;
  trendPercent?: number | null;
  recentMisses?: number;
  consecutiveHardSets?: number;
};

export type LiveSetDecision = ProgressionDecision & {
  nextSetNumber: number;
  shouldRest: boolean;
  suggestedRestSeconds: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function estimateOneRepMax(weight: number, reps: number) {
  if (weight <= 0 || reps <= 0) return 0;
  return weight * (1 + reps / 30);
}

export function normalizeRir(rir?: number | null, rpe?: number | null) {
  if (typeof rir === "number") return clamp(rir, 0, 5);
  if (typeof rpe === "number") return clamp(10 - rpe, 0, 5);
  return null;
}

export function getEffortZone(rir?: number | null, rpe?: number | null): EffortZone {
  const normalized = normalizeRir(rir, rpe);
  if (normalized === null) return "productive";
  if (normalized <= 0.5) return "failure";
  if (normalized <= 2) return "hard";
  if (normalized <= 4) return "productive";
  return "easy";
}

export function getProgressionDecision(input: ProgressEngineInput): ProgressionDecision {
  const weight = Math.max(0, input.weight);
  const reps = Math.max(0, input.reps);
  const minReps = Math.max(1, input.minReps);
  const maxReps = Math.max(minReps, input.maxReps);
  const rir = normalizeRir(input.rir, input.rpe);
  const readiness = input.readiness ?? null;
  const trend = input.trendPercent ?? 0;
  const misses = Math.max(0, input.recentMisses ?? 0);
  const sessions = Math.max(0, input.recentSessions ?? 0);
  const techniqueGood = input.techniqueGood !== false;
  const consecutiveHardSets = Math.max(0, input.consecutiveHardSets ?? 0);
  const fatigueRising = input.fatigueTrend === "rising";
  const signals: string[] = [];

  const veryFatigued = readiness !== null && readiness <= 2;
  const ready = readiness !== null && readiness >= 4.2;
  const nearFailure = rir !== null && rir <= 1;
  const comfortable = rir !== null && rir >= 4;
  const strongTrend = trend >= 3;
  const weakTrend = trend <= -3;
  const effortZone = getEffortZone(input.rir, input.rpe);

  if (veryFatigued) signals.push("récupération basse");
  if (ready) signals.push("récupération élevée");
  if (nearFailure) signals.push("proche de l'échec");
  if (comfortable) signals.push("marge importante");
  if (strongTrend) signals.push("tendance de force positive");
  if (weakTrend) signals.push("tendance de force négative");
  if (misses > 0) signals.push(`${misses} série(s) sous l'objectif récemment`);
  if (!techniqueGood) signals.push("technique à stabiliser");
  if (fatigueRising) signals.push("fatigue en hausse");
  if (consecutiveHardSets >= 2) signals.push("effort élevé sur plusieurs séries");

  const qualityScore = getTrainingQualityScore({ completedSets: 1, plannedSets: 1, averageRir: rir, readiness, trendPercent: trend });

  if (weight <= 0) return { action: "keep_weight", confidence: 0.45, recommendedWeight: 0, recommendedReps: minReps, reason: `Trouve d'abord une charge qui permet ${minReps}–${maxReps} reps propres.`, signals, effortZone, qualityScore };

  if (readiness !== null && readiness <= 1.5 && (fatigueRising || weakTrend)) return { action: "deload", confidence: 0.93, recommendedWeight: Math.max(0, Number((weight * 0.85).toFixed(2))), recommendedReps: minReps, reason: "Récupération très basse et fatigue en hausse : une réduction temporaire protège la progression.", signals, effortZone, qualityScore };

  if (!techniqueGood || veryFatigued || (nearFailure && weakTrend)) return { action: "keep_weight", confidence: 0.9, recommendedWeight: weight, recommendedReps: clamp(reps, minReps, maxReps), reason: !techniqueGood ? "La technique doit rester la priorité avant toute surcharge." : "Les signaux de fatigue sont trop élevés pour augmenter la charge aujourd'hui.", signals, effortZone, qualityScore };

  if (misses >= 2 && !ready) return { action: "reduce_load", confidence: 0.82, recommendedWeight: Math.max(0, weight - 2.5), recommendedReps: minReps, reason: "Les performances récentes montrent que la charge actuelle est trop ambitieuse. On réduit légèrement pour reconstruire une progression stable.", signals, effortZone, qualityScore };

  if (consecutiveHardSets >= 3 && readiness !== null && readiness < 4) return { action: "keep_weight", confidence: 0.89, recommendedWeight: weight, recommendedReps: minReps, reason: "Plusieurs séries sont déjà très exigeantes. On conserve la charge et on évite d'accumuler de la fatigue inutile.", signals, effortZone, qualityScore };

  if (reps >= maxReps && (rir === null || rir >= 2) && techniqueGood && !weakTrend) return { action: "increase_weight", confidence: clamp(0.78 + (ready ? 0.1 : 0) + (strongTrend ? 0.07 : 0), 0.5, 0.97), recommendedWeight: weight + 2.5, recommendedReps: minReps, reason: `Tu atteins le haut de la fourchette avec suffisamment de marge. Passe à ${weight + 2.5} kg et reconstruis les reps depuis le bas de la zone.`, signals, effortZone, qualityScore };

  if (comfortable && reps < maxReps) return { action: "increase_reps", confidence: 0.84, recommendedWeight: weight, recommendedReps: Math.min(maxReps, reps + 1), reason: "Tu gardes beaucoup de marge. Ajoute une répétition avant d'augmenter la charge.", signals, effortZone, qualityScore };

  if (weakTrend && sessions >= 2) return { action: "keep_weight", confidence: 0.86, recommendedWeight: weight, recommendedReps: clamp(reps, minReps, maxReps), reason: "La tendance récente est en baisse. On consolide plutôt que de forcer une surcharge.", signals, effortZone, qualityScore };

  return { action: "increase_reps", confidence: 0.72, recommendedWeight: weight, recommendedReps: Math.min(maxReps, Math.max(minReps, reps + 1)), reason: "La meilleure prochaine étape est une petite amélioration des répétitions à charge constante.", signals, effortZone, qualityScore };
}

export function getSuggestedRestSeconds(rir: number, baseRestSeconds: number, readiness?: number | null) {
  const base = Math.max(30, baseRestSeconds);
  const effortMultiplier = rir <= 0 ? 1.3 : rir === 1 ? 1.2 : rir === 2 ? 1.1 : rir >= 4 ? 0.9 : 1;
  const readinessMultiplier = readiness !== null && readiness !== undefined && readiness <= 2 ? 1.15 : 1;
  return Math.round((base * effortMultiplier * readinessMultiplier) / 15) * 15;
}

export function getLiveSetDecision(state: LiveSetState): LiveSetDecision {
  const decision = getProgressionDecision({
    weight: state.weight,
    reps: state.reps,
    rir: state.rir,
    minReps: state.minReps,
    maxReps: state.maxReps,
    readiness: state.readiness,
    trendPercent: state.trendPercent,
    recentMisses: state.recentMisses,
    recentSessions: 3,
    consecutiveHardSets: state.consecutiveHardSets,
    fatigueTrend: state.consecutiveHardSets && state.consecutiveHardSets >= 3 ? "rising" : "stable",
  });

  const nextSetNumber = Math.min(state.plannedSets, state.setNumber + 1);
  const shouldRest = state.setNumber < state.plannedSets || state.completedSets < state.plannedSets;
  const suggestedRestSeconds = getSuggestedRestSeconds(state.rir, 120, state.readiness);

  return { ...decision, nextSetNumber, shouldRest, suggestedRestSeconds };
}

export function getTrainingQualityScore(input: {
  completedSets: number;
  plannedSets: number;
  averageRir?: number | null;
  readiness?: number | null;
  trendPercent?: number | null;
  personalRecords?: number;
}) {
  const completion = input.plannedSets > 0 ? clamp(input.completedSets / input.plannedSets, 0, 1) : 0;
  const rir = input.averageRir == null ? 0.7 : 1 - clamp(Math.abs(input.averageRir - 2.5) / 4, 0, 1);
  const readiness = input.readiness == null ? 0.7 : clamp(input.readiness / 5, 0, 1);
  const trend = input.trendPercent == null ? 0.5 : clamp(0.5 + input.trendPercent / 20, 0, 1);
  const pr = Math.min(1, Math.max(0, input.personalRecords ?? 0) / 2);
  return Math.round(clamp(completion * 35 + rir * 25 + readiness * 20 + trend * 15 + pr * 5, 0, 100));
}
