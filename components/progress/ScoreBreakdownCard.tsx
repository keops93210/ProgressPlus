import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { GlobalProgressInputs } from "@/services/progress-global-score.service";
import { getScoreBreakdown } from "@/services/progress-score-breakdown.service";

export function ScoreBreakdownCard({ input }: { input: GlobalProgressInputs }) {
  const { pillars, weakest } = getScoreBreakdown(input);
  return <View style={styles.card}><Text style={styles.eyebrow}>DÉTAIL DU SCORE</Text>{pillars.map((p)=><View key={p.key} style={styles.row}><View style={styles.nameWrap}><Text style={styles.name}>{p.label}</Text><Text style={styles.weight}>{p.weight}%</Text></View><View style={styles.track}><View style={[styles.fill,{width:`${p.value ?? 0}%`}]} /></View><Text style={styles.value}>{p.value == null ? "—" : p.value}</Text></View>)}{weakest && <Text style={styles.footer}>🎯 Le principal levier actuel : <Text style={styles.strong}>{weakest.label}</Text></Text>}</View>;
}
const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.2,marginBottom:13},row:{flexDirection:"row",alignItems:"center",marginBottom:12},nameWrap:{width:92},name:{color:Colors.text,fontSize:11,fontWeight:"800"},weight:{color:Colors.textMuted,fontSize:8,marginTop:2},track:{flex:1,height:7,backgroundColor:Colors.background,borderRadius:4,overflow:"hidden"},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},value:{width:28,textAlign:"right",color:Colors.text,fontSize:12,fontWeight:"900"},footer:{color:Colors.textSecondary,fontSize:11,lineHeight:17,marginTop:2},strong:{color:Colors.primaryLight,fontWeight:"900"}});