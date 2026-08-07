import { useMemo } from "react";

export function useWorkoutProgress(
  currentExerciseIndex: number,
  totalExercises: number,
  currentSet: number,
  totalSets: number
) {
  const exerciseProgress = useMemo(() => {
    if (totalSets === 0) return 0;

    return (currentSet / totalSets) * 100;
  }, [currentSet, totalSets]);

  const workoutProgress = useMemo(() => {
    if (totalExercises === 0) return 0;

    return (
      ((currentExerciseIndex + 1) / totalExercises) *
      100
    );
  }, [currentExerciseIndex, totalExercises]);

  return {
    exerciseProgress,
    workoutProgress,
  };
}
