import type { BodyMeasurement } from "@/services/body-progress.service";

export type BodyGoalMetric = "weight_kg" | "body_fat_percent" | "waist_cm" | "arm_cm" | "chest_cm" | "thigh_cm";
export type BodyGoalDirection = "decrease" | "increase";
export type BodyGoal = { metric: BodyGoalMetric; target: number; direction: BodyGoalDirection; unit: string; startValue?: number };

export function getBodyGoalProgress(current: BodyMeasurement | null, goal: BodyGoal) {
  if (!current) return { progress: 0, remaining: null as number | null, completed: false };
  const value = current[goal.metric];
  if (typeof value !== "number") return { progress: 0, remaining: null as number | null, completed: false };
  const remaining = goal.target - value;
  const completed = goal.direction === "decrease" ? value <= goal.target : value >= goal.target;
  const start = goal.startValue ?? value;
  const totalDistance = Math.abs(goal.target - start);
  const traveled = Math.abs(value - start);
  const progress = completed ? 1 : totalDistance > 0 ? Math.min(traveled / totalDistance, 0.99) : 0;
  return { progress, remaining: Number(Math.abs(remaining).toFixed(2)), completed };
}

export function getBodyTrend(measurements: BodyMeasurement[], metric: BodyGoalMetric) {
  const points = measurements.filter((m) => typeof m[metric] === "number").sort((a,b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
  if (points.length < 2) return { delta: null as number | null, direction: "stable" as const };
  const first = Number(points[0][metric]);
  const last = Number(points[points.length - 1][metric]);
  const delta = Number((last - first).toFixed(2));
  return { delta, direction: delta > 0.01 ? "up" as const : delta < -0.01 ? "down" as const : "stable" as const };
}
