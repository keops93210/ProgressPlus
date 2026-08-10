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
 * Converts the completed set into one conservative coaching message.
 * The real performance always wins over the planned target.
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
      message: `Tu as fait ${reps} rep${reps > 1 ? "s" : ""} sur un minimum de ${minReps}. On garde la performance réelle et on évite de surcharger.`,
      completionRatio,
      shouldIncreaseLoad: false,
    };
  }

  if (rir <= 1) {
    return {
      tone: "intense",
      title: rir <= 0 ? "Échec atteint" : "Série très intense",
      message: rir <= 0
        ? "Tu as atteint l'échec. Progress+ protège la prochaine série : récupération avant surcharge."
        : `Tu es à ${rir} RIR. La série est très intense : récupération et qualité avant toute surcharge.`,
      completionRatio: 1,
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

  return {
    tone: "productive",
    title: "Série productive",
    message: `${reps} reps propres dans la zone cible. Garde la charge et construis progressivement les reps.`,
    completionRatio: 1,
    shouldIncreaseLoad: false,
  };
}
