import { supabase } from "@/lib/supabase";

export async function saveWorkoutEffort(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  rir: number,
) {
  const safeRir = Math.max(0, Math.min(5, Math.round(rir)));
  const rpe = 10 - safeRir;

  const { error } = await supabase
    .from("workout_sets")
    .update({ rir: safeRir, rpe })
    .eq("session_id", sessionId)
    .eq("exercise_id", exerciseId)
    .eq("set_number", setNumber);

  if (error) throw error;
  return { rir: safeRir, rpe };
}
