import { supabase } from "@/lib/supabase";

export type BodyProgressPhoto = {
  id: string;
  user_id: string;
  captured_at: string;
  storage_path: string;
  angle: "front" | "side" | "back" | "other";
  note: string | null;
};

export async function getBodyProgressPhotos(userId: string) {
  const { data, error } = await supabase
    .from("body_progress_photos")
    .select("*")
    .eq("user_id", userId)
    .order("captured_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BodyProgressPhoto[];
}

export async function deleteBodyProgressPhoto(userId: string, id: string) {
  const { data, error } = await supabase
    .from("body_progress_photos")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)
    .select("storage_path")
    .single();
  if (error) throw error;
  if (data?.storage_path) {
    await supabase.storage.from("body-progress").remove([data.storage_path]);
  }
}
