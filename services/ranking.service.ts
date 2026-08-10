import { supabase } from "@/lib/supabase";

export type ProgressRank =
  | "Fer" | "Bronze" | "Argent" | "Or" | "Platine"
  | "Diamant" | "Ascendant" | "Éternus" | "Apex" | "Progress";

export interface RankingProfile {
  user_id: string;
  score: number;
  rank: ProgressRank;
  season: number;
  season_points: number;
  streak_days: number;
  updated_at: string;
}

export interface RankingRow extends RankingProfile { position: number; }

export const RANKS: { name: ProgressRank; min: number; next: number | null }[] = [
  { name: "Fer", min: 0, next: 500 }, { name: "Bronze", min: 500, next: 1200 },
  { name: "Argent", min: 1200, next: 2500 }, { name: "Or", min: 2500, next: 4500 },
  { name: "Platine", min: 4500, next: 7000 }, { name: "Diamant", min: 7000, next: 11000 },
  { name: "Ascendant", min: 11000, next: 16000 }, { name: "Éternus", min: 16000, next: 22000 },
  { name: "Apex", min: 22000, next: 30000 }, { name: "Progress", min: 30000, next: null },
];

export function getRankProgress(score: number) {
  const current = [...RANKS].reverse().find((rank) => score >= rank.min) ?? RANKS[0];
  if (current.next === null) return { current, next: null, percent: 1, pointsToNext: 0 };
  const span = current.next - current.min;
  const percent = Math.min(1, Math.max(0, (score - current.min) / span));
  return { current, next: RANKS.find((rank) => rank.min === current.next) ?? null, percent, pointsToNext: Math.max(0, current.next - score) };
}

export async function getRankingProfile(userId: string): Promise<RankingProfile> {
  const { data, error } = await supabase.from("progress_profiles").select("*").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (data) return data as RankingProfile;

  const initial = { user_id: userId, score: 0, rank: "Fer" as ProgressRank, season: 1, season_points: 0, streak_days: 0, updated_at: new Date().toISOString() };
  const { data: created, error: createError } = await supabase.from("progress_profiles").upsert(initial, { onConflict: "user_id", ignoreDuplicates: true }).select().maybeSingle();
  if (createError) throw createError;
  if (created) return created as RankingProfile;

  const { data: existing, error: retryError } = await supabase.from("progress_profiles").select("*").eq("user_id", userId).single();
  if (retryError) throw retryError;
  return existing as RankingProfile;
}

export function calculateWorkoutPoints(input: {
  volume: number;
  totalSets: number;
  personalRecords?: number;
  consistencyBonus?: number;
  qualityScore?: number;
  goalCompleted?: boolean;
}) {
  // Le volume reste récompensé, mais avec un rendement décroissant : soulever plus lourd
  // ne doit pas écraser la régularité, la qualité et la progression personnelle.
  const volumePoints = Math.min(45, Math.floor(Math.log10(Math.max(0, input.volume) + 1) * 12));
  const setPoints = Math.min(35, Math.max(0, input.totalSets) * 1.5);
  const consistencyBonus = Math.max(0, Math.min(25, input.consistencyBonus ?? 0));
  const qualityPoints = Math.min(40, Math.max(0, input.qualityScore ?? 0) * 0.4);
  const prBonus = Math.min(50, Math.max(0, input.personalRecords ?? 0) * 12);
  const goalBonus = input.goalCompleted ? 15 : 0;
  return Math.round(volumePoints + setPoints + consistencyBonus + qualityPoints + prBonus + goalBonus);
}

function dateKey(value: string | Date) {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export async function calculateStreak(userId: string) {
  const { data, error } = await supabase.from("workout_sessions").select("finished_at").eq("user_id", userId).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(365);
  if (error) throw error;
  const days = [...new Set((data ?? []).map((row) => dateKey(row.finished_at as string)))].sort((a, b) => b - a);
  if (!days.length) return { current: 0, best: 0 };

  const today = dateKey(new Date());
  const yesterday = today - 86400000;
  let current = days[0] === today || days[0] === yesterday ? 1 : 0;
  for (let i = 1; current > 0 && i < days.length; i += 1) {
    if (days[i - 1] - days[i] !== 86400000) break;
    current += 1;
  }

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i += 1) {
    if (days[i - 1] - days[i] === 86400000) run += 1;
    else run = 1;
    best = Math.max(best, run);
  }
  return { current, best };
}

export async function awardWorkoutPoints(userId: string, input: {
  volume: number;
  totalSets: number;
  personalRecords?: number;
  sessionId?: string;
  qualityScore?: number;
  goalCompleted?: boolean;
}) {
  let sessionId = input.sessionId;
  if (!sessionId) {
    const { data: latestSession, error: latestSessionError } = await supabase
      .from("workout_sessions")
      .select("id")
      .eq("user_id", userId)
      .not("finished_at", "is", null)
      .order("finished_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestSessionError) throw latestSessionError;
    sessionId = latestSession?.id ?? undefined;
  }

  if (sessionId) {
    const { data: existingEvent, error: existingEventError } = await supabase
      .from("progress_score_events")
      .select("points")
      .eq("user_id", userId)
      .eq("event_type", "workout_completed")
      .eq("metadata->>session_id", sessionId)
      .limit(1)
      .maybeSingle();
    if (existingEventError) throw existingEventError;
    if (existingEvent) {
      return { profile: await getRankingProfile(userId), pointsEarned: 0, streak: await calculateStreak(userId), alreadyAwarded: true };
    }
  }

  const profile = await getRankingProfile(userId);
  const streak = await calculateStreak(userId);
  const points = calculateWorkoutPoints({
    ...input,
    consistencyBonus: Math.min(25, Math.max(0, streak.current * 5)),
  });
  const nextScore = profile.score + points;
  const nextRank = [...RANKS].reverse().find((rank) => nextScore >= rank.min) ?? RANKS[0];

  const { data, error } = await supabase.from("progress_profiles").update({
    score: nextScore,
    rank: nextRank.name,
    season_points: profile.season_points + points,
    streak_days: streak.current,
    updated_at: new Date().toISOString(),
  }).eq("user_id", userId).select().single();
  if (error) throw error;

  const { error: eventError } = await supabase.from("progress_score_events").insert({
    user_id: userId,
    event_type: "workout_completed",
    points,
    metadata: {
      session_id: sessionId ?? null,
      volume: input.volume,
      total_sets: input.totalSets,
      personal_records: input.personalRecords ?? 0,
      quality_score: input.qualityScore ?? null,
      goal_completed: input.goalCompleted ?? false,
      streak_days: streak.current,
    },
  });
  if (eventError) throw eventError;

  return { profile: data as RankingProfile, pointsEarned: points, streak, alreadyAwarded: false };
}

export async function getGlobalRanking(limit = 50): Promise<RankingRow[]> {
  const { data, error } = await supabase.from("progress_profiles").select("*").order("score", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, index) => ({ ...(row as RankingProfile), position: index + 1 }));
}

export async function getSeasonRanking(season: number, limit = 50): Promise<RankingRow[]> {
  const { data, error } = await supabase.from("progress_profiles").select("*").eq("season", season).order("season_points", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []).map((row, index) => ({ ...(row as RankingProfile), position: index + 1 }));
}

export async function getUserRankingPosition(userId: string) {
  const profile = await getRankingProfile(userId);
  const { count, error } = await supabase.from("progress_profiles").select("user_id", { count: "exact", head: true }).gt("score", profile.score);
  if (error) throw error;
  return (count ?? 0) + 1;
}
