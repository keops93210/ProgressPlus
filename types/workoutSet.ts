export interface WorkoutSet {
  id: string;

  session_id: string;

  exercise_id: string;

  set_number: number;

  weight: number;

  reps: number;

  created_at: string;
}
