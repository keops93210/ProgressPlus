import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getExerciseProgress, ExerciseProgressPoint } from "@/services/exercise-progress.service";
import { useAuth } from "@/contexts/AuthContext";

type Metric = "1RM" | "Poids" | "Volume";

type Props = { exerciseId: string };

export default function ExerciseProgressChart({ exerciseId }: Props) {
  const { user } = useAuth();
  const [points, setPoints] = useState<ExerciseProgressPoint[]>([]);
  const [metric, setMetric] = useState<Metric>("1RM");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getExerciseProgress(user?.id ?? null, exerciseId, 8)
      .then((result) => { if (active) setPoints([...result.points].reverse()); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [exerciseId, user?.id]);

  const values = useMemo(() => points.map((point) => metric === "1RM" ? point.estimated1rm : metric === "Poids" ? point.weight : point.volume), [points, metric]);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const latest = values[values.length - 1] ?? 0;
  const first = values[0] ?? 0;
  const change = first > 0 ? Math.round(((latest - first) / first) * 100) : 0;
  const unit = metric === "Volume" ? "kg" : "kg";

  if (loading) return <View style={styles.card}><ActivityIndicator color={Colors.primary} /><Text style={styles.loading}>Analyse de ta progression…</Text></View>;
  if (points.length < 2) return <View style={styles.card}><Text style={styles.title}>Évolution</Text><Text style={styles.empty}>Pas encore assez de séances pour afficher une courbe.</Text></View>;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>ÉVOLUTION</Text><Text style={styles.title}>{metric} · {latest.toFixed(metric === "Volume" ? 0 : 1)} {unit}</Text></View>
        <Text style={[styles.change, { color: change >= 0 ? Colors.success : Colors.danger }]}>{change >= 0 ? "+" : ""}{change}%</Text>
      </View>
      <View style={styles.tabs}>{(["1RM", "Poids", "Volume"] as Metric[]).map((item) => <Text key={item} onPress={() => setMetric(item)} style={[styles.tab, item === metric && styles.activeTab]}>{item}</Text>)}</View>
      <View style={styles.chart}>
        {points.map((point, index) => {
          const value = values[index];
          const height = 18 + ((value - min) / range) * 92;
          return <View key={point.sessionId} style={styles.column}><Text style={styles.value}>{value.toFixed(metric === "Volume" ? 0 : 1)}</Text><View style={styles.track}><View style={[styles.bar, { height }]} /></View><Text style={styles.date}>{new Date(point.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</Text></View>;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: 16, marginBottom: 16, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#FFFFFF" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 19, fontWeight: "900", marginTop: 4 },
  change: { fontSize: 16, fontWeight: "900" },
  tabs: { flexDirection: "row", gap: 8, marginTop: 16 },
  tab: { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 14, color: Colors.textSecondary, backgroundColor: Colors.surfaceLight, fontSize: 12, fontWeight: "800" },
  activeTab: { color: Colors.primary, backgroundColor: "#FFF0F0" },
  chart: { height: 170, marginTop: 18, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 6 },
  column: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" },
  value: { color: Colors.textSecondary, fontSize: 9, fontWeight: "800", marginBottom: 5 },
  track: { height: 112, width: "72%", justifyContent: "flex-end", backgroundColor: Colors.surfaceLight, borderRadius: 8, overflow: "hidden" },
  bar: { width: "100%", backgroundColor: Colors.primary, borderRadius: 8 },
  date: { color: Colors.textMuted, fontSize: 9, marginTop: 6 },
  loading: { color: Colors.textSecondary, textAlign: "center", marginTop: 8 },
  empty: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 4 },
});
