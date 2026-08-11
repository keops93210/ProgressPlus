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

function finite(value: number | null | undefined, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeInput(input: SessionCoachInput): SessionCoachInput {
  const plannedSets = Math.max(0, Math.round(finite(input.plannedSets)));
  const completedSets = Math.max(0, Math.round(finite(input.completedSets)));
  const averageRir = input.averageRir == null ? null : clamp(finite(input.averageRir), 0, 5);
  const recoveryScore = input.recoveryScore == null ? null : clamp(finite(input.recoveryScore), 0, 5);
  const volumeChangePercent = input.volumeChangePercent == null ? null : clamp(finite(input.volumeChangePercent), -100, 100);

  return {
    plannedSets,
    completedSets,
    averageRir,
    recoveryScore,
    volumeChangePercent,
    shortenedSets: Math.max(0, Math.round(finite(input.shortenedSets))),
    personalRecords: Math.max(0, Math.round(finite(input.personalRecords))),
    hardSets: Math.max(0, Math.round(finite(input.hardSets))),
    painReported: input.painReported === true,
  };
}

export function getSessionQualityScore(input: SessionCoachInput) {
  const safe = normalizeInput(input);
  const completion = safe.plannedSets > 0 ? clamp(safe.completedSets / safe.plannedSets, 0, 1) : 0;
  const effort = safe.averageRir == null ? 0.7 : 1 - clamp(Math.abs(safe.averageRir - 2.5) / 4, 0, 1);
  const recovery = safe.recoveryScore == null ? 0.7 : clamp(safe.recoveryScore / 5, 0, 1);
  const trend = safe.volumeChangePercent == null ? 0.5 : clamp(0.5 + safe.volumeChangePercent / 20, 0, 1);
  const pr = clamp(safe.personalRecords / 2, 0, 1);
  const shortenedPenalty = safe.plannedSets > 0 ? clamp(safe.shortenedSets / safe.plannedSets, 0, 1) * 15 : 0;
  const hardPenalty = safe.plannedSets > 0 ? clamp(safe.hardSets / safe.plannedSets, 0, 1) * 8 : 0;

  return Math.round(clamp(
    completion * 30 + effort * 22 + recovery * 18 + trend * 15 + pr * 15 - shortenedPenalty - hardPenalty,
    0,
    100,
  ));
}

export function getSessionCoachDecision(input: SessionCoachInput): SessionCoachDecision {
  const safe = normalizeInput(input);
  const qualityScore = getSessionQualityScore(safe);
  const lowRecovery = safe.recoveryScore != null && safe.recoveryScore <= 2;
  const veryLowRecovery = safe.recoveryScore != null && safe.recoveryScore <= 1.5;
  const pain = safe.painReported === true;
  const repeatedHardEffort = safe.hardSets >= 3;
  const manyShortened = safe.shortenedSets >= Math.max(2, Math.ceil(safe.plannedSets * 0.25));
  const goodRecovery = safe.recoveryScore != null && safe.recoveryScore >= 4.2;
  const positiveVolume = safe.volumeChangePercent != null && safe.volumeChangePercent >= 3;

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

  if (goodRecovery && positiveVolume && safe.personalRecords > 0 && !manyShortened) {
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
