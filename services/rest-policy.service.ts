export type RestPolicyInput = {
  baseSeconds: number;
  rir: number;
  readiness?: number | null;
  previousRir?: number | null;
  consecutiveHardSets?: number;
  exerciseType?: "compound" | "isolation";
};

export type RestPolicyResult = {
  seconds: number;
  adjustment: "shorter" | "standard" | "longer";
  reason: string;
};

function roundTo15(seconds: number) { return Math.max(30, Math.round(seconds / 15) * 15); }

export function getAdaptiveRest(input: RestPolicyInput): RestPolicyResult {
  let seconds = Math.max(30, input.baseSeconds);
  const compound = input.exerciseType === "compound";
  if (input.rir <= 0) seconds *= compound ? 1.3 : 1.2;
  else if (input.rir === 1) seconds *= 1.2;
  else if (input.rir === 2) seconds *= 1.1;
  else if (input.rir >= 4) seconds *= 0.9;

  if (input.readiness != null && input.readiness <= 2) seconds *= 1.15;
  if ((input.consecutiveHardSets ?? 0) >= 2) seconds *= 1.1;
  if (input.previousRir != null && input.rir < input.previousRir) seconds *= 1.05;

  const rounded = roundTo15(seconds);
  const adjustment = rounded < input.baseSeconds - 15 ? "shorter" : rounded > input.baseSeconds + 15 ? "longer" : "standard";
  const reason = adjustment === "longer"
    ? "Progress+ augmente le repos pour préserver la qualité des prochaines séries."
    : adjustment === "shorter"
      ? "Ta marge est importante : Progress+ réduit légèrement le repos sans sacrifier la qualité."
      : "Repos adapté à l'effort actuel.";
  return { seconds: rounded, adjustment, reason };
}
