import { getSessionCoachDecision, SessionCoachDecision } from "@/services/workout-session-coach.service";
import type { WorkoutSummary } from "@/services/workout-summary.service";

/** Converts the persisted workout summary into the same Coach decision used by the live session. */
export function getSummaryCoachDecision(summary: WorkoutSummary): SessionCoachDecision {
  return getSessionCoachDecision({
    plannedSets: summary.plannedSets,
    completedSets: summary.totalSets,
    averageRir: summary.averageRir,
    recoveryScore: summary.recoveryScore,
    volumeChangePercent: summary.volumeChangePercent,
    shortenedSets: Math.max(0, summary.plannedSets - summary.totalSets),
    personalRecords: summary.personalRecords,
    hardSets: summary.hardSets,
    painReported: false,
  });
}
