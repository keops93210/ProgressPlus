import { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredExercises(exercises);
      return;
    }

    const filtered = exercises.filter((exercise) =>
      exercise.name.toLowerCase().includes(search.toLowerCase())
    );

    setFilteredExercises(filtered);
  }, [search, exercises]);

  async function loadExercises() {
    try {
      const data = await getExercises();

      setExercises(data ?? []);
      setFilteredExercises(data ?? []);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Exercices</Text>

      <TextInput
        style={styles.input}
        placeholder="Rechercher..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.name}</Text>

            <Text style={styles.muscle}>
              {item.primary_muscle}
            </Text>
          </Card>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Aucun exercice trouvé.
          </Text>
        }
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

  title: {
    color: Colors.text,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 20,
  },

  input: {
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
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

  empty: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
});