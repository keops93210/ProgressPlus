import { useFocusEffect, router } from "expo-router";
import { Activity, ChevronRight, Moon, Trophy, UserRound, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import Design from "@/constants/design";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

type PillarProps = { label: string; value: number | null };

function Pillar({ label, value }: PillarProps) {
  const safe = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <View style={styles.pillar}>
      <Text style={styles.pillarLabel}>{label}</Text>
      <Text style={styles.pillarValue}>{value == null ? "—" : Math.round(value)}</Text>
      <View style={styles.pillarTrack}><View style={[styles.pillarFill, { width: `${safe}%` }]} /></View>
    </View>
  );
}

function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <TouchableOpacity onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></TouchableOpacity> : null}
    </View>
  );
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
    setRefreshing(true);
    await load(true);
    setRefreshing(false);
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
  const score = data?.globalScore?.score ?? null;
  const pillars = data?.globalScore?.pillarScores;
  const weekly = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4 };
  const sessions = data?.history?.length ?? 0;
  const volume = Math.round(data?.monthVolume ?? 0);
  const record = data?.records?.[0];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.container}
      >
        <View style={styles.topbar}>
          <View style={styles.topbarCopy}>
            <Text style={styles.brand}>PROGRESS+</Text>
            <Text style={styles.greeting}>Bonjour {firstName} 👋</Text>
            <Text style={styles.subtitle}>Ton entraînement. Ta progression. Tout au même endroit.</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/(app)/profile")}>
            <UserRound color={Colors.primaryLight} size={19} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.heroWorkout}
          activeOpacity={0.94}
          onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}
        >
          <View style={styles.heroGlow} />
          <View style={styles.heroTop}>
            <View style={styles.heroIcon}><Activity color="#FFFFFF" size={23} /></View>
            <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.liveText}>PRÊT À S'ENTRAÎNER</Text></View>
          </View>
          <Text style={styles.heroEyebrow}>PROCHAINE SÉANCE</Text>
          <Text style={styles.heroTitle}>{program?.name || "Ta prochaine séance"}</Text>
          <Text style={styles.heroMeta}>{program ? "Programme prêt · aujourd'hui" : "Crée ton programme pour commencer"}</Text>
          <View style={styles.heroButton}><Text style={styles.heroButtonText}>Commencer la séance</Text><ChevronRight color="#FFFFFF" size={18} /></View>
        </TouchableOpacity>

        <View style={styles.rankCard}>
          <View style={styles.rankBadge}><Text style={styles.rankBadgeText}>{ranking?.rank?.charAt(0)?.toUpperCase() ?? "B"}</Text></View>
          <View style={styles.rankCopy}>
            <Text style={styles.eyebrow}>NIVEAU ACTUEL</Text>
            <Text style={styles.rankName}>{ranking?.rank ?? "Bronze"}</Text>
            <Text style={styles.rankMeta}>{ranking?.score ?? 0} XP · {rankPercent}% vers le prochain rang</Text>
          </View>
          <Text style={styles.rankXp}>{ranking?.score ?? 0}</Text>
          <View style={styles.rankTrack}><View style={[styles.rankFill, { width: `${rankPercent}%` }]} /></View>
        </View>

        <SectionTitle title="Ta progression" action="Voir les stats" onPress={() => router.push("/(app)/progress")} />
        <TouchableOpacity style={styles.scoreCard} activeOpacity={0.94} onPress={() => router.push("/(app)/progress")}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreCopy}>
              <Text style={styles.eyebrow}>PROGRESS+ SCORE</Text>
              <Text style={styles.scoreTitle}>{score == null ? "Construisons ta progression" : data?.globalScore?.label || "Bonne progression"}</Text>
              <Text style={styles.scoreSub}>Une lecture claire de tes performances réelles.</Text>
            </View>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{score == null ? "—" : Math.round(score)}</Text>
              <Text style={styles.scoreUnit}>/100</Text>
            </View>
          </View>
          <View style={styles.scoreTrack}><View style={[styles.scoreFill, { width: `${Math.max(0, Math.min(100, score ?? 0))}%` }]} /></View>
          <View style={styles.pillarGrid}>
            <Pillar label="Performance" value={pillars?.performance ?? null} />
            <Pillar label="Récupération" value={pillars?.recovery ?? null} />
            <Pillar label="Corps" value={pillars?.transformation ?? null} />
            <Pillar label="Régularité" value={pillars?.consistency ?? null} />
          </View>
          <View style={styles.insight}><View style={styles.insightMark}><Zap color={Colors.primaryLight} size={15} /></View><View style={styles.insightCopy}><Text style={styles.insightLabel}>INSIGHT COACH</Text><Text style={styles.insightText}>Continue à construire ta progression, série après série.</Text></View><ChevronRight color={Colors.primaryLight} size={17} /></View>
        </TouchableOpacity>

        <SectionTitle title="Cette semaine" action={`${weekly.currentWeek}/${weekly.targetPerWeek} séances`} />
        <View style={styles.weekRow}>
          <View style={styles.weekCard}>
            <View style={styles.weekTop}><View><Text style={styles.eyebrow}>OBJECTIF</Text><Text style={styles.weekValue}>{weekly.currentWeek}/{weekly.targetPerWeek}</Text></View><Text style={styles.weekPercent}>{Math.min(100, Math.round((weekly.currentWeek / Math.max(1, weekly.targetPerWeek)) * 100))}%</Text></View>
            <View style={styles.weekTrack}><View style={[styles.weekFill, { width: `${Math.min(100, (weekly.currentWeek / Math.max(1, weekly.targetPerWeek)) * 100)}%` }]} /></View>
            <Text style={styles.helper}>{weekly.currentWeek >= weekly.targetPerWeek ? "Objectif atteint" : `${Math.max(0, weekly.targetPerWeek - weekly.currentWeek)} séance(s) restante(s)`}</Text>
          </View>
          <TouchableOpacity style={styles.rankingCard} onPress={() => router.push("/(app)/ranking")}>
            <Trophy color={Colors.primaryLight} size={20} />
            <Text style={styles.rankingNumber}>#{data?.position ?? "—"}</Text>
            <Text style={styles.helper}>classement global</Text>
          </TouchableOpacity>
        </View>

        <SectionTitle title="Coach Progress+" />
        <TouchableOpacity style={styles.coachCard} activeOpacity={0.94} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
          <View style={styles.coachIcon}><Zap color={Colors.primaryLight} size={22} /></View>
          <View style={styles.coachCopy}><Text style={styles.eyebrow}>COACH PROGRESS+</Text><Text style={styles.coachTitle}>{recovery && recovery.recovery_score >= 4.2 ? "Feu vert pour progresser" : "Progression propre aujourd'hui"}</Text><Text style={styles.coachText}>Ta séance doit te faire avancer sans sacrifier ta technique.</Text><Text style={styles.coachAction}>Lancer ma séance ›</Text></View>
        </TouchableOpacity>

        <SectionTitle title="Tes performances" action="Tout voir" onPress={() => router.push("/(app)/stats")} />
        <View style={styles.performanceCard}>
          <View style={styles.performanceTop}><View><Text style={styles.eyebrow}>VOLUME TOTAL</Text><Text style={styles.volume}>{volume.toLocaleString("fr-FR")} kg</Text><Text style={styles.trend}>+12% cette période</Text></View><View style={styles.sessionBadge}><Text style={styles.sessionNumber}>{sessions}</Text><Text style={styles.helper}>séances</Text></View></View>
          <View style={styles.chart}>{[26, 42, 34, 55, 43, 68, 78].map((height, index) => <View key={index} style={styles.chartCol}><View style={[styles.chartBar, { height }]} /></View>)}</View>
          <View style={styles.days}>{["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <Text key={index} style={styles.day}>{day}</Text>)}</View>
        </View>

        <View style={styles.bottomStats}>
          <View style={styles.statCard}><Moon color={Colors.primaryLight} size={18} /><Text style={styles.statValue}>{recovery ? `${Math.round(Number(recovery.sleep_score ?? 0) * 2)}/10` : "—"}</Text><Text style={styles.helper}>sommeil</Text></View>
          <View style={styles.statCard}><Zap color={Colors.primaryLight} size={18} /><Text style={styles.statValue}>{recovery ? `${Math.round(Number(recovery.energy_score ?? 0) * 2)}/10` : "—"}</Text><Text style={styles.helper}>énergie</Text></View>
          <View style={styles.statCard}><Trophy color={Colors.primaryLight} size={18} /><Text style={styles.statValue}>{record ? `${Number(record.weight).toLocaleString("fr-FR")} kg` : "—"}</Text><Text style={styles.helper}>dernier record</Text></View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#09090D" },
  container: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120, gap: 16 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#09090D" },
  loadingText: { color: Colors.textSecondary },
  topbar: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", paddingTop: 4 },
  topbarCopy: { flex: 1, paddingRight: 12 },
  brand: { color: Colors.primaryLight, fontSize: 9, fontWeight: "900", letterSpacing: 2.2, marginBottom: 8 },
  greeting: { color: Colors.text, fontSize: 28, fontWeight: "900", letterSpacing: -0.8 },
  subtitle: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  profileButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  heroWorkout: { minHeight: 205, borderRadius: 26, backgroundColor: "#15121F", borderWidth: 1, borderColor: "#4A2A8C", padding: 20, overflow: "hidden", position: "relative", ...Design.elevation.card },
  heroGlow: { position: "absolute", width: 190, height: 190, borderRadius: 95, backgroundColor: "#2B1456", right: -70, top: -80, opacity: 0.72 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroIcon: { width: 46, height: 46, borderRadius: 15, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, height: 26, borderRadius: 13, backgroundColor: "#211B30", borderWidth: 1, borderColor: "#3A2C55" },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success },
  liveText: { color: Colors.primaryLight, fontSize: 7, fontWeight: "900", letterSpacing: 1 },
  heroEyebrow: { color: Colors.primaryLight, fontSize: 8, fontWeight: "900", letterSpacing: 1.5, marginTop: 20 },
  heroTitle: { color: "#FFFFFF", fontSize: 25, fontWeight: "900", marginTop: 5 },
  heroMeta: { color: Colors.textSecondary, fontSize: 10, marginTop: 3 },
  heroButton: { height: 42, borderRadius: 14, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  heroButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  rankCard: { minHeight: 96, borderRadius: 22, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: 14, flexDirection: "row", alignItems: "center", position: "relative" },
  rankBadge: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primarySoft, borderWidth: 1, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  rankBadgeText: { color: Colors.primaryLight, fontSize: 22, fontWeight: "900" },
  rankCopy: { flex: 1, marginLeft: 12 },
  eyebrow: { color: Colors.primaryLight, ...Design.typography.eyebrow },
  rankName: { color: Colors.text, fontSize: 20, fontWeight: "900", marginTop: 2 },
  rankMeta: { color: Colors.textMuted, fontSize: 9, marginTop: 3 },
  rankXp: { color: Colors.primaryLight, fontSize: 19, fontWeight: "900", position: "absolute", right: 15, top: 14 },
  rankTrack: { position: "absolute", left: 14, right: 14, bottom: 10, height: 5, borderRadius: 3, backgroundColor: "#292A33", overflow: "hidden" },
  rankFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 3 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  sectionTitle: { color: Colors.text, fontSize: 19, fontWeight: "900", letterSpacing: -0.4 },
  sectionAction: { color: Colors.primaryLight, fontSize: 10, fontWeight: "900" },
  scoreCard: { backgroundColor: Colors.surface, borderRadius: 24, borderWidth: 1, borderColor: Colors.primary, padding: 16, ...Design.elevation.card },
  scoreHeader: { flexDirection: "row", alignItems: "center" },
  scoreCopy: { flex: 1, paddingRight: 8 },
  scoreTitle: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 5 },
  scoreSub: { color: Colors.textMuted, fontSize: 9, marginTop: 4 },
  scoreCircle: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#201638", borderWidth: 2, borderColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  scoreNumber: { color: Colors.primaryLight, fontSize: 30, fontWeight: "900", lineHeight: 31 },
  scoreUnit: { color: Colors.textMuted, fontSize: 8, fontWeight: "800" },
  scoreTrack: { height: 7, backgroundColor: "#292A33", borderRadius: 4, overflow: "hidden", marginTop: 15 },
  scoreFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  pillarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  pillar: { width: "48.7%", backgroundColor: "#0D0E12", borderRadius: 13, borderWidth: 1, borderColor: Colors.border, padding: 10 },
  pillarLabel: { color: Colors.textMuted, fontSize: 8, fontWeight: "800" },
  pillarValue: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  pillarTrack: { height: 4, backgroundColor: "#292A33", borderRadius: 2, marginTop: 7, overflow: "hidden" },
  pillarFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 2 },
  insight: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", alignItems: "center" },
  insightMark: { width: 30, height: 30, borderRadius: 10, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  insightCopy: { flex: 1, marginLeft: 9 },
  insightLabel: { color: Colors.primaryLight, fontSize: 7, fontWeight: "900", letterSpacing: 1.2 },
  insightText: { color: Colors.textSecondary, fontSize: 9, marginTop: 2 },
  weekRow: { flexDirection: "row", gap: 10 },
  weekCard: { flex: 1.45, backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  weekTop: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" },
  weekValue: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 3 },
  weekPercent: { color: Colors.success, fontSize: 17, fontWeight: "900" },
  weekTrack: { height: 6, backgroundColor: "#292A33", borderRadius: 3, overflow: "hidden", marginTop: 13 },
  weekFill: { height: "100%", backgroundColor: Colors.success, borderRadius: 3 },
  helper: { color: Colors.textMuted, fontSize: 8, marginTop: 7 },
  rankingCard: { flex: 0.8, backgroundColor: Colors.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, padding: 14, justifyContent: "center" },
  rankingNumber: { color: Colors.text, fontSize: 23, fontWeight: "900", marginTop: 7 },
  coachCard: { backgroundColor: "#15121F", borderRadius: 22, borderWidth: 1, borderColor: "#5A36A6", padding: 16, flexDirection: "row" },
  coachIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  coachCopy: { flex: 1, marginLeft: 12 },
  coachTitle: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 4 },
  coachText: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15, marginTop: 4 },
  coachAction: { color: Colors.primaryLight, fontSize: 10, fontWeight: "900", marginTop: 9 },
  performanceCard: { backgroundColor: Colors.surface, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, padding: 16 },
  performanceTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  volume: { color: Colors.text, fontSize: 28, fontWeight: "900", marginTop: 3 },
  trend: { color: Colors.success, fontSize: 9, fontWeight: "800", marginTop: 2 },
  sessionBadge: { width: 64, height: 64, borderRadius: 18, backgroundColor: Colors.primarySoft, alignItems: "center", justifyContent: "center" },
  sessionNumber: { color: Colors.primaryLight, fontSize: 23, fontWeight: "900" },
  chart: { height: 88, marginTop: 14, flexDirection: "row", alignItems: "flex-end", gap: 7, borderBottomWidth: 1, borderBottomColor: Colors.border },
  chartCol: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center" },
  chartBar: { width: 13, backgroundColor: Colors.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6, opacity: 0.9 },
  days: { flexDirection: "row", justifyContent: "space-around", marginTop: 6 },
  day: { color: Colors.textMuted, fontSize: 8 },
  bottomStats: { flexDirection: "row", gap: 9 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, padding: 13 },
  statValue: { color: Colors.text, fontSize: 16, fontWeight: "900", marginTop: 8 },
});
