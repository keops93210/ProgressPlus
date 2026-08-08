import { supabase } from "@/lib/supabase";

export type ProgressRank =
  | "Fer"
  | "Bronze"
  | "Argent"
  | "Or"
  | "Platine"
  | "Diamant"
  | "Ascendant"
  | "Éternus"
  | "Apex"
  | "Progress";

export interface RankingProfile {
  user_id: string;
  score: number;
  rank: ProgressRank;
  season: number;
  season_points: number;
  streak_days: number;
  updated_at: string;
}

export interface RankingRow extends RankingProfile {
  position: number;
}

export const RANKS: { name: ProgressRank; min: number; next: number | null }[] = [
  { name: "Fer", min: 0, next: 500 },
  { name: "Bronze", min: 500, next: 1200 },
  { name: "Argent", min: 1200, next: 2500 },
  { name: "Or", min: 2500, next: 4500 },
  { name: "Platine", min: 4500, next: 7000 },
  { name: "Diamant", min: 7000, next: 11000 },
  { name: "Ascendant", min: 11000, next: 16000 },
  { name: "Éternus", min: 16000, next: 22000 },
  { name: "Apex", min: 22000, next: 30000 },
  { name: "Progress", min: 30000, next: null },
];

export function getRankProgress(score: number) {
  const current = [...RANKS].reverse().find((rank) => score >= rank.min) ?? RANKS[0];
  const next = current.next;
  if (next === null) return { current, next: null, percent: 1, pointsToNext: 0 };
  const span = next - current.min;
  const percent = Math.min(1, Math.max(0, (score - current.min) / span));
  return { current, next: RANKS.find((rank) => rank.min === next) ?? null, percent, pointsToNext: Math.max(0, next - score) };
}

export async function getRankingProfile(userId: string): Promise<RankingProfile> {
  const { data, error } = await supabase
    .from("progress_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (data) return data as RankingProfile;

  const { data: created, error: createError } = await supabase
    .from("progress_profiles")
    .insert({ user_id: userId })
    .select()
    .single();

  if (createError) throw createError;
  return created as RankingProfile;
}

export async function addProgressPoints(
  userId: string,
  eventType: string,
  points: number,
  metadata: Record<string, unknown> = {}
) {
  const { data, error } = await supabase.rpc("add_progress_points", {
    p_user_id: userId,
    p_event_type: eventType,
    p_points: points,
    p_metadata: metadata,
  });

  if (error) throw error;
  return data as RankingProfile;
}

export async function getGlobalRanking(limit = 50): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from("progress_profiles")
    .select("*")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row, index) => ({
    ...(row as RankingProfile),
    position: index + 1,
  }));
}

export async function getSeasonRanking(season: number, limit = 50): Promise<RankingRow[]> {
  const { data, error } = await supabase
    .from("progress_profiles")
    .select("*")
    .eq("season", season)
    .order("season_points", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row, index) => ({
    ...(row as RankingProfile),
    position: index + 1,
  }));
}

export async function getUserRankingPosition(userId: string) {
  const profile = await getRankingProfile(userId);
  const { count, error } = await supabase
    .from("progress_profiles")
    .select("user_id", { count: "exact", head: true })
    .gt("score", profile.score);

  if (error) throw error;
  return (count ?? 0) + 1;
}
