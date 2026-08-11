import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getBodyTrend } from "@/services/body-goals.service";

type Props = { measurements: BodyMeasurement[]; metric: "weight_kg" | "waist_cm" | "arm_cm" | "chest_cm" | "thigh_cm"; label: string; unit: string };

export function BodyTrendCard({ measurements, metric, label, unit }: Props) {
  const trend = getBodyTrend(measurements, metric);
  const values = measurements.filter((item) => typeof item[metric] === "number").map((item) => Number(item[metric])).slice(0, 6).reverse();
  if (!values.length) return null;
  const min = Math.min(...values); const max = Math.max(...values); const range = Math.max(max - min, 0.01);
  return <View style={styles.card}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>TENDANCE</Text><Text style={styles.title}>{label}</Text></View><Text style={[styles.delta, trend.direction === "down" ? styles.good : trend.direction === "up" ? styles.primary : styles.muted]}>{trend.delta == null ? "—" : `${trend.delta > 0 ? "+" : ""}${trend.delta} ${unit}`}</Text></View>
    <View style={styles.chart}>{values.map((value, index) => <View key={`${value}-${index}`} style={styles.pointColumn}><View style={styles.track}><View style={[styles.point, { bottom: `${((value - min) / range) * 80 + 10}%` }]} /></View><Text style={styles.value}>{value}</Text></View>)}</View>
    <Text style={styles.footer}>{values.length} mesures • dernière : {values[values.length - 1]} {unit}</Text>
  </View>;
}

const styles = StyleSheet.create({ card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primary,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:17,fontWeight:"900",marginTop:3},delta:{fontSize:14,fontWeight:"900"},good:{color:Colors.success},primary:{color:Colors.primaryLight},muted:{color:Colors.textSecondary},chart:{height:110,flexDirection:"row",alignItems:"stretch",justifyContent:"space-between",marginTop:12},pointColumn:{flex:1,alignItems:"center"},track:{width:2,flex:1,backgroundColor:Colors.border,position:"relative"},point:{position:"absolute",width:10,height:10,borderRadius:5,backgroundColor:Colors.primary,left:-4},value:{color:Colors.textSecondary,fontSize:9,marginTop:6},footer:{color:Colors.textMuted,fontSize:10,marginTop:8},});
