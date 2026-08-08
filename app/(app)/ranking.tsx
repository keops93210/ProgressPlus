import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Crown, Trophy } from "lucide-react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getGlobalRanking,
  getRankProgress,
  getRankingProfile,
  getUserRankingPosition,
  RankingRow,
} from "@/services/ranking.service";

export default function RankingScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [ranking, setRanking] = useState<RankingRow[]>([]);
  const [position, setPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [profileData, rankingData, positionData] = await Promise.all([
      getRankingProfile(user.id),
      getGlobalRanking(50),
      getUserRankingPosition(user.id),
    ]);
    setProfile(profileData);
    setRanking(rankingData);
    setPosition(positionData);
  }, [user]);

  useEffect(() => {
    load().catch((error) => console.log("RANKING ERROR =", error)).finally(() => setLoading(false));
  }, [load]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  if (loading || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.muted}>Chargement du classement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const progress = getRankProgress(profile.score);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.eyebrow}>PROGRESS+</Text>
        <Text style={styles.title}>Classement</Text>
        <Text style={styles.subtitle}>Ta progression contre la communauté.</Text>

        <Card style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.rankLabel}>RANG ACTUEL</Text>
              <Text style={styles.rank}>{profile.rank}</Text>
            </View>
            <View style={styles.trophy}>
              <Crown color={Colors.primaryLight} size={30} />
            </View>
          </View>

          <View style={styles.scoreRow}>
            <Text style={styles.score}>{profile.score.toLocaleString("fr-FR")}</Text>
            <Text style={styles.points}> points</Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress.percent * 100}%` }]} />
          </View>

          <View style={styles.nextRow}>
            <Text style={styles.muted}>{progress.next ? `Prochain rang : ${progress.next.name}` : "Rang maximum"}</Text>
            <Text style={styles.green}>{progress.next ? `${progress.pointsToNext} pts` : "MAX"}</Text>
          </View>
        </Card>

        <View style={styles.personalRow}>
          <Card style={styles.personalCard}>
            <Text style={styles.muted}>CLASSEMENT MONDIAL</Text>
            <Text style={styles.bigValue}>#{position ?? "—"}</Text>
          </Card>
          <Card style={styles.personalCard}>
            <Text style={styles.muted}>SAISON</Text>
            <Text style={styles.bigValue}>{profile.season_points}</Text>
            <Text style={styles.muted}>points</Text>
          </Card>
        </View>

        <Text style={styles.sectionTitle}>🏆 Top 50 mondial</Text>

        {ranking.map((row) => {
          const isMe = row.user_id === user?.id;
          return (
            <Card key={row.user_id} style={[styles.row, isMe && styles.myRow]}>
              <View style={styles.position}>
                {row.position <= 3 ? (
                  <Trophy color={Colors.primary} size={18} />
                ) : (
                  <Text style={styles.positionText}>#{row.position}</Text>
                )}
              </View>
              <View style={styles.rowMain}>
                <Text style={styles.rowRank}>{row.rank}{isMe ? " · TOI" : ""}</Text>
                <Text style={styles.rowMeta}>{row.season_points} pts saison · {row.streak_days} j de série</Text>
              </View>
              <Text style={styles.rowScore}>{row.score.toLocaleString("fr-FR")}</Text>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  content: { paddingTop: 20, paddingBottom: 40, gap: 12 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  eyebrow: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 2 },
  title: { color: Colors.text, fontSize: 32, fontWeight: "900", marginTop: 2 },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginBottom: 10 },
  hero: { borderColor: Colors.primary, padding: 20 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rankLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  rank: { color: Colors.primaryLight, fontSize: 34, fontWeight: "900", marginTop: 3 },
  trophy: { width: 58, height: 58, borderRadius: 29, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  scoreRow: { flexDirection: "row", alignItems: "baseline", marginTop: 20 },
  score: { color: Colors.text, fontSize: 38, fontWeight: "900" },
  points: { color: Colors.textSecondary, fontSize: 14, marginLeft: 5 },
  progressTrack: { height: 8, borderRadius: 8, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 14 },
  progressFill: { height: "100%", backgroundColor: Colors.primary, borderRadius: 8 },
  nextRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  green: { color: Colors.primaryLight, fontWeight: "800" },
  muted: { color: Colors.textSecondary, fontSize: 12 },
  personalRow: { flexDirection: "row", gap: 10 },
  personalCard: { flex: 1, padding: 16 },
  bigValue: { color: Colors.text, fontSize: 25, fontWeight: "900", marginTop: 7 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: "900", marginTop: 12, marginBottom: 2 },
  row: { flexDirection: "row", alignItems: "center", padding: 14 },
  myRow: { borderColor: Colors.primary, borderWidth: 1 },
  position: { width: 38, alignItems: "center" },
  positionText: { color: Colors.textSecondary, fontWeight: "800" },
  rowMain: { flex: 1, marginLeft: 8 },
  rowRank: { color: Colors.text, fontSize: 16, fontWeight: "800" },
  rowMeta: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  rowScore: { color: Colors.primaryLight, fontSize: 16, fontWeight: "900" },
});
