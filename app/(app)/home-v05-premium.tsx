import { router, useFocusEffect } from "expo-router";
import { Activity, ArrowUpRight, CalendarDays, ChevronRight, Dumbbell, Flame, Medal, Moon, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const C = {
  bg: "#07070A", card: "#101016", card2: "#14111A", purple: "#8B5CF6", light: "#B78CFF",
  text: "#F7F5FA", muted: "#817D8C", soft: "#AAA6B2", line: "#292632", green: "#55E78A",
  purpleCard: "#17111F", purpleLine: "#513473", purpleSoft: "#241633",
};

type HomeData = Awaited<ReturnType<typeof getHomeData>>;

export default function HomeV05Premium() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" ? width >= 980 : width >= 1000;
  const shellWidth = desktop ? Math.min(width - 56, 1420) : Math.max(width * 0.92, 300);
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try { setData(await getHomeData(user.id)); } finally { setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const stats = useMemo(() => {
    const sessions = data?.history ?? [];
    const now = Date.now();
    const last7 = sessions.filter((x) => now - new Date(x.finished_at ?? x.started_at).getTime() <= 7 * 86400000);
    const durations = sessions.map((x) => {
      const start = new Date(x.started_at).getTime();
      const end = new Date(x.finished_at ?? x.started_at).getTime();
      return end > start ? (end - start) / 60000 : 0;
    }).filter(Boolean);
    const avg = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
    return { sessions, last7, avg };
  }, [data]);

  if (loading && !data) return (
    <SafeAreaView style={s.safe}><View style={s.loading}><ActivityIndicator color={C.light} /><Text style={s.muted}>Chargement de Progress+...</Text></View></SafeAreaView>
  );

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const rank = data?.ranking?.rank || "Bronze";
  const xp = Number(data?.ranking?.score || 0);
  const rp = getRankProgress(xp);
  const weekly = data?.consistency || { currentWeek: 0, targetPerWeek: 4 };
  const recovery = data?.recovery;
  const recovery100 = recovery ? Math.round(Number(recovery.recovery_score) * 20) : null;
  const volume = Math.round(data?.monthVolume || 0);
  const change = Number(data?.volumeChange || 0);
  const program = data?.programs?.[0];
  const score = data?.globalScore?.score == null ? null : Math.round(Number(data.globalScore.score));
  const streak = Number(data?.ranking?.streak_days || 0);
  const prCount = data?.records?.length ?? 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={C.light} />} contentContainerStyle={s.scroll}>
        <View style={[s.shell, { width: shellWidth }]}>
          <Header firstName={firstName} />

          <View style={[s.hero, !desktop && s.stack]}>
            <View style={s.heroGlow} />
            <View style={s.heroLeft}>
              <Text style={s.eyebrow}>TON NIVEAU</Text>
              <View style={s.levelLine}>
                <View style={s.medal}><Medal size={28} color={C.light} /></View>
                <View><Text style={s.level}>{rank}</Text><Text style={s.xp}>{xp.toLocaleString("fr-FR")} <Text style={s.xpUnit}>XP</Text></Text></View>
              </View>
              <View style={s.progressLine}><View style={s.track}><View style={[s.fill, { width: `${Math.round(rp.percent * 100)}%` }]} /></View><Text style={s.percent}>{Math.round(rp.percent * 100)}%</Text></View>
              <Text style={s.helper}>{rp.pointsToNext.toLocaleString("fr-FR")} XP avant {rp.next?.name || "le prochain rang"}</Text>
            </View>
            <View style={[s.heroRight, !desktop && s.heroRightMobile]}>
              <Text style={s.eyebrow}>PROCHAIN PALIER</Text>
              <Text style={s.nextRank}>{rp.next?.name || "—"}</Text>
              <Text style={s.helper}>Continue tes séances pour débloquer le prochain niveau.</Text>
              <TouchableOpacity style={s.textButton} onPress={() => router.push("/(app)/ranking")}><Text style={s.textButtonLabel}>Voir les récompenses</Text><ChevronRight size={14} color={C.light} /></TouchableOpacity>
            </View>
          </View>

          <Section title="Aujourd’hui" meta={`${weekly.currentWeek}/${weekly.targetPerWeek} séances`} />
          <View style={[s.todayGrid, !desktop && s.stack]}>
            <TouchableOpacity activeOpacity={0.88} style={[s.workout, s.card]} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
              <View style={s.cardTop}><IconBox><Dumbbell size={19} color={C.light} /></IconBox><View style={s.live}><View style={s.liveDot} /><Text style={s.liveText}>PRÊT</Text></View></View>
              <Text style={s.eyebrow}>PROCHAINE SÉANCE</Text>
              <Text style={s.cardTitle}>{program?.name || "Ton entraînement"}</Text>
              <Text style={s.helper}>{program ? "Ton programme est prêt." : "Prépare ta prochaine séance."}</Text>
              <View style={s.sessionInfo}><Info label="DURÉE" value="≈ 75 min" /><Info label="EXERCICES" value="Programme" /></View>
              <View style={s.primaryButton}><Text style={s.primaryButtonText}>{program ? "Démarrer la séance" : "Voir ma séance"}</Text><ArrowUpRight size={16} color="#FFF" /></View>
            </TouchableOpacity>

            <View style={[s.weekCard, s.card]}>
              <View style={s.cardTop}><View><Text style={s.eyebrow}>OBJECTIF HEBDOMADAIRE</Text><Text style={s.weekNumber}>{weekly.currentWeek}<Text style={s.weekTarget}> / {weekly.targetPerWeek}</Text></Text></View><IconBox><CalendarDays size={19} color={C.light} /></IconBox></View>
              <View style={s.days}>{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <View style={s.day} key={`${d}-${i}`}><View style={[s.dayDot, i < weekly.currentWeek && s.dayDone]}>{i < weekly.currentWeek && <Text style={s.check}>✓</Text>}</View><Text style={s.dayLabel}>{d}</Text></View>)}</View>
              <View style={s.goalRow}><View style={[s.goalBar, { width: `${Math.min((weekly.currentWeek / Math.max(weekly.targetPerWeek, 1)) * 100, 100)}%` }]} /><Text style={s.goalText}>{weekly.currentWeek >= weekly.targetPerWeek ? "Objectif atteint" : `${Math.max(weekly.targetPerWeek - weekly.currentWeek, 0)} restante(s)`}</Text></View>
            </View>

            <TouchableOpacity activeOpacity={0.88} style={[s.streakCard, s.card]} onPress={() => router.push("/(app)/progress")}>
              <IconBox><Flame size={20} color={C.light} /></IconBox><Text style={s.eyebrow}>SÉRIE</Text><Text style={s.streakNumber}>{streak}<Text style={s.streakUnit}> j</Text></Text><Text style={s.helper}>Ta régularité fait la différence.</Text><View style={s.streakDots}>{Array.from({ length: 7 }).map((_, i) => <View key={i} style={[s.streakDot, i < Math.min(streak, 7) && s.dayDone]} />)}</View>
            </TouchableOpacity>
          </View>

          <Section title="Tes performances" link="Voir les stats →" onLink={() => router.push("/(app)/progress")} />
          <View style={[s.metrics, !desktop && s.wrap]}>
            <Metric icon={<Activity size={17} color={C.light} />} value={String(stats.last7.length)} label="Séances · 7 jours" />
            <Metric icon={<Dumbbell size={17} color={C.light} />} value={`${volume.toLocaleString("fr-FR")} kg`} label="Volume · ce mois" delta={change ? `${change >= 0 ? "+" : ""}${change.toFixed(1)}%` : undefined} />
            <Metric icon={<Trophy size={17} color={C.light} />} value={String(prCount)} label="Records personnels" />
            <Metric icon={<Zap size={17} color={C.light} />} value={stats.avg ? `${stats.avg} min` : "—"} label="Durée moyenne" />
            <Metric icon={<Sparkles size={17} color={C.light} />} value={score == null ? "—" : `${score}/100`} label="Progress+ Score" />
          </View>

          <View style={[s.insightsGrid, !desktop && s.stack]}>
            <View style={[s.panel, s.activityPanel]}>
              <Section title="Ton activité" meta="7 derniers jours" />
              <View style={s.chart}>{["L", "M", "M", "J", "V", "S", "D"].map((d, i) => { const value = stats.last7.filter(x => new Date(x.finished_at ?? x.started_at).getDay() === (i + 1) % 7).length; const h = value ? Math.min(140, 36 + value * 28) : 20; return <View style={s.barWrap} key={`${d}-${i}`}><View style={[s.bar, { height: h }]} /><Text style={s.barLabel}>{d}</Text></View>; })}</View>
              <View style={s.panelFooter}><Text style={s.helper}>Volume période</Text><Text style={s.footerValue}>{volume.toLocaleString("fr-FR")} kg</Text></View>
            </View>
            <View style={s.panel}>
              <Section title="Récupération" meta={recovery100 == null ? "À renseigner" : `${recovery100}/100`} />
              <View style={s.recoveryHero}><View style={s.recoveryRing}><Text style={s.recoveryScore}>{recovery100 ?? "—"}</Text><Text style={s.recoveryUnit}>/100</Text></View><View><Text style={s.recoveryTitle}>{recovery100 == null ? "Comment te sens-tu ?" : recovery100 >= 75 ? "Très bonne forme" : recovery100 >= 55 ? "Forme correcte" : "Prends soin de toi"}</Text><Text style={s.helper}>Ton état guide tes prochaines séances.</Text></View></View>
              <View style={s.recoveryStats}><Small icon={<Moon size={14} color={C.light} />} label="Sommeil" value={recovery?.sleep_score == null ? "—" : `${Math.round(Number(recovery.sleep_score) * 2)}/10`} /><Small icon={<Zap size={14} color={C.light} />} label="Énergie" value={recovery?.energy_score == null ? "—" : `${Math.round(Number(recovery.energy_score) * 2)}/10`} /></View>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.88} style={s.insight} onPress={() => router.push("/(app)/progress")}><View style={s.insightIcon}><Sparkles size={19} color={C.light} /></View><View style={{ flex: 1 }}><Text style={s.eyebrow}>PROGRESS+ INSIGHT</Text><Text style={s.insightTitle}>{score == null ? "Construis ta progression." : `${score}/100 · ${data?.globalScore?.label || "Bonne progression"}`}</Text><Text style={s.helper}>Découvre ce qui progresse réellement et ce qui mérite ton attention.</Text></View><ArrowUpRight size={18} color={C.light} /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ firstName }: { firstName: string }) { return <View style={s.header}><View><View style={s.brand}><Sparkles size={12} color={C.light} /><Text style={s.brandText}>PROGRESS+</Text></View><Text style={s.greeting}>Bonjour {firstName} <Text>👋</Text></Text><Text style={s.sub}>Voici où tu en es aujourd’hui.</Text></View><TouchableOpacity style={s.avatar} onPress={() => router.push("/(app)/profile")}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></TouchableOpacity></View>; }
