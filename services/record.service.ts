import { supabase } from "@/lib/supabase";

export async function getPersonalRecord(
  userId: string,
  exerciseId: string
) {
  const { data, error } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (error) throw error;

  return data;
}

export async function savePersonalRecord(
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number,
  estimated1RM: number
) {
  const { error } = await supabase
    .from("personal_records")
    .upsert({
      user_id: userId,
      exercise_id: exerciseId,
      weight,
      reps,
      estimated_1rm: estimated1RM,
    });

  if (error) throw error;
}
