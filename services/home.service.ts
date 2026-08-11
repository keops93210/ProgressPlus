import { supabase } from "@/lib/supabase";
import { getPersonalRecords, getWorkoutHistory } from "@/services/workout-session.service";
import { getPrograms } from "@/services/program.service";
import { getLatestRecoveryCheckin } from "@/services/recovery.service";
import { getRankingProfile, getUserRankingPosition } from "@/services/ranking.service";
import { getBodyMeasurements, getMeasurementDelta } from "@/services/body-progress.service";
import { getTransformationScore } from "@/services/body-progress-score.service";
import { getGlobalProgressScore } from "@/services/progress-global-score.service";
import { getWeeklyConsistency } from "@/services/progress-consistency.service";
import { getPerformanceScore } from "@/services/progress-performance-score.service";

export async function getHomeData(userId: string) {
  const [profileResult, programs, history, records, recovery, ranking, position, bodyMeasurements] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, level, avatar_url").eq("id", userId).maybeSingle(),
    getPrograms(userId), getWorkoutHistory(userId, 200), getPersonalRecords(userId, 5), getLatestRecoveryCheckin(userId),
    getRankingProfile(userId), getUserRankingPosition(userId), getBodyMeasurements(userId),
  ]);
  if (profileResult.error) throw profileResult.error;
  const completedSessions = history.filter((session) => Boolean(session.finished_at));
  const now = new Date();
  const monthSessions = completedSessions.filter((session) => { const d = new Date(session.finished_at ?? session.started_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); });
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthSessions = completedSessions.filter((session) => { const d = new Date(session.finished_at ?? session.started_at); return d.getMonth() === previousMonth.getMonth() && d.getFullYear() === previousMonth.getFullYear(); });
  const monthVolume = monthSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0);
  const previousMonthVolume = previousMonthSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0);
  const volumeChange = previousMonthVolume > 0 ? ((monthVolume - previousMonthVolume) / previousMonthVolume) * 100 : monthVolume > 0 ? 100 : 0;
  const currentBody = bodyMeasurements[0] ?? null;
  const previousBody = bodyMeasurements[1] ?? null;
  const transformation = getTransformationScore(currentBody, previousBody);
  const bodyDelta = getMeasurementDelta(currentBody, previousBody);
  const consistency = getWeeklyConsistency(completedSessions.map((session) => ({ date: session.finished_at ?? session.started_at, completed: true })), 4);
  const recoveryScore = recovery?.recovery_score != null ? Math.max(0, Math.min(100, Number(recovery.recovery_score) / 5 * 100)) : null;
  const strongestRecord = records?.[0];
  const performance = getPerformanceScore({
    currentE1rm: strongestRecord?.estimated_1rm != null ? Number(strongestRecord.estimated_1rm) : null,
    previousE1rm: null,
    volumeChangePercent: volumeChange,
    prCount: records?.length ?? 0,
    sessionCount: completedSessions.length,
  });
  const globalScore = getGlobalProgressScore({ transformationScore: transformation.score, performanceScore: performance.score, recoveryScore, consistencyScore: consistency.completion * 100 });
  return {
    profile: profileResult.data, programs: programs ?? [], history: completedSessions, records, recovery, ranking, position, monthVolume, volumeChange,
    body: { current: currentBody, previous: previousBody, delta: bodyDelta }, consistency, performance, globalScore,
  };
}