function Section({ title, meta, link, onLink }: { title: string; meta?: string; link?: string; onLink?: () => void }) { return <View style={s.sectionRow}><Text style={s.sectionTitle}>{title}</Text>{link ? <TouchableOpacity onPress={onLink}><Text style={s.link}>{link}</Text></TouchableOpacity> : <Text style={s.sectionMeta}>{meta}</Text>}</View>; }
function IconBox({ children }: { children: React.ReactNode }) { return <View style={s.iconBox}>{children}</View>; }
function Info({ label, value }: { label: string; value: string }) { return <View><Text style={s.infoLabel}>{label}</Text><Text style={s.infoValue}>{value}</Text></View>; }
function Metric({ icon, value, label, delta }: { icon: React.ReactNode; value: string; label: string; delta?: string }) { return <View style={s.metric}><View style={s.metricIcon}>{icon}</View><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text>{delta && <Text style={s.delta}>{delta}</Text>}</View>; }
function Small({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <View style={s.small}><View style={s.smallIcon}>{icon}</View><View><Text style={s.smallLabel}>{label}</Text><Text style={s.smallValue}>{value}</Text></View></View>; }

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:C.bg},scroll:{paddingBottom:120},shell:{alignSelf:"center",paddingTop:26},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:C.bg},
  header:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:30},brand:{flexDirection:"row",alignItems:"center",gap:6,marginBottom:8},brandText:{color:C.light,fontSize:9,fontWeight:"900",letterSpacing:2.8},greeting:{color:C.text,fontSize:32,fontWeight:"900",letterSpacing:-1.1},sub:{color:C.muted,fontSize:11,marginTop:5},avatar:{width:46,height:46,borderRadius:23,backgroundColor:C.card,borderWidth:1,borderColor:C.purpleLine,alignItems:"center",justifyContent:"center"},avatarText:{color:C.light,fontSize:15,fontWeight:"900"},
  hero:{minHeight:245,borderRadius:26,borderWidth:1,borderColor:C.purpleLine,backgroundColor:C.purpleCard,padding:30,flexDirection:"row",marginBottom:32,overflow:"hidden",position:"relative"},stack:{flexDirection:"column"},heroGlow:{position:"absolute",right:-170,top:-210,width:560,height:560,borderRadius:280,backgroundColor:"#28143F"},heroLeft:{flex:1,zIndex:1},heroRight:{width:285,zIndex:1,paddingLeft:32,borderLeftWidth:1,borderLeftColor:C.line,justifyContent:"center"},heroRightMobile:{width:"100%",paddingLeft:0,paddingTop:24,marginTop:24,borderLeftWidth:0,borderTopWidth:1,borderTopColor:C.line},eyebrow:{color:C.light,fontSize:8.5,fontWeight:"900",letterSpacing:1.8,marginBottom:8},levelLine:{flexDirection:"row",alignItems:"center",gap:15},medal:{width:64,height:64,borderRadius:18,backgroundColor:C.purpleSoft,borderWidth:1,borderColor:"#7049A4",alignItems:"center",justifyContent:"center"},level:{color:C.text,fontSize:30,fontWeight:"900"},xp:{color:C.light,fontSize:22,fontWeight:"900",marginTop:1},xpUnit:{color:C.muted,fontSize:9},progressLine:{flexDirection:"row",alignItems:"center",gap:12,marginTop:23,maxWidth:510},track:{height:8,flex:1,borderRadius:8,backgroundColor:"#292530",overflow:"hidden"},fill:{height:"100%",backgroundColor:C.purple,borderRadius:8},percent:{color:C.text,fontSize:10,fontWeight:"900"},helper:{color:C.muted,fontSize:10,fontWeight:"700",lineHeight:16,marginTop:5},nextRank:{color:C.text,fontSize:28,fontWeight:"900"},textButton:{alignSelf:"flex-start",flexDirection:"row",alignItems:"center",gap:4,marginTop:15},textButtonLabel:{color:C.light,fontSize:9,fontWeight:"900"},
  sectionRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginBottom:13},sectionTitle:{color:C.text,fontSize:20,fontWeight:"900",letterSpacing:-.45},sectionMeta:{color:C.muted,fontSize:9,fontWeight:"800"},link:{color:C.light,fontSize:10,fontWeight:"900"},todayGrid:{flexDirection:"row",gap:14,marginBottom:32},card:{borderRadius:21,borderWidth:1,borderColor:C.line,backgroundColor:C.card,padding:21,minHeight:270},workout:{flex:1.05,backgroundColor:C.purpleCard,borderColor:C.purpleLine},weekCard:{flex:1.3},streakCard:{flex:.75,backgroundColor:"#110C18",borderColor:"#3E2952"},cardTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-start"},iconBox:{width:42,height:42,borderRadius:13,backgroundColor:"#21152F",borderWidth:1,borderColor:"#4D326A",alignItems:"center",justifyContent:"center",marginBottom:15},live:{flexDirection:"row",alignItems:"center",gap:5,paddingHorizontal:8,paddingVertical:5,borderRadius:8,backgroundColor:"#1A1620",borderWidth:1,borderColor:C.line},liveDot:{width:5,height:5,borderRadius:3,backgroundColor:C.green},liveText:{color:C.soft,fontSize:7,fontWeight:"900",letterSpacing:1},cardTitle:{color:C.text,fontSize:21,fontWeight:"900",letterSpacing:-.35},sessionInfo:{flexDirection:"row",gap:35,marginTop:20},infoLabel:{color:C.muted,fontSize:7,fontWeight:"900",letterSpacing:1},infoValue:{color:C.text,fontSize:10,fontWeight:"800",marginTop:3},primaryButton:{height:43,borderRadius:11,backgroundColor:C.purple,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:7,marginTop:19},primaryButtonText:{color:"#FFF",fontSize:10,fontWeight:"900"},weekNumber:{color:C.light,fontSize:34,fontWeight:"900",lineHeight:38},weekTarget:{color:C.soft,fontSize:13},days:{flexDirection:"row",justifyContent:"space-between",marginTop:24},day:{alignItems:"center",gap:7},dayDot:{width:29,height:29,borderRadius:15,backgroundColor:"#25232B",borderWidth:1,borderColor:"#393641",alignItems:"center",justifyContent:"center"},dayDone:{backgroundColor:C.purple,borderColor:C.purple},check:{color:"#FFF",fontSize:10,fontWeight:"900"},dayLabel:{color:C.muted,fontSize:7,fontWeight:"900"},goalRow:{marginTop:24},goalBar:{height:5,borderRadius:5,backgroundColor:C.purple,maxWidth:"100%"},goalText:{color:C.muted,fontSize:8,fontWeight:"800",marginTop:7},streakNumber:{color:C.text,fontSize:34,fontWeight:"900",marginTop:2},streakUnit:{color:C.muted,fontSize:11},streakDots:{flexDirection:"row",gap:4,marginTop:24},streakDot:{height:5,flex:1,borderRadius:4,backgroundColor:"#292632"},
  metrics:{flexDirection:"row",gap:10,marginBottom:32},wrap:{flexWrap:"wrap"},metric:{flex:1,minWidth:150,padding:15,borderRadius:16,backgroundColor:C.card,borderWidth:1,borderColor:C.line},metricIcon:{width:31,height:31,borderRadius:9,backgroundColor:"#1C1524",alignItems:"center",justifyContent:"center",marginBottom:11},metricValue:{color:C.text,fontSize:19,fontWeight:"900"},metricLabel:{color:C.muted,fontSize:8.5,fontWeight:"700",marginTop:3},delta:{color:C.green,fontSize:8,fontWeight:"900",marginTop:7},
  insightsGrid:{flexDirection:"row",gap:14,marginBottom:18},panel:{flex:1,minHeight:300,borderRadius:21,borderWidth:1,borderColor:C.line,backgroundColor:C.card,padding:21},activityPanel:{flex:1.2},chart:{height:180,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-around",borderBottomWidth:1,borderBottomColor:C.line,marginTop:4},barWrap:{height:"100%",width:"10%",alignItems:"center",justifyContent:"flex-end",gap:7},bar:{width:"58%",borderRadius:6,backgroundColor:C.purple},barLabel:{color:C.muted,fontSize:8,fontWeight:"900"},panelFooter:{marginTop:12,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},footerValue:{color:C.text,fontSize:14,fontWeight:"900"},recoveryHero:{flexDirection:"row",alignItems:"center",gap:18,marginTop:17},recoveryRing:{width:104,height:104,borderRadius:52,borderWidth:8,borderColor:"#39244C",alignItems:"center",justifyContent:"center"},recoveryScore:{color:C.text,fontSize:25,fontWeight:"900"},recoveryUnit:{color:C.muted,fontSize:8},recoveryTitle:{color:C.text,fontSize:15,fontWeight:"900",maxWidth:150},recoveryStats:{flexDirection:"row",gap:16,marginTop:20},small:{flexDirection:"row",alignItems:"center",gap:8},smallIcon:{width:30,height:30,borderRadius:9,backgroundColor:"#1C1524",alignItems:"center",justifyContent:"center"},smallLabel:{color:C.muted,fontSize:7},smallValue:{color:C.text,fontSize:10,fontWeight:"900",marginTop:2},insight:{minHeight:96,borderRadius:20,borderWidth:1,borderColor:C.purpleLine,backgroundColor:"#130E1A",padding:18,flexDirection:"row",alignItems:"center",gap:14},insightIcon:{width:40,height:40,borderRadius:12,backgroundColor:C.purpleSoft,borderWidth:1,borderColor:"#543673",alignItems:"center",justifyContent:"center"},insightTitle:{color:C.text,fontSize:16,fontWeight:"900"},
});
