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
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getWorkoutSession(
  sessionId: string
) {
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