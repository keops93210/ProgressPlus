import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMetricPoint } from "@/services/body-metric-history.service";

export function BodyMetricTrendChart({ points, unit }: { points: BodyMetricPoint[]; unit: string }) {
  if (points.length < 2) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Pas encore assez de données</Text>
        <Text style={styles.emptyText}>Ajoute une deuxième mesure pour voir l'évolution.</Text>
      </View>
    );
  }
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>ÉVOLUTION</Text>
          <Text style={styles.title}>{points[0].value} → {points[points.length - 1].value} {unit}</Text>
        </View>
        <Text style={styles.count}>{points.length} mesures</Text>
      </View>
      <View style={styles.chart}>
        {points.map((point, index) => {
          const height = 24 + ((point.value - min) / range) * 76;
          return (
            <View key={`${point.date}-${index}`} style={styles.column}>
              <Text style={styles.value}>{point.value}</Text>
              <View style={styles.track}><View style={[styles.bar, { height }]} /></View>
              <Text style={styles.date}>{new Date(point.date).toLocaleDateString("fr-FR", { month: "short" })}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  eyebrow: { color: Colors.primaryLight, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 3 },
  count: { color: Colors.textMuted, fontSize: 10, fontWeight: "800" },
  chart: { height: 145, flexDirection: "row", alignItems: "flex-end", gap: 7, marginTop: 15 },
  column: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" },
  value: { color: Colors.textSecondary, fontSize: 9, fontWeight: "800", marginBottom: 4 },
  track: { height: 100, width: "70%", justifyContent: "flex-end", backgroundColor: Colors.background, borderRadius: 8, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: Colors.primary, borderRadius: 8 },
  date: { color: Colors.textMuted, fontSize: 8, marginTop: 5 },
  empty: { backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 20 },
  emptyTitle: { color: Colors.text, fontSize: 14, fontWeight: "900" },
  emptyText: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
});
