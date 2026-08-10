import { getTrainingQualityScore } from "@/services/progress-engine.service";

export type SetQualityInput = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir?: number | null;
};

export function getSetQuality(input: SetQualityInput) {
  const repScore = input.reps < input.minReps
    ? Math.max(0, input.reps / input.minReps)
    : input.reps >= input.maxReps ? 1 : 0.8;
  const rir = input.rir == null ? 0.7 : Math.max(0, Math.min(1, 1 - Math.abs(input.rir - 2.5) / 4));
  return Math.round((repScore * 60 + rir * 40));
}

export function getSessionQuality(input: {
  completedSets: number;
  plannedSets: number;
  averageRir?: number | null;
  readiness?: number | null;
  trendPercent?: number | null;
  personalRecords?: number;
}) {
  return getTrainingQualityScore(input);
}

export function getQualityLabel(score: number) {
  if (score >= 90) return "EXCEPTIONNELLE";
  if (score >= 80) return "EXCELLENTE";
  if (score >= 70) return "SOLIDE";
  if (score >= 55) return "CORRECTE";
  return "À AMÉLIORER";
}

export function getQualityAdvice(score: number) {
  if (score >= 90) return "Très bonne séance : performance et effort sont parfaitement alignés.";
  if (score >= 80) return "Séance très solide. Continue à progresser sans ajouter de fatigue inutile.";
  if (score >= 70) return "Bonne séance. Cherche une petite amélioration la prochaine fois.";
  if (score >= 55) return "Séance correcte. Progress+ va privilégier la consolidation.";
  return "La priorité est de récupérer et de stabiliser la qualité avant de surcharger.";
}
