import { Check, Target } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Props = { completed: number; target: number };

export function WeeklyTargetCard({ completed, target }: Props) {
  const safeTarget = Math.max(1, target);
  const percent = Math.min(100, Math.round((completed / safeTarget) * 100));
  const done = completed >= safeTarget;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.icon, done && styles.iconDone]}>
          {done ? <Check color={Colors.success} size={17} /> : <Target color={Colors.primaryLight} size={17} />}
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>OBJECTIF SEMAINE</Text>
          <Text style={styles.title}>{completed}/{safeTarget} séances</Text>
        </View>
        <Text style={[styles.percent, done && styles.success]}>{percent}%</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` as `${number}%` }, done && styles.fillDone]} /></View>
      <Text style={styles.helper}>{done ? "Objectif atteint" : `${safeTarget - completed} séance${safeTarget - completed > 1 ? "s" : ""} restante${safeTarget - completed > 1 ? "s" : ""}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#111116", borderRadius: 18, borderWidth: 1, borderColor: "#272631", padding: 14 },
  top: { flexDirection: "row", alignItems: "center" },
  icon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#21143C", alignItems: "center", justifyContent: "center" },
  iconDone: { backgroundColor: "#102A1B" },
  copy: { flex: 1, marginLeft: 10 },
  eyebrow: { color: Colors.primaryLight, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: "#FFFFFF", fontSize: 14, fontWeight: "900", marginTop: 3 },
  percent: { color: Colors.primaryLight, fontSize: 18, fontWeight: "900" },
  success: { color: Colors.success },
  track: { height: 6, backgroundColor: "#292832", borderRadius: 3, overflow: "hidden", marginTop: 13 },
  fill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 3 },
  fillDone: { backgroundColor: Colors.success },
  helper: { color: "#7F7F8B", fontSize: 9, marginTop: 8 },
});