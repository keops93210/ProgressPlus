import { getSetFeedback, SetFeedback } from "@/services/set-feedback.service";
import type { LiveSetDecision } from "@/services/progress-engine.service";

export type WorkoutSetCoachInput = {
  weight: number;
  reps: number;
  minReps: number;
  maxReps: number;
  rir: number;
  isPersonalRecord: boolean;
  liveDecision: LiveSetDecision;
};

export type WorkoutSetCoachResult = {
  feedback: SetFeedback;
  nextWeight: number;
  nextReps: number;
  suggestedRestSeconds: number;
  qualityScore: number;
  shouldIncreaseLoad: boolean;
};

/**
 * Single source of truth for the immediate answer after a completed set.
 * Keeps the UI simple and makes the same coaching decision reusable by
 * the workout screen, summary and future notifications.
 */
export function getWorkoutSetCoach(input: WorkoutSetCoachInput): WorkoutSetCoachResult {
  const feedback = getSetFeedback({
    weight: input.weight,
    reps: input.reps,
    minReps: input.minReps,
    maxReps: input.maxReps,
    rir: input.rir,
    isPersonalRecord: input.isPersonalRecord,
  });

  const increase = feedback.shouldIncreaseLoad && input.liveDecision.recommendedWeight > input.weight;

  return {
    feedback,
    nextWeight: input.liveDecision.recommendedWeight > 0 ? input.liveDecision.recommendedWeight : input.weight,
    nextReps: Math.min(input.maxReps, Math.max(1, input.liveDecision.recommendedReps)),
    suggestedRestSeconds: Math.max(15, input.liveDecision.suggestedRestSeconds),
    qualityScore: input.liveDecision.qualityScore ?? 0,
    shouldIncreaseLoad: increase,
  };
}
