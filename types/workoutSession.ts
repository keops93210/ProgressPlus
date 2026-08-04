export interface WorkoutSession {
  id: string;

  user_id: string;

  program_id: string;

  started_at: string;

  finished_at: string | null;

  duration_seconds: number | null;

  total_volume: number | null;

  total_sets: number | null;
}
