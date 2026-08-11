import type { BodyMeasurementInput } from "@/services/body-progress.service";

const ranges: Partial<Record<keyof BodyMeasurementInput, [number, number]>> = {
  weight_kg: [30, 300], body_fat_percent: [2, 70], neck_cm: [20, 70], shoulders_cm: [50, 180], chest_cm: [50, 180], arm_cm: [15, 70], forearm_cm: [12, 50], waist_cm: [40, 180], hips_cm: [50, 180], thigh_cm: [25, 100], calf_cm: [20, 70],
};

export function validateBodyMeasurement(input: BodyMeasurementInput) {
  const errors: string[] = [];
  for (const [key, value] of Object.entries(input)) {
    if (value == null) continue;
    const range = ranges[key as keyof BodyMeasurementInput];
    if (typeof value !== "number" || !Number.isFinite(value)) errors.push(`${key}: valeur invalide`);
    else if (range && (value < range[0] || value > range[1])) errors.push(`${key}: valeur inhabituelle`);
  }
  return { valid: errors.length === 0, errors };
}
