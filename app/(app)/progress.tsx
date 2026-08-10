import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { getPersonalRecords, getWorkoutHistory, PersonalRecordItem, WorkoutHistoryItem } from "@/services/workout-session.service";
import { getRankingProfile, getRankProgress, RANKS, RankingProfile } from "@/services/ranking.service";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes === 0 ? `${remainingSeconds}s` : `${minutes} min${remainingSeconds ? ` ${remainingSeconds}s` : ""}`;
}

function formatVolume(volume: number | null) {
  return `${Math.round(Number(volume ?? 0)).toLocaleString("fr-FR")} kg`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function getDayKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export default function Progress() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [records, setRecords] = useState<PersonalRecordItem[]>([]);
  const [profile, setProfile] = useState<RankingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (refresh = false) => {
    if (!user) return;
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      const [historyData, recordsData, ranking] = await Promise.all([getWorkoutHistory(user.id), getPersonalRecords(user.id), getRankingProfile(user.id)]);
      setHistory(historyData);
      setRecords(recordsData);
      setProfile(ranking);
    } catch (error) {
      console.log("PROGRESS DATA ERROR =", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => {
    const completed = history.filter((session) => session.finished_at);
    const now = Date.now();
    const weekStart = now - 7 * 24 * 60 * 60 * 1000;
    const previousWeekStart = now - 14 * 24 * 60 * 60 * 1000;
    const thisWeek = completed.filter((session) => new Date(session.finished_at ?? session.started_at).getTime() >= weekStart);
    const previousWeek = completed.filter((session) => {
      const timestamp = new Date(session.finished_at ?? session.started_at).getTime();
      return timestamp >= previousWeekStart && timestamp < weekStart;
    });
    const thisWeekVolume = thisWeek.reduce((total, session) => total + Number(session.total_volume ?? 0), 0);
    const previousWeekVolume = previousWeek.reduce((total, session) => total + Number(session.total_volume ?? 0), 0);
    const volumeDelta = previousWeekVolume > 0 ? Math.round(((thisWeekVolume - previousWeekVolume) / previousWeekVolume) * 100) : null;
    const totalDuration = thisWeek.reduce((total, session) => total + Number(session.duration_seconds ?? 0), 0);
    const activeDays = new Set(thisWeek.map((session) => getDayKey(session.finished_at ?? session.started_at))).size;

    const sortedDates = Array.from(new Set(completed.map((session) => getDayKey(session.finished_at ?? session.started_at))))
      .map((key) => new Date(key.split("-").map(Number)[0], key.split("-").map(Number)[1], key.split("-").map(Number)[2]).getTime())
      .sort((a, b) => b - a);
    let streak = 0;
    if (sortedDates.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const firstDate = new Date(sortedDates[0]);
      firstDate.setHours(0, 0, 0, 0);
      const daysSinceLast = Math.round((today.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000));
      if (daysSinceLast <= 1) {
        streak = 1;
        for (let index = 1; index < sortedDates.length; index += 1) {
          const current = new Date(sortedDates[index - 1]);
          const previous = new Date(sortedDates[index]);
          current.setHours(0, 0, 0, 0);
          previous.setHours(0, 0, 0, 0);
          const gap = Math.round((current.getTime() - previous.getTime()) / (24 * 60 * 60 * 1000));
          if (gap !== 1) break;
          streak += 1;
        }
      }
    }

    return {
      sessions: completed.length,
      volume: completed.reduce((total, session) => total + Number(session.total_volume ?? 0), 0),
      sets: completed.reduce((total, session) => total + Number(session.total_sets ?? 0), 0),
      thisWeekSessions: thisWeek.length,
      thisWeekVolume,
      previousWeekVolume,
      volumeDelta,
      averageDuration: thisWeek.length > 0 ? Math.round(totalDuration / thisWeek.length) : 0,
      activeDays,
      streak,
    };
  }, [history]);

  if (loading) return <SafeAreaView style={styles.container}><View style={styles.loading}><ActivityIndicator /><Text style={styles.loadingText}>Chargement de ta progression...</Text></View></SafeAreaView>;

  const score = profile?.score ?? 0;
  const rankProgress = getRankProgress(score);
  const nextRank = rankProgress.next?.name ?? "MAX";

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<View>
          <Text style={styles.title}>Ma progression</Text>
          <Text style={styles.subtitle}>Tes performances et ta progression dans Progress+.</Text>

          <Card style={styles.rankCard}>
            <View style={styles.rankTop}>
              <View><Text style={styles.rankEyebrow}>RANG ACTUEL</Text><Text style={styles.rankName}>{rankProgress.current.name}</Text></View>
              <Text style={styles.rankScore}>{score.toLocaleString("fr-FR")} XP</Text>
            </View>
            <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.round(rankProgress.percent * 100)}%` }]} /></View>
            <View style={styles.rankBottom}><Text style={styles.rankHint}>{rankProgress.next ? `${rankProgress.pointsToNext.toLocaleString("fr-FR")} XP avant ${nextRank}` : "Rang maximum atteint"}</Text><Text style={styles.rankPercent}>{Math.round(rankProgress.percent * 100)}%</Text></View>
          </Card>

          <Text style={styles.sectionTitle}>Ton rythme cette semaine</Text>
          <Card style={styles.weekCard}>
            <View style={styles.weekHeader}>
              <View>
                <Text style={styles.weekEyebrow}>7 DERNIERS JOURS</Text>
                <Text style={styles.weekTitle}>{stats.thisWeekSessions} séance{stats.thisWeekSessions > 1 ? "s" : ""}</Text>
              </View>
              <View style={styles.streakBadge}>
                <Text style={styles.streakValue}>{stats.streak}</Text>
                <Text style={styles.streakLabel}>jour{stats.streak > 1 ? "s" : ""} de série</Text>
              </View>
            </View>
            <View style={styles.weekMetrics}>
              <View style={styles.weekMetric}><Text style={styles.weekMetricValue}>{formatVolume(stats.thisWeekVolume)}</Text><Text style={styles.weekMetricLabel}>volume</Text></View>
              <View style={styles.weekDivider} />
              <View style={styles.weekMetric}><Text style={styles.weekMetricValue}>{formatDuration(stats.averageDuration)}</Text><Text style={styles.weekMetricLabel}>durée moyenne</Text></View>
              <View style={styles.weekDivider} />
              <View style={styles.weekMetric}><Text style={styles.weekMetricValue}>{stats.activeDays}/7</Text><Text style={styles.weekMetricLabel}>jours actifs</Text></View>
            </View>
            <View style={styles.weekComparison}>
              <Text style={styles.weekComparisonLabel}>Volume vs semaine précédente</Text>
              <Text style={styles.weekComparisonValue}>
                {stats.volumeDelta === null ? "Première semaine" : `${stats.volumeDelta >= 0 ? "+" : ""}${stats.volumeDelta}%`}
              </Text>
            </View>
          </Card>

          <Text style={styles.sectionTitle}>Tes gains réels</Text>
          <Card style={styles.explainerCard}>
            <Text style={styles.explainerTitle}>Aucune validation manuelle</Text>
            <Text style={styles.explainerText}>Progress+ attribue les XP uniquement à partir des données réellement enregistrées dans l'application : séances terminées, séries, volume, records personnels et régularité.</Text>
          </Card>

          <View style={styles.earningsGrid}>
            <Card style={styles.earningCard}><Text style={styles.earningValue}>{stats.sessions}</Text><Text style={styles.earningLabel}>séances terminées</Text></Card>
            <Card style={styles.earningCard}><Text style={styles.earningValue}>{stats.sets}</Text><Text style={styles.earningLabel}>séries enregistrées</Text></Card>
            <Card style={styles.earningCard}><Text style={styles.earningValue}>{formatVolume(stats.volume)}</Text><Text style={styles.earningLabel}>volume enregistré</Text></Card>
            <Card style={styles.earningCard}><Text style={styles.earningValue}>{records.length}</Text><Text style={styles.earningLabel}>records détectés</Text></Card>
          </View>

          <Text style={styles.sectionTitle}>Les rangs</Text>
          <Card style={styles.ranksCard}>{RANKS.map((rank, index) => <View key={rank.name} style={[styles.rankRow, index === RANKS.length - 1 && styles.rankRowLast]}><Text style={[styles.rankRowName, score >= rank.min && styles.rankRowActive]}>{rank.name}</Text><Text style={styles.rankRowXP}>{rank.min.toLocaleString("fr-FR")} XP</Text></View>)}</Card>

          {records.length > 0 && <View><Text style={styles.sectionTitle}>Records personnels</Text><View style={styles.recordsGrid}>{records.map((record) => <Card key={record.id} style={styles.recordCard}><Text style={styles.recordExercise} numberOfLines={1}>{record.exercises?.name ?? "Exercice"}</Text><Text style={styles.recordWeight}>{Number(record.weight).toLocaleString("fr-FR")} kg × {record.reps}</Text><Text style={styles.record1rm}>1RM estimé : {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg</Text></Card>)}</View></View>}
          <Text style={styles.sectionTitle}>Historique</Text>
        </View>}
        ListEmptyComponent={<Card><Text style={styles.emptyTitle}>Aucune séance terminée</Text><Text style={styles.emptyText}>Lance ta première séance pour commencer à construire ton historique.</Text></Card>}
        renderItem={({ item }) => <Card><View style={styles.sessionHeader}><View style={styles.sessionTitleContainer}><Text style={styles.sessionTitle}>{item.workout_programs?.name ?? "Séance"}</Text><Text style={styles.sessionDate}>{formatDate(item.finished_at ?? item.started_at)}</Text></View><Text style={styles.sessionDuration}>{formatDuration(item.duration_seconds)}</Text></View><View style={styles.sessionStats}><Text style={styles.sessionStat}>{formatVolume(item.total_volume)}</Text><Text style={styles.sessionStat}>{item.total_sets ?? 0} séries</Text></View></Card>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background,paddingHorizontal:20}, content:{paddingTop:20,paddingBottom:40,gap:14}, loading:{flex:1,alignItems:"center",justifyContent:"center",gap:12}, loadingText:{color:Colors.textSecondary}, title:{color:Colors.text,fontSize:30,fontWeight:"800"}, subtitle:{color:Colors.textSecondary,fontSize:15,marginTop:6,marginBottom:20},
  rankCard:{padding:18}, rankTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}, rankEyebrow:{color:Colors.textSecondary,fontSize:11,fontWeight:"800",letterSpacing:1}, rankName:{color:Colors.text,fontSize:28,fontWeight:"900",marginTop:4}, rankScore:{color:Colors.primary,fontSize:18,fontWeight:"800"}, progressTrack:{height:10,borderRadius:10,backgroundColor:Colors.border,overflow:"hidden",marginTop:18}, progressFill:{height:"100%",backgroundColor:Colors.primary,borderRadius:10}, rankBottom:{flexDirection:"row",justifyContent:"space-between",marginTop:9}, rankHint:{color:Colors.textSecondary,fontSize:12}, rankPercent:{color:Colors.text,fontSize:12,fontWeight:"700"},
  sectionTitle:{color:Colors.text,fontSize:20,fontWeight:"800",marginTop:20,marginBottom:10}, weekCard:{padding:18}, weekHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}, weekEyebrow:{color:Colors.textSecondary,fontSize:10,fontWeight:"900",letterSpacing:1}, weekTitle:{color:Colors.text,fontSize:24,fontWeight:"900",marginTop:4}, streakBadge:{minWidth:82,alignItems:"center",paddingHorizontal:10,paddingVertical:8,borderRadius:14,backgroundColor:Colors.primary + "12",borderWidth:1,borderColor:Colors.primary + "35"}, streakValue:{color:Colors.primary,fontSize:20,fontWeight:"900"}, streakLabel:{color:Colors.textSecondary,fontSize:9,fontWeight:"800",marginTop:1}, weekMetrics:{flexDirection:"row",alignItems:"center",marginTop:18,paddingTop:14,borderTopWidth:1,borderTopColor:Colors.border}, weekMetric:{flex:1}, weekMetricValue:{color:Colors.text,fontSize:14,fontWeight:"900"}, weekMetricLabel:{color:Colors.textSecondary,fontSize:10,marginTop:3}, weekDivider:{width:1,height:32,backgroundColor:Colors.border,marginHorizontal:10}, weekComparison:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:14,paddingTop:12,borderTopWidth:1,borderTopColor:Colors.border}, weekComparisonLabel:{color:Colors.textSecondary,fontSize:11}, weekComparisonValue:{color:Colors.primary,fontSize:12,fontWeight:"900"},
  explainerCard:{padding:16}, explainerTitle:{color:Colors.text,fontSize:16,fontWeight:"800"}, explainerText:{color:Colors.textSecondary,fontSize:13,lineHeight:19,marginTop:7}, earningsGrid:{flexDirection:"row",flexWrap:"wrap",gap:10,marginTop:10}, earningCard:{width:"48%",padding:14}, earningValue:{color:Colors.primary,fontSize:20,fontWeight:"900"}, earningLabel:{color:Colors.textSecondary,fontSize:12,marginTop:4},
  ranksCard:{paddingVertical:4}, rankRow:{flexDirection:"row",justifyContent:"space-between",paddingVertical:11,paddingHorizontal:14,borderBottomWidth:1,borderBottomColor:Colors.border}, rankRowLast:{borderBottomWidth:0}, rankRowName:{color:Colors.textSecondary,fontSize:14,fontWeight:"700"}, rankRowActive:{color:Colors.primary}, rankRowXP:{color:Colors.textSecondary,fontSize:13}, recordsGrid:{gap:10}, recordCard:{padding:16}, recordExercise:{color:Colors.text,fontSize:16,fontWeight:"800"}, recordWeight:{color:Colors.primary,fontSize:18,fontWeight:"800",marginTop:6}, record1rm:{color:Colors.textSecondary,fontSize:12,marginTop:4}, sessionHeader:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"}, sessionTitleContainer:{flex:1}, sessionTitle:{color:Colors.text,fontSize:18,fontWeight:"700"}, sessionDate:{color:Colors.textSecondary,fontSize:13,marginTop:4}, sessionDuration:{color:Colors.primary,fontWeight:"700",marginLeft:12}, sessionStats:{flexDirection:"row",gap:24,marginTop:16,paddingTop:12,borderTopWidth:1,borderTopColor:Colors.border}, sessionStat:{color:Colors.textSecondary,fontSize:14}, emptyTitle:{color:Colors.text,fontSize:18,fontWeight:"700"}, emptyText:{color:Colors.textSecondary,fontSize:14,lineHeight:20,marginTop:8}
});