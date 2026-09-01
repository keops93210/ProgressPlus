export type ProgressionPolicyInput = {
  minReps: number;
  maxReps: number;
  targetReps: number;
  completedReps: number;
  currentLoad: number;
  rir: number | null;
  readiness: number | null;
  trend: 'up' | 'flat' | 'down';
};

export type ProgressionPolicyResult = {
  action: 'add_reps' | 'add_load' | 'hold' | 'reduce_load';
  nextLoad: number;
  nextTargetReps: number;
  reason: string;
};

export function calculateNextPrescription(input: ProgressionPolicyInput): ProgressionPolicyResult {
  const readiness = input.readiness ?? 70;
  const rir = input.rir ?? 2;
  const step = input.currentLoad >= 60 ? 2.5 : input.currentLoad >= 30 ? 1.25 : 1;

  if (readiness < 45 || input.trend === 'down' || rir < 0) {
    return {
      action: 'reduce_load',
      nextLoad: Math.max(0, Number((input.currentLoad - step).toFixed(2))),
      nextTargetReps: Math.max(input.minReps, input.completedReps - 1),
      reason: 'Récupération ou performance insuffisante : charge réduite pour favoriser la récupération.',
    };
  }

  if (input.completedReps < input.maxReps) {
    return {
      action: 'add_reps',
      nextLoad: input.currentLoad,
      nextTargetReps: Math.min(input.maxReps, input.completedReps + 1),
      reason: 'La charge reste stable jusqu’à atteindre le haut de la fourchette de répétitions.',
    };
  }

  if (input.completedReps >= input.maxReps && rir >= 2 && readiness >= 65) {
    return {
      action: 'add_load',
      nextLoad: Number((input.currentLoad + step).toFixed(2)),
      nextTargetReps: input.minReps,
      reason: 'Haut de fourchette atteint avec une marge suffisante : augmentation progressive de la charge.',
    };
  }

  return {
    action: 'hold',
    nextLoad: input.currentLoad,
    nextTargetReps: Math.min(input.maxReps, Math.max(input.minReps, input.targetReps)),
    reason: 'Maintien de la prescription pour confirmer la progression.',
  };
}
