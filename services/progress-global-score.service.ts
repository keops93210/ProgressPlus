export type GlobalProgressInputs = {
  transformationScore: number | null;
  performanceScore: number | null;
  recoveryScore: number | null;
  consistencyScore: number | null;
};

const weights: Record<keyof GlobalProgressInputs, number> = {
  transformationScore: 0.3,
  performanceScore: 0.3,
  recoveryScore: 0.2,
  consistencyScore: 0.2,
};

export function getGlobalProgressScore(input: GlobalProgressInputs) {
  const available = (Object.keys(weights) as Array<keyof GlobalProgressInputs>).filter((key) => Number.isFinite(input[key]));
  if (!available.length) return { score: null as number | null, label: "Pas assez de données", confidence: 0, available: 0, missing: Object.keys(weights) as string[] };

  let weighted = 0;
  let activeWeight = 0;
  for (const key of available) {
    const value = input[key];
    if (typeof value === "number") {
      weighted += value * weights[key];
      activeWeight += weights[key];
    }
  }

  const score = Math.round(weighted / activeWeight);
  const missing = (Object.keys(weights) as Array<keyof GlobalProgressInputs>).filter((key) => !available.includes(key));
  return {
    score,
    label: score >= 80 ? "Excellente progression" : score >= 65 ? "Bonne progression" : score >= 50 ? "Progression stable" : "À ajuster",
    confidence: Math.round((activeWeight / 1) * 100),
    available: available.length,
    missing,
  };
}
