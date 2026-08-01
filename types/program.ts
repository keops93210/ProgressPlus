export interface WorkoutProgram {
  id: string;
  user_id: string;

  name: string;
  description: string | null;

  created_at: string;
}