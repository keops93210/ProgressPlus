import { useFocusEffect, router } from "expo-router";
import { ArrowUpRight, Dumbbell, Moon, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const BG = "#08080B";
const CARD = "#121218";
const PURPLE_CARD = "#171220";
const LINE = "#292630";
const MUTED = "#85818F";

export default function HomeV03() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 700;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try { setData(await getHomeData(user.id)); }
    catch (error) { console.log("HOME V03 ERROR =", error); }
    finally { setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  if (loading && !data) return <SafeAreaView style={s.safe}><View style={s.loading}><ActivityIndicator color={Colors.primary}/><Text style={s.muted}>Chargement de Progress+...</Text></View></SafeAreaView>;

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || "toi";
  const ranking = data?.ranking;
  const progress = Math.round((ranking ? getRankProgress(ranking.score)?.percent : 0) * 100);
  const program = data?.programs?.[0];
  const recovery = data?.recovery;
  const score = data?.globalScore?.score == null ? null : Math.round(Number(data.globalScore.score));
  const weekly = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4 };
  const position = data?.position;
  const volume = Math.round(data?.monthVolume ?? 0);
  const change = Number(data?.volumeChange ?? 0);

  return <SafeAreaView style={s.safe}>
    <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary}/>} contentContainerStyle={s.scroll}>
      <View style={s.shell}>
        <View style={s.header}>
          <View><View style={s.brand}><Sparkles size={13} color={Colors.primaryLight}/><Text style={s.brandText}>PROGRESS+</Text></View><Text style={s.greeting}>Bonjour {firstName} <Text style={s.wave}>👋</Text></Text><Text style={s.subtitle}>Voici où tu en es aujourd’hui.</Text></View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push("/(app)/profile")}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></TouchableOpacity>
        </View>

        <View style={[s.topGrid, !wide && s.stack]}>
          <TouchableOpacity style={s.hero} activeOpacity={0.92} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
            <View style={s.glow}/><View style={s.heroContent}><Text style={s.eyebrow}>PROCHAINE SÉANCE</Text><Text style={s.heroTitle}>{program?.name || "Commencer ton entraînement"}</Text><Text style={s.heroText}>{program ? "Ton programme est prêt pour aujourd’hui." : "Crée ton programme pour commencer."}</Text><View style={s.cta}><Text style={s.ctaText}>{program ? "Ouvrir la séance" : "Commencer"}</Text><ArrowUpRight size={16} color="#FFF"/></View></View><View style={s.heroIcon}><Dumbbell size={25} color={Colors.primaryLight}/></View>
          </TouchableOpacity>

          <View style={s.level}>
            <View style={s.row}><Text style={s.eyebrow}>TON NIVEAU</Text><Text style={s.xp}>{ranking?.score ?? 0} XP</Text></View>
            <Text style={s.levelName}>{ranking?.rank ?? "Bronze"}</Text>
            <View style={[s.row, { marginTop: 16 }]}><Text style={s.muted}>{progress}% vers le prochain rang</Text><Text style={s.percent}>{progress}%</Text></View>
            <View style={s.track}><View style={[s.fill, { width: `${Math.min(100, progress)}%` }]}/></View>
            <Text style={s.rank}>#{position ?? "—"} global</Text>
          </View>
        </View>

        <View style={s.section}><View><Text style={s.eyebrow}>PROGRESS+ SCORE</Text><Text style={s.sectionTitle}>Ta progression réelle</Text></View><TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={s.link}>Détails →</Text></TouchableOpacity></View>
        <TouchableOpacity style={s.scoreCard} onPress={() => router.push("/(app)/progress")}>
          <View style={s.scoreCircle}><Text style={s.score}>{score ?? "—"}</Text><Text style={s.scoreUnit}>/100</Text></View>
          <View style={s.scoreBody}><View style={s.row}><View><Text style={s.cardTitle}>{data?.globalScore?.label || "Pas encore assez de données"}</Text><Text style={s.muted}>{data?.globalScore?.available ?? 0} indicateurs analysés</Text></View><Text style={s.scoreBig}>{score ?? "—"}</Text></View><View style={s.track}><View style={[s.fill, { width: `${Math.min(100, score ?? 0)}%` }]}/></View><View style={s.metrics}><Metric label="Corps" value="50"/><Metric label="Performance" value="97"/><Metric label="Récupération" value={recovery ? String(Math.round(Number(recovery.recovery_score) * 20)) : "—"}/><Metric label="Régularité" value="100"/></View></View>
        </TouchableOpacity>

        <View style={s.section}><Text style={s.sectionTitle}>Cette semaine</Text><Text style={s.muted}>{weekly.currentWeek}/{weekly.targetPerWeek} séances</Text></View>
        <View style={[s.grid, !wide && s.stack]}>
          <View style={s.card}><Text style={s.eyebrow}>OBJECTIF</Text><Text style={s.big}>{weekly.currentWeek}<Text style={s.bigUnit}> / {weekly.targetPerWeek}</Text></Text><Text style={s.muted}>séances réalisées</Text><View style={s.dots}>{Array.from({ length: weekly.targetPerWeek }).map((_: any, i: number) => <View key={i} style={[s.dot, i < weekly.currentWeek && s.dotOn]}/>)}</View></View>
          <TouchableOpacity style={[s.card, s.rankCard]} onPress={() => router.push("/(app)/ranking")}><Trophy size={21} color={Colors.primaryLight}/><Text style={s.rankBig}>#{position ?? "—"}</Text><Text style={s.muted}>classement global</Text><Text style={s.link}>Voir le classement →</Text></TouchableOpacity>
          <View style={s.card}><View style={s.row}><View><Text style={s.eyebrow}>ANALYTICS</Text><Text style={s.cardTitle}>Tes performances</Text></View><Text style={s.muted}>{data?.history?.length ?? 0} séances</Text></View><Text style={s.volume}>{volume.toLocaleString("fr-FR")} <Text style={s.volumeUnit}>kg</Text></Text><Text style={[s.change, change >= 0 ? s.good : s.bad]}>{change >= 0 ? "+" : ""}{change.toFixed(1)}% vs période précédente</Text><View style={s.chart}>{[25,42,32,55,44,65,50,74].map((h, i) => <View key={i} style={[s.bar, { height: h, opacity: 0.35 + i * 0.08 }]}/>)}</View></View>
          <View style={s.card}><View style={s.row}><View><Text style={s.eyebrow}>RÉCUPÉRATION</Text><Text style={s.cardTitle}>État du jour</Text></View><Text style={s.recovery}>{recovery ? `${Number(recovery.recovery_score).toLocaleString("fr-FR")}/5` : "—"}</Text></View><View style={s.recoveryGrid}><Mini icon={<Moon size={16} color={Colors.primaryLight}/>} label="Sommeil" value={recovery?.sleep_score == null ? "—" : `${Math.round(Number(recovery.sleep_score) * 2)}/10`}/><Mini icon={<Zap size={16} color={Colors.primaryLight}/>} label="Énergie" value={recovery?.energy_score == null ? "—" : `${Math.round(Number(recovery.energy_score) * 2)}/10`}/><Mini icon={<Sparkles size={16} color={Colors.primaryLight}/>} label="Humeur" value={recovery?.mood_score == null ? "—" : `${Math.round(Number(recovery.mood_score) * 2)}/10`}/></View></View>
        </View>

        <View style={s.coach}><View style={s.coachIcon}><Sparkles size={19} color={Colors.primaryLight}/></View><View style={s.coachBody}><Text style={s.eyebrow}>COACH PROGRESS+</Text><Text style={s.coachTitle}>{recovery ? "Feu vert pour progresser" : "Ton prochain niveau commence ici"}</Text><Text style={s.coachText}>{recovery ? "Ta récupération est prise en compte. Cherche une progression contrôlée aujourd’hui, sans sacrifier ta technique." : "Fais ton check-in pour que Progress+ puisse personnaliser tes recommandations."}</Text></View><ArrowUpRight size={19} color={Colors.primaryLight}/></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

