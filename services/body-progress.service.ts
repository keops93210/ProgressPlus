import { supabase } from "@/lib/supabase";

export type BodyMeasurement = {
  id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  neck_cm: number | null;
  shoulders_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  forearm_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  thigh_cm: number | null;
  calf_cm: number | null;
  notes: string | null;
};

export type BodyMeasurementInput = Partial<Omit<BodyMeasurement, "id" | "measured_at">> & { measured_at?: string };

export async function getBodyMeasurements(userId: string): Promise<BodyMeasurement[]> {
  const { data, error } = await supabase.from("body_measurements").select("*").eq("user_id", userId).order("measured_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BodyMeasurement[];
}

export async function saveBodyMeasurement(userId: string, input: BodyMeasurementInput) {
  const { data, error } = await supabase.from("body_measurements").insert({ user_id: userId, ...input }).select("*").single();
  if (error) throw error;
  return data as BodyMeasurement;
}

export async function deleteBodyMeasurement(userId: string, id: string) {
  const { error } = await supabase.from("body_measurements").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export function getMeasurementDelta(current: BodyMeasurement | null, previous: BodyMeasurement | null) {
  if (!current || !previous) return null;
  const fields: (keyof BodyMeasurement)[] = ["weight_kg", "body_fat_percent", "neck_cm", "shoulders_cm", "chest_cm", "arm_cm", "forearm_cm", "waist_cm", "hips_cm", "thigh_cm", "calf_cm"];
  return Object.fromEntries(fields.map((field) => {
    const a = current[field]; const b = previous[field];
    return [field, typeof a === "number" && typeof b === "number" ? Number((a - b).toFixed(2)) : null];
  }));
}
