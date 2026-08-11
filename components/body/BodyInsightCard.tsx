import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getBodyProgressInsight } from "@/services/body-progress-analysis.service";

type Props = { current: BodyMeasurement | null; previous: BodyMeasurement | null };

export function BodyInsightCard({ current, previous }: Props) {
  const insight = getBodyProgressInsight(current, previous);
  if (!insight) return null;
  const color = insight.tone === "progress" ? Colors.success : insight.tone === "attention" ? Colors.danger : Colors.primary;
  return <View style={[styles.card, { borderColor: color }]} accessible accessibilityLabel={`${insight.title}. ${insight.message}`}>
    <View style={styles.header}><View style={[styles.icon, { backgroundColor: `${color}20`, borderColor: color }]}><Text style={[styles.iconText, { color }]}>{insight.tone === "progress" ? "↗" : insight.tone === "attention" ? "!" : "◆"}</Text></View><View style={styles.copy}><Text style={[styles.eyebrow, { color }]}>ANALYSE PROGRESS+</Text><Text style={styles.title}>{insight.title}</Text></View></View>
    <Text style={styles.message}>{insight.message}</Text>
  </View>;
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,padding:16,marginTop:2},header:{flexDirection:"row",alignItems:"center",gap:11},icon:{width:38,height:38,borderRadius:12,borderWidth:1,alignItems:"center",justifyContent:"center"},iconText:{fontSize:18,fontWeight:"900"},copy:{flex:1},eyebrow:{fontSize:9,fontWeight:"900",letterSpacing:1.1},title:{color:Colors.text,fontSize:16,fontWeight:"900",marginTop:3},message:{color:Colors.textSecondary,fontSize:12,lineHeight:18,marginTop:13}});
