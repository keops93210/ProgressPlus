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

  const loadWorkout = useCallback(async () => {}, []);

  const validateSet = useCallback(async () => {}, []);

  const finishWorkout = useCallback(async () => {}, []);

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
