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
  const { data: created, error: createError } = await supabase.from("progress_profiles").insert({ user_id: userId, score: 0, rank: "Fer", season: 1, season_points: 0, streak_days: 0 }).select().single();
  if (createError) throw createError;
  return created as RankingProfile;
}

export function calculateWorkoutPoints(input: { volume: number; totalSets: number; personalRecords?: number; consistencyBonus?: number; }) {
  const volumePoints = Math.min(100, Math.floor(input.volume / 500));
  const setPoints = Math.min(30, input.totalSets * 2);
  const consistencyBonus = Math.max(0, Math.min(25, input.consistencyBonus ?? 0));
  const prBonus = Math.min(100, (input.personalRecords ?? 0) * 25);
  return volumePoints + setPoints + consistencyBonus + prBonus;
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

export async function awardWorkoutPoints(userId: string, input: { volume: number; totalSets: number; personalRecords?: number; }) {
  const profile = await getRankingProfile(userId);
  const streak = await calculateStreak(userId);
  const points = calculateWorkoutPoints({ ...input, consistencyBonus: Math.min(25, Math.max(0, streak.current * 5)) });
  const nextScore = profile.score + points;
  const nextRank = [...RANKS].reverse().find((rank) => nextScore >= rank.min) ?? RANKS[0];

  const { data, error } = await supabase.from("progress_profiles").update({ score: nextScore, rank: nextRank.name, season_points: profile.season_points + points, streak_days: streak.current, updated_at: new Date().toISOString() }).eq("user_id", userId).select().single();
  if (error) throw error;
  return { profile: data as RankingProfile, pointsEarned: points, streak };
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
