import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { Activity, ChevronRight, Flame, Moon, Smile, Sparkles, Trophy, Zap } from "lucide-react-native";
import { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getHomeData } from "@/services/home.service";
import { getRankProgress } from "@/services/ranking.service";

function Metric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Icon color={Colors.primary} size={18} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? <Text style={styles.sectionAction}>{action}</Text> : null}
    </View>
  );
}

function formatScore(value: number | null | undefined) {
  if (value == null) return "—";
  return `${Math.round(Number(value) * 2)}/10`;
}

function formatVolume(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} kg`;
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

  useFocusEffect(useCallback(() => {
    load(true);
  }, [load]));

  async function refresh() {
    try {
      setRefreshing(true);
      await load(true);
    } finally {
      setRefreshing(false);
    }
  }

  if (loading && !data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement de Progress+...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const firstName = data?.profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "toi";
  const ranking = data?.ranking;
  const rankProgress = ranking ? getRankProgress(ranking.score) : null;
  const program = data?.programs?.[0];
  const recovery = data?.recovery;
  const record = data?.records?.[0];
  const volumeChange = data?.volumeChange ?? 0;
  const hasComparison = Boolean(data?.history?.length && data?.monthVolume);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors.primary} />}
        contentContainerStyle={styles.container}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>PROGRESS+</Text>
            <Text style={styles.greeting}>Bonjour {firstName} 👋</Text>
            <Text style={styles.subtitle}>On continue à construire ta progression.</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push("/(app)/profile")}>
            {data?.profile?.avatar_url ? <Text style={styles.avatarText}>●</Text> : <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.levelCard} activeOpacity={0.9} onPress={() => router.push("/(app)/ranking")}>
          <View style={styles.levelTop}>
            <View>
              <Text style={styles.levelLabel}>{ranking?.rank?.toUpperCase() ?? "FER"}</Text>
              <Text style={styles.levelTitle}>{ranking?.score ?? 0} points</Text>
            </View>
            <View style={styles.xpPill}>
              <Sparkles color={Colors.primary} size={15} />
              <Text style={styles.xpText}>{ranking?.season_points ?? 0} saison</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round((rankProgress?.percent ?? 0) * 100)}%` }]} />
          </View>
          <View style={styles.levelBottom}>
            <Text style={styles.levelSmall}>
              {rankProgress?.next ? `${rankProgress.pointsToNext} pts avant ${rankProgress.next.name}` : "Rang maximum atteint"}
            </Text>
            <Text style={styles.levelSmall}>{Math.round((rankProgress?.percent ?? 0) * 100)}%</Text>
          </View>
        </TouchableOpacity>

        <SectionHeader title="Ton programme" />
        {program ? (
          <TouchableOpacity
            style={styles.workoutCard}
            activeOpacity={0.9}
            onPress={() => router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}
          >
            <View style={styles.workoutIcon}><Activity color={Colors.primary} size={28} /></View>
            <View style={styles.workoutInfo}>
              <Text style={styles.workoutType}>{program.name}</Text>
              <Text style={styles.workoutName} numberOfLines={2}>{program.description || "Programme personnalisé"}</Text>
              <Text style={styles.workoutMeta}>Appuie pour voir les exercices et commencer</Text>
            </View>
            <View style={styles.startCircle}><ChevronRight color="#FFFFFF" size={24} /></View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.emptyProgram} onPress={() => router.push("/(app)/workout")}>
            <Activity color={Colors.primary} size={24} />
            <View style={{ flex: 1 }}>
              <Text style={styles.emptyProgramTitle}>Crée ton premier programme</Text>
              <Text style={styles.emptyProgramText}>Ajoute tes exercices, séries, reps et temps de repos.</Text>
            </View>
            <ChevronRight color={Colors.primary} size={20} />
          </TouchableOpacity>
        )}

        <SectionHeader title="Ton état récent" />
        <View style={styles.recoveryCard}>
          <Metric icon={Moon} label="Sommeil" value={formatScore(recovery?.sleep_score)} />
          <View style={styles.divider} />
          <Metric icon={Zap} label="Énergie" value={formatScore(recovery?.energy_score)} />
          <View style={styles.divider} />
          <Metric icon={Smile} label="Humeur" value={formatScore(recovery?.mood_score)} />
        </View>
        <Text style={styles.recoveryHint}>
          {recovery ? `Récupération globale : ${Number(recovery.recovery_score).toLocaleString("fr-FR")}/5` : "Ton prochain check-in apparaîtra ici."}
        </Text>

        <View style={styles.twoColumns}>
          <View style={styles.statCard}>
            <Flame color={Colors.primary} size={21} />
            <Text style={styles.statBig}>{ranking?.streak_days ?? 0}</Text>
            <Text style={styles.statLabel}>jours de série</Text>
          </View>
          <TouchableOpacity style={styles.statCard} onPress={() => router.push("/(app)/ranking")}>
            <Trophy color={Colors.primary} size={21} />
            <Text style={styles.statBig}>#{data?.position ?? "—"}</Text>
            <Text style={styles.statLabel}>classement global</Text>
          </TouchableOpacity>
        </View>

        <SectionHeader title="Progression" action="Voir les stats" />
        <TouchableOpacity style={styles.progressCard} onPress={() => router.push("/(app)/progress")}>
          <View style={styles.progressTitleRow}>
            <View>
              <Text style={styles.progressBig}>{hasComparison ? `${volumeChange >= 0 ? "+" : ""}${volumeChange.toFixed(1)}%` : formatVolume(data?.monthVolume ?? 0)}</Text>
              <Text style={styles.progressLabel}>{hasComparison ? "volume vs mois précédent" : "volume ce mois-ci"}</Text>
            </View>
            <View style={styles.trendBadge}><Text style={styles.trendText}>{hasComparison ? (volumeChange >= 0 ? "↗ EN HAUSSE" : "↘ EN BAISSE") : "EN CONSTRUCTION"}</Text></View>
          </View>
          <View style={styles.progressSummary}>
            <Text style={styles.progressSummaryValue}>{data?.history?.length ?? 0}</Text>
            <Text style={styles.progressSummaryLabel}>séances enregistrées</Text>
          </View>
        </TouchableOpacity>

        <SectionHeader title="Dernier record" />
        {record ? (
          <View style={styles.recordCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordExercise}>{record.exercises?.name ?? "Exercice"}</Text>
              <Text style={styles.recordDate}>Meilleur 1RM estimé : {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg</Text>
            </View>
            <Text style={styles.recordValue}>{Number(record.weight).toLocaleString("fr-FR")} × {record.reps}</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.emptyRecord} onPress={() => program && router.push({ pathname: "/(app)/program/[id]", params: { id: program.id } })}>
            <Trophy color={Colors.primary} size={21} />
            <Text style={styles.emptyRecordText}>Ton premier record apparaîtra après une série enregistrée.</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: 20, paddingBottom: 110, gap: 14 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: Colors.textSecondary },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 2 },
  greeting: { color: Colors.text, fontSize: 28, fontWeight: "900", marginTop: 3 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 3 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", marginLeft: 12 },
  avatarText: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  levelCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 18, borderWidth: 1, borderColor: Colors.border },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  levelLabel: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  levelTitle: { color: Colors.text, fontSize: 22, fontWeight: "900", marginTop: 2 },
  xpPill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12 },
  xpText: { color: Colors.text, fontSize: 12, fontWeight: "800" },
  progressTrack: { height: 7, backgroundColor: Colors.border, borderRadius: 4, marginTop: 15, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 4 },
  levelBottom: { flexDirection: "row", justifyContent: "space-between", marginTop: 7 },
  levelSmall: { color: Colors.textSecondary, fontSize: 11 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 5 },
  sectionTitle: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  sectionAction: { color: Colors.primary, fontSize: 12, fontWeight: "800" },
  workoutCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: Colors.primary, flexDirection: "row", alignItems: "center" },
  workoutIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  workoutInfo: { flex: 1, marginLeft: 13, marginRight: 8 },
  workoutType: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  workoutName: { color: Colors.text, fontSize: 13, fontWeight: "700", marginTop: 3 },
  workoutMeta: { color: Colors.textSecondary, fontSize: 11, marginTop: 5 },
  startCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  emptyProgram: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyProgramTitle: { color: Colors.text, fontSize: 15, fontWeight: "800" },
  emptyProgramText: { color: Colors.textSecondary, fontSize: 12, marginTop: 4, lineHeight: 17 },
  recoveryCard: { backgroundColor: Colors.surface, borderRadius: 18, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "stretch", paddingVertical: 15 },
  metric: { flex: 1, alignItems: "center", gap: 4 },
  metricValue: { color: Colors.text, fontSize: 18, fontWeight: "900" },
  metricLabel: { color: Colors.textSecondary, fontSize: 11 },
  divider: { width: 1, backgroundColor: Colors.border },
  recoveryHint: { color: Colors.textMuted, fontSize: 11, marginTop: -7, textAlign: "right" },
  twoColumns: { flexDirection: "row", gap: 12 },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border },
  statBig: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: 7 },
  statLabel: { color: Colors.textSecondary, fontSize: 11, marginTop: 2 },
  progressCard: { backgroundColor: Colors.surface, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: Colors.border },
  progressTitleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressBig: { color: Colors.text, fontSize: 27, fontWeight: "900" },
  progressLabel: { color: Colors.textSecondary, fontSize: 12 },
  trendBadge: { backgroundColor: Colors.background, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9 },
  trendText: { color: Colors.primary, fontSize: 10, fontWeight: "900" },
  progressSummary: { marginTop: 15, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border, flexDirection: "row", alignItems: "baseline", gap: 7 },
  progressSummaryValue: { color: Colors.text, fontSize: 20, fontWeight: "900" },
  progressSummaryLabel: { color: Colors.textSecondary, fontSize: 12 },
  recordCard: { backgroundColor: Colors.surface, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  recordExercise: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  recordDate: { color: Colors.textSecondary, fontSize: 11, marginTop: 4 },
  recordValue: { color: Colors.primary, fontSize: 20, fontWeight: "900", marginLeft: 10 },
  emptyRecord: { backgroundColor: Colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", gap: 12 },
  emptyRecordText: { color: Colors.textSecondary, flex: 1, fontSize: 13, lineHeight: 18 },
});
