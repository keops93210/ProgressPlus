import { Exercise } from "./exercise";

export interface ProgramExercise {
  id: string;

  program_id: string;
  exercise_id: string;

  position: number;

  sets: number;
  min_reps: number;
  max_reps: number;

  rest_seconds: number;

  created_at: string;

  exercises: Exercise;
}