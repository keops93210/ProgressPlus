import { supabase } from "@/lib/supabase";
import { getPersonalRecords, getWorkoutHistory } from "@/services/workout-session.service";
import { getPrograms } from "@/services/program.service";
import { getLatestRecoveryCheckin } from "@/services/recovery.service";
import { getRankingProfile, getUserRankingPosition } from "@/services/ranking.service";

export async function getHomeData(userId: string) {
  const [profileResult, programs, history, records, recovery, ranking, position] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, level, avatar_url")
      .eq("id", userId)
      .maybeSingle(),
    getPrograms(userId),
    // The home dashboard needs enough history to calculate monthly comparisons.
    // A small limit such as 30 can silently produce incorrect totals for active users.
    getWorkoutHistory(userId, 200),
    getPersonalRecords(userId, 5),
    getLatestRecoveryCheckin(userId),
    getRankingProfile(userId),
    getUserRankingPosition(userId),
  ]);

  if (profileResult.error) throw profileResult.error;

  const completedSessions = history.filter((session) => Boolean(session.finished_at));
  const currentMonth = new Date();
  const monthSessions = completedSessions.filter((session) => {
    const date = new Date(session.finished_at ?? session.started_at);
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  });
  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const previousMonthSessions = completedSessions.filter((session) => {
    const date = new Date(session.finished_at ?? session.started_at);
    return date.getMonth() === previousMonth.getMonth() && date.getFullYear() === previousMonth.getFullYear();
  });

  const monthVolume = monthSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0);
  const previousMonthVolume = previousMonthSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0);
  const volumeChange = previousMonthVolume > 0
    ? ((monthVolume - previousMonthVolume) / previousMonthVolume) * 100
    : monthVolume > 0 ? 100 : 0;

  return {
    profile: profileResult.data,
    programs: programs ?? [],
    history: completedSessions,
    records,
    recovery,
    ranking,
    position,
    monthVolume,
    volumeChange,
  };
}
