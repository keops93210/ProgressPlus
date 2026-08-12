import { supabase } from "@/lib/supabase";

export type ExerciseProgressPoint = {
  sessionId: string;
  date: string;
  weight: number;
  reps: number;
  volume: number;
  estimated1rm: number;
};

export type ExerciseProgressSummary = {
  bestWeight: number;
  bestReps: number;
  bestEstimated1rm: number;
  bestVolume: number;
  sessionsCount: number;
  trendPercent: number;
  trend: "up" | "stable" | "down";
  personalRecord: {
    weight: number;
    reps: number;
    estimated1rm: number;
  } | null;
};

export async function getExerciseProgress(
  userId: string | null,
  exerciseId: string,
  limit = 8,
): Promise<{ points: ExerciseProgressPoint[]; summary: ExerciseProgressSummary }> {
  if (!userId) throw new Error("Utilisateur non connecté.");

  const { data, error } = await supabase
    .from("workout_sets")
    .select("session_id, weight, reps, created_at, workout_sessions!inner(user_id, finished_at)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .not("workout_sessions.finished_at", "is", null)
    .eq("completed", true)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const grouped = new Map<string, ExerciseProgressPoint>();

  for (const row of data ?? []) {
    const sessionId = String(row.session_id);
    const weight = Number(row.weight) || 0;
    const reps = Number(row.reps) || 0;
    const existing = grouped.get(sessionId);
    const estimated1rm = weight * (1 + reps / 30);

    if (!existing) {
      grouped.set(sessionId, {
        sessionId,
        date: String(row.created_at),
        weight,
        reps,
        volume: weight * reps,
        estimated1rm,
      });
      continue;
    }

    existing.volume += weight * reps;
    if (estimated1rm > existing.estimated1rm) {
      existing.weight = weight;
      existing.reps = reps;
      existing.estimated1rm = estimated1rm;
    }
  }

  const points = Array.from(grouped.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, Math.max(1, limit));

  const bestWeight = Math.max(...points.map((point) => point.weight), 0);
  const bestReps = Math.max(...points.map((point) => point.reps), 0);
  const bestEstimated1rm = Math.max(...points.map((point) => point.estimated1rm), 0);
  const bestVolume = Math.max(...points.map((point) => point.volume), 0);

  const latest = points[0];
  const previous = points[1];
  const trendPercent = latest && previous && previous.estimated1rm > 0
    ? Math.round(((latest.estimated1rm - previous.estimated1rm) / previous.estimated1rm) * 100)
    : 0;
  const trend: "up" | "stable" | "down" = trendPercent >= 3 ? "up" : trendPercent <= -3 ? "down" : "stable";

  const { data: personalRecord, error: recordError } = await supabase
    .from("personal_records")
    .select("weight, reps, estimated_1rm")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (recordError) throw recordError;

  return {
    points,
    summary: {
      bestWeight,
      bestReps,
      bestEstimated1rm,
      bestVolume,
      sessionsCount: points.length,
      trendPercent,
      trend,
      personalRecord: personalRecord
        ? {
            weight: Number(personalRecord.weight) || 0,
            reps: Number(personalRecord.reps) || 0,
            estimated1rm: Number(personalRecord.estimated_1rm) || 0,
          }
        : null,
    },
  };
}
