export type SetCompletionStatus = "completed" | "partial" | "failed";

export type SetCompletionResult = {
  status: SetCompletionStatus;
  completedReps: number;
  targetReps: number;
  completionRatio: number;
  countsAsCompletedSet: boolean;
  message: string;
};

export function evaluateSetCompletion(input: {
  performedReps: number;
  targetReps: number;
  minReps?: number;
}): SetCompletionResult {
  const performedReps = Math.max(0, Math.floor(input.performedReps));
  const targetReps = Math.max(1, Math.floor(input.targetReps));
  const minReps = Math.max(1, Math.floor(input.minReps ?? 1));
  const completionRatio = Math.min(1, performedReps / targetReps);

  if (performedReps >= targetReps) {
    return {
      status: "completed",
      completedReps: performedReps,
      targetReps,
      completionRatio: 1,
      countsAsCompletedSet: true,
      message: "Série complète : objectif atteint.",
    };
  }

  if (performedReps >= minReps) {
    return {
      status: "partial",
      completedReps: performedReps,
      targetReps,
      completionRatio,
      countsAsCompletedSet: true,
      message: `Série partielle enregistrée : ${performedReps}/${targetReps} reps. Progress+ adapte la suite sans pénaliser inutilement la séance.`,
    };
  }

  return {
    status: "failed",
    completedReps: performedReps,
    targetReps,
    completionRatio,
    countsAsCompletedSet: performedReps > 0,
    message: performedReps === 0
      ? "Aucune répétition enregistrée."
      : `Série sous la zone minimale : ${performedReps}/${targetReps} reps. On consolide avant de surcharger.`,
  };
}

export function getNextTargetAfterPartialSet(input: {
  weight: number;
  performedReps: number;
  targetReps: number;
  minReps: number;
  rir: number;
}) {
  const weight = Math.max(0, input.weight);
  const performedReps = Math.max(0, input.performedReps);
  const targetReps = Math.max(input.minReps, input.targetReps);
  const rir = Math.max(0, Math.min(5, input.rir));

  if (performedReps < input.minReps) {
    return { weight, reps: input.minReps, action: "consolidate" as const };
  }

  if (performedReps < targetReps) {
    return { weight, reps: Math.min(targetReps, performedReps + 1), action: "add_reps" as const };
  }

  if (rir >= 3 && weight > 0) {
    return { weight: weight + 2.5, reps: input.minReps, action: "increase_weight" as const };
  }

  return { weight, reps: Math.min(targetReps, performedReps + 1), action: "consolidate" as const };
}
