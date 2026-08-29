import { useFocusEffect, router } from "expo-router";
import { Activity, ChevronRight, Moon, Smile, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";
import { GlobalProgressHero } from "@/components/home/GlobalProgressHero";
import { WeeklyTargetCard } from "@/components/home/WeeklyTargetCard";
import { BodySnapshotCard } from "@/components/home/BodySnapshotCard";

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <View style={styles.metric}><Icon color={Colors.primaryLight} size={17} /><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{action ? <Text style={styles.sectionAction}>{action}</Text> : null}</View>;
}

function formatScore(value: number | null | undefined) { return value == null ? "—" : `${Math.round(Number(value) * 2)}/10`; }
function formatVolume(value: number) { return `${Math.round(value).toLocaleString("fr-FR")} kg`; }

function getCoachDecision(recoveryScore: number | null | undefined, hasProgram: boolean) {
  if (!hasProgram) return { eyebrow: "PREMIÈRE ÉTAPE", title: "Construis ton programme", message: "Ajoute tes exercices et Progress+ commencera à piloter ta progression série par série.", action: "Voir mes programmes", tone: "neutral" as const };
  if (recoveryScore == null) return { eyebrow: "COACH PROGRESS+", title: "Prêt à décider avec tes données", message: "Fais ton check-in au début de ta prochaine séance.", action: "Commencer la séance", tone: "neutral" as const };
  if (recoveryScore <= 2) return { eyebrow: "COACH PROGRESS+", title: "Aujourd'hui, on consolide", message: "Ta récupération est basse. Priorité à une exécution propre et maîtrisée.", action: "Ouvrir ma séance", tone: "caution" as const };
  if (recoveryScore >= 4.2) return { eyebrow: "COACH PROGRESS+", title: "Feu vert pour progresser", message: "Ta récupération est très bonne. Progress+ cherchera une progression contrôlée.", action: "Lancer ma séance", tone: "ready" as const };
  return { eyebrow: "COACH PROGRESS+", title: "Progression propre aujourd'hui", message: "Ta récupération est correcte. On cherche une petite amélioration sans sacrifier la technique.", action: "Lancer ma séance", tone: "neutral" as const };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getHomeData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async (silent = false) => {
    if (!user) return;
    try { if (!silent) setLoading(true); setData(await getHomeData(user.id)); }
    catch (error) { console.log("HOME DATA ERROR =", error); }
    finally { setLoading(false); }
  }, [user]);
  useFocusEffect(useCallback(() => { load(true); }, [load]));
  async function refresh() { try { setRefreshing(true); await load(true); } finally { setRefreshing(false); } }

  if (loading && !data) return <SafeAreaView style={styles.safe}><View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Chargement de Progress+...</Text></View></SafeAreaView>;

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const ranking = data?.ranking;
  const rankProgress = ranking ? getRankProgress(ranking.score) : null;
  const program = data?.programs?.[0];
  const recovery = data?.recovery;
  const record = data?.records?.[0];
  const volumeChange = data?.volumeChange ?? 0;
  const hasComparison = Boolean(data?.history?.length && data?.monthVolume);
  const coachDecision = getCoachDecision(recovery?.recovery_score, Boolean(program));
  const readinessColor = coachDecision.tone === "ready" ? Colors.success : coachDecision.tone === "caution" ? Colors.danger : Colors.primary;
  const globalScore = data?.globalScore ?? { score: null, label: "Pas assez de données", confidence: 0, available: 0, missing: [] as string[] };
  const weeklyTarget = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4, completion: 0, successfulWeeks: 0 };
  const currentBody = data?.body?.current;
  const bodyDelta = data?.body?.delta as { waist_cm?: number | null } | null | undefined;
  const rankPercent = Math.round((rankProgress?.percent ?? 0) * 100);

  return <SafeAreaView style={styles.safe}>
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandLine}><Sparkles color={Colors.primaryLight} size={14} /><Text style={styles.brand}>PROGRESS+</Text></View>
        <View style={styles.headerRow}><View style={{ flex: 1 }}><Text style={styles.greeting}>Bonjour {firstName} 👋</Text><Text style={styles.subtitle}>Prêt à devenir une meilleure version ?</Text></View><TouchableOpacity style={styles.avatar} onPress={() => router.push("/(app)/profile")}><Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text></TouchableOpacity></View>
      </View>

      <TouchableOpacity style={styles.nextWorkout} activeOpacity={0.92} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
        <View style={styles.nextIcon}><Activity color={Colors.primaryLight} size={20} /></View><View style={styles.nextCopy}><Text style={styles.nextEyebrow}>PROCHAINE SÉANCE</Text><Text style={styles.nextTitle}>{program?.name || "Commencer ton entraînement"}</Text><Text style={styles.nextMeta}>{program ? "Ton programme est prêt · aujourd'hui" : "Crée ton programme pour commencer"}</Text></View><View style={styles.nextButton}><ChevronRight color="#fff" size={21} /></View>
      </TouchableOpacity>

      <View style={styles.levelCard}><View style={styles.levelOrb}><Text style={styles.levelOrbText}>{ranking?.rank?.charAt(0)?.toUpperCase() ?? "P"}</Text></View><View style={styles.levelCopy}><Text style={styles.levelLabel}>NIVEAU ACTUEL</Text><Text style={styles.levelTitle}>{ranking?.rank ?? "Bronze"}</Text><Text style={styles.levelSmall}>{ranking?.score ?? 0} XP · {rankPercent}% vers le prochain rang</Text></View><Text style={styles.levelXp}>{ranking?.score ?? 0}</Text><View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${rankPercent}%` }]} /></View></View>

      <View style={styles.scoreHeading}><View><Text style={styles.sectionKicker}>PROGRESS+ SCORE</Text><Text style={styles.sectionTitle}>Ta progression réelle</Text></View><TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={styles.seeMore}>Voir plus ›</Text></TouchableOpacity></View>
      <GlobalProgressHero result={globalScore} onPress={() => router.push("/(app)/progress")} />

      <View style={styles.weekHeader}><Text style={styles.sectionTitle}>Cette semaine</Text><Text style={styles.sectionAction}>{weeklyTarget.currentWeek}/{weeklyTarget.targetPerWeek} séances</Text></View>
      <View style={styles.weekGrid}><WeeklyTargetCard completed={weeklyTarget.currentWeek} target={weeklyTarget.targetPerWeek} /><TouchableOpacity style={styles.rankMini} onPress={() => router.push("/(app)/ranking")}><Trophy color={Colors.primaryLight} size={18} /><Text style={styles.rankMiniValue}>#{data?.position ?? "—"}</Text><Text style={styles.rankMiniLabel}>classement global</Text></TouchableOpacity></View>

      <SectionHeader title="Coach Progress+" />
      <TouchableOpacity style={styles.coachCard} activeOpacity={0.9} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}><View style={[styles.coachIcon, { backgroundColor: `${readinessColor}18` }]}><Sparkles color={readinessColor} size={20} /></View><View style={styles.coachContent}><Text style={[styles.coachEyebrow, { color: readinessColor }]}>{coachDecision.eyebrow}</Text><Text style={styles.coachTitle}>{coachDecision.title}</Text><Text style={styles.coachMessage}>{coachDecision.message}</Text><Text style={[styles.coachAction, { color: readinessColor }]}>{coachDecision.action} ›</Text></View></TouchableOpacity>

      <SectionHeader title="Tes performances" action="Voir les stats" />
      <View style={styles.performanceCard}><View style={styles.performanceHero}><View><Text style={styles.performanceKicker}>VOLUME TOTAL</Text><Text style={styles.performanceValue}>{formatVolume(data?.monthVolume ?? 0)}</Text><Text style={[styles.performanceTrend, volumeChange >= 0 ? styles.success : styles.danger]}>{hasComparison ? `${volumeChange >= 0 ? "+" : ""}${volumeChange.toFixed(1)}% vs période précédente` : "Première période"}</Text></View><View style={styles.performanceBadge}><Text style={styles.performanceBadgeValue}>{data?.history?.length ?? 0}</Text><Text style={styles.performanceBadgeLabel}>séances</Text></View></View><View style={styles.miniChart}>{[18,28,40,32,54,46,62].map((height,index)=><View key={index} style={[styles.bar,{height}]} />)}</View><View style={styles.chartLabels}>{["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map((day,index)=><Text key={index} style={styles.dayLabel}>{day}</Text>)}</View></View>

      <View style={styles.recoveryHeader}><Text style={styles.sectionTitle}>Ton état</Text><Text style={styles.recoveryScore}>{recovery ? `${Number(recovery.recovery_score).toLocaleString("fr-FR")}/5` : "—"}</Text></View>
      <View style={styles.recoveryCard}><Metric icon={Moon} label="Sommeil" value={formatScore(recovery?.sleep_score)} /><View style={styles.divider} /><Metric icon={Zap} label="Énergie" value={formatScore(recovery?.energy_score)} /><View style={styles.divider} /><Metric icon={Smile} label="Humeur" value={formatScore(recovery?.mood_score)} /></View>
      <BodySnapshotCard weight={currentBody?.weight_kg ?? null} waist={currentBody?.waist_cm ?? null} waistDelta={bodyDelta?.waist_cm ?? null} onPress={() => router.push("/(app)/body-progress")} />

      <SectionHeader title="Dernier record" />
      {record ? <View style={styles.recordCard}><View style={styles.recordIcon}><Trophy color={Colors.primaryLight} size={19} /></View><View style={{ flex: 1 }}><Text style={styles.recordExercise}>{record.exercises?.name ?? "Exercice"}</Text><Text style={styles.recordDate}>1RM estimé · {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg</Text></View><Text style={styles.recordValue}>{Number(record.weight).toLocaleString("fr-FR")} × {record.reps}</Text></View> : <View style={styles.emptyRecord}><Trophy color={Colors.primary} size={19} /><Text style={styles.emptyRecordText}>Ton premier record apparaîtra après une série enregistrée.</Text></View>}
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#07070A"},container:{paddingHorizontal:18,paddingTop:8,paddingBottom:115,gap:14},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:"#07070A"},loadingText:{color:Colors.textSecondary},header:{paddingTop:4,marginBottom:2},brandLine:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:8},brand:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:2.1},headerRow:{flexDirection:"row",alignItems:"center"},greeting:{color:"#FFFFFF",fontSize:29,fontWeight:"900",letterSpacing:-0.7},subtitle:{color:"#8F8F9D",fontSize:12,marginTop:3},avatar:{width:42,height:42,borderRadius:21,backgroundColor:"#111116",borderWidth:1,borderColor:"#7650E8",alignItems:"center",justifyContent:"center"},avatarText:{color:Colors.primaryLight,fontSize:17,fontWeight:"900"},nextWorkout:{minHeight:86,borderRadius:20,backgroundColor:"#111116",borderWidth:1,borderColor:"#272631",padding:13,flexDirection:"row",alignItems:"center"},nextIcon:{width:42,height:42,borderRadius:14,backgroundColor:"#21143C",alignItems:"center",justifyContent:"center"},nextCopy:{flex:1,marginLeft:11},nextEyebrow:{color:Colors.primaryLight,fontSize:8,fontWeight:"900",letterSpacing:1.2},nextTitle:{color:"#FFFFFF",fontSize:16,fontWeight:"900",marginTop:3},nextMeta:{color:"#858591",fontSize:10,marginTop:3},nextButton:{width:38,height:38,borderRadius:19,backgroundColor:Colors.primary,alignItems:"center",justifyContent:"center",marginLeft:8},levelCard:{minHeight:96,backgroundColor:"#111116",borderRadius:20,borderWidth:1,borderColor:"#24232D",padding:15,flexDirection:"row",alignItems:"center",position:"relative"},levelOrb:{width:54,height:54,borderRadius:27,backgroundColor:"#24143F",borderWidth:1,borderColor:"#774AE7",alignItems:"center",justifyContent:"center"},levelOrbText:{color:Colors.primaryLight,fontSize:22,fontWeight:"900"},levelCopy:{flex:1,marginLeft:12},levelLabel:{color:"#8E879D",fontSize:8,fontWeight:"900",letterSpacing:1.3},levelTitle:{color:"#FFFFFF",fontSize:20,fontWeight:"900",marginTop:2},levelSmall:{color:"#777782",fontSize:9,marginTop:3},levelXp:{color:Colors.primaryLight,fontSize:19,fontWeight:"900",alignSelf:"flex-start"},levelTrack:{position:"absolute",left:15,right:15,bottom:10,height:4,backgroundColor:"#292832",borderRadius:3,overflow:"hidden"},levelFill:{height:"100%",backgroundColor:Colors.primary,borderRadius:3},scoreHeading:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginTop:5},sectionKicker:{color:Colors.primaryLight,fontSize:8,fontWeight:"900",letterSpacing:1.3},sectionTitle:{color:"#FFFFFF",fontSize:17,fontWeight:"900",letterSpacing:-0.2},seeMore:{color:Colors.primaryLight,fontSize:10,fontWeight:"800"},weekHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:4},sectionAction:{color:Colors.primaryLight,fontSize:10,fontWeight:"800"},sectionHeader:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:3},weekGrid:{flexDirection:"row",gap:10},rankMini:{width:105,backgroundColor:"#111116",borderRadius:18,borderWidth:1,borderColor:"#24232D",padding:13,justifyContent:"center"},rankMiniValue:{color:"#FFFFFF",fontSize:25,fontWeight:"900",marginTop:8},rankMiniLabel:{color:"#777782",fontSize:9,marginTop:2},coachCard:{backgroundColor:"#111116",borderRadius:20,borderWidth:1,borderColor:"#282632",padding:15,flexDirection:"row"},coachIcon:{width:43,height:43,borderRadius:14,alignItems:"center",justifyContent:"center"},coachContent:{flex:1,marginLeft:11},coachEyebrow:{fontSize:8,fontWeight:"900",letterSpacing:1.2},coachTitle:{color:"#FFFFFF",fontSize:16,fontWeight:"900",marginTop:3},coachMessage:{color:"#858591",fontSize:11,lineHeight:16,marginTop:4},coachAction:{fontSize:10,fontWeight:"900",marginTop:8},performanceCard:{backgroundColor:"#111116",borderRadius:20,borderWidth:1,borderColor:"#24232D",padding:15},performanceHero:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},performanceKicker:{color:"#8E879D",fontSize:8,fontWeight:"900",letterSpacing:1.2},performanceValue:{color:"#FFFFFF",fontSize:26,fontWeight:"900",marginTop:3},performanceTrend:{fontSize:9,fontWeight:"800",marginTop:2},performanceBadge:{width:54,height:54,borderRadius:15,backgroundColor:"#1B1230",alignItems:"center",justifyContent:"center"},performanceBadgeValue:{color:Colors.primaryLight,fontSize:18,fontWeight:"900"},performanceBadgeLabel:{color:"#777782",fontSize:7,marginTop:1},miniChart:{height:72,marginTop:14,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",paddingHorizontal:4,borderBottomWidth:1,borderBottomColor:"#292832"},bar:{width:20,borderTopLeftRadius:5,borderTopRightRadius:5,backgroundColor:Colors.primary},chartLabels:{flexDirection:"row",justifyContent:"space-between",marginTop:5},dayLabel:{color:"#656570",fontSize:7},recoveryHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:2},recoveryScore:{color:Colors.success,fontSize:11,fontWeight:"900"},recoveryCard:{backgroundColor:"#111116",borderRadius:18,borderWidth:1,borderColor:"#24232D",flexDirection:"row",alignItems:"stretch",paddingVertical:14},metric:{flex:1,alignItems:"center",gap:4},metricValue:{color:"#FFFFFF",fontSize:17,fontWeight:"900"},metricLabel:{color:"#777782",fontSize:9},divider:{width:1,backgroundColor:"#282731"},recordCard:{backgroundColor:"#111116",borderRadius:18,padding:14,borderWidth:1,borderColor:"#24232D",flexDirection:"row",alignItems:"center"},recordIcon:{width:40,height:40,borderRadius:13,backgroundColor:"#21143C",alignItems:"center",justifyContent:"center",marginRight:10},recordExercise:{color:"#FFFFFF",fontSize:14,fontWeight:"800"},recordDate:{color:"#777782",fontSize:9,marginTop:3},recordValue:{color:Colors.success,fontSize:17,fontWeight:"900",marginLeft:8},emptyRecord:{backgroundColor:"#111116",borderRadius:18,padding:15,borderWidth:1,borderColor:"#24232D",flexDirection:"row",alignItems:"center",gap:10},emptyRecordText:{color:"#858591",flex:1,fontSize:11,lineHeight:16},success:{color:Colors.success},danger:{color:Colors.danger}
});
