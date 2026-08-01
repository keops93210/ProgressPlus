export interface Exercise {
  id: string;

  name: string;
  slug: string | null;

  primary_muscle: string;
  secondary_muscles: string[] | null;

  equipment: string | null;
  difficulty: string | null;

  instructions: string | null;

  image_url: string | null;
  video_url: string | null;

  is_compound: boolean;

  created_at: string;
}