import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPersonalRecords,
  getWorkoutHistory,
  PersonalRecordItem,
  WorkoutHistoryItem,
} from "@/services/workout-session.service";

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) return `${remainingSeconds}s`;
  return `${minutes} min${remainingSeconds ? ` ${remainingSeconds}s` : ""}`;
}

function formatVolume(volume: number | null) {
  if (!volume) return "0 kg";
  return `${Math.round(Number(volume)).toLocaleString("fr-FR")} kg`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Progress() {
  const { user } = useAuth();
  const [history, setHistory] = useState<WorkoutHistoryItem[]>([]);
  const [records, setRecords] = useState<PersonalRecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [historyData, recordsData] = await Promise.all([
        getWorkoutHistory(user.id),
        getPersonalRecords(user.id),
      ]);
      setHistory(historyData);
      setRecords(recordsData);
    } catch (error) {
      console.log("PROGRESS DATA ERROR =", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      const [historyData, recordsData] = await Promise.all([
        getWorkoutHistory(user.id),
        getPersonalRecords(user.id),
      ]);
      setHistory(historyData);
      setRecords(recordsData);
    } catch (error) {
      console.log("PROGRESS REFRESH ERROR =", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const completed = history.filter((session) => session.finished_at);

    return {
      sessions: completed.length,
      volume: completed.reduce(
        (total, session) => total + Number(session.total_volume ?? 0),
        0
      ),
      sets: completed.reduce(
        (total, session) => total + Number(session.total_sets ?? 0),
        0
      ),
    };
  }, [history]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Chargement de ta progression...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Ma progression</Text>
            <Text style={styles.subtitle}>
              Tes performances, tes records et ton historique d'entraînement.
            </Text>

            <View style={styles.statsRow}>
              <View style={styles.statWrapper}>
                <Card>
                  <Text style={styles.statValue}>{stats.sessions}</Text>
                  <Text style={styles.statLabel}>Séances</Text>
                </Card>
              </View>
              <View style={styles.statWrapper}>
                <Card>
                  <Text style={styles.statValue}>{formatVolume(stats.volume)}</Text>
                  <Text style={styles.statLabel}>Volume</Text>
                </Card>
              </View>
              <View style={styles.statWrapper}>
                <Card>
                  <Text style={styles.statValue}>{stats.sets}</Text>
                  <Text style={styles.statLabel}>Séries</Text>
                </Card>
              </View>
            </View>

            {records.length > 0 && (
              <View>
                <Text style={styles.sectionTitle}>🏆 Records personnels</Text>
                <View style={styles.recordsGrid}>
                  {records.map((record) => (
                    <Card key={record.id} style={styles.recordCard}>
                      <Text style={styles.recordExercise} numberOfLines={1}>
                        {record.exercises?.name ?? "Exercice"}
                      </Text>
                      <Text style={styles.recordWeight}>
                        {Number(record.weight).toLocaleString("fr-FR")} kg × {record.reps}
                      </Text>
                      <Text style={styles.record1rm}>
                        1RM estimé : {Number(record.estimated_1rm ?? 0).toLocaleString("fr-FR")} kg
                      </Text>
                    </Card>
                  ))}
                </View>
              </View>
            )}

            <Text style={styles.sectionTitle}>Historique</Text>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text style={styles.emptyTitle}>Aucune séance terminée</Text>
            <Text style={styles.emptyText}>
              Lance ta première séance pour commencer à construire ton historique.
            </Text>
          </Card>
        }
        renderItem={({ item }) => (
          <Card>
            <View style={styles.sessionHeader}>
              <View style={styles.sessionTitleContainer}>
                <Text style={styles.sessionTitle}>
                  {item.workout_programs?.name ?? "Séance"}
                </Text>
                <Text style={styles.sessionDate}>
                  {formatDate(item.finished_at ?? item.started_at)}
                </Text>
              </View>
              <Text style={styles.sessionDuration}>
                {formatDuration(item.duration_seconds)}
              </Text>
            </View>

            <View style={styles.sessionStats}>
              <Text style={styles.sessionStat}>{formatVolume(item.total_volume)}</Text>
              <Text style={styles.sessionStat}>{item.total_sets ?? 0} séries</Text>
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 40,
    gap: 14,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    color: Colors.textSecondary,
  },
  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginTop: 6,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statWrapper: {
    flex: 1,
  },
  statValue: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 10,
  },
  recordsGrid: {
    gap: 10,
  },
  recordCard: {
    padding: 16,
  },
  recordExercise: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "800",
  },
  recordWeight: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  record1rm: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sessionTitleContainer: {
    flex: 1,
  },
  sessionTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sessionDate: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  sessionDuration: {
    color: Colors.primary,
    fontWeight: "700",
    marginLeft: 12,
  },
  sessionStats: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sessionStat: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
});
