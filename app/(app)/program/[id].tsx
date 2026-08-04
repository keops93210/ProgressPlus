import ExerciseCard from "@/components/exercise/ExerciseCard";
import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
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

  const [program, setProgram] =
    useState<WorkoutProgram | null>(null);

  const [exercises, setExercises] =
    useState<ProgramExercise[]>([]);

    useFocusEffect(
  useCallback(() => {
    load();
  }, [id])
);

async function load() {
  if (!id) return;

  console.log("ID reçu =", id);

  const programData = await getProgram(id);
  console.log("PROGRAM =", programData);

  setProgram(programData);

  const exerciseData = await getProgramExercises(id);
  console.log("EXERCISES =", exerciseData);

  setExercises(exerciseData ?? []);
}
  async function handleDeleteExercise(
    exerciseId: string
  ) {
    await deleteProgramExercise(exerciseId);
    await load();
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title={program?.name ?? "Programme"}
        subtitle={`${exercises.length} exercice${
          exercises.length > 1 ? "s" : ""
        }`}
      />

      <Card>
        <View style={styles.stats}>
          <View>
            <Text style={styles.statValue}>
              {exercises.length}
            </Text>
            <Text style={styles.statLabel}>
              Exercices
            </Text>
          </View>

          <View>
            <Text style={styles.statValue}>
              {exercises.reduce(
                (total, e) => total + e.sets,
                0
              )}
            </Text>
            <Text style={styles.statLabel}>
              Séries
            </Text>
          </View>

          <View>
            <Text style={styles.statValue}>
              ~{Math.max(
                15,
                exercises.length * 12
              )}{" "}
              min
            </Text>
            <Text style={styles.statLabel}>
              Durée
            </Text>
          </View>
        </View>
      </Card>

      <Button
        title="AJOUTER UN EXERCICE"
        onPress={() =>
          router.push({
            pathname: "/program/add-exercise",
            params: {
              id: String(id),
            },
          })
        }
        style={{ marginTop: 20 }}
      />

      <FlatList
        style={{ marginTop: 20 }}
        data={exercises}
        keyExtractor={(item) => item.id}
renderItem={({ item }) => (
  <ExerciseCard
    exercise={item}
    onDelete={() =>
      handleDeleteExercise(item.id)
    }
  />
)}
        ListEmptyComponent={
          <Card>
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>
                💪
              </Text>

              <Text style={styles.emptyTitle}>
                Aucun exercice
              </Text>

              <Text
                style={styles.emptyDescription}
              >
                Ajoute ton premier exercice{"\n"}
                pour commencer ce programme.
              </Text>
            </View>
          </Card>
        }
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      />

<BottomButton
  title="COMMENCER LA SÉANCE"
  onPress={() =>
    router.push({
      pathname: "/workout-session",
      params: {
        programId: String(id),
      },
    })
  }
  disabled={exercises.length === 0}
/>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  statValue: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },

  statLabel: {
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
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
    fontWeight: "700",
    marginBottom: 8,
  },

  emptyDescription: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});