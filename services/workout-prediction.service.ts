export type ProgressionForecast = {
  currentValue: number;
  targetValue: number;
  weeklyRate: number;
  estimatedWeeks: number | null;
  confidence: number;
  direction: "ahead" | "on_track" | "behind" | "insufficient_data";
  message: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function forecastTarget(input: {
  currentValue: number;
  targetValue: number;
  recentValues: number[];
}): ProgressionForecast {
  const currentValue = Number.isFinite(input.currentValue) ? input.currentValue : 0;
  const targetValue = Number.isFinite(input.targetValue) ? input.targetValue : 0;
  const values = input.recentValues.filter(Number.isFinite);

  if (values.length < 2 || currentValue <= 0 || targetValue <= currentValue) {
    return {
      currentValue,
      targetValue,
      weeklyRate: 0,
      estimatedWeeks: null,
      confidence: values.length >= 2 ? 0.45 : 0.2,
      direction: "insufficient_data",
      message: "Pas encore assez de données pour prévoir une date fiable.",
    };
  }

  const first = values[0];
  const last = values[values.length - 1];
  const averageRate = (last - first) / Math.max(1, values.length - 1);
  const weeklyRate = Math.max(0, averageRate);
  const remaining = Math.max(0, targetValue - currentValue);
  const estimatedWeeks = weeklyRate > 0 ? Math.ceil(remaining / weeklyRate) : null;
  const variability = values.reduce((sum, value, index) => {
    if (index === 0) return sum;
    return sum + Math.abs(value - values[index - 1]);
  }, 0) / Math.max(1, values.length - 1);
  const confidence = clamp(0.9 - variability / Math.max(1, targetValue) * 2, 0.35, 0.9);

  const expectedProgress = weeklyRate * Math.max(1, values.length - 1);
  const direction = expectedProgress > 0
    ? "on_track"
    : "behind";

  return {
    currentValue,
    targetValue,
    weeklyRate,
    estimatedWeeks,
    confidence,
    direction,
    message: estimatedWeeks === null
      ? "La progression est actuellement trop faible pour estimer l'objectif."
      : `À ce rythme, ton objectif est estimé dans environ ${estimatedWeeks} semaine${estimatedWeeks > 1 ? "s" : ""}.`,
  };
}

export function compareTargetProgress(input: {
  currentValue: number;
  targetValue: number;
  previousValue?: number | null;
}) {
  const current = Math.max(0, input.currentValue);
  const target = Math.max(0, input.targetValue);
  const previous = input.previousValue == null ? null : Math.max(0, input.previousValue);
  const completion = target > 0 ? clamp(current / target, 0, 1) : 0;
  const delta = previous == null ? null : current - previous;

  return {
    completionPercent: Math.round(completion * 100),
    delta,
    improving: delta == null ? null : delta > 0,
    remaining: Math.max(0, target - current),
  };
}
