import type { GlobalProgressInputs } from "@/services/progress-global-score.service";
import { getGlobalProgressScore } from "@/services/progress-global-score.service";

export function getGlobalProgressInsight(input: GlobalProgressInputs) {
  const result = getGlobalProgressScore(input);
  if (result.score == null) return "Continue à enregistrer tes séances et ta progression corporelle pour construire ton score.";
  if (result.confidence < 50) return "Ton score est encore provisoire : Progress+ a besoin de davantage de données pour affiner son analyse.";
  if (input.transformationScore != null && input.performanceScore != null && input.transformationScore >= 70 && input.performanceScore >= 70) return "Ton évolution corporelle et tes performances avancent ensemble. C'est un signal très favorable.";
  if (input.recoveryScore != null && input.recoveryScore < 50) return "Tes performances peuvent être bonnes, mais ta récupération limite actuellement ton score global.";
  if (input.consistencyScore != null && input.consistencyScore < 50) return "La régularité est actuellement ton principal levier pour améliorer ton score.";
  return "Ta progression est en bonne voie. Continue à enregistrer tes données pour permettre à Progress+ d'affiner ses recommandations.";
}
