import { supabase } from "@/lib/supabase";

export type CommunitySort = "weekly" | "rating" | "downloads" | "new";

export interface CommunityProgram {
  id: string;
  name: string;
  description: string | null;
  category: string;
  days_per_week: number | null;
  tags: string[];
  downloads_count: number;
  favorites_count: number;
  rating_average: number;
  ratings_count: number;
  published_at: string;
  creator_id: string;
  creator_name: string;
}

export async function getCommunityPrograms(sort: CommunitySort = "weekly") {
  const { data, error } = await supabase.rpc("get_community_programs", {
    p_sort: sort,
  });
  if (error) throw error;
  return (data ?? []) as CommunityProgram[];
}

export async function downloadCommunityProgram(communityProgramId: string) {
  const { data, error } = await supabase.rpc("download_community_program", {
    p_community_program_id: communityProgramId,
  });
  if (error) throw error;
  return data as string;
}

export async function publishCommunityProgram(
  programId: string,
  category = "Autre",
  daysPerWeek: number | null = null,
  tags: string[] = [],
) {
  const { data, error } = await supabase.rpc("publish_community_program", {
    p_program_id: programId,
    p_category: category,
    p_days_per_week: daysPerWeek,
    p_tags: tags,
  });
  if (error) throw error;
  return data as string;
}

export async function unpublishCommunityProgram(programId: string) {
  const { error } = await supabase.rpc("unpublish_community_program", {
    p_program_id: programId,
  });
  if (error) throw error;
}

export async function rateCommunityProgram(
  communityProgramId: string,
  rating: number,
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non connecté");

  const { error } = await supabase.from("community_program_ratings").upsert(
    {
      community_program_id: communityProgramId,
      user_id: userData.user.id,
      rating,
    },
    { onConflict: "community_program_id,user_id" },
  );
  if (error) throw error;
}

export async function toggleCommunityFavorite(communityProgramId: string) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non connecté");

  const { data: existing, error: existingError } = await supabase
    .from("community_program_favorites")
    .select("id")
    .eq("community_program_id", communityProgramId)
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (existingError) throw existingError;

  if (existing) {
    const { error } = await supabase
      .from("community_program_favorites")
      .delete()
      .eq("id", existing.id);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase.from("community_program_favorites").insert({
    community_program_id: communityProgramId,
    user_id: userData.user.id,
  });
  if (error) throw error;
  return true;
}
