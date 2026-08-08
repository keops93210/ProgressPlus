import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function AddExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadExercises() {
      try {
        setLoading(true);
        setError(null);
        const data = await getExercises();
        if (!cancelled) setExercises(data ?? []);
      } catch (loadError) {
        console.log("ADD EXERCISE ERROR =", loadError);
        if (!cancelled) setError("Impossible de charger la bibliothèque d'exercices.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadExercises();
    return () => { cancelled = true; };
  }, []);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exercises;
    return exercises.filter((exercise) => [exercise.name, exercise.primary_muscle, exercise.equipment ?? ""].some((value) => value.toLowerCase().includes(query)));
  }, [exercises, search]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ajouter un exercice" subtitle={`${filteredExercises.length} résultat${filteredExercises.length > 1 ? "s" : ""}`} />
      <TextInput
        style={styles.input}
        placeholder="Rechercher : développé couché, pectoraux..."
        placeholderTextColor={Colors.textMuted}
        value={search}
        onChangeText={setSearch}
        autoCorrect={false}
      />

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Chargement de la bibliothèque...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => id && router.push({ pathname: "/program/configure-exercise", params: { id: String(id), exerciseId: item.id, name: item.name } })}
              disabled={!id}
            >
              <Card>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muscle}>{item.primary_muscle}</Text>
                {item.equipment ? <Text style={styles.equipment}>{item.equipment}</Text> : null}
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun exercice ne correspond à ta recherche.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  input: { height: 56, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, color: Colors.text, paddingHorizontal: 16, marginBottom: 14, fontSize: 15 },
  name: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  muscle: { color: Colors.primary, marginTop: 6, fontWeight: "700" },
  equipment: { color: Colors.textSecondary, fontSize: 12, marginTop: 4 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: Colors.textSecondary },
  error: { color: "#DC2626", textAlign: "center", fontWeight: "700" },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 40 },
});
