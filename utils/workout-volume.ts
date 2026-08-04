export function calculateWorkoutVolume(
  weight: number,
  reps: number
) {
  return weight * reps;
}

export function calculateSessionVolume(
  sets: {
    weight: number;
    reps: number;
  }[]
) {
  return sets.reduce(
    (total, set) => total + set.weight * set.reps,
    0
  );
}
