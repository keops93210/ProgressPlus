import type { BodyMeasurement } from "@/services/body-progress.service";

export function getBodyMonthlySummary(measurements: BodyMeasurement[], referenceDate = new Date()) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1).getTime();
  const current = measurements.filter((item) => new Date(item.measured_at).getTime() >= monthStart).sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());
  const first = current[0] ?? null;
  const last = current[current.length - 1] ?? null;
  if (!first || !last) return { measurements: 0, weightDelta: null, waistDelta: null, armDelta: null, message: "Aucune mesure ce mois-ci." };
  const delta = (key: keyof BodyMeasurement) => typeof first[key] === "number" && typeof last[key] === "number" ? Number((Number(last[key]) - Number(first[key])).toFixed(2)) : null;
  const weightDelta = delta("weight_kg");
  const waistDelta = delta("waist_cm");
  const armDelta = delta("arm_cm");
  let message = "Évolution stable ce mois-ci.";
  if (waistDelta != null && waistDelta < 0 && armDelta != null && armDelta >= 0) message = "Signal favorable : le tour de taille diminue sans baisse du bras.";
  else if (waistDelta != null && waistDelta > 0) message = "Le tour de taille augmente : Progress+ surveillera la tendance sur les prochaines mesures.";
  return { measurements: current.length, weightDelta, waistDelta, armDelta, message };
}
