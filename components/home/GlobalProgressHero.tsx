import { ChevronRight, Sparkles } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";

export type GlobalScoreView = { score: number | null; label: string; confidence: number; available: number; missing: string[] };

type Props = { result: GlobalScoreView; onPress?: () => void };

export function GlobalProgressHero({ result, onPress }: Props) {
  const score = result.score;
  const width = `${Math.max(0, Math.min(100, score ?? 0))}%` as `${number}%`;
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.92} onPress={onPress}>
      <View style={styles.top}>
        <View style={styles.brandRow}><View style={styles.icon}><Sparkles color={Colors.primaryLight} size={18} /></View><View><Text style={styles.eyebrow}>PROGRESS+ SCORE</Text><Text style={styles.title}>{score == null ? "Construisons ton score" : result.label}</Text></View></View>
        <Text style={styles.score}>{score == null ? "—" : score}</Text>
      </View>
      <View style={styles.track}><View style={[styles.fill, { width }]} /></View>
      <View style={styles.bottom}><Text style={styles.meta}>{result.available}/4 piliers · confiance {result.confidence}%</Text><ChevronRight color={Colors.primaryLight} size={18} /></View>
    </TouchableOpacity>
  );
}

const styles=StyleSheet.create({card:{backgroundColor:Colors.surface,borderRadius:22,borderWidth:1,borderColor:Colors.primary,padding:17},top:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},brandRow:{flexDirection:"row",alignItems:"center",flex:1},icon:{width:40,height:40,borderRadius:13,backgroundColor:Colors.primarySoft,alignItems:"center",justifyContent:"center",marginRight:10},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.3},title:{color:Colors.text,fontSize:16,fontWeight:"900",marginTop:3},score:{color:Colors.primaryLight,fontSize:32,fontWeight:"900"},track:{height:8,backgroundColor:Colors.background,borderRadius:4,overflow:"hidden",marginTop:15},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},bottom:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:9},meta:{color:Colors.textMuted,fontSize:10,fontWeight:"700"}});
