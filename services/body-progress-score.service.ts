import type { BodyMeasurement } from "@/services/body-progress.service";

export function getTransformationScore(current: BodyMeasurement | null, previous: BodyMeasurement | null) {
  if (!current || !previous) return { score: null as number | null, label: "Pas assez de données", tone: "neutral" as const };
  let score = 50;
  const weightDelta = current.weight_kg != null && previous.weight_kg != null ? current.weight_kg - previous.weight_kg : null;
  const waistDelta = current.waist_cm != null && previous.waist_cm != null ? current.waist_cm - previous.waist_cm : null;
  const armDelta = current.arm_cm != null && previous.arm_cm != null ? current.arm_cm - previous.arm_cm : null;
  if (waistDelta != null && waistDelta < 0) score += 20;
  if (waistDelta != null && waistDelta > 0) score -= 15;
  if (armDelta != null && armDelta > 0) score += 15;
  if (weightDelta != null && waistDelta != null && weightDelta < 0 && waistDelta < 0) score += 10;
  if (weightDelta != null && waistDelta != null && weightDelta > 0 && waistDelta > 0) score -= 10;
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    label: score >= 75 ? "Très bonne évolution" : score >= 55 ? "Évolution favorable" : score >= 40 ? "Évolution stable" : "À surveiller",
    tone: score >= 75 ? "positive" as const : score >= 55 ? "good" as const : score >= 40 ? "neutral" as const : "warning" as const,
  };
}
