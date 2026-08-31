import { router, useFocusEffect } from "expo-router";
import { Activity, ArrowUpRight, CalendarDays, ChevronRight, Dumbbell, Flame, Medal, Moon, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

const BG = "#07070A";
const SURFACE = "#101016";
const SURFACE_2 = "#14121B";
const PURPLE = "#8B5CF6";
const PURPLE_LIGHT = "#B78CFF";
const TEXT = "#F7F5FA";
const MUTED = "#817D8C";
const LINE = "#282532";
const GREEN = "#55E78A";

export default function HomeV03Premium() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const desktop = Platform.OS === "web" ? width >= 900 : width >= 1000;
  const shellWidth = desktop ? Math.min(width - 48, 1380) : Math.max(width * 0.92, 300);
  const [data, setData] = useState<Awaited<ReturnType<typeof getHomeData>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    try { setData(await getHomeData(user.id)); } finally { setLoading(false); }
  }, [user]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading && !data) {
    return <SafeAreaView style={s.safe}><View style={s.loading}><ActivityIndicator color={PURPLE_LIGHT} /><Text style={s.muted}>Chargement de Progress+...</Text></View></SafeAreaView>;
  }

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const ranking = data?.ranking;
  const xp = Number(ranking?.score ?? 0);
  const rank = ranking?.rank ?? "Bronze";
  const rankProgress = Math.round((getRankProgress(xp)?.percent ?? 0) * 100);
  const nextXp = getRankProgress(xp)?.nextScore ?? 1200;
  const program = data?.programs?.[0];
  const weekly = data?.consistency ?? { currentWeek: 0, targetPerWeek: 4 };
  const recovery = data?.recovery;
  const position = data?.position;
  const score = data?.globalScore?.score == null ? 0 : Math.round(Number(data.globalScore.score));
  const volume = Math.round(data?.monthVolume ?? 0);
  const volumeChange = data?.volumeChange ?? 0;
  const sessions = data?.history?.length ?? weekly.currentWeek;
  const recoveryScore = recovery ? Number(recovery.recovery_score) : 0;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={PURPLE_LIGHT} />} contentContainerStyle={s.scroll}>
        <View style={[s.shell, { width: shellWidth }]}>
          <View style={s.header}>
            <View>
              <View style={s.brand}><Sparkles size={13} color={PURPLE_LIGHT} /><Text style={s.brandText}>PROGRESS+</Text></View>
              <Text style={s.greeting}>Bonjour {firstName} <Text style={s.wave}>👋</Text></Text>
              <Text style={s.subtitle}>Prêt à dépasser tes limites aujourd’hui ?</Text>
            </View>
            <TouchableOpacity style={s.avatar} onPress={() => router.push("/(app)/profile")} activeOpacity={0.8}><Text style={s.avatarText}>{firstName[0]?.toUpperCase()}</Text></TouchableOpacity>
          </View>

          <View style={[s.hero, !desktop && s.heroMobile]}>
            <View style={s.heroGlow} />
            <View style={s.heroLeft}>
              <Text style={s.eyebrow}>TON NIVEAU ACTUEL</Text>
              <View style={s.levelRow}><View style={s.medal}><Medal size={31} color={PURPLE_LIGHT} /></View><View><Text style={s.level}>{rank}</Text><Text style={s.xp}>{xp.toLocaleString("fr-FR")} <Text style={s.xpUnit}>XP</Text></Text></View></View>
              <View style={s.progressRow}><View style={s.progressTrack}><View style={[s.progressFill, { width: `${Math.min(rankProgress, 100)}%` }]} /></View><Text style={s.progressPercent}>{rankProgress}%</Text></View>
              <Text style={s.helper}>{Math.max(nextXp - xp, 0).toLocaleString("fr-FR")} XP avant le prochain rang</Text>
            </View>
            <View style={[s.nextLevel, !desktop && s.nextLevelMobile]}>
              <View><Text style={s.eyebrow}>PROCHAINE ÉTAPE</Text><Text style={s.nextTitle}>{rank === "Bronze" ? "Argent" : "Niveau supérieur"}</Text><Text style={s.nextText}>Continue comme ça. Chaque séance compte.</Text></View>
              <TouchableOpacity style={s.outlineButton} onPress={() => router.push("/(app)/ranking")}><Text style={s.outlineText}>Voir les récompenses</Text><ChevronRight size={15} color={PURPLE_LIGHT} /></TouchableOpacity>
            </View>
            <View style={s.mountain}><Activity size={100} color={PURPLE} strokeWidth={1.1} /></View>
          </View>

          <View style={s.sectionHead}><Text style={s.sectionTitle}>Aujourd’hui</Text><Text style={s.sectionMeta}>{sessions} séances récentes</Text></View>
          <View style={[s.todayGrid, !desktop && s.stack]}>
            <TouchableOpacity style={[s.primaryCard, { flex: 1 }]} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })} activeOpacity={0.9}>
              <View style={s.iconBubble}><Dumbbell size={21} color={PURPLE_LIGHT} /></View>
              <Text style={s.cardEyebrow}>PROCHAINE SÉANCE</Text>
              <Text style={s.cardHeading}>{program?.name || "Ton entraînement"}</Text>
              <Text style={s.cardSub}>{program ? "Ton programme est prêt." : "Prépare ta prochaine séance."}</Text>
              <View style={s.detailRow}><Text style={s.detail}>≈ 75 min</Text><Text style={s.detail}>12 exercices</Text></View>
              <View style={s.primaryButton}><Text style={s.primaryButtonText}>{program ? "Démarrer ma séance" : "Voir ma séance"}</Text><ArrowUpRight size={17} color="#FFF" /></View>
            </TouchableOpacity>

            <View style={[s.card, { flex: 1.35 }]}>
              <View style={s.cardTop}><View><Text style={s.cardEyebrow}>OBJECTIF HEBDOMADAIRE</Text><Text style={s.weekNumber}>{weekly.currentWeek}<Text style={s.weekUnit}> / {weekly.targetPerWeek}</Text> <Text style={s.weekLabel}>séances</Text></Text></View><CalendarDays size={20} color={PURPLE_LIGHT} /></View>
              <View style={s.days}>{["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"].map((day, i) => { const active = i < weekly.currentWeek; return <View key={day} style={s.day}><View style={[s.dayDot, active && s.dayDotOn]}>{active && <Text style={s.check}>✓</Text>}</View><Text style={s.dayLabel}>{day}</Text></View>; })}</View>
              <Text style={s.success}>{weekly.currentWeek >= weekly.targetPerWeek ? "Objectif dépassé ! 🔥" : `${Math.max(weekly.targetPerWeek - weekly.currentWeek, 0)} séance${weekly.targetPerWeek - weekly.currentWeek > 1 ? "s" : ""} restante${weekly.targetPerWeek - weekly.currentWeek > 1 ? "s" : ""}`}</Text>
            </View>

            <TouchableOpacity style={[s.card, s.streakCard, { flex: 0.8 }]} onPress={() => router.push("/(app)/stats")}>
              <View style={s.fire}><Flame size={23} color={PURPLE_LIGHT} /></View><Text style={s.cardEyebrow}>SÉRIE ACTUELLE</Text><Text style={s.streak}>{Math.max(weekly.currentWeek, 0)} <Text style={s.streakUnit}>jours</Text></Text><Text style={s.cardSub}>Continue comme ça !</Text><View style={s.streakDots}>{Array.from({ length: 8 }).map((_, i) => <View key={i} style={[s.streakDot, i < Math.min(weekly.currentWeek, 7) && s.streakDotOn]} />)}</View>
            </TouchableOpacity>
          </View>

          <View style={s.sectionHead}><Text style={s.sectionTitle}>Vue rapide</Text><TouchableOpacity onPress={() => router.push("/(app)/stats")}><Text style={s.link}>Voir les stats →</Text></TouchableOpacity></View>
          <View style={[s.metrics, !desktop && s.metricsMobile]}>
            <Metric icon={<CalendarDays size={18} color={PURPLE_LIGHT} />} value={String(weekly.currentWeek)} label="Séances cette semaine" delta={weekly.currentWeek >= weekly.targetPerWeek ? "Objectif atteint" : "En cours"} />
            <Metric icon={<Activity size={18} color={PURPLE_LIGHT} />} value="54" label="Séries cette semaine" delta="+8 vs dernière semaine" />
            <Metric icon={<Dumbbell size={18} color={PURPLE_LIGHT} />} value={`${volume.toLocaleString("fr-FR")} kg`} label="Volume cette période" delta={`${volumeChange >= 0 ? "+" : ""}${volumeChange.toFixed(1)}% vs période précédente`} />
            <Metric icon={<Trophy size={18} color={PURPLE_LIGHT} />} value="10" label="Records battus" delta="+2 nouveaux" />
            <Metric icon={<Zap size={18} color={PURPLE_LIGHT} />} value="1h 24m" label="Durée moyenne" delta="+6 min" />
          </View>

          <View style={[s.analysisGrid, !desktop && s.stack]}>
            <View style={[s.analysisCard, { flex: 1.15 }]}>
              <View style={s.cardTop}><View><Text style={s.cardEyebrow}>TON ACTIVITÉ</Text><Text style={s.analysisTitle}>Volume sur 7 jours</Text></View><Text style={s.filter}>7 jours⌄</Text></View>
              <View style={s.chart}><View style={s.gridLine} /><View style={[s.gridLine, { top: "50%" }]} /><View style={s.bars}>{[38, 52, 44, 63, 78, 59, 48].map((h, i) => <View key={i} style={s.barColumn}><View style={[s.bar, { height: h }]} /><Text style={s.barLabel}>{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i]}</Text></View>)}</View></View>
              <View style={s.average}><Text style={s.muted}>Moyenne</Text><Text style={s.averageValue}>{Math.round(volume / 7 || 0).toLocaleString("fr-FR")} kg</Text></View>
            </View>

            <View style={[s.analysisCard, { flex: 0.85 }]}>
              <View style={s.cardTop}><View><Text style={s.cardEyebrow}>RÉCUPÉRATION</Text><Text style={s.analysisTitle}>État du jour</Text></View><Text style={s.recoveryValue}>{recovery ? `${recoveryScore.toFixed(1)}/5` : "—"}</Text></View>
              <View style={s.recoveryRing}><View style={s.ringInner}><Text style={s.ringScore}>{recovery ? Math.round(recoveryScore * 20) : "—"}</Text><Text style={s.ringUnit}>/100</Text></View></View>
              <View style={s.recoveryItems}><Recovery icon={<Moon size={15} color={PURPLE_LIGHT} />} label="Sommeil" value={recovery?.sleep_score == null ? "—" : `${Math.round(Number(recovery.sleep_score) * 2)}/10`} /><Recovery icon={<Zap size={15} color={PURPLE_LIGHT} />} label="Énergie" value={recovery?.energy_score == null ? "—" : `${Math.round(Number(recovery.energy_score) * 2)}/10`} /><Recovery icon={<Sparkles size={15} color={PURPLE_LIGHT} />} label="Humeur" value={recovery?.mood_score == null ? "—" : `${Math.round(Number(recovery.mood_score) * 2)}/10`} /></View>
            </View>
          </View>

          <TouchableOpacity style={s.coach} activeOpacity={0.9} onPress={() => router.push("/(app)/progress")}>
            <View style={s.coachIcon}><Sparkles size={20} color={PURPLE_LIGHT} /></View><View style={{ flex: 1 }}><Text style={s.cardEyebrow}>PROGRESS+ INSIGHT</Text><Text style={s.coachTitle}>{score ? `${score}/100 — ${data?.globalScore?.label ?? "Bonne progression"}` : "Ton potentiel commence ici"}</Text><Text style={s.coachText}>Analyse tes performances, ta régularité et ta récupération pour voir ce qui progresse vraiment.</Text></View><View style={s.coachArrow}><ArrowUpRight size={18} color={PURPLE_LIGHT} /></View>
          </TouchableOpacity>

          <Text style={s.footer}>Progress+ · Ton entraînement. Ta progression. Ton niveau.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ icon, value, label, delta }: { icon: React.ReactNode; value: string; label: string; delta: string }) {
  return <View style={s.metric}><View style={s.metricIcon}>{icon}</View><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text><Text style={s.metricDelta}>{delta}</Text></View>;
}

