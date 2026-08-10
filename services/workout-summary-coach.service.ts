import { getSessionCoachDecision, SessionCoachDecision } from "@/services/workout-session-coach.service";
import type { WorkoutSummary } from "@/services/workout-summary.service";

/** Turns the persisted workout summary into the same Coach decision used by the live session. */
export function getSummaryCoachDecision(summary: WorkoutSummary): SessionCoachDecision {
  return getSessionCoachDecision({
    plannedSets: summary.totalSets,
    completedSets: Math.round((summary.totalSets * summary.completionPercent) / 100),
    averageRir: summary.averageRir,
    recoveryScore: null,
    volumeChangePercent: summary.volumeChangePercent,
    shortenedSets: Math.max(0, Math.round(summary.totalSets * (1 - summary.completionPercent / 100))),
    personalRecords: summary.personalRecords,
    hardSets: summary.hardSets,
    painReported: false,
  });
}
