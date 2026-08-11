import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getWeeklyConsistency, type WorkoutEntry } from "@/services/progress-consistency.service";

type Props = { entries: WorkoutEntry[]; targetPerWeek?: number };
export function WeeklyConsistencyCard({ entries, targetPerWeek = 4 }: Props) {
  const result = getWeeklyConsistency(entries, targetPerWeek);
  return <View style={styles.card}><View style={styles.row}><View><Text style={styles.eyebrow}>RÉGULARITÉ</Text><Text style={styles.title}>{result.currentWeek}/{result.targetPerWeek} séances</Text></View><Text style={styles.percent}>{Math.round(result.completion * 100)}%</Text></View><View style={styles.track}><View style={[styles.fill, { width: `${result.completion * 100}%` }]} /></View><Text style={styles.helper}>{result.successfulWeeks} semaine{result.successfulWeeks > 1 ? "s" : ""} avec l'objectif atteint.</Text></View>;
}
const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primary,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:19,fontWeight:"900",marginTop:3},percent:{color:Colors.primary,fontSize:24,fontWeight:"900"},track:{height:8,backgroundColor:Colors.background,borderRadius:4,overflow:"hidden",marginTop:13},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},helper:{color:Colors.textMuted,fontSize:10,marginTop:8}});
