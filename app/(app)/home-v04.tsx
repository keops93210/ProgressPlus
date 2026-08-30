import { router } from "expo-router";
import { Activity, ArrowUpRight, Dumbbell, Moon, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const BG = "#07070A";
const CARD = "#111116";
const CARD2 = "#15101F";
const LINE = "#2A2632";
const MUTED = "#85808F";

export default function HomeV04() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const wide = Platform.OS === "web" || width >= 760;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    if (!user) return;
    try { setData(await getHomeData(user.id)); } catch (e) { console.log("HOME V04", e); } finally { setLoading(false); }
  }, [user]);
  useEffect(() => { load(); }, [load]);
  if (loading && !data) return <SafeAreaView style={s.safe}><View style={s.center}><ActivityIndicator color={Colors.primary}/><Text style={s.muted}>Chargement de Progress+...</Text></View></SafeAreaView>;

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || "toi";
  const ranking = data?.ranking;
  const score = data?.globalScore?.score == null ? 75 : Math.round(Number(data.globalScore.score));
  const rankProgress = Math.round((getRankProgress(ranking?.score || 725)?.percent || 0) * 100);
  const weekly = data?.consistency || { currentWeek: 6, targetPerWeek: 4 };
  const position = data?.position ?? 1;
  const recovery = data?.recovery;
  const volume = Math.round(data?.monthVolume ?? 0);

  return <SafeAreaView style={s.safe}>
    <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} tintColor={Colors.primary}/>} showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <View style={[s.page, wide && s.pageWide]}>
        <View style={s.header}>
          <View><View style={s.brand}><Sparkles size={12} color={Colors.primaryLight}/><Text style={s.brandText}>PROGRESS+</Text></View><Text style={s.greeting}>Bonjour {firstName} 👋</Text><Text style={s.subtitle}>Voici où tu en es aujourd’hui.</Text></View>
          <TouchableOpacity style={s.avatar} onPress={() => router.push("/(app)/profile")}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></TouchableOpacity>
        </View>

        <View style={[s.heroGrid, !wide && s.column]}>
          <TouchableOpacity activeOpacity={0.9} style={s.hero} onPress={() => router.push("/(app)/program") }>
            <View style={s.heroOrb}/><View style={s.heroCopy}><Text style={s.eyebrow}>PROCHAINE SÉANCE</Text><Text style={s.heroTitle}>{data?.programs?.[0]?.name || "Ta prochaine séance"}</Text><Text style={s.heroSub}>Ton programme est prêt. Passe à l’action.</Text><View style={s.open}><Text style={s.openText}>Ouvrir la séance</Text><ArrowUpRight size={16} color="#FFF"/></View></View><View style={s.heroBadge}><Dumbbell size={25} color={Colors.primaryLight}/></View>
          </TouchableOpacity>
          <View style={s.levelCard}><View style={s.levelTop}><Text style={s.eyebrow}>TON NIVEAU</Text><Text style={s.xp}>{ranking?.score ?? 725} XP</Text></View><Text style={s.level}>{ranking?.rank || "Bronze"}</Text><View style={s.levelMeta}><Text style={s.muted}>{rankProgress}% vers le prochain rang</Text><Text style={s.purple}>{rankProgress}%</Text></View><View style={s.track}><View style={[s.fill,{width:`${Math.min(100,rankProgress)}%`}]}/></View><Text style={s.muted}>#{position} global</Text></View>
        </View>

        <View style={s.sectionHead}><View><Text style={s.eyebrow}>PROGRESS+ SCORE</Text><Text style={s.sectionTitle}>Ta progression réelle</Text></View><Text style={s.link}>Détails →</Text></View>
        <TouchableOpacity style={[s.scoreCard, !wide && s.column]} onPress={() => router.push("/(app)/progress")}>
          <View style={s.scoreRing}><Text style={s.score}>{score}</Text><Text style={s.scoreUnit}>/100</Text></View>
          <View style={s.scoreMain}><View style={s.levelTop}><View><Text style={s.cardTitle}>{data?.globalScore?.label || "Bonne progression"}</Text><Text style={s.muted}>{data?.globalScore?.available ?? 4} indicateurs analysés</Text></View><Text style={s.scoreRight}>{score}</Text></View><View style={s.track}><View style={[s.fill,{width:`${score}%`}]}/></View><View style={s.metrics}><Metric label="Corps" value="50"/><Metric label="Performance" value="97"/><Metric label="Récupération" value={recovery ? "80" : "—"}/><Metric label="Régularité" value="100"/></View></View>
        </TouchableOpacity>

        <View style={s.sectionHead}><Text style={s.sectionTitle}>Cette semaine</Text><Text style={s.muted}>{weekly.currentWeek}/{weekly.targetPerWeek} séances</Text></View>
        <View style={[s.cards, !wide && s.column]}>
          <StatCard eyebrow="OBJECTIF" big={`${weekly.currentWeek}`} suffix={` / ${weekly.targetPerWeek}`} text="séances réalisées" icon={<Activity size={18} color={Colors.primaryLight}/>} />
          <TouchableOpacity style={[s.smallCard,s.purpleCard]} onPress={() => router.push("/(app)/ranking")}><Trophy size={19} color={Colors.primaryLight}/><Text style={s.rankBig}>#{position}</Text><Text style={s.muted}>classement global</Text><Text style={s.link}>Voir le classement →</Text></TouchableOpacity>
          <View style={s.smallCard}><Text style={s.eyebrow}>ANALYTICS</Text><Text style={s.cardTitle}>Volume mensuel</Text><Text style={s.volume}>{volume.toLocaleString("fr-FR")} <Text style={s.volumeUnit}>kg</Text></Text><Text style={s.good}>Progression suivie</Text><View style={s.miniBars}>{[25,38,31,52,45,65,58,78].map((h,i)=><View key={i} style={[s.bar,{height:h,opacity:.35+i*.08}]}/>)}</View></View>
          <View style={s.smallCard}><View style={s.levelTop}><View><Text style={s.eyebrow}>RÉCUPÉRATION</Text><Text style={s.cardTitle}>État du jour</Text></View><Text style={s.purple}>{recovery ? `${Number(recovery.recovery_score).toFixed(1)}/5` : "—"}</Text></View><View style={s.recovery}><Mini icon={<Moon size={15} color={Colors.primaryLight}/>} label="Sommeil" value={recovery?.sleep_score == null ? "—" : `${Math.round(Number(recovery.sleep_score)*2)}/10`}/><Mini icon={<Zap size={15} color={Colors.primaryLight}/>} label="Énergie" value={recovery?.energy_score == null ? "—" : `${Math.round(Number(recovery.energy_score)*2)}/10`}/><Mini icon={<Sparkles size={15} color={Colors.primaryLight}/>} label="Humeur" value={recovery?.mood_score == null ? "—" : `${Math.round(Number(recovery.mood_score)*2)}/10`}/></View></View>
        </View>

        <View style={s.coach}><View style={s.coachIcon}><Sparkles size={19} color={Colors.primaryLight}/></View><View style={s.coachText}><Text style={s.eyebrow}>COACH PROGRESS+</Text><Text style={s.cardTitle}>Continue comme ça.</Text><Text style={s.muted}>La régularité crée les résultats. Ta prochaine séance compte.</Text></View><ArrowUpRight size={18} color={Colors.primaryLight}/></View>
      </View>
    </ScrollView>
  </SafeAreaView>;
}

