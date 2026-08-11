import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { BodyMeasurement } from "@/services/body-progress.service";
import { getTransformationScore } from "@/services/body-progress-score.service";

type Props = { current: BodyMeasurement | null; previous: BodyMeasurement | null };

export function TransformationScoreCard({ current, previous }: Props) {
  const result = getTransformationScore(current, previous);
  return <View style={styles.card}>
    <View style={styles.header}><View><Text style={styles.eyebrow}>PROGRESS+ ANALYSIS</Text><Text style={styles.title}>Score transformation</Text></View><Text style={styles.score}>{result.score == null ? "—" : result.score}</Text></View>
    <Text style={styles.label}>{result.label}</Text>
    <View style={styles.track}><View style={[styles.fill, { width: `${result.score ?? 0}%` }]} /></View>
    <Text style={styles.helper}>Basé sur l'évolution de tes dernières mensurations disponibles.</Text>
  </View>;
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:17,fontWeight:"900",marginTop:3},score:{color:Colors.primary,fontSize:32,fontWeight:"900"},label:{color:Colors.text,fontSize:13,fontWeight:"800",marginTop:12},track:{height:8,backgroundColor:Colors.background,borderRadius:4,overflow:"hidden",marginTop:10},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},helper:{color:Colors.textMuted,fontSize:10,lineHeight:16,marginTop:8}});
