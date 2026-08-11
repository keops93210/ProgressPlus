import type { GlobalProgressInputs } from "@/services/progress-global-score.service";
import { getGlobalProgressScore } from "@/services/progress-global-score.service";

export type ProgressInsight = { title: string; message: string; tone: "positive" | "neutral" | "warning" };

export function getGlobalProgressInsight(input: GlobalProgressInputs): ProgressInsight {
  const result = getGlobalProgressScore(input);
  if (result.score == null) return { title: "Construisons tes données", message: "Continue à enregistrer tes séances et ta progression corporelle pour construire ton score.", tone: "neutral" };
  if (result.confidence < 50) return { title: "Score encore provisoire", message: "Progress+ a besoin de davantage de données pour affiner son analyse.", tone: "neutral" };
  const candidates = Object.entries(input).filter(([, value]) => typeof value === "number" && Number.isFinite(value)) as [keyof GlobalProgressInputs, number][];
  const labels: Record<keyof GlobalProgressInputs, string> = { transformationScore: "transformation", performanceScore: "performances", recoveryScore: "récupération", consistencyScore: "régularité" };
  const lowest = [...candidates].sort((a, b) => a[1] - b[1])[0];
  const highest = [...candidates].sort((a, b) => b[1] - a[1])[0];
  if (lowest && lowest[1] < 50) return { title: `${labels[lowest[0]]} est ton principal levier`, message: `Ton point fort est ${labels[highest[0]]}. Travaille d'abord ${labels[lowest[0]]} plutôt que de pousser uniquement ce qui fonctionne déjà.`, tone: "warning" };
  if (input.transformationScore != null && input.performanceScore != null && input.transformationScore >= 70 && input.performanceScore >= 70) return { title: "Corps et performances avancent ensemble", message: "C'est un signal très favorable : continue le plan actuel tant que ta récupération reste bonne.", tone: "positive" };
  if (highest && lowest && highest[1] - lowest[1] >= 20) return { title: "Progression à équilibrer", message: `${labels[highest[0]]} est nettement devant ${labels[lowest[0]]}. Progress+ va chercher à réduire cet écart.`, tone: "neutral" };
  return { title: "Progression équilibrée", message: "Tes indicateurs évoluent dans une zone cohérente. Continue à progresser sans sacrifier la récupération.", tone: "positive" };
}
