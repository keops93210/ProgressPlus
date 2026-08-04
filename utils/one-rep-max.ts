export function estimateOneRepMax(
  weight: number,
  reps: number
) {
  return Math.round(weight * (1 + reps / 30));
}
