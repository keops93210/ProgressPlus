export type SessionCoachTone = "progress" | "stable" | "caution" | "deload";

export type SessionCoachInput = {
  plannedSets: number;
  completedSets: number;
  averageRir: number | null;
  recoveryScore: number | null;
  volumeChangePercent: number | null;
  shortenedSets: number;
  personalRecords: number;
  hardSets: number;
  painReported?: boolean;
};

export type SessionCoachDecision = {
  tone: SessionCoachTone;
  title: string;
  message: string;
  nextSessionAction: "progress" | "consolidate" | "reduce" | "rest";
  confidence: number;
  qualityScore: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getSessionQualityScore(input: SessionCoachInput) {
  const completion = input.plannedSets > 0 ? clamp(input.completedSets / input.plannedSets, 0, 1) : 0;
  const effort = input.averageRir == null ? 0.7 : 1 - clamp(Math.abs(input.averageRir - 2.5) / 4, 0, 1);
  const recovery = input.recoveryScore == null ? 0.7 : clamp(input.recoveryScore / 5, 0, 1);
  const trend = input.volumeChangePercent == null ? 0.5 : clamp(0.5 + input.volumeChangePercent / 20, 0, 1);
  const pr = clamp(input.personalRecords / 2, 0, 1);
  const shortenedPenalty = input.plannedSets > 0 ? clamp(input.shortenedSets / input.plannedSets, 0, 1) * 15 : 0;
  const hardPenalty = input.plannedSets > 0 ? clamp(input.hardSets / input.plannedSets, 0, 1) * 8 : 0;

  return Math.round(clamp(
    completion * 30 + effort * 22 + recovery * 18 + trend * 15 + pr * 15 - shortenedPenalty - hardPenalty,
    0,
    100,
  ));
}

export function getSessionCoachDecision(input: SessionCoachInput): SessionCoachDecision {
  const qualityScore = getSessionQualityScore(input);
  const lowRecovery = input.recoveryScore != null && input.recoveryScore <= 2;
  const veryLowRecovery = input.recoveryScore != null && input.recoveryScore <= 1.5;
  const pain = input.painReported === true;
  const repeatedHardEffort = input.hardSets >= 3;
  const manyShortened = input.shortenedSets >= Math.max(2, Math.ceil(input.plannedSets * 0.25));
  const goodRecovery = input.recoveryScore != null && input.recoveryScore >= 4.2;
  const positiveVolume = input.volumeChangePercent != null && input.volumeChangePercent >= 3;

  if (pain || veryLowRecovery) {
    return {
      tone: "deload",
      title: pain ? "Priorité à la récupération" : "Récupération à protéger",
      message: pain
        ? "Une douleur a été signalée. Progress+ ne recommande pas de surcharge : privilégie le repos et une exécution sans douleur."
        : "Ta récupération est très basse. La prochaine séance doit réduire la contrainte plutôt que chercher la performance.",
      nextSessionAction: "rest",
      confidence: 0.95,
      qualityScore,
    };
  }

  if (lowRecovery || manyShortened || (repeatedHardEffort && !goodRecovery)) {
    return {
      tone: "caution",
      title: "On consolide",
      message: "Plusieurs signaux montrent que la séance était exigeante. Garde les charges maîtrisées à la prochaine séance et reconstruis de la marge.",
      nextSessionAction: "consolidate",
      confidence: 0.9,
      qualityScore,
    };
  }

  if (goodRecovery && positiveVolume && input.personalRecords > 0 && !manyShortened) {
    return {
      tone: "progress",
      title: "Progression confirmée",
      message: "Bonne récupération, volume en hausse et performance confirmée. Progress+ peut proposer une progression contrôlée à la prochaine séance.",
      nextSessionAction: "progress",
      confidence: 0.92,
      qualityScore,
    };
  }

  return {
    tone: "stable",
    title: "Séance productive",
    message: "La séance apporte suffisamment de données pour continuer. On consolide la performance avant de chercher une nouvelle hausse.",
    nextSessionAction: "consolidate",
    confidence: 0.78,
    qualityScore,
  };
}
