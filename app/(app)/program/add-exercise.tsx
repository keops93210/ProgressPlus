import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight, Dumbbell, Info, Search, X } from "lucide-react-native";

import Header from "@/components/ui/Header";
import Colors from "@/constants/colors";
import { resolveExerciseImage } from "@/services/exercise-image.service";
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
    return exercises.filter((exercise) =>
      [exercise.name, exercise.primary_muscle, exercise.equipment ?? ""].some((value) => value.toLowerCase().includes(query)),
    );
  }, [exercises, search]);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Ajouter un exercice" subtitle={`${filteredExercises.length} résultat${filteredExercises.length > 1 ? "s" : ""}`} />

      <View style={styles.searchBox}>
        <Search size={22} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher un exercice..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 ? <Pressable onPress={() => setSearch("")} hitSlop={10} style={styles.clearButton}><X size={18} color={Colors.textMuted} /></Pressable> : null}
      </View>

      <View style={styles.filterRow}>
        <View style={styles.filterButton}><Dumbbell size={17} color={Colors.textSecondary} /><Text style={styles.filterText}>Tous les équipements</Text></View>
        <View style={styles.filterButton}><View style={styles.muscleIcon}><View style={styles.muscleHead} /><View style={styles.muscleBody} /></View><Text style={styles.filterText}>Tous les muscles</Text></View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Chargement de la bibliothèque...</Text></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text></View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ExerciseLibraryCard
              exercise={item}
              onPress={() => {
                if (!id) return;
                router.push({ pathname: "/program/configure-exercise", params: { id: String(id), exerciseId: item.id, name: item.name } });
              }}
            />
          )}
          ListEmptyComponent={<Text style={styles.empty}>Aucun exercice ne correspond à ta recherche.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

function ExerciseLibraryCard({ exercise, onPress }: { exercise: Exercise; onPress: () => void }) {
  const imageUri = resolveExerciseImage(exercise);

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.exerciseCard, pressed && styles.exerciseCardPressed]}>
      <View style={styles.thumbnailWrap}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="contain" />
        ) : (
          <View style={styles.thumbnailFallback}><Dumbbell size={28} color={Colors.primary} /><Text style={styles.fallbackText}>Illustration</Text></View>
        )}
      </View>

      <View style={styles.exerciseCopy}>
        <Text style={styles.exerciseName} numberOfLines={2}>{exercise.name}</Text>
        <Text style={styles.exerciseMuscle} numberOfLines={1}>{exercise.primary_muscle}</Text>
        {exercise.equipment ? <Text style={styles.exerciseEquipment} numberOfLines={1}>{exercise.equipment}</Text> : null}
      </View>

      <View style={styles.cardActions}>
        <View style={styles.infoButton}><Info size={17} color={Colors.textSecondary} /></View>
        <ChevronRight size={22} color={Colors.textSecondary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  searchBox: { height: 56, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, color: Colors.text, fontSize: 16, marginLeft: 10, paddingVertical: 0 },
  clearButton: { padding: 3 },
  filterRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  filterButton: { flex: 1, height: 48, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  filterText: { color: Colors.text, fontSize: 12, fontWeight: "800", marginLeft: 7 },
  muscleIcon: { width: 17, height: 20, alignItems: "center", justifyContent: "flex-start" },
  muscleHead: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textSecondary },
  muscleBody: { width: 12, height: 9, borderRadius: 6, backgroundColor: Colors.textSecondary, marginTop: 2 },
  listContent: { paddingBottom: 30 },
  exerciseCard: { minHeight: 98, borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, marginBottom: 8, padding: 10, flexDirection: "row", alignItems: "center" },
  exerciseCardPressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  thumbnailWrap: { width: 84, height: 84, borderRadius: 15, overflow: "hidden", backgroundColor: "#FAFAFC", borderWidth: 1, borderColor: Colors.border },
  thumbnail: { width: "100%", height: "100%" },
  thumbnailFallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallbackText: { color: Colors.textMuted, fontSize: 8, fontWeight: "800", marginTop: 2 },
  exerciseCopy: { flex: 1, minWidth: 0, marginLeft: 13, marginRight: 8 },
  exerciseName: { color: Colors.text, fontSize: 16, lineHeight: 20, fontWeight: "900" },
  exerciseMuscle: { color: Colors.primary, fontSize: 13, fontWeight: "800", marginTop: 5 },
  exerciseEquipment: { color: Colors.textMuted, fontSize: 11, marginTop: 3 },
  cardActions: { alignItems: "center", justifyContent: "center", gap: 8 },
  infoButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  muted: { color: Colors.textSecondary },
  error: { color: "#DC2626", textAlign: "center", fontWeight: "700" },
  empty: { color: Colors.textSecondary, textAlign: "center", marginTop: 40 },
});
