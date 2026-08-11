import { Colors } from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getMeasurementDelta } from "@/services/body-progress.service";
import { StyleSheet, Text, View } from "react-native";

type Props = { current: BodyMeasurement | null; previous: BodyMeasurement | null };

const ITEMS: { key: keyof BodyMeasurement; label: string; unit: string }[] = [
  { key: "weight_kg", label: "Poids", unit: "kg" },
  { key: "body_fat_percent", label: "Masse grasse", unit: "%" },
  { key: "chest_cm", label: "Poitrine", unit: "cm" },
  { key: "arm_cm", label: "Bras", unit: "cm" },
  { key: "waist_cm", label: "Taille", unit: "cm" },
  { key: "hips_cm", label: "Hanches", unit: "cm" },
  { key: "thigh_cm", label: "Cuisse", unit: "cm" },
  { key: "calf_cm", label: "Mollet", unit: "cm" },
];

function formatDelta(value: number | null) {
  if (value == null || value === 0) return "—";
  return `${value > 0 ? "+" : ""}${value}`;
}

export function BodyProgressCard({ current, previous }: Props) {
  const delta = getMeasurementDelta(current, previous);
  if (!current) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>ÉVOLUTION CORPORELLE</Text>
      <Text style={styles.title}>Ton évolution</Text>
      <Text style={styles.date}>Mesure du {new Date(current.measured_at).toLocaleDateString("fr-FR")}</Text>
      <View style={styles.grid}>
        {ITEMS.map((item) => {
          const value = current[item.key];
          const change = delta?.[item.key] ?? null;
          return (
            <View key={item.key} style={styles.item}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.value}>{typeof value === "number" ? `${value} ${item.unit}` : "—"}</Text>
              <Text style={[styles.delta, { color: change == null || change === 0 ? Colors.textSecondary : change < 0 ? Colors.success : Colors.primary }]}>{formatDelta(change)}{change != null && change !== 0 ? ` ${item.unit}` : ""}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 20, padding: 18 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 21, fontWeight: "900", marginTop: 4 },
  date: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 14, gap: 8 },
  item: { width: "48%", backgroundColor: Colors.background, borderRadius: 14, padding: 11 },
  label: { color: Colors.textSecondary, fontSize: 10, fontWeight: "700" },
  value: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 4 },
  delta: { fontSize: 10, fontWeight: "800", marginTop: 3 },
});
