import { supabase } from "@/lib/supabase";

export async function startWorkoutSession(
  userId: string,
  programId: string
) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      program_id: programId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function finishWorkoutSession(
  sessionId: string,
  duration: number,
  volume: number,
  totalSets: number
) {
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      finished_at: new Date().toISOString(),
      duration_seconds: duration,
      total_volume: volume,
      total_sets: totalSets,
    })
    .eq("id", sessionId);

  if (error) throw error;
}

export async function saveWorkoutSet(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  weight: number,
  reps: number
) {
  const { data, error } = await supabase
    .from("workout_sets")
    .insert({
      session_id: sessionId,
      exercise_id: exerciseId,
      set_number: setNumber,
      weight,
      reps,
      completed: true,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWorkoutSession(sessionId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(`
      *,
      workout_sets (*)
    `)
    .eq("id", sessionId)
    .single();

  if (error) throw error;

  return data;
}

export async function getWorkoutExercises(programId: string) {
  const { data, error } = await supabase
    .from("program_exercises")
    .select(`
      *,
      exercises (*)
    `)
    .eq("program_id", programId)
    .order("position");

  if (error) throw error;

  return data;
}

export async function getLastPerformance(
  userId: string,
  exerciseId: string
): Promise<{ weight: number; reps: number } | null> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select(`
      weight,
      reps,
      created_at,
      workout_sessions!inner (
        user_id,
        finished_at
      )
    `)
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .not("workout_sessions.finished_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    weight: Number(data.weight) || 0,
    reps: Number(data.reps) || 0,
  };
}

export interface WorkoutHistoryItem {
  id: string;
  program_id: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  total_volume: number | null;
  total_sets: number | null;
  workout_programs: { name: string } | null;
}

export async function getWorkoutHistory(
  userId: string,
  limit = 20
): Promise<WorkoutHistoryItem[]> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(`
      id,
      program_id,
      started_at,
      finished_at,
      duration_seconds,
      total_volume,
      total_sets,
      workout_programs (name)
    `)
    .eq("user_id", userId)
    .not("finished_at", "is", null)
    .order("finished_at", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data ?? []) as unknown as WorkoutHistoryItem[];
}
