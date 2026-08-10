import {
  getLiveSetDecision,
  getTrainingQualityScore,
  normalizeRir,
  type LiveSetDecision,
} from "@/services/progress-engine.service";

export type LiveWorkoutInput = {
  setNumber: number;
  plannedSets: number;
  completedSets: number;
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir?: number | null;
  rpe?: number | null;
  readiness?: number | null;
  trendPercent?: number | null;
  recentMisses?: number;
  consecutiveHardSets?: number;
  previousRir?: number | null;
  baseRestSeconds?: number;
  personalRecords?: number;
};

export type LiveWorkoutDecision = LiveSetDecision & {
  normalizedRir: number | null;
  qualityLabel: "excellent" | "productive" | "needs_attention" | "fatiguing";
  restLabel: "short" | "normal" | "long";
  nextTargetLabel: string;
  shouldSuggestEarlyFinish: boolean;
};

function qualityLabel(score: number, rir: number | null): LiveWorkoutDecision["qualityLabel"] {
  if (rir !== null && rir <= 1) return score >= 70 ? "fatiguing" : "needs_attention";
  if (score >= 85) return "excellent";
  if (score >= 65) return "productive";
  return "needs_attention";
}

function restLabel(seconds: number): LiveWorkoutDecision["restLabel"] {
  if (seconds <= 90) return "short";
  if (seconds <= 180) return "normal";
  return "long";
}

function targetLabel(weight: number, reps: number) {
  if (weight <= 0) return `${reps} reps`;
  return `${weight % 1 === 0 ? weight : weight.toFixed(1)} kg × ${reps}`;
}

export function getLiveWorkoutDecision(input: LiveWorkoutInput): LiveWorkoutDecision {
  const rir = normalizeRir(input.rir, input.rpe);
  const decision = getLiveSetDecision({
    setNumber: input.setNumber,
    plannedSets: input.plannedSets,
    completedSets: input.completedSets,
    weight: input.weight,
    reps: input.reps,
    rir: rir ?? 2,
    minReps: input.minReps,
    maxReps: input.maxReps,
    readiness: input.readiness,
    trendPercent: input.trendPercent,
    recentMisses: input.recentMisses,
    consecutiveHardSets: input.consecutiveHardSets,
  });

  const score = decision.qualityScore ?? getTrainingQualityScore({
    completedSets: input.completedSets,
    plannedSets: input.plannedSets,
    averageRir: rir,
    readiness: input.readiness,
    trendPercent: input.trendPercent,
    personalRecords: input.personalRecords,
  });

  const previousRir = normalizeRir(input.previousRir);
  const fatigueRising = rir !== null && previousRir !== null && rir < previousRir;
  const suggestedRestSeconds = Math.max(
    decision.suggestedRestSeconds,
    fatigueRising ? (input.baseRestSeconds ?? 120) + 15 : 0,
  );

  return {
    ...decision,
    suggestedRestSeconds,
    normalizedRir: rir,
    qualityLabel: qualityLabel(score, rir),
    restLabel: restLabel(suggestedRestSeconds),
    nextTargetLabel: targetLabel(decision.recommendedWeight, decision.recommendedReps),
    shouldSuggestEarlyFinish:
      input.setNumber < input.plannedSets &&
      ((rir !== null && rir <= 0.5) || (input.consecutiveHardSets ?? 0) >= 3),
    qualityScore: score,
  };
}

export function getEarlyFinishMessage(actualReps: number, plannedReps: number, rir?: number | null) {
  const normalized = normalizeRir(rir);
  if (actualReps >= plannedReps) return null;
  if (normalized !== null && normalized <= 1) {
    return `Série terminée à ${actualReps} reps. Tu étais proche de l'échec : valide-la telle quelle, pas besoin de compléter artificiellement.`;
  }
  return `Série terminée à ${actualReps}/${plannedReps} reps. Elle sera enregistrée comme réalisée avec ta performance réelle.`;
}
