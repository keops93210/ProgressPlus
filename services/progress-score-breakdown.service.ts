import type { GlobalProgressInputs } from "@/services/progress-global-score.service";

export type ScorePillar = keyof GlobalProgressInputs;
export const SCORE_PILLARS: { key: ScorePillar; label: string; weight: number }[] = [
  { key: "transformationScore", label: "Transformation", weight: 30 },
  { key: "performanceScore", label: "Performance", weight: 30 },
  { key: "recoveryScore", label: "Récupération", weight: 20 },
  { key: "consistencyScore", label: "Régularité", weight: 20 },
];

export function getScoreBreakdown(input: GlobalProgressInputs) {
  const available = SCORE_PILLARS.filter((p) => typeof input[p.key] === "number" && Number.isFinite(input[p.key]));
  const weakest = [...available].sort((a,b) => Number(input[a.key]) - Number(input[b.key]))[0] ?? null;
  const strongest = [...available].sort((a,b) => Number(input[b.key]) - Number(input[a.key]))[0] ?? null;
  return { pillars: SCORE_PILLARS.map((pillar) => ({ ...pillar, value: typeof input[pillar.key] === "number" ? Math.round(Number(input[pillar.key])) : null })), available: available.length, weakest, strongest };
}
