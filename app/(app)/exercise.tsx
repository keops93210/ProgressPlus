import { router } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { loadExercises(); }, []);

  useEffect(() => {
    if (!search.trim()) return setFilteredExercises(exercises);
    setFilteredExercises(exercises.filter((exercise) => exercise.name.toLowerCase().includes(search.toLowerCase())));
  }, [search, exercises]);

  async function loadExercises() {
    try {
      const data = await getExercises();
      setExercises(data ?? []);
      setFilteredExercises(data ?? []);
    } catch (error) { console.log(error); }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>BIBLIOTHÈQUE</Text>
          <Text style={styles.title}>Exercices</Text>
        </View>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Rechercher un exercice..."
        placeholderTextColor={Colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push({ pathname: "/exercise-detail", params: { id: item.id } })}>
            <Card>
              <View style={styles.row}>
                <View style={styles.icon}><Text style={styles.iconText}>+</Text></View>
                <View style={styles.copy}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.muscle}>{item.primary_muscle}</Text>
                  <Text style={styles.help}>Voir technique • anatomie • conseils</Text>
                </View>
                <ChevronRight size={22} color={Colors.primary} />
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun exercice trouvé.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  kicker: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "900", marginTop: 2 },
  input: { height: 56, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, color: Colors.text, paddingHorizontal: 16, marginBottom: 14, fontSize: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 13 },
  icon: { width: 48, height: 48, borderRadius: 15, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  iconText: { color: Colors.primary, fontSize: 27, fontWeight: "900" },
  copy: { flex: 1 },
  name: { color: Colors.text, fontSize: 17, fontWeight: "800" },
  muscle: { color: Colors.primary, fontSize: 13, fontWeight: "800", marginTop: 4 },
  help: { color: Colors.textMuted, fontSize: 11, marginTop: 4 },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 40 },
});
