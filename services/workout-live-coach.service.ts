import { decideNextSet, type AdaptiveSetDecision } from "@/services/workout-effort.service";
import { getSuggestedRestSeconds, type ProgressionDecision } from "@/services/progress-engine.service";

export type LiveCoachInput = {
  weight: number;
  reps: number;
  rir: number;
  minReps: number;
  maxReps: number;
  recoveryScore?: number | null;
  trendPercent?: number | null;
  recentMisses?: number;
  consecutiveHardSets?: number;
  baseRestSeconds: number;
};

export type LiveCoachDecision = {
  progression: AdaptiveSetDecision;
  restSeconds: number;
  headline: string;
  shortReason: string;
  isCaution: boolean;
};

function headlineFor(action: AdaptiveSetDecision["action"]) {
  switch (action) {
    case "increase_weight": return "Augmente légèrement la charge";
    case "increase_reps": return "Gagne une répétition";
    case "reduce_weight": return "Réduis légèrement la charge";
    case "deload": return "Protège ta récupération";
    default: return "Consolide cette charge";
  }
}

export function getLiveCoachDecision(input: LiveCoachInput): LiveCoachDecision {
  const progression = decideNextSet(input);
  const adaptiveRest = progression.suggestedRestSeconds;
  const restSeconds = Math.max(
    30,
    Math.round(Math.max(input.baseRestSeconds, adaptiveRest) / 15) * 15,
  );

  return {
    progression,
    restSeconds,
    headline: headlineFor(progression.action),
    shortReason: progression.reason,
    isCaution: progression.fatigueRisk >= 60 || progression.action === "reduce_weight" || progression.action === "deload",
  };
}

export function getRestLabel(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const remaining = safe % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export function getRestAdjustment(baseRestSeconds: number, rir: number, recoveryScore?: number | null) {
  return getSuggestedRestSeconds(rir, Math.max(30, baseRestSeconds), recoveryScore);
}

export function shouldWarnBeforeNextSet(decision: ProgressionDecision) {
  return decision.action === "reduce_load" || decision.action === "deload" || decision.effortZone === "failure";
}