function Metric({ label, value }: { label: string; value: string }) { return <View style={s.metric}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricValue}>{value}</Text></View>; }
function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <View style={s.mini}><View style={s.miniIcon}>{icon}</View><Text style={s.miniValue}>{value}</Text><Text style={s.miniLabel}>{label}</Text></View>; }

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},scroll:{paddingBottom:120},shell:{width:"94%",maxWidth:1280,alignSelf:"center",paddingTop:24},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:BG},
  header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:28},brand:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:8},brandText:{color:Colors.primaryLight,fontSize:10,fontWeight:"900",letterSpacing:2.5},greeting:{color:"#FFF",fontSize:32,fontWeight:"900",letterSpacing:-1.2},wave:{fontSize:23},subtitle:{color:MUTED,fontSize:12,marginTop:5},avatar:{width:46,height:46,borderRadius:23,backgroundColor:CARD,borderWidth:1,borderColor:"#6942A5",alignItems:"center",justifyContent:"center"},avatarText:{color:Colors.primaryLight,fontSize:17,fontWeight:"900"},
  topGrid:{flexDirection:"row",gap:16,marginBottom:30},stack:{flexDirection:"column"},hero:{flex:1,minHeight:215,borderRadius:26,backgroundColor:PURPLE_CARD,borderWidth:1,borderColor:"#4B3165",padding:28,justifyContent:"center",overflow:"hidden",position:"relative"},glow:{position:"absolute",right:-90,top:-120,width:340,height:340,borderRadius:170,backgroundColor:"#2A1648"},heroContent:{zIndex:2},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.8,marginBottom:7},heroTitle:{color:"#FFF",fontSize:30,fontWeight:"900",letterSpacing:-.9},heroText:{color:MUTED,fontSize:12,marginTop:6},cta:{flexDirection:"row",alignItems:"center",gap:6,marginTop:20},ctaText:{color:"#FFF",fontSize:12,fontWeight:"900"},heroIcon:{position:"absolute",right:25,bottom:25,width:58,height:58,borderRadius:19,backgroundColor:"#24143D",borderWidth:1,borderColor:"#7448B0",alignItems:"center",justifyContent:"center"},
  level:{width:310,minHeight:215,borderRadius:26,backgroundColor:CARD,borderWidth:1,borderColor:LINE,padding:25,justifyContent:"space-between"},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},xp:{color:MUTED,fontSize:11,fontWeight:"800"},levelName:{color:"#FFF",fontSize:34,fontWeight:"900",marginTop:8},percent:{color:Colors.primaryLight,fontSize:20,fontWeight:"900"},track:{height:7,borderRadius:7,backgroundColor:"#2A2932",overflow:"hidden",marginTop:8},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:7},rank:{color:MUTED,fontSize:10,fontWeight:"800",marginTop:10},muted:{color:MUTED,fontSize:11,fontWeight:"700"},
  section:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12},sectionTitle:{color:"#FFF",fontSize:21,fontWeight:"900",letterSpacing:-.5},link:{color:Colors.primaryLight,fontSize:11,fontWeight:"900"},scoreCard:{flexDirection:"row",alignItems:"center",gap:25,minHeight:205,borderRadius:26,backgroundColor:CARD,borderWidth:1,borderColor:"#4B3165",padding:24,marginBottom:30},scoreCircle:{width:128,height:128,borderRadius:64,borderWidth:9,borderColor:"#392450",backgroundColor:"#19141F",alignItems:"center",justifyContent:"center"},score:{color:"#FFF",fontSize:39,fontWeight:"900"},scoreUnit:{color:MUTED,fontSize:10,fontWeight:"800"},scoreBody:{flex:1},cardTitle:{color:"#FFF",fontSize:16,fontWeight:"900"},scoreBig:{color:Colors.primaryLight,fontSize:34,fontWeight:"900"},metrics:{flexDirection:"row",gap:10,marginTop:18},metric:{flex:1,borderRadius:12,borderWidth:1,borderColor:LINE,backgroundColor:"#0D0D11",padding:11},metricLabel:{color:MUTED,fontSize:9,fontWeight:"700"},metricValue:{color:"#FFF",fontSize:17,fontWeight:"900",marginTop:2},
  grid:{flexDirection:"row",flexWrap:"wrap",gap:16},card:{width:"calc(50% - 8px)" as any,minHeight:178,borderRadius:23,backgroundColor:CARD,borderWidth:1,borderColor:LINE,padding:21},rankCard:{backgroundColor:PURPLE_CARD,borderColor:"#4B3165"},big:{color:"#FFF",fontSize:44,fontWeight:"900",marginTop:5},bigUnit:{color:MUTED,fontSize:14},dots:{flexDirection:"row",gap:7,marginTop:20},dot:{height:6,flex:1,borderRadius:5,backgroundColor:"#2A2932"},dotOn:{backgroundColor:Colors.primary},rankBig:{color:"#FFF",fontSize:34,fontWeight:"900",marginTop:12},volume:{color:"#FFF",fontSize:30,fontWeight:"900",marginTop:11},volumeUnit:{color:MUTED,fontSize:11},change:{fontSize:10,fontWeight:"800",marginTop:2},good:{color:Colors.success},bad:{color:Colors.danger},chart:{height:70,flexDirection:"row",alignItems:"flex-end",gap:9,marginTop:13,borderBottomWidth:1,borderBottomColor:LINE},bar:{flex:1,minHeight:7,backgroundColor:Colors.primary,borderTopLeftRadius:5,borderTopRightRadius:5},recovery:{color:Colors.primaryLight,fontSize:15,fontWeight:"900"},recoveryGrid:{flexDirection:"row",gap:8,marginTop:20},mini:{flex:1,alignItems:"center"},miniIcon:{width:38,height:38,borderRadius:12,backgroundColor:"#21163A",alignItems:"center",justifyContent:"center",marginBottom:7},miniValue:{color:"#FFF",fontSize:13,fontWeight:"900"},miniLabel:{color:MUTED,fontSize:9,marginTop:2},
  coach:{marginTop:24,marginBottom:30,minHeight:112,borderRadius:23,backgroundColor:CARD,borderWidth:1,borderColor:"#4B3165",padding:20,flexDirection:"row",alignItems:"center",gap:14},coachIcon:{width:46,height:46,borderRadius:14,backgroundColor:"#21163A",alignItems:"center",justifyContent:"center"},coachBody:{flex:1},coachTitle:{color:"#FFF",fontSize:18,fontWeight:"900",marginBottom:5},coachText:{color:MUTED,fontSize:11,lineHeight:17},
});
