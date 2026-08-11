import type { BodyMeasurement } from "@/services/body-progress.service";

export type BodyMonthlySummary = {
  measurements: number;
  weightDelta: number | null;
  waistDelta: number | null;
  armDelta: number | null;
  chestDelta: number | null;
  message: string;
  signal: "positive" | "watch" | "stable";
};

export function getBodyMonthlySummary(measurements: BodyMeasurement[], referenceDate = new Date()): BodyMonthlySummary {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1).getTime();
  const current = measurements
    .filter((item) => new Date(item.measured_at).getTime() >= monthStart)
    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

  const first = current[0] ?? null;
  const last = current[current.length - 1] ?? null;

  if (!first || !last) {
    return {
      measurements: 0,
      weightDelta: null,
      waistDelta: null,
      armDelta: null,
      chestDelta: null,
      message: "Aucune mesure ce mois-ci.",
      signal: "stable",
    };
  }

  const delta = (key: keyof BodyMeasurement) =>
    typeof first[key] === "number" && typeof last[key] === "number"
      ? Number((Number(last[key]) - Number(first[key])).toFixed(2))
      : null;

  const weightDelta = delta("weight_kg");
  const waistDelta = delta("waist_cm");
  const armDelta = delta("arm_cm");
  const chestDelta = delta("chest_cm");

  let signal: BodyMonthlySummary["signal"] = "stable";
  let message = "Évolution stable ce mois-ci.";

  if (
    waistDelta != null &&
    waistDelta < 0 &&
    ((armDelta != null && armDelta >= 0) || (chestDelta != null && chestDelta >= 0))
  ) {
    signal = "positive";
    message = "Signal favorable : le tour de taille diminue sans baisse des mensurations musculaires suivies.";
  } else if (waistDelta != null && waistDelta > 0) {
    signal = "watch";
    message = "Le tour de taille augmente : Progress+ surveillera la tendance sur les prochaines mesures.";
  }

  return { measurements: current.length, weightDelta, waistDelta, armDelta, chestDelta, message, signal };
}
