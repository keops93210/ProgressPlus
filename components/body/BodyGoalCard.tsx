import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getBodyGoalProgress, type BodyGoal } from "@/services/body-goals.service";

type Props = { goal: BodyGoal; current: BodyMeasurement | null };

const LABELS: Record<BodyGoal["metric"], string> = { weight_kg: "Poids", body_fat_percent: "Masse grasse", waist_cm: "Tour de taille", arm_cm: "Bras", chest_cm: "Poitrine", thigh_cm: "Cuisse" };

export function BodyGoalCard({ goal, current }: Props) {
  const result = getBodyGoalProgress(current, goal);
  const value = current?.[goal.metric];
  const display = typeof value === "number" ? `${value} ${goal.unit}` : "—";
  const percent = Math.round(result.progress * 100);
  return <View style={styles.card}>
    <View style={styles.top}><View><Text style={styles.eyebrow}>OBJECTIF</Text><Text style={styles.title}>{LABELS[goal.metric]}</Text></View><Text style={[styles.status, result.completed ? styles.done : styles.active]}>{result.completed ? "ATTEINT" : "EN COURS"}</Text></View>
    <View style={styles.values}><View><Text style={styles.label}>ACTUEL</Text><Text style={styles.value}>{display}</Text></View><Text style={styles.arrow}>→</Text><View style={styles.target}><Text style={styles.label}>CIBLE</Text><Text style={styles.value}>{goal.target} {goal.unit}</Text></View></View>
    <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View>
    <Text style={styles.remaining}>{result.completed ? "Objectif atteint. Nouveau cap ?" : result.remaining != null ? `${result.remaining} ${goal.unit} restant${result.remaining > 1 ? "s" : ""} • ${percent}%` : "Renseigne une mesure pour suivre l'objectif."}</Text>
  </View>;
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16,marginTop:2},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primary,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:17,fontWeight:"900",marginTop:3},status:{fontSize:9,fontWeight:"900",letterSpacing:.6,paddingHorizontal:9,paddingVertical:6,borderRadius:8,borderWidth:1},done:{color:Colors.success,borderColor:Colors.success},active:{color:Colors.primaryLight,borderColor:Colors.primary},values:{flexDirection:"row",alignItems:"flex-end",gap:14,marginTop:18},label:{color:Colors.textMuted,fontSize:9,fontWeight:"800",letterSpacing:.7},value:{color:Colors.text,fontSize:20,fontWeight:"900",marginTop:3},arrow:{color:Colors.primary,fontSize:20,fontWeight:"900",paddingBottom:2},target:{marginLeft:"auto",alignItems:"flex-end"},track:{height:7,borderRadius:4,backgroundColor:Colors.background,overflow:"hidden",marginTop:16},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},remaining:{color:Colors.textSecondary,fontSize:11,fontWeight:"700",marginTop:8}});
