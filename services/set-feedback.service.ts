export type SetFeedbackTone = "progress" | "productive" | "intense" | "warning";

export type SetFeedbackInput = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir: number;
  isPersonalRecord?: boolean;
};

export type SetFeedback = {
  tone: SetFeedbackTone;
  title: string;
  message: string;
  completionRatio: number;
  shouldIncreaseLoad: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Turns a completed set into a short, human-readable coaching message.
 * This is deliberately UI-agnostic so the same feedback can be reused by
 * the workout screen, notifications and the future workout summary.
 */
export function getSetFeedback(input: SetFeedbackInput): SetFeedback {
  const minReps = Math.max(1, input.minReps);
  const maxReps = Math.max(minReps, input.maxReps);
  const reps = Math.max(0, input.reps);
  const rir = clamp(input.rir, 0, 5);
  const completionRatio = clamp(reps / minReps, 0, 1);
  const pr = Boolean(input.isPersonalRecord);

  if (reps < minReps) {
    return {
      tone: "warning",
      title: "Série écourtée",
      message: `Tu as fait ${reps} rep${reps > 1 ? "s" : ""} sur un minimum de ${minReps}. On enregistre la performance réelle et on évite de surcharger.`,
      completionRatio,
      shouldIncreaseLoad: false,
    };
  }

  if (pr) {
    return {
      tone: "progress",
      title: "Nouveau record",
      message: `Nouveau PR à ${input.weight} kg × ${reps}. Progress+ conserve cette performance comme nouveau repère.`,
      completionRatio: 1,
      shouldIncreaseLoad: reps >= maxReps && rir >= 2,
    };
  }

  if (reps >= maxReps && rir >= 2) {
    return {
      tone: "progress",
      title: "Objectif atteint",
      message: `Haut de fourchette atteint avec ${rir} RIR. La prochaine étape peut être une petite hausse de charge.`,
      completionRatio: 1,
      shouldIncreaseLoad: true,
    };
  }

  if (rir <= 1) {
    return {
      tone: "intense",
      title: "Série très intense",
      message: `Tu es à ${rir} RIR. On privilégie la récupération et la qualité avant toute surcharge.`,
      completionRatio: 1,
      shouldIncreaseLoad: false,
    };
  }

  return {
    tone: "productive",
    title: "Série productive",
    message: `${reps} reps propres dans la zone cible. Garde la charge et construis progressivement les reps.`,
    completionRatio: 1,
    shouldIncreaseLoad: false,
  };
}
