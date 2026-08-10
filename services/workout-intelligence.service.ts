import { getLiveSetDecision, getProgressionDecision, getSuggestedRestSeconds, type LiveSetDecision } from "@/services/progress-engine.service";

export type WorkoutIntelligenceInput = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir: number;
  readiness: number | null;
  baseRestSeconds: number;
  completedSets: number;
  plannedSets: number;
  previousRir?: number | null;
  previousReps?: number | null;
  consecutiveHardSets?: number;
  trendPercent?: number;
};

export type WorkoutIntelligence = LiveSetDecision & {
  headline: string;
  restReason: string;
  nextTargetLabel: string;
  fatigueLabel: "FAIBLE" | "MODÉRÉE" | "ÉLEVÉE" | "CRITIQUE";
};

function getFatigueLabel(input: WorkoutIntelligenceInput): WorkoutIntelligence["fatigueLabel"] {
  const hard = input.rir <= 1;
  const rising = input.previousRir != null && input.rir < input.previousRir;
  const readinessLow = input.readiness != null && input.readiness <= 2;
  const repeated = (input.consecutiveHardSets ?? 0) >= 2;
  if (readinessLow && (hard || repeated)) return "CRITIQUE";
  if (hard && (rising || repeated)) return "ÉLEVÉE";
  if (hard || readinessLow) return "MODÉRÉE";
  return "FAIBLE";
}

function getHeadline(action: LiveSetDecision["action"]) {
  switch (action) {
    case "increase_weight": return "Tu as validé la zone : on monte la charge.";
    case "increase_reps": return "La charge est bonne : on cherche une rep de plus.";
    case "reduce_load": return "On réduit légèrement pour repartir proprement.";
    case "deload": return "La récupération est insuffisante : on protège ta progression.";
    default: return "On consolide cette charge avant de pousser plus loin.";
  }
}

export function analyzeWorkoutSet(input: WorkoutIntelligenceInput): WorkoutIntelligence {
  const decision = getLiveSetDecision({
    setNumber: input.completedSets,
    plannedSets: input.plannedSets,
    completedSets: input.completedSets,
    weight: input.weight,
    reps: input.reps,
    rir: input.rir,
    minReps: input.minReps,
    maxReps: input.maxReps,
    readiness: input.readiness,
    trendPercent: input.trendPercent,
    consecutiveHardSets: input.consecutiveHardSets,
  });
  const suggestedRestSeconds = getSuggestedRestSeconds(input.rir, input.baseRestSeconds, input.readiness);
  const restReason = input.rir <= 1
    ? "Série très exigeante : Progress+ augmente légèrement la récupération."
    : input.rir >= 4
      ? "Bonne marge : récupération légèrement raccourcie."
      : "Repos standard adapté à ton effort.";
  return {
    ...decision,
    suggestedRestSeconds,
    headline: getHeadline(decision.action),
    restReason,
    nextTargetLabel: `${decision.recommendedWeight > 0 ? `${decision.recommendedWeight} kg` : "Charge à définir"} × ${decision.recommendedReps} reps`,
    fatigueLabel: getFatigueLabel(input),
  };
}

export function getSetQualityLabel(rir: number, reps: number, minReps: number, maxReps: number) {
  if (reps < minReps) return "À CONSOLIDER";
  if (rir <= 0) return "MAXIMAL";
  if (rir <= 2 && reps >= minReps) return "TRÈS PRODUCTIVE";
  if (rir <= 4 && reps <= maxReps) return "PRODUCTIVE";
  return "FACILE";
}

export function getNextTargetFromDecision(decision: LiveSetDecision) {
  return {
    weight: decision.recommendedWeight,
    reps: decision.recommendedReps,
    restSeconds: decision.suggestedRestSeconds,
  };
}
