import { Check, Flame, Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Props = { completed: number; target: number };

export function WeeklyTargetCard({ completed, target }: Props) {
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((completed / safeTarget) * 100));
  const done = completed >= safeTarget;
  const remaining = Math.max(0, safeTarget - completed);

  return <View style={styles.card}>
    <View style={styles.header}>
      <View style={[styles.icon, done && styles.iconDone]}>{done ? <Check color={Colors.success} size={18} /> : <Target color={Colors.primaryLight} size={18} />}</View>
      <View style={styles.copy}><Text style={styles.eyebrow}>OBJECTIF DE LA SEMAINE</Text><Text style={styles.title}>{completed} / {safeTarget} séances</Text></View>
      <Text style={[styles.percent, done && styles.success]}>{percent}%</Text>
    </View>
    <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` as `${number}%` }, done && styles.fillDone]} /></View>
    <View style={styles.footer}><View style={styles.status}><Flame color={done ? Colors.success : Colors.primaryLight} size={13} /><Text style={styles.helper}>{done ? "Objectif atteint" : `${remaining} séance${remaining > 1 ? "s" : ""} pour atteindre ton objectif`}</Text></View><Text style={styles.cta}>Cette semaine</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#15141C", borderRadius: 20, borderWidth: 1, borderColor: "#292733", padding: 16, minHeight: 118 },
  header: { flexDirection: "row", alignItems: "center" },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: "#261641", alignItems: "center", justifyContent: "center" },
  iconDone: { backgroundColor: "#102A1B" },
  copy: { flex: 1, marginLeft: 11 },
  eyebrow: { color: Colors.primaryLight, fontSize: 7, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: "#FFFFFF", fontSize: 17, fontWeight: "900", marginTop: 4 },
  percent: { color: Colors.primaryLight, fontSize: 20, fontWeight: "900" },
  success: { color: Colors.success },
  track: { height: 8, backgroundColor: "#292733", borderRadius: 4, overflow: "hidden", marginTop: 15 },
  fill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  fillDone: { backgroundColor: Colors.success },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 11 },
  status: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  helper: { color: "#85818D", fontSize: 9 },
  cta: { color: "#625E6D", fontSize: 8, fontWeight: "800" },
});
