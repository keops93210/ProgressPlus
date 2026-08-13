import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getExerciseProgress, ExerciseProgressPoint } from "@/services/exercise-progress.service";
import { useAuth } from "@/contexts/AuthContext";

type Metric = "1RM" | "Poids" | "Volume";
type Period = 3 | 6 | 12;
type Props = { exerciseId: string };

export default function ExerciseProgressChart({ exerciseId }: Props) {
  const { user } = useAuth();
  const [points, setPoints] = useState<ExerciseProgressPoint[]>([]);
  const [metric, setMetric] = useState<Metric>("1RM");
  const [period, setPeriod] = useState<Period>(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getExerciseProgress(user?.id ?? null, exerciseId, 50, period)
      .then((result) => { if (active) setPoints([...result.points].reverse()); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [exerciseId, period, user?.id]);

  const values = useMemo(() => points.map((p) => metric === "1RM" ? p.estimated1rm : metric === "Poids" ? p.weight : p.volume), [points, metric]);
  const max = Math.max(...values, 0), min = Math.min(...values, 0), range = Math.max(max - min, 1);
  const latest = values.at(-1) ?? 0, first = values[0] ?? 0;
  const change = first > 0 ? Math.round(((latest - first) / first) * 100) : 0;
  const trend = change >= 3 ? "Progression" : change <= -3 ? "À surveiller" : "Stable";
  const best = Math.max(...values, 0), bestIndex = values.findIndex((v) => v === best);
  const format = (v: number) => v.toFixed(metric === "Volume" ? 0 : 1);

  if (loading) return <View style={styles.card}><ActivityIndicator color={Colors.primary} /><Text style={styles.loading}>Analyse de ta progression…</Text></View>;
  if (points.length < 2) return <View style={styles.card}><Text style={styles.title}>Évolution</Text><Text style={styles.empty}>Pas encore assez de séances sur cette période.</Text></View>;

  return <View style={styles.card}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>ÉVOLUTION · {period} MOIS</Text><Text style={styles.title}>{metric} · {format(latest)} kg</Text></View><Text style={[styles.change,{color:change>=0?Colors.success:Colors.danger}]}>{change>=0?"+":""}{change}%</Text></View>
    <View style={styles.row}>{([3,6,12] as Period[]).map((p)=><Pressable key={p} onPress={()=>setPeriod(p)} style={[styles.pill,p===period&&styles.pillActive]}><Text style={[styles.pillText,p===period&&styles.pillTextActive]}>{p} mois</Text></Pressable>)}</View>
    <View style={styles.row}>{(["1RM","Poids","Volume"] as Metric[]).map((m)=><Pressable key={m} onPress={()=>setMetric(m)} style={[styles.pill,m===metric&&styles.metricActive]}><Text style={[styles.pillText,m===metric&&styles.metricTextActive]}>{m}</Text></Pressable>)}</View>
    <View style={styles.insight}><View><Text style={styles.label}>TENDANCE</Text><Text style={styles.insightValue}>{trend}</Text></View><View><Text style={styles.label}>MEILLEURE</Text><Text style={styles.insightValue}>{format(best)} kg</Text></View><View><Text style={styles.label}>SÉANCES</Text><Text style={styles.insightValue}>{points.length}</Text></View></View>
    <View style={styles.chart}>{points.map((point,i)=>{const value=values[i],height=18+((value-min)/range)*92;return <View key={point.sessionId} style={styles.column}><Text style={styles.value}>{format(value)}</Text><View style={styles.track}><View style={[styles.bar,{height},i===bestIndex&&styles.bestBar]}/></View><Text style={styles.date}>{new Date(point.date).toLocaleDateString("fr-FR",{day:"2-digit",month:"short"})}</Text></View>})}</View>
    <Text style={styles.summary}>{change>0?`Tu as progressé de ${change}% sur cette période.`:change<0?`Ta performance a reculé de ${Math.abs(change)}% sur cette période.`:"Ta performance reste stable sur cette période."}</Text>
  </View>;
}

const styles=StyleSheet.create({card:{marginHorizontal:16,marginBottom:16,padding:18,borderRadius:22,borderWidth:1,borderColor:Colors.border,backgroundColor:"#FFFFFF"},header:{flexDirection:"row",alignItems:"center",justifyContent:"space-between"},eyebrow:{color:Colors.primary,fontSize:10,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:19,fontWeight:"900",marginTop:4},change:{fontSize:16,fontWeight:"900"},row:{flexDirection:"row",gap:7,marginTop:12},pill:{paddingHorizontal:10,paddingVertical:7,borderRadius:13,backgroundColor:Colors.surfaceLight},pillActive:{backgroundColor:Colors.primary},pillText:{color:Colors.textSecondary,fontSize:11,fontWeight:"800"},pillTextActive:{color:"#FFFFFF"},metricActive:{backgroundColor:"#FFF0F0"},metricTextActive:{color:Colors.primary},insight:{flexDirection:"row",justifyContent:"space-between",marginTop:15,padding:12,borderRadius:15,backgroundColor:Colors.surfaceLight},label:{color:Colors.textMuted,fontSize:8,fontWeight:"900",letterSpacing:.7},insightValue:{color:Colors.text,fontSize:12,fontWeight:"900",marginTop:3},chart:{height:170,marginTop:18,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",gap:5},column:{flex:1,height:"100%",alignItems:"center",justifyContent:"flex-end"},value:{color:Colors.textSecondary,fontSize:8,fontWeight:"800",marginBottom:5},track:{height:112,width:"72%",justifyContent:"flex-end",backgroundColor:Colors.surfaceLight,borderRadius:8,overflow:"hidden"},bar:{width:"100%",backgroundColor:Colors.primary,borderRadius:8},bestBar:{backgroundColor:Colors.success},date:{color:Colors.textMuted,fontSize:8,marginTop:6},summary:{color:Colors.textSecondary,fontSize:13,lineHeight:19,marginTop:14},loading:{color:Colors.textSecondary,textAlign:"center",marginTop:8},empty:{color:Colors.textSecondary,fontSize:13,lineHeight:20,marginTop:4}});
