import { useFocusEffect, router } from "expo-router";
import { Activity, ArrowUpRight, Dumbbell, Moon, Smile, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const BG = "#08080B";
const CARD = "#121218";
const CARD_2 = "#17131F";
const MUTED = "#85818F";

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return <View style={s.metric}><View style={s.metricIcon}><Icon size={16} color={Colors.primaryLight} /></View><View><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View></View>;
}

export default function HomeWeb() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getHomeData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => { if (!user) return; try { setData(await getHomeData(user.id)); } catch (e) { console.log("HOME WEB ERROR =", e); } finally { setLoading(false); } }, [user]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  if (loading && !data) return <SafeAreaView style={s.safe}><View style={s.loading}><ActivityIndicator color={Colors.primary} /><Text style={s.muted}>Chargement de Progress+...</Text></View></SafeAreaView>;

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const ranking = data?.ranking;
  const rankProgress = ranking ? getRankProgress(ranking.score) : null;
  const rankPercent = Math.round((rankProgress?.percent ?? 0) * 100);
  const program = data?.programs?.[0];
  const recovery = data?.recovery;
  const record = data?.records?.[0];
  const globalScore = data?.globalScore ?? { score: null, label: "Pas encore assez de données", available: 0 };
  const score = globalScore.score == null ? 0 : Math.round(Number(globalScore.score));
  const weekly = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4 };
  const volume = Math.round(data?.monthVolume ?? 0);
  const change = data?.volumeChange ?? 0;
  const position = data?.position;

  return <SafeAreaView style={s.safe}>
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />} contentContainerStyle={s.page}>
      <View style={s.shell}>
        <View style={s.topbar}>
          <View><View style={s.brand}><Sparkles size={13} color={Colors.primaryLight} /><Text style={s.brandText}>PROGRESS+</Text></View><Text style={s.greeting}>Bonjour {firstName} <Text style={s.wave}>👋</Text></Text><Text style={s.sub}>Voici où tu en es aujourd’hui.</Text></View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push("/(app)/profile")}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></TouchableOpacity>
        </View>

        <View style={s.heroRow}>
          <TouchableOpacity style={s.hero} activeOpacity={0.9} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
            <View style={s.heroGlow} /><View style={s.heroCopy}><Text style={s.eyebrow}>PROCHAINE SÉANCE</Text><Text style={s.heroTitle}>{program?.name || "Commencer ton entraînement"}</Text><Text style={s.heroMeta}>{program ? "Ton programme est prêt pour aujourd’hui." : "Crée ton programme pour commencer."}</Text><View style={s.heroCta}><Text style={s.heroCtaText}>{program ? "Ouvrir la séance" : "Commencer"}</Text><ArrowUpRight size={17} color="#FFF" /></View></View><View style={s.heroIcon}><Dumbbell size={27} color={Colors.primaryLight} /></View>
          </TouchableOpacity>
          <View style={s.levelCard}><Text style={s.eyebrow}>TON NIVEAU</Text><View style={s.levelTop}><View><Text style={s.level}>{ranking?.rank ?? "Bronze"}</Text><Text style={s.muted}>{ranking?.score ?? 0} XP</Text></View><Text style={s.levelScore}>{rankPercent}%</Text></View><View style={s.track}><View style={[s.fill, { width: `${rankPercent}%` }]} /></View><Text style={s.muted}>{rankPercent}% vers le prochain rang</Text></View>
        </View>

        <View style={s.sectionHead}><View><Text style={s.eyebrow}>PROGRESS+ SCORE</Text><Text style={s.sectionTitle}>Ta progression réelle</Text></View><TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={s.link}>Voir l’analyse →</Text></TouchableOpacity></View>
        <TouchableOpacity style={s.scoreCard} onPress={() => router.push("/(app)/progress")}>
          <View style={s.scoreCircle}><Text style={s.score}>{score || "—"}</Text><Text style={s.scoreUnit}>/100</Text></View>
          <View style={s.scoreMain}><View style={s.scoreLine}><View><Text style={s.scoreTitle}>{globalScore.label}</Text><Text style={s.muted}>{globalScore.available ?? 0} indicateurs analysés</Text></View><Text style={s.scoreBig}>{score || "—"}</Text></View><View style={s.miniTrack}><View style={[s.fill, { width: `${Math.min(100, score)}%` }]} /></View><View style={s.pillRow}><View style={s.pill}><Text style={s.pillLabel}>Corps</Text><Text style={s.pillValue}>50</Text></View><View style={s.pill}><Text style={s.pillLabel}>Performance</Text><Text style={s.pillValue}>97</Text></View><View style={s.pill}><Text style={s.pillLabel}>Récupération</Text><Text style={s.pillValue}>{recovery ? Math.round(Number(recovery.recovery_score) * 20) : "—"}</Text></View><View style={s.pill}><Text style={s.pillLabel}>Régularité</Text><Text style={s.pillValue}>100</Text></View></View></View>
        </TouchableOpacity>

        <View style={s.grid}>
          <View style={s.panel}><View style={s.sectionHead}><Text style={s.sectionTitle}>Cette semaine</Text><Text style={s.muted}>{weekly.currentWeek}/{weekly.targetPerWeek} séances</Text></View><Text style={s.bigNumber}>{weekly.currentWeek}<Text style={s.bigUnit}> / {weekly.targetPerWeek}</Text></Text><Text style={s.muted}>séances réalisées</Text><View style={s.weekTrack}>{Array.from({ length: weekly.targetPerWeek }).map((_, i) => <View key={i} style={[s.weekDot, i < weekly.currentWeek && s.weekDotOn]} />)}</View></View>
          <TouchableOpacity style={[s.panel, s.rankPanel]} onPress={() => router.push("/(app)/ranking")}><Trophy size={20} color={Colors.primaryLight} /><Text style={s.rankNumber}>#{position ?? "—"}</Text><Text style={s.muted}>classement global</Text><Text style={s.link}>Voir le classement →</Text></TouchableOpacity>
          <View style={s.panel}><View style={s.sectionHead}><View><Text style={s.eyebrow}>ANALYTICS</Text><Text style={s.sectionTitle}>Tes performances</Text></View><Text style={s.muted}>{data?.history?.length ?? 0} séances</Text></View><Text style={s.volume}>{volume.toLocaleString("fr-FR")} <Text style={s.volumeUnit}>kg</Text></Text><Text style={[s.change, change >= 0 ? s.good : s.bad]}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% vs période précédente</Text><View style={s.chart}>{[28, 42, 34, 58, 46, 67, 54, 78].map((h, i) => <View key={i} style={[s.bar, { height: h, opacity: 0.35 + i * 0.08 }]} />)}</View></View>
          <View style={s.panel}><View style={s.sectionHead}><Text style={s.sectionTitle}>Récupération</Text><Text style={s.muted}>{recovery ? `${Number(recovery.recovery_score).toLocaleString("fr-FR")}/5` : "—"}</Text></View><View style={s.metrics}><Metric icon={Moon} label="Sommeil" value={recovery?.sleep_score == null ? "—" : `${Math.round(Number(recovery.sleep_score) * 2)}/10`} /><Metric icon={Zap} label="Énergie" value={recovery?.energy_score == null ? "—" : `${Math.round(Number(recovery.energy_score) * 2)}/10`} /><Metric icon={Smile} label="Humeur" value={recovery?.mood_score == null ? "—" : `${Math.round(Number(recovery.mood_score) * 2)}/10`} /></View></View>
        </View>

        <View style={s.coach}><View style={s.coachAccent} /><View style={s.coachIcon}><Sparkles size={19} color={Colors.primaryLight} /></View><View style={{ flex: 1 }}><Text style={s.eyebrow}>COACH PROGRESS+</Text><Text style={s.coachTitle}>{recovery ? "Feu vert pour progresser" : "Ton prochain niveau commence ici"}</Text><Text style={s.coachText}>{recovery ? "Ta récupération est prise en compte. Cherche une progression contrôlée aujourd’hui, sans sacrifier ta technique." : "Fais ton check-in pour que Progress+ puisse personnaliser tes recommandations."}</Text></View><ArrowUpRight size={19} color={Colors.primaryLight} /></View>

        <View style={s.sectionHead}><View><Text style={s.eyebrow}>RECORD</Text><Text style={s.sectionTitle}>Dernière performance</Text></View><TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={s.link}>Tout voir →</Text></TouchableOpacity></View>
        {record ? <View style={s.record}><View style={s.recordIcon}><Trophy size={18} color={Colors.primaryLight} /></View><View style={{ flex: 1 }}><Text style={s.scoreTitle}>{record.exercises?.name ?? "Exercice"}</Text><Text style={s.muted}>1RM estimé · {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg</Text></View><Text style={s.recordValue}>{Number(record.weight).toLocaleString("fr-FR")} × {record.reps}</Text></View> : <View style={s.record}><Trophy size={18} color={Colors.primaryLight} /><Text style={s.muted}>Ton premier record apparaîtra ici.</Text></View>}
      </View>
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG}, page:{paddingBottom:110}, shell:{width:"100%",maxWidth:1180,alignSelf:"center",paddingHorizontal:28,paddingTop:16}, loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:BG}, muted:{color:MUTED,fontSize:12}, topbar:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingBottom:22}, brand:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:8}, brandText:{color:Colors.primaryLight,fontSize:10,fontWeight:"900",letterSpacing:2.6}, greeting:{color:"#FFF",fontSize:32,fontWeight:"900",letterSpacing:-1.2}, wave:{fontSize:25}, sub:{color:MUTED,fontSize:12,marginTop:4}, avatar:{width:46,height:46,borderRadius:23,backgroundColor:CARD,borderWidth:1,borderColor:"#5C3B8B",alignItems:"center",justifyContent:"center"}, avatarText:{color:Colors.primaryLight,fontSize:17,fontWeight:"900"}, heroRow:{flexDirection:"row",gap:14,marginBottom:24}, hero:{flex:1,minHeight:205,borderRadius:25,backgroundColor:CARD_2,borderWidth:1,borderColor:"#3A2B4D",overflow:"hidden",padding:25,justifyContent:"center",position:"relative"}, heroGlow:{position:"absolute",width:280,height:280,borderRadius:140,right:-75,top:-100,backgroundColor:"#291448",opacity:.9}, heroCopy:{zIndex:2}, eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.8,marginBottom:6}, heroTitle:{color:"#FFF",fontSize:27,fontWeight:"900",letterSpacing:-.8}, heroMeta:{color:MUTED,fontSize:12,marginTop:5}, heroCta:{flexDirection:"row",alignItems:"center",gap:6,marginTop:19}, heroCtaText:{color:"#FFF",fontSize:12,fontWeight:"900"}, heroIcon:{position:"absolute",right:24,bottom:24,width:58,height:58,borderRadius:20,backgroundColor:"#24143D",borderWidth:1,borderColor:"#6942A5",alignItems:"center",justifyContent:"center"}, levelCard:{width:285,minHeight:205,borderRadius:25,backgroundColor:CARD,borderWidth:1,borderColor:"#292630",padding:23,justifyContent:"space-between"}, levelTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginTop:8}, level:{color:"#FFF",fontSize:30,fontWeight:"900"}, levelScore:{color:Colors.primaryLight,fontSize:30,fontWeight:"900"}, track:{height:6,borderRadius:6,backgroundColor:"#292731",overflow:"hidden",marginVertical:10}, fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:6}, sectionHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12},sectionTitle:{color:"#FFF",fontSize:20,fontWeight:"900",letterSpacing:-.5},link:{color:Colors.primaryLight,fontSize:11,fontWeight:"900"},scoreCard:{flexDirection:"row",alignItems:"center",gap:24,minHeight:205,borderRadius:25,backgroundColor:CARD,borderWidth:1,borderColor:"#3A2A50",padding:22,marginBottom:22},scoreCircle:{width:128,height:128,borderRadius:64,borderWidth:9,borderColor:"#392450",backgroundColor:"#19141F",alignItems:"center",justifyContent:"center"},score:{color:"#FFF",fontSize:38,fontWeight:"900"},scoreUnit:{color:MUTED,fontSize:10,fontWeight:"800"},scoreMain:{flex:1},scoreLine:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},scoreTitle:{color:"#FFF",fontSize:16,fontWeight:"900"},scoreBig:{color:Colors.primaryLight,fontSize:31,fontWeight:"900"},miniTrack:{height:6,borderRadius:6,backgroundColor:"#292731",overflow:"hidden",marginTop:16},pillRow:{flexDirection:"row",gap:10,marginTop:18},pill:{flex:1,borderRadius:12,borderWidth:1,borderColor:"#2A2831",backgroundColor:"#0D0D11",padding:10},pillLabel:{color:MUTED,fontSize:9},pillValue:{color:"#FFF",fontSize:16,fontWeight:"900",marginTop:2},grid:{flexDirection:"row",flexWrap:"wrap",gap:14},panel:{width:"calc(50% - 7px)" as any,minHeight:170,borderRadius:23,backgroundColor:CARD,borderWidth:1,borderColor:"#292630",padding:20},rankPanel:{backgroundColor:"#171220",borderColor:"#402A59"},bigNumber:{color:"#FFF",fontSize:48,fontWeight:"900",marginTop:12},bigUnit:{color:MUTED,fontSize:18},weekTrack:{flexDirection:"row",gap:8,marginTop:22},weekDot:{width:24,height:6,borderRadius:4,backgroundColor:"#2A2831"},weekDotOn:{backgroundColor:Colors.primary},rankNumber:{color:"#FFF",fontSize:40,fontWeight:"900",marginTop:8},volume:{color:"#FFF",fontSize:34,fontWeight:"900",marginTop:3},volumeUnit:{color:MUTED,fontSize:13},change:{fontSize:10,fontWeight:"800",marginTop:2},good:{color:Colors.success},bad:{color:Colors.danger},chart:{height:62,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#2A2831",marginTop:14,paddingHorizontal:4},bar:{width:22,borderTopLeftRadius:5,borderTopRightRadius:5,backgroundColor:Colors.primary},metrics:{flexDirection:"row",gap:12,marginTop:15},metric:{flex:1,flexDirection:"row",alignItems:"center",gap:9,borderRadius:15,backgroundColor:"#0D0D11",borderWidth:1,borderColor:"#28262D",padding:11},metricIcon:{width:30,height:30,borderRadius:9,backgroundColor:"#211632",alignItems:"center",justifyContent:"center"},metricValue:{color:"#FFF",fontSize:15,fontWeight:"900"},metricLabel:{color:MUTED,fontSize:8,marginTop:2},coach:{marginTop:14,marginBottom:24,borderRadius:23,backgroundColor:CARD_2,borderWidth:1,borderColor:"#3A2A4E",padding:20,flexDirection:"row",alignItems:"center",gap:15,overflow:"hidden"},coachAccent:{position:"absolute",left:0,top:0,bottom:0,width:4,backgroundColor:Colors.primary},coachIcon:{width:45,height:45,borderRadius:15,backgroundColor:"#211532",alignItems:"center",justifyContent:"center"},coachTitle:{color:"#FFF",fontSize:17,fontWeight:"900",marginBottom:4},coachText:{color:MUTED,fontSize:11,lineHeight:17,maxWidth:760},record:{borderRadius:20,backgroundColor:CARD,borderWidth:1,borderColor:"#292630",padding:16,flexDirection:"row",alignItems:"center",gap:12},recordIcon:{width:45,height:45,borderRadius:14,backgroundColor:"#211532",alignItems:"center",justifyContent:"center"},recordValue:{color:Colors.success,fontSize:16,fontWeight:"900"}
});
