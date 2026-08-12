import type { BodyMeasurement } from "@/services/body-progress.service";
import type { BodyMetricKey } from "@/components/body/BodyMetricTrendSelector";

export type BodyMetricPoint = {
  date: string;
  value: number;
};

export function getBodyMetricHistory(
  measurements: BodyMeasurement[],
  key: BodyMetricKey,
  limit?: number,
): BodyMetricPoint[] {
  const effectiveLimit = limit ?? 12;
  return [...measurements]
    .filter((item) => typeof item[key] === "number")
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
    .slice(-effectiveLimit)
    .map((item) => ({ date: item.measured_at, value: Number(item[key]) }));
}
