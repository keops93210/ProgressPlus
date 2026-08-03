import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function AddExerciseScreen() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    const data = await getExercises();
    setExercises(data ?? []);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Ajouter un exercice"
        subtitle={`${exercises.length} exercices`}
      />

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/program/configure-exercise",
                params: {
                  id,
                  exerciseId: item.id,
                  name: item.name,
                },
              })
            }
          >
            <Card>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.muscle}>
                {item.primary_muscle}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
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

  name: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: "700",
  },

  muscle: {
    color: Colors.primary,
    marginTop: 6,
  },
});