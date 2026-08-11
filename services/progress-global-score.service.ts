export type GlobalProgressInputs = {
  transformationScore: number | null;
  performanceScore: number | null;
  recoveryScore: number | null;
  consistencyScore: number | null;
};

export function getGlobalProgressScore(input: GlobalProgressInputs) {
  const values = [input.transformationScore, input.performanceScore, input.recoveryScore, input.consistencyScore].filter((v): v is number => Number.isFinite(v));
  if (!values.length) return { score: null as number | null, label: "Pas assez de données" };
  const weights = { transformationScore: 0.3, performanceScore: 0.3, recoveryScore: 0.2, consistencyScore: 0.2 };
  let weighted = 0;
  let weight = 0;
  for (const [key, factor] of Object.entries(weights)) {
    const value = input[key as keyof GlobalProgressInputs];
    if (typeof value === "number" && Number.isFinite(value)) { weighted += value * factor; weight += factor; }
  }
  const score = Math.round(weighted / weight);
  return { score, label: score >= 80 ? "Excellente progression" : score >= 65 ? "Bonne progression" : score >= 50 ? "Progression stable" : "À ajuster" };
}
