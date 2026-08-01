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

export async function deleteProgram(id: string) {
  const { error } = await supabase
    .from("workout_programs")
    .delete()
    .eq("id", id);

  if (error) throw error;
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