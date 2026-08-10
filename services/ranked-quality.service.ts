export type RankedWorkoutInput = {
  plannedSets: number;
  completedSets: number;
  averageRir: number;
  recoveryScore?: number | null;
  personalRecords?: number;
  goalCompleted?: boolean;
  volume?: number;
  previousVolume?: number;
  streakDays?: number;
};

export type RankedWorkoutScore = {
  score: number;
  quality: number;
  progression: number;
  consistency: number;
  achievement: number;
  explanation: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function scoreQuality(input: RankedWorkoutInput) {
  const completion = clamp(input.completedSets / Math.max(1, input.plannedSets), 0, 1);
  const rirQuality = 1 - clamp(Math.abs(input.averageRir - 2.5) / 3.5, 0, 1);
  const recovery = input.recoveryScore == null ? 0.75 : clamp(input.recoveryScore / 5, 0, 1);
  return Math.round(completion * 55 + rirQuality * 30 + recovery * 15);
}

function scoreProgression(input: RankedWorkoutInput) {
  const volumeDelta = input.previousVolume && input.previousVolume > 0
    ? (input.volume ?? 0) / input.previousVolume - 1
    : 0;
  const volumeProgress = clamp(0.5 + volumeDelta * 4, 0, 1);
  const prs = clamp((input.personalRecords ?? 0) / 2, 0, 1);
  const goal = input.goalCompleted ? 1 : 0;
  return Math.round(volumeProgress * 45 + prs * 35 + goal * 20);
}

function scoreConsistency(input: RankedWorkoutInput) {
  return Math.round(clamp((input.streakDays ?? 0) / 7, 0, 1) * 100);
}

function scoreAchievement(input: RankedWorkoutInput) {
  const prs = clamp((input.personalRecords ?? 0) / 3, 0, 1);
  const goal = input.goalCompleted ? 1 : 0;
  return Math.round(prs * 60 + goal * 40);
}

export function calculateRankedWorkoutScore(input: RankedWorkoutInput): RankedWorkoutScore {
  const quality = scoreQuality(input);
  const progression = scoreProgression(input);
  const consistency = scoreConsistency(input);
  const achievement = scoreAchievement(input);

  const score = Math.round(
    quality * 0.45 +
    progression * 0.3 +
    consistency * 0.15 +
    achievement * 0.1,
  );

  const explanation = score >= 85
    ? "Excellente séance : qualité, progression et régularité sont toutes au rendez-vous."
    : score >= 70
      ? "Très bonne séance : la progression est solide sans sacrifier la qualité."
      : score >= 50
        ? "Séance productive : continue à construire régulièrement."
        : "Séance à consolider : la priorité est de retrouver une exécution et une récupération stables.";

  return { score, quality, progression, consistency, achievement, explanation };
}
