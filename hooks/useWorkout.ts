import { useState } from "react";

import { ProgramExercise } from "@/types/programExercise";

export default function useWorkout(
  exercises: ProgramExercise[]
) {
  const [exerciseIndex, setExerciseIndex] =
    useState(0);

  const [setNumber, setSetNumber] =
    useState(1);

  const currentExercise =
    exercises[exerciseIndex];

  function nextSet() {
    if (!currentExercise) return;

    if (setNumber < currentExercise.sets) {
      setSetNumber((prev) => prev + 1);
      return;
    }

    if (exerciseIndex < exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1);
      setSetNumber(1);
    }
  }

  return {
    currentExercise,
    exerciseIndex,
    setNumber,
    nextSet,
  };
}
