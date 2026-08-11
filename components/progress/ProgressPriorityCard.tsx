import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getPriorityFromScores } from "@/services/progress-score-label.service";

type Props = { scores: { transformation: number | null; performance: number | null; recovery: number | null; consistency: number | null } };
const labels = { transformation: "Transformation", performance: "Performances", recovery: "Récupération", consistency: "Régularité" };
export function ProgressPriorityCard({ scores }: Props) {
  const key = getPriorityFromScores(scores);
  if (!key) return null;
  return <View style={styles.card}><Text style={styles.eyebrow}>PROCHAIN LEVIER</Text><Text style={styles.title}>{labels[key as keyof typeof labels]}</Text><Text style={styles.text}>Progress+ identifie ce pilier comme le plus intéressant à améliorer maintenant.</Text></View>;
}
const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:20,borderWidth:1,borderColor:Colors.border,padding:16},eyebrow:{color:Colors.primary,fontSize:9,fontWeight:"900",letterSpacing:1.2},title:{color:Colors.text,fontSize:19,fontWeight:"900",marginTop:4},text:{color:Colors.textSecondary,fontSize:12,lineHeight:18,marginTop:6}});
