import { useFocusEffect, router } from "expo-router";
import { Activity, ArrowUpRight, ChevronRight, Moon, Smile, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const BG = "#07070A";
const CARD = "#101015";
const CARD_2 = "#14131B";
const MUTED = "#777683";

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricIcon}><Icon color={Colors.primaryLight} size={15} /></View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function formatScore(value: number | null | undefined) {
  return value == null ? "—" : `${Math.round(Number(value) * 2)}/10`;
}

function getCoach(recovery: number | null | undefined, hasProgram: boolean) {
  if (!hasProgram) return { title: "Construis ton programme", text: "Ajoute ton premier programme et Progress+ commencera à piloter ta progression.", action: "Créer mon programme", color: Colors.primary };
  if (recovery == null) return { title: "Ton prochain niveau commence ici", text: "Fais ton check-in avant ta prochaine séance pour obtenir une recommandation personnalisée.", action: "Faire mon check-in", color: Colors.primary };
  if (recovery >= 4.2) return { title: "Feu vert pour progresser", text: "Ta récupération est très bonne. On peut chercher une progression contrôlée aujourd'hui.", action: "Lancer ma séance", color: Colors.success };
  if (recovery <= 2) return { title: "Aujourd'hui, on consolide", text: "Ta récupération est basse. Priorité à une exécution propre et maîtrisée.", action: "Ouvrir ma séance", color: Colors.danger };
  return { title: "Progression propre aujourd'hui", text: "Ta récupération est correcte. Cherche une petite amélioration sans sacrifier ta technique.", action: "Lancer ma séance", color: Colors.primary };
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<Awaited<ReturnType<typeof getHomeData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoading(true);
      setData(await getHomeData(user.id));
    } catch (error) {
      console.log("HOME DATA ERROR =", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { load(true); }, [load]));

  async function refresh() {
    try { setRefreshing(true); await load(true); } finally { setRefreshing(false); }
  }

  if (loading && !data) {
    return <SafeAreaView style={styles.safe}><View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.loadingText}>Chargement de Progress+...</Text></View></SafeAreaView>;
  }

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const ranking = data?.ranking;
  const rankProgress = ranking ? getRankProgress(ranking.score) : null;
  const rankPercent = Math.round((rankProgress?.percent ?? 0) * 100);
  const program = data?.programs?.[0];
  const recovery = data?.recovery;
  const record = data?.records?.[0];
  const globalScore = data?.globalScore ?? { score: null, label: "Pas encore assez de données", confidence: 0, available: 0, missing: [] as string[] };
  const weekly = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4, completion: 0, successfulWeeks: 0 };
  const coach = getCoach(recovery?.recovery_score, Boolean(program));
  const score = globalScore.score == null ? 0 : Math.round(Number(globalScore.score));
  const scoreProgress = Math.min(100, Math.max(0, score));
  const volume = Math.round(data?.monthVolume ?? 0);
  const volumeChange = data?.volumeChange ?? 0;
  const position = data?.position;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.container}
      >
        <View style={styles.topbar}>
          <View>
            <View style={styles.brand}><Sparkles size={12} color={Colors.primaryLight} /><Text style={styles.brandText}>PROGRESS+</Text></View>
            <Text style={styles.greeting}>Bonjour {firstName}</Text>
            <Text style={styles.subGreeting}>Voici où tu en es aujourd'hui.</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(app)/profile")}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.heroWorkout} activeOpacity={0.9} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
          <View style={styles.heroGlow} />
          <View style={styles.heroContent}>
            <Text style={styles.heroEyebrow}>PROCHAINE SÉANCE</Text>
            <Text style={styles.heroTitle}>{program?.name || "Commencer ton entraînement"}</Text>
            <Text style={styles.heroMeta}>{program ? "Ton programme est prêt" : "Crée ton programme pour commencer"}</Text>
            <View style={styles.heroCta}><Text style={styles.heroCtaText}>{program ? "Ouvrir la séance" : "Commencer"}</Text><ArrowUpRight size={16} color="#fff" /></View>
          </View>
          <View style={styles.heroOrb}><Activity color={Colors.primaryLight} size={28} /></View>
        </TouchableOpacity>

        <View style={styles.sectionRow}>
          <View><Text style={styles.kicker}>TON NIVEAU</Text><Text style={styles.sectionTitle}>{ranking?.rank ?? "Bronze"}</Text></View>
          <View style={styles.xpBlock}><Text style={styles.xpValue}>{ranking?.score ?? 0}</Text><Text style={styles.xpLabel}>XP</Text></View>
        </View>
        <View style={styles.levelCard}>
          <View style={styles.levelTop}><Text style={styles.levelHint}>{rankPercent}% vers le prochain rang</Text><Text style={styles.levelHint}>#{position ?? "—"} global</Text></View>
          <View style={styles.levelTrack}><View style={[styles.levelFill, { width: `${rankPercent}%` }]} /></View>
        </View>

        <View style={styles.sectionRow}>
          <View><Text style={styles.kicker}>PROGRESS+ SCORE</Text><Text style={styles.sectionTitle}>Ta progression réelle</Text></View>
          <TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={styles.link}>Détails ›</Text></TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.scoreCard} activeOpacity={0.9} onPress={() => router.push("/(app)/progress")}>
          <View style={styles.scoreRingOuter}>
            <View style={styles.scoreRingInner}>
              <Text style={styles.scoreNumber}>{score || "—"}</Text>
              <Text style={styles.scoreOutOf}>/100</Text>
            </View>
          </View>
          <View style={styles.scoreCopy}>
            <Text style={styles.scoreLabel}>{globalScore.label}</Text>
            <Text style={styles.scoreDescription}>{globalScore.available ?? 0} indicateurs analysés</Text>
            <View style={styles.scoreMiniTrack}><View style={[styles.scoreMiniFill, { width: `${scoreProgress}%` }]} /></View>
            <Text style={styles.scoreAction}>Voir mon analyse <ChevronRight size={13} color={Colors.primaryLight} /></Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Cette semaine</Text><Text style={styles.sectionMeta}>{weekly.currentWeek}/{weekly.targetPerWeek} séances</Text></View>
        <View style={styles.twoCol}>
          <View style={styles.weekCard}>
            <View style={styles.weekTop}><Text style={styles.bigNumber}>{weekly.currentWeek}</Text><Text style={styles.smallUnit}>/ {weekly.targetPerWeek}</Text></View>
            <Text style={styles.cardLabel}>séances réalisées</Text>
            <View style={styles.dots}>{Array.from({ length: weekly.targetPerWeek }).map((_, i) => <View key={i} style={[styles.dot, i < weekly.currentWeek && styles.dotActive]} />)}</View>
          </View>
          <TouchableOpacity style={styles.rankCard} onPress={() => router.push("/(app)/ranking")}>
            <Trophy color={Colors.primaryLight} size={19} />
            <Text style={styles.rankNumber}>#{position ?? "—"}</Text>
            <Text style={styles.cardLabel}>classement global</Text>
            <Text style={styles.cardLink}>Voir le classement ›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Coach Progress+</Text><Sparkles color={Colors.primaryLight} size={16} /></View>
        <TouchableOpacity style={styles.coachCard} activeOpacity={0.9} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
          <View style={[styles.coachAccent, { backgroundColor: coach.color }]} />
          <View style={styles.coachAvatar}><Sparkles color={coach.color} size={19} /></View>
          <View style={styles.coachCopy}><Text style={styles.coachTitle}>{coach.title}</Text><Text style={styles.coachText}>{coach.text}</Text><Text style={[styles.coachAction, { color: coach.color }]}>{coach.action} ›</Text></View>
        </TouchableOpacity>

        <View style={styles.sectionRow}><View><Text style={styles.kicker}>ANALYTICS</Text><Text style={styles.sectionTitle}>Tes performances</Text></View><TouchableOpacity onPress={() => router.push("/(app)/progress")}><Text style={styles.link}>Tout voir ›</Text></TouchableOpacity></View>
        <View style={styles.performanceCard}>
          <View style={styles.performanceTop}><View><Text style={styles.performanceLabel}>VOLUME</Text><Text style={styles.performanceValue}>{volume.toLocaleString("fr-FR")} <Text style={styles.performanceUnit}>kg</Text></Text><Text style={[styles.change, volumeChange >= 0 ? styles.success : styles.danger]}>{volumeChange >= 0 ? "+" : ""}{volumeChange.toFixed(1)}% vs période précédente</Text></View><View style={styles.sessionPill}><Text style={styles.sessionNumber}>{data?.history?.length ?? 0}</Text><Text style={styles.sessionLabel}>séances</Text></View></View>
          <View style={styles.chart}>{[24, 35, 28, 48, 39, 57, 50, 68].map((h, i) => <View key={i} style={[styles.chartBar, { height: h, opacity: i === 7 ? 1 : 0.45 + i * 0.04 }]} />)}</View>
          <View style={styles.chartLabels}>{["L","M","M","J","V","S","D"].map((d, i) => <Text key={i} style={styles.chartLabel}>{d}</Text>)}</View>
        </View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Récupération</Text><Text style={styles.sectionMeta}>{recovery ? `${Number(recovery.recovery_score).toLocaleString("fr-FR")}/5` : "—"}</Text></View>
        <View style={styles.recoveryCard}>
          <Metric icon={Moon} label="Sommeil" value={formatScore(recovery?.sleep_score)} />
          <View style={styles.vDivider} />
          <Metric icon={Zap} label="Énergie" value={formatScore(recovery?.energy_score)} />
          <View style={styles.vDivider} />
          <Metric icon={Smile} label="Humeur" value={formatScore(recovery?.mood_score)} />
        </View>

        <View style={styles.sectionRow}><Text style={styles.sectionTitle}>Dernier record</Text></View>
        {record ? (
          <View style={styles.recordCard}><View style={styles.recordBadge}><Trophy color={Colors.primaryLight} size={18} /></View><View style={{ flex: 1 }}><Text style={styles.recordName}>{record.exercises?.name ?? "Exercice"}</Text><Text style={styles.recordSub}>1RM estimé · {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg</Text></View><Text style={styles.recordValue}>{Number(record.weight).toLocaleString("fr-FR")} × {record.reps}</Text></View>
        ) : (
          <View style={styles.emptyCard}><Trophy color={Colors.primaryLight} size={18} /><Text style={styles.emptyText}>Ton premier record apparaîtra ici.</Text></View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:BG},container:{paddingHorizontal:18,paddingTop:8,paddingBottom:120,gap:12},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12,backgroundColor:BG},loadingText:{color:Colors.textSecondary},topbar:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:4,paddingBottom:6},brand:{flexDirection:"row",alignItems:"center",gap:5,marginBottom:7},brandText:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",letterSpacing:2.2},greeting:{color:"#FFF",fontSize:29,fontWeight:"900",letterSpacing:-1},subGreeting:{color:MUTED,fontSize:11,marginTop:3},avatar:{width:43,height:43,borderRadius:22,backgroundColor:CARD,borderWidth:1,borderColor:"#49317D",alignItems:"center",justifyContent:"center"},avatarText:{color:Colors.primaryLight,fontSize:17,fontWeight:"900"},heroWorkout:{height:178,borderRadius:28,backgroundColor:CARD_2,overflow:"hidden",borderWidth:1,borderColor:"#2A2636",padding:20,position:"relative",justifyContent:"center"},heroGlow:{position:"absolute",width:190,height:190,borderRadius:95,backgroundColor:"#241442",right:-55,top:-35,opacity:.8},heroContent:{zIndex:2},heroEyebrow:{color:Colors.primaryLight,fontSize:8,fontWeight:"900",letterSpacing:1.6},heroTitle:{color:"#FFF",fontSize:23,fontWeight:"900",letterSpacing:-.6,marginTop:7,maxWidth:"78%"},heroMeta:{color:"#8A8793",fontSize:10,marginTop:5},heroCta:{flexDirection:"row",alignItems:"center",gap:5,marginTop:16},heroCtaText:{color:"#FFF",fontSize:11,fontWeight:"900"},heroOrb:{position:"absolute",right:22,bottom:22,width:60,height:60,borderRadius:30,backgroundColor:"#251342",borderWidth:1,borderColor:"#6741A7",alignItems:"center",justifyContent:"center"},sectionRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"flex-end",marginTop:8},kicker:{color:Colors.primaryLight,fontSize:8,fontWeight:"900",letterSpacing:1.5,marginBottom:3},sectionTitle:{color:"#FFF",fontSize:18,fontWeight:"900",letterSpacing:-.35},sectionMeta:{color:MUTED,fontSize:10,fontWeight:"800"},link:{color:Colors.primaryLight,fontSize:10,fontWeight:"900"},xpBlock:{flexDirection:"row",alignItems:"baseline",gap:4},xpValue:{color:"#FFF",fontSize:22,fontWeight:"900"},xpLabel:{color:Colors.primaryLight,fontSize:8,fontWeight:"900"},levelCard:{backgroundColor:CARD,borderRadius:18,borderWidth:1,borderColor:"#23222B",padding:14},levelTop:{flexDirection:"row",justifyContent:"space-between",marginBottom:9},levelHint:{color:MUTED,fontSize:9},levelTrack:{height:5,borderRadius:5,backgroundColor:"#272630",overflow:"hidden"},levelFill:{height:"100%",backgroundColor:Colors.primary,borderRadius:5},scoreCard:{minHeight:150,borderRadius:24,backgroundColor:CARD,borderWidth:1,borderColor:"#292531",padding:18,flexDirection:"row",alignItems:"center",overflow:"hidden"},scoreRingOuter:{width:108,height:108,borderRadius:54,borderWidth:8,borderColor:"#2A203B",alignItems:"center",justifyContent:"center"},scoreRingInner:{width:91,height:91,borderRadius:46,backgroundColor:"#17131F",alignItems:"center",justifyContent:"center"},scoreNumber:{color:"#FFF",fontSize:31,fontWeight:"900",letterSpacing:-1},scoreOutOf:{color:MUTED,fontSize:9,fontWeight:"800",marginTop:-3},scoreCopy:{flex:1,marginLeft:18},scoreLabel:{color:"#FFF",fontSize:16,fontWeight:"900"},scoreDescription:{color:MUTED,fontSize:10,marginTop:4},scoreMiniTrack:{height:4,backgroundColor:"#292730",borderRadius:4,marginTop:13,overflow:"hidden"},scoreMiniFill:{height:"100%",backgroundColor:Colors.primary,borderRadius:4},scoreAction:{color:Colors.primaryLight,fontSize:10,fontWeight:"900",marginTop:12,flexDirection:"row",alignItems:"center"},twoCol:{flexDirection:"row",gap:10},weekCard:{flex:1,backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:"#24232C",padding:16,minHeight:125},weekTop:{flexDirection:"row",alignItems:"baseline"},bigNumber:{color:"#FFF",fontSize:37,fontWeight:"900",letterSpacing:-1},smallUnit:{color:MUTED,fontSize:13,fontWeight:"800",marginLeft:3},cardLabel:{color:MUTED,fontSize:9,marginTop:1},dots:{flexDirection:"row",gap:6,marginTop:18},dot:{width:14,height:6,borderRadius:4,backgroundColor:"#2A2932"},dotActive:{backgroundColor:Colors.primary},rankCard:{flex:1,backgroundColor:"#171221",borderRadius:20,borderWidth:1,borderColor:"#35264A",padding:16,minHeight:125},rankNumber:{color:"#FFF",fontSize:29,fontWeight:"900",marginTop:8},cardLink:{color:Colors.primaryLight,fontSize:9,fontWeight:"900",marginTop:12},coachCard:{backgroundColor:CARD,borderRadius:22,borderWidth:1,borderColor:"#292531",padding:16,flexDirection:"row",overflow:"hidden"},coachAccent:{position:"absolute",left:0,top:0,bottom:0,width:3},coachAvatar:{width:43,height:43,borderRadius:15,backgroundColor:"#21163A",alignItems:"center",justifyContent:"center"},coachCopy:{flex:1,marginLeft:12},coachTitle:{color:"#FFF",fontSize:15,fontWeight:"900"},coachText:{color:MUTED,fontSize:10.5,lineHeight:16,marginTop:5},coachAction:{fontSize:10,fontWeight:"900",marginTop:9},performanceCard:{backgroundColor:CARD,borderRadius:22,borderWidth:1,borderColor:"#25242D",padding:17},performanceTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},performanceLabel:{color:MUTED,fontSize:8,fontWeight:"900",letterSpacing:1.4},performanceValue:{color:"#FFF",fontSize:29,fontWeight:"900",marginTop:2},performanceUnit:{color:MUTED,fontSize:11,fontWeight:"800"},change:{fontSize:9,fontWeight:"800",marginTop:2},success:{color:Colors.success},danger:{color:Colors.danger},sessionPill:{width:54,height:54,borderRadius:16,backgroundColor:"#1B1430",alignItems:"center",justifyContent:"center"},sessionNumber:{color:Colors.primaryLight,fontSize:18,fontWeight:"900"},sessionLabel:{color:MUTED,fontSize:7},chart:{height:78,flexDirection:"row",alignItems:"flex-end",justifyContent:"space-between",borderBottomWidth:1,borderBottomColor:"#292832",marginTop:16,paddingHorizontal:5},chartBar:{width:20,borderTopLeftRadius:6,borderTopRightRadius:6,backgroundColor:Colors.primary},chartLabels:{flexDirection:"row",justifyContent:"space-between",paddingHorizontal:5,marginTop:5},chartLabel:{color:"#5F5E69",fontSize:7},recoveryCard:{backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:"#24232C",paddingVertical:15,flexDirection:"row"},metric:{flex:1,alignItems:"center",gap:4},metricIcon:{width:30,height:30,borderRadius:10,backgroundColor:"#1E1730",alignItems:"center",justifyContent:"center"},metricValue:{color:"#FFF",fontSize:16,fontWeight:"900"},metricLabel:{color:MUTED,fontSize:8},vDivider:{width:1,backgroundColor:"#292832"},recordCard:{backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:"#25242D",padding:14,flexDirection:"row",alignItems:"center"},recordBadge:{width:42,height:42,borderRadius:14,backgroundColor:"#21163A",alignItems:"center",justifyContent:"center",marginRight:11},recordName:{color:"#FFF",fontSize:14,fontWeight:"900"},recordSub:{color:MUTED,fontSize:9,marginTop:3},recordValue:{color:Colors.success,fontSize:16,fontWeight:"900"},emptyCard:{backgroundColor:CARD,borderRadius:20,borderWidth:1,borderColor:"#25242D",padding:15,flexDirection:"row",alignItems:"center",gap:10},emptyText:{color:MUTED,fontSize:10}
});