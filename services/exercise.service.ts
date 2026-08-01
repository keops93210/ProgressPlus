import { supabase } from "@/lib/supabase";

export async function getExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name");

  if (error) {
    throw error;
  }

  return data;
}