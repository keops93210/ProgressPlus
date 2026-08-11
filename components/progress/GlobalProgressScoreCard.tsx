import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { getGlobalProgressScore, type GlobalProgressInputs } from "@/services/progress-global-score.service";

type Props = { input: GlobalProgressInputs };

export function GlobalProgressScoreCard({ input }: Props) {
  const result = getGlobalProgressScore(input);
  const score = result.score ?? 0;
  const tone = score >= 80 ? Colors.success : score >= 65 ? Colors.primary : score >= 50 ? Colors.primaryLight : Colors.danger;
  const available = Object.values(input).filter((value) => typeof value === "number" && Number.isFinite(value)).length;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View><Text style={styles.eyebrow}>PROGRESS+ SCORE</Text><Text style={styles.title}>Ta progression globale</Text></View>
        <View style={styles.scoreWrap}><Text style={[styles.score, { color: tone }]}>{result.score == null ? "—" : result.score}</Text><Text style={styles.outOf}>/100</Text></View>
      </View>
      <Text style={styles.label}>{result.label}</Text>
      <View style={styles.track}><View style={[styles.fill, { width: `${score}%`, backgroundColor: tone }]} /></View>
      <View style={styles.grid}>
        <Metric label="Transformation" value={input.transformationScore} />
        <Metric label="Performance" value={input.performanceScore} />
        <Metric label="Récupération" value={input.recoveryScore} />
        <Metric label="Régularité" value={input.consistencyScore} />
      </View>
      <Text style={styles.helper}>{available}/4 indicateurs disponibles. Le score se recalibre automatiquement quand de nouvelles données sont enregistrées.</Text>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return <View style={styles.metric}><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value == null ? "—" : Math.round(value)}</Text></View>;
}

const styles = StyleSheet.create({ card:{backgroundColor:Colors.surface,borderRadius:22,borderWidth:1,borderColor:Colors.border,padding:18},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.3},title:{color:Colors.text,fontSize:18,fontWeight:"900",marginTop:3},scoreWrap:{flexDirection:"row",alignItems:"baseline"},score:{fontSize:34,fontWeight:"900"},outOf:{color:Colors.textMuted,fontSize:12,fontWeight:"800"},label:{color:Colors.text,fontSize:13,fontWeight:"800",marginTop:12},track:{height:8,backgroundColor:Colors.background,borderRadius:5,overflow:"hidden",marginTop:9},fill:{height:"100%",borderRadius:5},grid:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:14},metric:{width:"48%",backgroundColor:Colors.background,borderRadius:12,padding:10},metricLabel:{color:Colors.textMuted,fontSize:9,fontWeight:"800"},metricValue:{color:Colors.text,fontSize:16,fontWeight:"900",marginTop:2},helper:{color:Colors.textMuted,fontSize:10,lineHeight:15,marginTop:12}});
