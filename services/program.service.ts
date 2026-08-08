import { supabase } from "@/lib/supabase";

export async function createProgram(userId: string, name: string, description?: string) {
  const cleanName = name.trim();
  if (!cleanName) throw new Error("Le nom du programme est obligatoire.");
  if (cleanName.length > 80) throw new Error("Le nom du programme est trop long.");

  const { data, error } = await supabase
    .from("workout_programs")
    .insert({ user_id: userId, name: cleanName, description: description?.trim() || null })
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

  const programs = data ?? [];
  if (programs.length === 0) return [];

  const programIds = programs.map((program) => program.id);
  const { data: communityPrograms, error: communityError } = await supabase
    .from("community_programs")
    .select("source_program_id, is_published")
    .in("source_program_id", programIds);
  if (communityError) throw communityError;

  const publicationByProgram = new Map(
    (communityPrograms ?? []).map((communityProgram) => [
      communityProgram.source_program_id,
      communityProgram.is_published === true,
    ]),
  );

  return programs.map((program) => ({
    ...program,
    is_published: publicationByProgram.get(program.id) ?? false,
  }));
}

export async function getProgram(id: string) {
  const { data, error } = await supabase.from("workout_programs").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function deleteProgram(id: string) {
  const { error } = await supabase.from("workout_programs").delete().eq("id", id);
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
  if (!Number.isInteger(sets) || sets < 1 || sets > 20) {
    throw new Error("Le nombre de séries doit être compris entre 1 et 20.");
  }
  if (!Number.isInteger(minReps) || !Number.isInteger(maxReps) || minReps < 1 || maxReps < minReps || maxReps > 50) {
    throw new Error("La plage de répétitions est invalide.");
  }
  if (!Number.isInteger(rest) || rest < 0 || rest > 600) {
    throw new Error("Le temps de repos est invalide.");
  }

  const { data: existingExercise, error: existingError } = await supabase
    .from("program_exercises")
    .select("id")
    .eq("program_id", programId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existingExercise) throw new Error("Cet exercice est déjà présent dans le programme.");

  const { data: lastExercise, error: positionError } = await supabase
    .from("program_exercises")
    .select("position")
    .eq("program_id", programId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (positionError) throw positionError;

  const nextPosition = lastExercise ? Number(lastExercise.position) + 1 : 1;
  const { data, error } = await supabase
    .from("program_exercises")
    .insert({ program_id: programId, exercise_id: exerciseId, position: nextPosition, sets, min_reps: minReps, max_reps: maxReps, rest_seconds: rest })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProgramExercises(programId: string) {
  const { data, error } = await supabase
    .from("program_exercises")
    .select(`*, exercises (id, name, primary_muscle, equipment)`)
    .eq("program_id", programId)
    .order("position");
  if (error) throw error;
  return data;
}

export async function deleteProgramExercise(id: string) {
  const { error } = await supabase.from("program_exercises").delete().eq("id", id);
  if (error) throw error;
}
