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
          {done ? <Check color={Colors.success} size={18} /> : <Target color={Colors.primaryLight} size={18} />}
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>OBJECTIF SEMAINE</Text>
          <Text style={styles.title}>{completed}/{safeTarget} séances</Text>
        </View>
        <View style={styles.percentWrap}>
          <Text style={[styles.percent, done && styles.success]}>{percent}%</Text>
        </View>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` as `${number}%` }, done && styles.fillDone]} /></View>
      <View style={styles.bottom}>
        <Text style={styles.helper}>{done ? "Objectif atteint" : `${safeTarget - completed} restante${safeTarget - completed > 1 ? "s" : ""}`}</Text>
        <Text style={[styles.status, done && styles.success]}>{done ? "COMPLET" : "EN COURS"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 15 },
  top: { flexDirection: "row", alignItems: "center" },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  iconDone: { backgroundColor: "rgba(52, 211, 153, 0.10)" },
  copy: { flex: 1, marginLeft: 10 },
  eyebrow: { color: Colors.primaryLight, fontSize: 8, fontWeight: "900", letterSpacing: 1.1 },
  title: { color: Colors.text, fontSize: 15, fontWeight: "900", marginTop: 3 },
  percentWrap: { minWidth: 38, alignItems: "flex-end" },
  percent: { color: Colors.primaryLight, fontSize: 19, fontWeight: "900" },
  success: { color: Colors.success },
  track: { height: 7, backgroundColor: Colors.background, borderRadius: 4, overflow: "hidden", marginTop: 14 },
  fill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  fillDone: { backgroundColor: Colors.success },
  bottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 9 },
  helper: { color: Colors.textMuted, fontSize: 10 },
  status: { color: Colors.primaryLight, fontSize: 8, fontWeight: "900", letterSpacing: 0.8 },
});
