import { supabase } from "@/lib/supabase";
import { getPersonalRecords, getWorkoutHistory } from "@/services/workout-session.service";
import { getRankProgress, getRankingProfile, RankingProfile } from "@/services/ranking.service";

export type ProgressObjective = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  reward: number;
  period: "daily" | "weekly" | "lifetime";
  completed: boolean;
};

export type ProgressEvent = {
  id: string;
  event_type: string;
  points: number;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ProgressOverview = {
  profile: RankingProfile;
  rankProgress: ReturnType<typeof getRankProgress>;
  objectives: ProgressObjective[];
  recentEvents: ProgressEvent[];
};

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function startOfWeek(date = new Date()) {
  const value = startOfDay(date);
  const day = value.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  value.setDate(value.getDate() - mondayOffset);
  return value;
}

export async function getProgressOverview(userId: string): Promise<ProgressOverview> {
  const [profile, history, records, eventsResult] = await Promise.all([
    getRankingProfile(userId),
    getWorkoutHistory(userId, 100),
    getPersonalRecords(userId, 100),
    supabase
      .from("progress_score_events")
      .select("id, event_type, points, metadata, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (eventsResult.error) throw eventsResult.error;

  const now = new Date();
  const today = startOfDay(now).getTime();
  const week = startOfWeek(now).getTime();
  const completedSessions = history.filter((session) => session.finished_at);
  const todaySessions = completedSessions.filter((session) => startOfDay(session.finished_at as string).getTime() === today);
  const weekSessions = completedSessions.filter((session) => new Date(session.finished_at as string).getTime() >= week);

  const objectives: ProgressObjective[] = [
    {
      id: "daily-session",
      title: "Faire une séance aujourd'hui",
      description: "Reste actif et valide une séance complète.",
      current: Math.min(1, todaySessions.length),
      target: 1,
      reward: 50,
      period: "daily",
      completed: todaySessions.length > 0,
    },
    {
      id: "weekly-sessions",
      title: "3 séances cette semaine",
      description: "Construis une vraie régularité sur la semaine.",
      current: Math.min(3, weekSessions.length),
      target: 3,
      reward: 100,
      period: "weekly",
      completed: weekSessions.length >= 3,
    },
    {
      id: "weekly-volume",
      title: "10 000 kg de volume",
      description: "Accumule du volume d'entraînement cette semaine.",
      current: Math.min(10000, Math.round(weekSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0)),),
      target: 10000,
      reward: 150,
      period: "weekly",
      completed: weekSessions.reduce((sum, session) => sum + Number(session.total_volume ?? 0), 0) >= 10000,
    },
    {
      id: "records",
      title: "Atteindre 5 records personnels",
      description: "Fais progresser tes performances exercice par exercice.",
      current: Math.min(5, records.length),
      target: 5,
      reward: 100,
      period: "lifetime",
      completed: records.length >= 5,
    },
  ];

  return {
    profile,
    rankProgress: getRankProgress(profile.score),
    objectives,
    recentEvents: (eventsResult.data ?? []) as ProgressEvent[],
  };
}
