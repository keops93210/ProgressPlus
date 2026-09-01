export type TrainingCycleAction = "PROGRESS" | "CONSOLIDATE" | "REDUCE" | "DELOAD";

export interface TrainingSessionSignal {
  completionPercent: number;
  averageRir: number | null;
  volumeChangePercent: number | null;
  recoveryScore: number | null;
  hardSets: number;
  failureSets: number;
  performanceTrend: "up" | "stable" | "down" | "unknown";
}

export interface TrainingCycleDecision {
  action: TrainingCycleAction;
  volumeMultiplier: number;
  loadMultiplier: number;
  targetRir: number;
  reason: string;
  signals: string[];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Converts recent training signals into conservative changes for the next
 * micro-cycle. It deliberately prefers small adjustments over large jumps.
 */
export function getTrainingCycleDecision(
  sessions: TrainingSessionSignal[],
): TrainingCycleDecision {
  const recent = sessions.slice(0, 4);
  if (!recent.length) {
    return {
      action: "CONSOLIDATE",
      volumeMultiplier: 1,
      loadMultiplier: 1,
      targetRir: 2.5,
      reason: "Pas assez de données : Progress+ établit une référence avant d'accélérer.",
      signals: ["historique insuffisant"],
    };
  }

  const recovery = recent.filter((s) => s.recoveryScore != null).map((s) => s.recoveryScore as number);
  const averageRecovery = recovery.length ? recovery.reduce((a, b) => a + b, 0) / recovery.length : null;
  const averageCompletion = recent.reduce((sum, s) => sum + clamp(s.completionPercent, 0, 100), 0) / recent.length;
  const averageRirValues = recent.filter((s) => s.averageRir != null).map((s) => s.averageRir as number);
  const averageRir = averageRirValues.length ? averageRirValues.reduce((a, b) => a + b, 0) / averageRirValues.length : null;
  const hardSets = recent.reduce((sum, s) => sum + Math.max(0, s.hardSets), 0);
  const failureSets = recent.reduce((sum, s) => sum + Math.max(0, s.failureSets), 0);
  const downSessions = recent.filter((s) => s.performanceTrend === "down").length;
  const upSessions = recent.filter((s) => s.performanceTrend === "up").length;
  const signals: string[] = [];

  if (averageRecovery != null && averageRecovery <= 2) signals.push("récupération basse");
  if (averageRecovery != null && averageRecovery >= 4.2) signals.push("récupération excellente");
  if (averageCompletion < 90) signals.push("volume incomplet");
  if (averageRir != null && averageRir <= 1) signals.push("intensité très élevée");
  if (hardSets >= 8) signals.push("fatigue d'entraînement élevée");
  if (failureSets >= 3) signals.push("échec répété");
  if (downSessions >= 2) signals.push("performances en baisse");
  if (upSessions >= 2) signals.push("performances en hausse");

  const deloadTrigger =
    (averageRecovery != null && averageRecovery <= 2 && (downSessions >= 1 || hardSets >= 4)) ||
    (downSessions >= 3 && (averageRir == null || averageRir <= 2)) ||
    failureSets >= 5;

  if (deloadTrigger) {
    return {
      action: "DELOAD",
      volumeMultiplier: 0.6,
      loadMultiplier: 0.85,
      targetRir: 3,
      reason: "Plusieurs signaux de fatigue sont présents. Progress+ réduit temporairement le volume et la charge pour permettre une vraie récupération.",
      signals,
    };
  }

  if ((averageRecovery != null && averageRecovery <= 2.8) || averageCompletion < 85 || downSessions >= 2) {
    return {
      action: "REDUCE",
      volumeMultiplier: 0.8,
      loadMultiplier: 0.975,
      targetRir: 2.5,
      reason: "La récupération ou la performance est en retrait. On réduit légèrement la demande sans interrompre la progression.",
      signals,
    };
  }

  if (upSessions >= 2 && averageCompletion >= 95 && (averageRir == null || averageRir >= 1.5) && (averageRecovery == null || averageRecovery >= 3.5)) {
    return {
      action: "PROGRESS",
      volumeMultiplier: 1.05,
      loadMultiplier: 1.025,
      targetRir: 2,
      reason: "Les dernières séances sont solides : Progress+ peut augmenter légèrement la charge ou le volume.",
      signals,
    };
  }

  return {
    action: "CONSOLIDATE",
    volumeMultiplier: 1,
    loadMultiplier: 1,
    targetRir: averageRecovery != null && averageRecovery < 3.5 ? 2.5 : 2,
    reason: "Les signaux sont suffisamment stables pour conserver le plan et confirmer la progression.",
    signals,
  };
}

export function applyTrainingCycleDecision(params: {
  sets: number;
  weight: number;
  decision: TrainingCycleDecision;
}) {
  const sets = Math.max(1, Math.round(params.sets * params.decision.volumeMultiplier));
  const weight = Math.max(0, Math.round((params.weight * params.decision.loadMultiplier) / 1.25) * 1.25);
  return { sets, weight };
}
