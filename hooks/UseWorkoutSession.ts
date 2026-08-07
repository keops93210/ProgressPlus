import { useCallback, useState } from "react";

import {
  getWorkoutExercises,
  saveWorkoutSet,
  startWorkoutSession,
  finishWorkoutSession,
} from "@/services/workout-session.service";

import { ProgramExercise } from "@/types/programExercise";

export function useWorkoutSession() {
  const [loading, setLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [exercises, setExercises] = useState<ProgramExercise[]>([]);

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const [currentSet, setCurrentSet] = useState(1);

  const [weight, setWeight] = useState(20);

  const [reps, setReps] = useState(8);

  const loadWorkout = useCallback(
  async (userId: string, programId: string) => {
    try {
      setLoading(true);

      const data = await getWorkoutExercises(programId);

      setExercises(data ?? []);

      const session = await startWorkoutSession(
        userId,
        programId
      );

      setSessionId(session.id);
    } finally {
      setLoading(false);
    }
  },
  []
);

const validateSet = useCallback(
  async (
    exercise: ProgramExercise
  ) => {
    if (!sessionId) return;

    await saveWorkoutSet(
      sessionId,
      exercise.exercise_id,
      currentSet,
      weight,
      reps
    );
  },
  [sessionId, currentSet, weight, reps]
);

const finishWorkout = useCallback(
  async () => {
    if (!sessionId) return;

    await finishWorkoutSession(
      sessionId,
      0,
      0,
      0
    );
  },
  [sessionId]
);;

  return {
    loading,

    sessionId,

    exercises,

    currentExerciseIndex,

    currentSet,

    weight,

    reps,

    setWeight,

    setReps,

    setCurrentSet,

    setCurrentExerciseIndex,

    setSessionId,

    setExercises,

    loadWorkout,

    validateSet,

    finishWorkout,
  };
}