function Recovery({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <View style={s.recoveryItem}><View style={s.recoveryIcon}>{icon}</View><View><Text style={s.recoveryLabel}>{label}</Text><Text style={s.recoveryItemValue}>{value}</Text></View></View>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG }, scroll: { paddingBottom: 120 }, shell: { alignSelf: "center", paddingTop: 24 }, loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: BG },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }, brand: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }, brandText: { color: PURPLE_LIGHT, fontSize: 10, fontWeight: "900", letterSpacing: 2.8 }, greeting: { color: TEXT, fontSize: 32, fontWeight: "900", letterSpacing: -1.1 }, wave: { fontSize: 25 }, subtitle: { color: MUTED, fontSize: 12, marginTop: 5 }, avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: SURFACE, borderWidth: 1, borderColor: "#62408B", alignItems: "center", justifyContent: "center" }, avatarText: { color: PURPLE_LIGHT, fontSize: 16, fontWeight: "900" },
  hero: { minHeight: 250, borderRadius: 28, borderWidth: 1, borderColor: "#3C2B52", backgroundColor: SURFACE_2, padding: 30, flexDirection: "row", overflow: "hidden", position: "relative", marginBottom: 32 }, heroMobile: { flexDirection: "column", gap: 24 }, heroGlow: { position: "absolute", width: 520, height: 520, borderRadius: 260, right: -130, top: -220, backgroundColor: "#25123F", opacity: 0.9 }, heroLeft: { flex: 1, zIndex: 2 }, eyebrow: { color: PURPLE_LIGHT, fontSize: 9, fontWeight: "900", letterSpacing: 1.9, marginBottom: 8 }, levelRow: { flexDirection: "row", alignItems: "center", gap: 15 }, medal: { width: 64, height: 64, borderRadius: 20, backgroundColor: "#241734", borderWidth: 1, borderColor: "#6C46A0", alignItems: "center", justifyContent: "center" }, level: { color: TEXT, fontSize: 30, fontWeight: "900" }, xp: { color: PURPLE_LIGHT, fontSize: 23, fontWeight: "900", marginTop: 2 }, xpUnit: { color: MUTED, fontSize: 11 }, progressRow: { flexDirection: "row", alignItems: "center", gap: 13, marginTop: 22 }, progressTrack: { flex: 1, maxWidth: 420, height: 8, borderRadius: 8, backgroundColor: "#292631", overflow: "hidden" }, progressFill: { height: "100%", borderRadius: 8, backgroundColor: PURPLE }, progressPercent: { color: TEXT, fontSize: 12, fontWeight: "900" }, helper: { color: MUTED, fontSize: 10, marginTop: 8 }, nextLevel: { width: 260, justifyContent: "space-between", paddingLeft: 30, borderLeftWidth: 1, borderLeftColor: LINE, zIndex: 2 }, nextLevelMobile: { width: "100%", paddingLeft: 0, borderLeftWidth: 0, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 20 }, nextTitle: { color: TEXT, fontSize: 26, fontWeight: "900" }, nextText: { color: MUTED, fontSize: 11, lineHeight: 17, maxWidth: 210, marginTop: 4 }, outlineButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10, paddingHorizontal: 13, borderRadius: 10, borderWidth: 1, borderColor: "#684694", marginTop: 15 }, outlineText: { color: TEXT, fontSize: 10, fontWeight: "800" }, mountain: { position: "absolute", right: -4, bottom: -16, opacity: 0.28 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 13 }, sectionTitle: { color: TEXT, fontSize: 21, fontWeight: "900", letterSpacing: -0.5 }, sectionMeta: { color: MUTED, fontSize: 10, fontWeight: "700" }, link: { color: PURPLE_LIGHT, fontSize: 10, fontWeight: "900" }, todayGrid: { flexDirection: "row", gap: 14, marginBottom: 30 }, stack: { flexDirection: "column" }, primaryCard: { minHeight: 270, borderRadius: 23, padding: 22, backgroundColor: "#171020", borderWidth: 1, borderColor: "#523471" }, card: { minHeight: 270, borderRadius: 23, padding: 22, backgroundColor: SURFACE, borderWidth: 1, borderColor: LINE }, iconBubble: { width: 45, height: 45, borderRadius: 15, backgroundColor: "#26173A", borderWidth: 1, borderColor: "#63408E", alignItems: "center", justifyContent: "center", marginBottom: 18 }, cardEyebrow: { color: PURPLE_LIGHT, fontSize: 8.5, fontWeight: "900", letterSpacing: 1.5, marginBottom: 7 }, cardHeading: { color: TEXT, fontSize: 22, fontWeight: "900" }, cardSub: { color: MUTED, fontSize: 11, marginTop: 5 }, detailRow: { flexDirection: "row", gap: 18, marginTop: 17 }, detail: { color: "#AAA5B2", fontSize: 9, fontWeight: "800" }, primaryButton: { marginTop: 18, height: 42, borderRadius: 11, backgroundColor: PURPLE, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, primaryButtonText: { color: "#FFF", fontSize: 11, fontWeight: "900" }, cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }, weekNumber: { color: PURPLE_LIGHT, fontSize: 31, fontWeight: "900", marginTop: 3 }, weekUnit: { color: "#A8A4AF", fontSize: 14 }, weekLabel: { color: MUTED, fontSize: 11 }, days: { flexDirection: "row", justifyContent: "space-between", marginTop: 26 }, day: { alignItems: "center", gap: 7 }, dayDot: { width: 29, height: 29, borderRadius: 15, backgroundColor: "#25232C", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#393641" }, dayDotOn: { backgroundColor: PURPLE, borderColor: PURPLE }, check: { color: "#FFF", fontSize: 11, fontWeight: "900" }, dayLabel: { color: MUTED, fontSize: 7.5, fontWeight: "800" }, success: { color: weeklySafeGreen(), fontSize: 10, fontWeight: "900", marginTop: 24 }, streakCard: { backgroundColor: "#120D19", borderColor: "#3B2850" }, fire: { width: 45, height: 45, borderRadius: 15, backgroundColor: "#241535", alignItems: "center", justifyContent: "center", marginBottom: 18 }, streak: { color: TEXT, fontSize: 31, fontWeight: "900" }, streakUnit: { color: MUTED, fontSize: 11 }, streakDots: { flexDirection: "row", gap: 5, marginTop: 25 }, streakDot: { flex: 1, height: 5, borderRadius: 4, backgroundColor: "#292632" }, streakDotOn: { backgroundColor: PURPLE },
  metrics: { flexDirection: "row", gap: 10, marginBottom: 30 }, metricsMobile: { flexWrap: "wrap" }, metric: { flex: 1, minWidth: 145, backgroundColor: SURFACE, borderRadius: 17, borderWidth: 1, borderColor: LINE, padding: 16 }, metricIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#20152E", alignItems: "center", justifyContent: "center", marginBottom: 13 }, metricValue: { color: TEXT, fontSize: 21, fontWeight: "900" }, metricLabel: { color: MUTED, fontSize: 9, fontWeight: "700", marginTop: 3 }, metricDelta: { color: GREEN, fontSize: 8.5, fontWeight: "800", marginTop: 9 },
  analysisGrid: { flexDirection: "row", gap: 14, marginBottom: 18 }, analysisCard: { minHeight: 315, borderRadius: 23, padding: 22, backgroundColor: SURFACE, borderWidth: 1, borderColor: LINE }, analysisTitle: { color: TEXT, fontSize: 16, fontWeight: "900" }, filter: { color: MUTED, fontSize: 9, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: LINE }, chart: { height: 185, marginTop: 16, position: "relative" }, gridLine: { position: "absolute", left: 0, right: 0, top: "25%", borderTopWidth: 1, borderTopColor: "#201E25" }, bars: { height: "100%", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", paddingBottom: 22 }, barColumn: { height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 6, width: "11%" }, bar: { width: "65%", minHeight: 8, borderRadius: 7, backgroundColor: PURPLE }, barLabel: { color: MUTED, fontSize: 8 }, average: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#15121C", borderRadius: 12, padding: 13 }, averageValue: { color: TEXT, fontSize: 15, fontWeight: "900" }, muted: { color: MUTED, fontSize: 10, fontWeight: "700" }, recoveryValue: { color: PURPLE_LIGHT, fontSize: 14, fontWeight: "900" }, recoveryRing: { width: 126, height: 126, borderRadius: 63, borderWidth: 9, borderColor: "#332245", alignSelf: "center", marginTop: 18, alignItems: "center", justifyContent: "center" }, ringInner: { alignItems: "center" }, ringScore: { color: TEXT, fontSize: 28, fontWeight: "900" }, ringUnit: { color: MUTED, fontSize: 9 }, recoveryItems: { flexDirection: "row", justifyContent: "space-around", marginTop: 18 }, recoveryItem: { alignItems: "center", gap: 5 }, recoveryIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#21162F", alignItems: "center", justifyContent: "center" }, recoveryLabel: { color: MUTED, fontSize: 8 }, recoveryItemValue: { color: TEXT, fontSize: 10, fontWeight: "900" }, coach: { minHeight: 104, borderRadius: 22, borderWidth: 1, borderColor: "#523471", backgroundColor: "#130E1A", padding: 20, flexDirection: "row", alignItems: "center", gap: 15 }, coachIcon: { width: 46, height: 46, borderRadius: 14, backgroundColor: "#27173B", alignItems: "center", justifyContent: "center" }, coachTitle: { color: TEXT, fontSize: 17, fontWeight: "900" }, coachText: { color: MUTED, fontSize: 10, lineHeight: 16, marginTop: 4, maxWidth: 650 }, coachArrow: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, borderColor: "#523471", alignItems: "center", justifyContent: "center" }, footer: { color: "#4F4B56", textAlign: "center", fontSize: 8, fontWeight: "700", marginTop: 24, letterSpacing: 0.5 }
});

function weeklySafeGreen() { return GREEN; }
