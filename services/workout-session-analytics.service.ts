export type SetPerformance = {
  weight: number;
  reps: number;
  rir?: number | null;
};

export type SessionAnalytics = {
  totalVolume: number;
  completedSets: number;
  averageRir: number | null;
  hardSets: number;
  failureSets: number;
  completionRate: number;
  estimatedOneRepMax: number;
  fatigueFlag: "low" | "moderate" | "high";
};

export function getSetVolume(set: SetPerformance) {
  return Math.max(0, set.weight) * Math.max(0, set.reps);
}

export function getSessionAnalytics(sets: SetPerformance[], plannedSets: number): SessionAnalytics {
  const validSets = sets.filter((set) => set.weight > 0 && set.reps > 0);
  const rirValues = validSets
    .map((set) => set.rir)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  const averageRir = rirValues.length
    ? rirValues.reduce((sum, value) => sum + value, 0) / rirValues.length
    : null;
  const hardSets = rirValues.filter((value) => value <= 1).length;
  const failureSets = rirValues.filter((value) => value <= 0).length;
  const completionRate = plannedSets > 0 ? Math.min(1, validSets.length / plannedSets) : 0;
  const fatigueFlag = failureSets >= 2 || hardSets >= 4
    ? "high"
    : hardSets >= 2 || (averageRir !== null && averageRir <= 1.5)
      ? "moderate"
      : "low";
  const estimatedOneRepMax = validSets.reduce(
    (best, set) => Math.max(best, set.weight * (1 + set.reps / 30)),
    0,
  );

  return {
    totalVolume: validSets.reduce((sum, set) => sum + getSetVolume(set), 0),
    completedSets: validSets.length,
    averageRir: averageRir === null ? null : Number(averageRir.toFixed(1)),
    hardSets,
    failureSets,
    completionRate,
    estimatedOneRepMax: Number(estimatedOneRepMax.toFixed(2)),
    fatigueFlag,
  };
}

export function getSessionQualityMessage(analytics: SessionAnalytics) {
  if (analytics.fatigueFlag === "high") {
    return "Séance très exigeante : Progress+ privilégie maintenant la récupération et la consolidation.";
  }
  if (analytics.completionRate < 0.75) {
    return "Séance partiellement réalisée : ta performance réelle reste enregistrée sans pénaliser artificiellement ta progression.";
  }
  if (analytics.averageRir !== null && analytics.averageRir >= 2 && analytics.averageRir <= 3) {
    return "Zone productive : l'effort est suffisamment élevé sans accumuler une fatigue inutile.";
  }
  return "Séance enregistrée : Progress+ utilisera ces données pour ajuster la prochaine séance.";
}