function Metric({label,value}:{label:string;value:string}) { return <View style={s.metric}><Text style={s.metricLabel}>{label}</Text><Text style={s.metricValue}>{value}</Text></View>; }
function Mini({icon,label,value}:{icon:React.ReactNode;label:string;value:string}) { return <View style={s.mini}>{icon}<Text style={s.miniValue}>{value}</Text><Text style={s.miniLabel}>{label}</Text></View>; }
function StatCard({eyebrow,big,suffix,text,icon}:{eyebrow:string;big:string;suffix:string;text:string;icon:React.ReactNode}) { return <View style={s.smallCard}>{icon}<Text style={s.eyebrow}>{eyebrow}</Text><Text style={s.big}>{big}<Text style={s.bigSuffix}>{suffix}</Text></Text><Text style={s.muted}>{text}</Text><View style={s.dots}>{[0,1,2,3].map(i=><View key={i} style={[s.dot,i<4&&s.dotOn]}/>)}</View></View>; }

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:BG},scroll:{paddingBottom:120},center:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:BG},page:{width:"94%",alignSelf:"center",paddingTop:22},pageWide:{maxWidth:1500},header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:24},brand:{flexDirection:"row",alignItems:"center",gap:5,marginBottom:7},brandText:{color:Colors.primaryLight,fontSize:10,fontWeight:"900",letterSpacing:2.5},greeting:{color:"#FFF",fontSize:30,fontWeight:"900",letterSpacing:-1},subtitle:{color:MUTED,fontSize:12,marginTop:4},avatar:{width:44,height:44,borderRadius:22,borderWidth:1,borderColor:"#6D43A7",backgroundColor:CARD,alignItems:"center",justifyContent:"center"},avatarText:{color:Colors.primaryLight,fontSize:16,fontWeight:"900"},heroGrid:{flexDirection:"row",gap:16,marginBottom:28},column:{flexDirection:"column"},hero:{flex:1,minHeight:218,borderRadius:26,borderWidth:1,borderColor:"#4C3267",backgroundColor:CARD2,padding:28,justifyContent:"center",overflow:"hidden",position:"relative"},heroOrb:{position:"absolute",right:-70,top:-120,width:340,height:340,borderRadius:170,backgroundColor:"#2B174B"},heroCopy:{zIndex:2},eyebrow:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:1.8,marginBottom:6},heroTitle:{color:"#FFF",fontSize:29,fontWeight:"900"},heroSub:{color:MUTED,fontSize:12,marginTop:5},open:{flexDirection:"row",alignItems:"center",gap:6,marginTop:19},openText:{color:"#FFF",fontSize:12,fontWeight:"900"},heroBadge:{position:"absolute",right:26,bottom:25,width:58,height:58,borderRadius:20,borderWidth:1,borderColor:"#7449B0",backgroundColor:"#24153D",alignItems:"center",justifyContent:"center"},levelCard:{width:310,minHeight:218,borderRadius:26,borderWidth:1,borderColor:LINE,backgroundColor:CARD,padding:24,justifyContent:"space-between"},levelTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},xp:{color:MUTED,fontSize:11,fontWeight:"800"},level:{color:"#FFF",fontSize:34,fontWeight:"900",marginTop:7},levelMeta:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:14},purple:{color:Colors.primaryLight,fontSize:17,fontWeight:"900"},track:{height:7,borderRadius:7,backgroundColor:"#292831",overflow:"hidden",marginTop:8},fill:{height:"100%",backgroundColor:Colors.primary,borderRadius:7},muted:{color:MUTED,fontSize:11,fontWeight:"700"},sectionHead:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginBottom:11},sectionTitle:{color:"#FFF",fontSize:21,fontWeight:"900",letterSpacing:-.5},link:{color:Colors.primaryLight,fontSize:11,fontWeight:"900"},scoreCard:{flexDirection:"row",alignItems:"center",gap:25,minHeight:200,borderRadius:26,borderWidth:1,borderColor:"#4C3267",backgroundColor:CARD,padding:24,marginBottom:28},scoreRing:{width:126,height:126,borderRadius:63,borderWidth:9,borderColor:"#39234D",backgroundColor:"#19141F",alignItems:"center",justifyContent:"center"},score:{color:"#FFF",fontSize:38,fontWeight:"900"},scoreUnit:{color:MUTED,fontSize:10,fontWeight:"800"},scoreMain:{flex:1},cardTitle:{color:"#FFF",fontSize:16,fontWeight:"900"},scoreRight:{color:Colors.primaryLight,fontSize:32,fontWeight:"900"},metrics:{flexDirection:"row",gap:9,marginTop:16},metric:{flex:1,padding:10,borderRadius:12,borderWidth:1,borderColor:LINE,backgroundColor:"#0D0D11"},metricLabel:{color:MUTED,fontSize:8,fontWeight:"700"},metricValue:{color:"#FFF",fontSize:16,fontWeight:"900",marginTop:2},cards:{flexDirection:"row",flexWrap:"wrap",gap:14,marginBottom:22},smallCard:{flex:1,minWidth:260,minHeight:178,borderRadius:22,borderWidth:1,borderColor:LINE,backgroundColor:CARD,padding:20},purpleCard:{backgroundColor:CARD2,borderColor:"#4C3267"},big:{color:"#FFF",fontSize:44,fontWeight:"900",marginTop:5},bigSuffix:{color:MUTED,fontSize:14},dots:{flexDirection:"row",gap:7,marginTop:18},dot:{height:6,flex:1,borderRadius:4,backgroundColor:"#292831"},dotOn:{backgroundColor:Colors.primary},rankBig:{color:"#FFF",fontSize:34,fontWeight:"900",marginTop:10},volume:{color:"#FFF",fontSize:29,fontWeight:"900",marginTop:10},volumeUnit:{color:MUTED,fontSize:10},good:{color:Colors.success,fontSize:10,fontWeight:"800",marginTop:3},miniBars:{height:58,flexDirection:"row",alignItems:"flex-end",gap:8,borderBottomWidth:1,borderBottomColor:LINE,marginTop:10},bar:{flex:1,minHeight:6,backgroundColor:Colors.primary},recovery:{flexDirection:"row",gap:8,marginTop:17},mini:{flex:1,alignItems:"center",gap:5,padding:8,borderRadius:11,backgroundColor:"#0D0D11",borderWidth:1,borderColor:LINE},miniValue:{color:"#FFF",fontSize:15,fontWeight:"900"},miniLabel:{color:MUTED,fontSize:8,fontWeight:"700"},coach:{flexDirection:"row",alignItems:"center",gap:14,borderRadius:22,borderWidth:1,borderColor:"#4C3267",backgroundColor:CARD2,padding:20},coachIcon:{width:42,height:42,borderRadius:14,backgroundColor:"#24153D",alignItems:"center",justifyContent:"center"},coachText:{flex:1}
});
