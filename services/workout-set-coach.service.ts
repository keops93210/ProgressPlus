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
 * A conservative feedback state must never be overridden by a raw load
 * recommendation from the progression engine.
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

  const engineSuggestsIncrease = input.liveDecision.recommendedWeight > input.weight;
  const shouldIncreaseLoad = feedback.shouldIncreaseLoad && engineSuggestsIncrease;
  const nextWeight = shouldIncreaseLoad
    ? input.liveDecision.recommendedWeight
    : input.weight;

  const nextReps = feedback.tone === "warning" || feedback.tone === "intense"
    ? Math.min(input.maxReps, Math.max(1, input.reps))
    : Math.min(input.maxReps, Math.max(1, input.liveDecision.recommendedReps));

  return {
    feedback,
    nextWeight,
    nextReps,
    suggestedRestSeconds: Math.max(15, input.liveDecision.suggestedRestSeconds),
    qualityScore: input.liveDecision.qualityScore ?? 0,
    shouldIncreaseLoad,
  };
}
