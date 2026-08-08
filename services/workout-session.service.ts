import { supabase } from "@/lib/supabase";

export async function startWorkoutSession(userId: string, programId: string) {
  const { data: activeSession, error: activeError } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("program_id", programId)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeError) throw activeError;
  if (activeSession) return activeSession;

  const { data, error } = await supabase
    .from("workout_sessions")
    .insert({ user_id: userId, program_id: programId })
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

  await updatePersonalRecord(sessionId, exerciseId, weight, reps);
  return data;
}

async function updatePersonalRecord(
  sessionId: string,
  exerciseId: string,
  weight: number,
  reps: number
) {
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("user_id")
    .eq("id", sessionId)
    .single();

  if (sessionError) throw sessionError;

  const estimated1rm = weight * (1 + reps / 30);

  const { data: current, error: currentError } = await supabase
    .from("personal_records")
    .select("weight, reps, estimated_1rm")
    .eq("user_id", session.user_id)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (currentError) throw currentError;

  if (!current || estimated1rm > Number(current.estimated_1rm ?? 0)) {
    const { error } = await supabase
      .from("personal_records")
      .upsert(
        {
          user_id: session.user_id,
          exercise_id: exerciseId,
          weight,
          reps,
          estimated_1rm: Number(estimated1rm.toFixed(2)),
        },
        { onConflict: "user_id,exercise_id" }
      );

    if (error) throw error;
  }
}

export async function getWorkoutSession(sessionId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select(`*, workout_sets (*)`)
    .eq("id", sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getWorkoutExercises(programId: string) {
  const { data, error } = await supabase
    .from("program_exercises")
    .select(`*, exercises (*)`)
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
    .select(`weight, reps, created_at, workout_sessions!inner (user_id, finished_at)`)
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

export interface ProgressionRecommendation {
  action: "increase_weight" | "keep_weight" | "increase_reps" | "start";
  currentWeight: number;
  recommendedWeight: number;
  currentReps: number;
  recommendedReps: number;
  minReps: number;
  maxReps: number;
  completedSets: number;
  message: string;
}

type ProgressionSet = {
  weight: number;
  reps: number;
  set_number: number;
};

export async function getProgressionRecommendation(
  userId: string,
  exerciseId: string,
  minReps: number,
  maxReps: number,
  plannedSets: number
): Promise<ProgressionRecommendation> {
  const { data: latestSet, error: latestSetError } = await supabase
    .from("workout_sets")
    .select("session_id, workout_sessions!inner(id, user_id, finished_at)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .not("workout_sessions.finished_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestSetError) throw latestSetError;

  if (!latestSet) {
    return {
      action: "start",
      currentWeight: 0,
      recommendedWeight: 0,
      currentReps: minReps,
      recommendedReps: minReps,
      minReps,
      maxReps,
      completedSets: 0,
      message: `Commence à ${minReps}–${maxReps} répétitions et trouve ton poids de travail.`,
    };
  }

  const { data: rawSets, error: setsError } = await supabase
    .from("workout_sets")
    .select("weight, reps, set_number")
    .eq("session_id", latestSet.session_id)
    .eq("exercise_id", exerciseId)
    .eq("completed", true)
    .order("set_number", { ascending: true });

  if (setsError) throw setsError;

  const sets: ProgressionSet[] = (rawSets ?? []).map((set) => ({
    weight: Number(set.weight) || 0,
    reps: Number(set.reps) || 0,
    set_number: Number(set.set_number) || 0,
  }));

  if (!sets.length) {
    return {
      action: "start",
      currentWeight: 0,
      recommendedWeight: 0,
      currentReps: minReps,
      recommendedReps: minReps,
      minReps,
      maxReps,
      completedSets: 0,
      message: `Commence à ${minReps}–${maxReps} répétitions et trouve ton poids de travail.`,
    };
  }

  const currentWeight = sets[0].weight;
  const averageReps =
    sets.reduce((sum, set) => sum + set.reps, 0) / sets.length;
  const allAtTop =
    sets.length >= plannedSets && sets.every((set) => set.reps >= maxReps);

  if (allAtTop && currentWeight > 0) {
    const recommendedWeight = currentWeight + 2.5;
    return {
      action: "increase_weight",
      currentWeight,
      recommendedWeight,
      currentReps: Math.round(averageReps),
      recommendedReps: minReps,
      minReps,
      maxReps,
      completedSets: sets.length,
      message: `Toutes tes séries ont atteint ${maxReps} reps. Passe à ${recommendedWeight} kg et repars à ${minReps} reps.`,
    };
  }

  if (averageReps >= minReps && currentWeight > 0) {
    const recommendedReps = Math.min(maxReps, Math.round(averageReps) + 1);
    return {
      action: recommendedReps > Math.round(averageReps) ? "increase_reps" : "keep_weight",
      currentWeight,
      recommendedWeight: currentWeight,
      currentReps: Math.round(averageReps),
      recommendedReps,
      minReps,
      maxReps,
      completedSets: sets.length,
      message: `Garde ${currentWeight} kg et vise ${recommendedReps} reps sur les prochaines séries.`,
    };
  }

  return {
    action: "keep_weight",
    currentWeight,
    recommendedWeight: currentWeight,
    currentReps: Math.round(averageReps),
    recommendedReps: Math.max(minReps, Math.round(averageReps)),
    minReps,
    maxReps,
    completedSets: sets.length,
    message: `Garde ${currentWeight} kg et consolide ta technique dans la zone ${minReps}–${maxReps} reps.`,
  };
}

export interface PersonalRecordItem {
  id: string;
  exercise_id: string;
  weight: number;
  reps: number;
  estimated_1rm: number | null;
  created_at: string | null;
  exercises: { name: string } | null;
}

export async function getPersonalRecords(
  userId: string,
  limit = 10
): Promise<PersonalRecordItem[]> {
  const { data, error } = await supabase
    .from("personal_records")
    .select(`
      id,
      exercise_id,
      weight,
      reps,
      estimated_1rm,
      created_at,
      exercises (name)
    `)
    .eq("user_id", userId)
    .order("estimated_1rm", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as PersonalRecordItem[];
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
