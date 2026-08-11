import type { BodyMeasurement } from "@/services/body-progress.service";

export type BodyProgressInsightTone = "progress" | "stable" | "attention";

export type BodyProgressInsight = {
  tone: BodyProgressInsightTone;
  title: string;
  message: string;
};

export function getBodyProgressInsight(current: BodyMeasurement | null, previous: BodyMeasurement | null): BodyProgressInsight | null {
  if (!current || !previous) return null;

  const weightDelta = current.weight_kg != null && previous.weight_kg != null ? current.weight_kg - previous.weight_kg : null;
  const waistDelta = current.waist_cm != null && previous.waist_cm != null ? current.waist_cm - previous.waist_cm : null;
  const armDelta = current.arm_cm != null && previous.arm_cm != null ? current.arm_cm - previous.arm_cm : null;
  const chestDelta = current.chest_cm != null && previous.chest_cm != null ? current.chest_cm - previous.chest_cm : null;

  if (waistDelta != null && waistDelta < -0.5 && (armDelta == null || armDelta >= -0.2) && (chestDelta == null || chestDelta >= -0.2)) {
    return { tone: "progress", title: "Transformation favorable", message: `Ton tour de taille baisse de ${Math.abs(waistDelta).toFixed(1)} cm${weightDelta != null ? ` et ton poids évolue de ${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)} kg` : ""}. Les mensurations musculaires restent stables : c'est un signal encourageant.` };
  }

  if (waistDelta != null && waistDelta > 1 && weightDelta != null && weightDelta > 1) {
    return { tone: "attention", title: "Évolution à surveiller", message: `Le poids augmente de ${weightDelta.toFixed(1)} kg et le tour de taille de ${waistDelta.toFixed(1)} cm. Compare avec ton objectif avant d'ajuster ton plan.` };
  }

  if (armDelta != null && armDelta > 0.3 && (waistDelta == null || waistDelta <= 0.5)) {
    return { tone: "progress", title: "Progression musculaire", message: `Ton tour de bras progresse de ${armDelta.toFixed(1)} cm sans hausse importante du tour de taille. Continue à construire progressivement.` };
  }

  return { tone: "stable", title: "Évolution stable", message: "Les dernières mensurations restent globalement stables. Continue à mesurer dans des conditions similaires pour mieux détecter la tendance." };
}
