import { supabase } from "@/lib/supabase";

export async function createProgram(
  userId: string,
  name: string,
  description?: string
) {
  const { data, error } = await supabase
    .from("workout_programs")
    .insert({
      user_id: userId,
      name,
      description,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getPrograms(userId: string) {
  const { data, error } = await supabase
    .from("workout_programs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function getProgram(id: string) {
  const { data, error } = await supabase
    .from("workout_programs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function deleteProgram(id: string) {
  const { error } = await supabase
    .from("workout_programs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function addExerciseToProgram(
  programId: string,
  exerciseId: string,
  sets: number,
  minReps: number,
  maxReps: number,
  rest: number
) {
  const { data: lastExercise } = await supabase
    .from("program_exercises")
    .select("position")
    .eq("program_id", programId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = lastExercise
    ? lastExercise.position + 1
    : 1;

  const { data, error } = await supabase
    .from("program_exercises")
    .insert({
      program_id: programId,
      exercise_id: exerciseId,
      position: nextPosition,
      sets,
      min_reps: minReps,
      max_reps: maxReps,
      rest_seconds: rest,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getProgramExercises(
  programId: string
) {
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

export async function deleteProgramExercise(
  id: string
) {
  const { error } = await supabase
    .from("program_exercises")
    .delete()
    .eq("id", id);

  if (error) throw error;
}