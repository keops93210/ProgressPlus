import ExerciseCard from "@/components/exercise/ExerciseCard";
import { useFocusEffect } from "expo-router";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import BottomButton from "@/components/ui/BottomButton";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import {
  deleteProgramExercise,
  getProgram,
  getProgramExercises,
} from "@/services/program.service";
import { WorkoutProgram } from "@/types/program";
import { ProgramExercise } from "@/types/programExercise";

export default function ProgramScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [exercises, setExercises] = useState<ProgramExercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id])
  );

  async function load() {
    if (!id) return;

    const programData = await getProgram(id);
    setProgram(programData);

    const exerciseData = await getProgramExercises(id);
    setExercises(exerciseData ?? []);
  }

  async function handleDeleteExercise(exerciseId: string) {
    await deleteProgramExercise(exerciseId);
    await load();
  }

  const totalSets = useMemo(
    () => exercises.reduce((total, exercise) => total + exercise.sets, 0),
    [exercises]
  );

  const estimatedMinutes = useMemo(() => {
    if (exercises.length === 0) return 0;

    const workMinutes = totalSets * 1.5;
    const restMinutes = exercises.reduce(
      (total, exercise) =>
        total + Math.max(0, exercise.sets - 1) * exercise.rest_seconds / 60,
      0
    );

    return Math.max(10, Math.round(workMinutes + restMinutes));
  }, [exercises, totalSets]);

  const startWorkout = () => {
    if (!id || exercises.length === 0) return;

    // Replace the program screen instead of stacking another workout-session.
    // This prevents returning to the previous completed session when the same
    // program is started again.
    router.replace({
      pathname: "/workout-session",
      params: { programId: String(id) },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={program?.name ?? "Programme"}
        subtitle={`${exercises.length} exercice${exercises.length > 1 ? "s" : ""}`}
      />

      <FlatList
        style={styles.list}
        data={exercises}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Card>
              <View style={styles.heroTopRow}>
                <View style={styles.heroCopy}>
                  <Text style={styles.eyebrow}>PRÊT POUR LA SÉANCE ?</Text>
                  <Text style={styles.heroTitle}>
                    {program?.name ?? "Ton entraînement"}
                  </Text>
                  <Text style={styles.heroDescription}>
                    Tout est préparé. Lance la séance et Progress+ suivra ta progression série par série.
                  </Text>
                </View>
              </View>

              <View style={styles.stats}>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{exercises.length}</Text>
                  <Text style={styles.statLabel}>Exercices</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>{totalSets}</Text>
                  <Text style={styles.statLabel}>Séries</Text>
                </View>
                <View style={styles.statBlock}>
                  <Text style={styles.statValue}>~{estimatedMinutes}</Text>
                  <Text style={styles.statLabel}>Minutes</Text>
                </View>
              </View>

              <Button
                title="COMMENCER LA SÉANCE"
                onPress={startWorkout}
                disabled={exercises.length === 0}
                style={styles.startButton}
              />
            </Card>

            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Ta séance</Text>
                <Text style={styles.sectionSubtitle}>
                  {totalSets} séries à réaliser
                </Text>
              </View>
              <Button
                title="AJOUTER"
                onPress={() =>
                  router.push({
                    pathname: "/program/add-exercise",
                    params: { id: String(id) },
                  })
                }
                style={styles.addButton}
              />
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.exerciseItem}>
            <View style={styles.exerciseNumber}>
              <Text style={styles.exerciseNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.exerciseCardWrap}>
              <ExerciseCard
                exercise={item}
                onDelete={() => handleDeleteExercise(item.id)}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyTitle}>Aucun exercice</Text>
              <Text style={styles.emptyDescription}>
                Ajoute ton premier exercice pour construire cette séance.
              </Text>
              <Button
                title="AJOUTER UN EXERCICE"
                onPress={() =>
                  router.push({
                    pathname: "/program/add-exercise",
                    params: { id: String(id) },
                  })
                }
                style={styles.emptyButton}
              />
            </View>
          </Card>
        }
        contentContainerStyle={styles.contentContainer}
      />

      {exercises.length > 0 ? (
        <BottomButton title="COMMENCER LA SÉANCE" onPress={startWorkout} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  list: {
    flex: 1,
    marginTop: 4,
  },
  contentContainer: {
    paddingTop: 12,
    paddingBottom: 130,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: Colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    marginTop: 6,
  },
  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statBlock: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: Colors.primary,
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
  },
  startButton: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 19,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  addButton: {
    minWidth: 86,
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginRight: 8,
  },
  exerciseNumberText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: "900",
  },
  exerciseCardWrap: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 16,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  emptyDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 300,
  },
  emptyButton: {
    marginTop: 18,
  },
});
