import { router } from "expo-router";
import { ArrowLeft, ChevronRight, Dumbbell, Search, SlidersHorizontal } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

const FILTERS = ["Tous", "Pectoraux", "Dos", "Épaules", "Bras", "Jambes"];

function matchesMuscle(exercise: Exercise, filter: string) {
  if (filter === "Tous") return true;
  const value = `${exercise.primary_muscle} ${(exercise.secondary_muscles ?? []).join(" ")}`.toLowerCase();
  const aliases: Record<string, string[]> = {
    Pectoraux: ["chest", "pec", "pectoral", "torse"],
    Dos: ["back", "dos", "lat", "dorsal", "rhombo"],
    Épaules: ["shoulder", "épaule", "delto"],
    Bras: ["biceps", "triceps", "bras", "forearm"],
    Jambes: ["quad", "hamstring", "glute", "fessier", "leg", "mollet", "calf", "cuisse"],
  };
  return (aliases[filter] ?? []).some((term) => value.includes(term));
}

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getExercises()
      .then((data) => { if (active) setExercises(data ?? []); })
      .catch((error) => console.log(error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredExercises = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const haystack = `${exercise.name} ${exercise.primary_muscle} ${(exercise.secondary_muscles ?? []).join(" ")} ${exercise.equipment ?? ""}`.toLowerCase();
      return (!query || haystack.includes(query)) && matchesMuscle(exercise, filter);
    });
  }, [exercises, search, filter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <ArrowLeft size={22} color={Colors.text} />
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>BIBLIOTHÈQUE</Text>
          <Text style={styles.title}>Exercices</Text>
        </View>
        <View style={styles.countBadge}><Text style={styles.countText}>{filteredExercises.length}</Text></View>
      </View>

      <View style={styles.searchWrap}>
        <Search size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholder="Rechercher : développé, squat..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          autoCapitalize="none"
        />
        <SlidersHorizontal size={19} color={Colors.primary} />
      </View>

      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        renderItem={({ item }) => (
          <Pressable onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        )}
      />

      {loading ? (
        <View style={styles.loading}><ActivityIndicator color={Colors.primary} size="large" /><Text style={styles.loadingText}>Chargement de la bibliothèque…</Text></View>
      ) : (
        <FlatList
          data={filteredExercises}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable onPress={() => router.push({ pathname: "/(app)/exercise-detail", params: { id: item.id } })}>
              <Card>
                <View style={styles.row}>
                  <View style={styles.thumbnailWrap}>
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.thumbnail} resizeMode="cover" />
                    ) : (
                      <View style={styles.fallback}><Dumbbell size={25} color={Colors.primary} /></View>
                    )}
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.muscle} numberOfLines={1}>{item.primary_muscle}</Text>
                    <View style={styles.tags}>
                      {item.equipment ? <View style={styles.tag}><Text style={styles.tagText}>{item.equipment}</Text></View> : null}
                      <View style={styles.tag}><Text style={styles.tagText}>Fiche complète</Text></View>
                    </View>
                  </View>
                  <ChevronRight size={21} color={Colors.primary} />
                </View>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={<View style={styles.empty}><Dumbbell size={32} color={Colors.textMuted} /><Text style={styles.emptyTitle}>Aucun exercice</Text><Text style={styles.emptyText}>Essaie un autre nom ou un autre groupe musculaire.</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  headerCopy: { flex: 1, marginLeft: 12 },
  kicker: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "900", marginTop: 2 },
  countBadge: { minWidth: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center", paddingHorizontal: 9 },
  countText: { color: Colors.primaryDark, fontSize: 13, fontWeight: "900" },
  searchWrap: { height: 54, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 12 },
  input: { flex: 1, height: "100%", color: Colors.text, fontSize: 15, paddingHorizontal: 10 },
  filters: { gap: 8, paddingBottom: 14 },
  filter: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: "800" },
  filterTextActive: { color: "#FFFFFF" },
  list: { paddingBottom: 35 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumbnailWrap: { width: 76, height: 76, borderRadius: 16, overflow: "hidden", backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  thumbnail: { width: "100%", height: "100%" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, minWidth: 0 },
  name: { color: Colors.text, fontSize: 16, lineHeight: 20, fontWeight: "900" },
  muscle: { color: Colors.primary, fontSize: 12, fontWeight: "800", marginTop: 4 },
  tags: { flexDirection: "row", gap: 5, marginTop: 7, flexWrap: "wrap" },
  tag: { backgroundColor: Colors.surfaceLight, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 4 },
  tagText: { color: Colors.textMuted, fontSize: 9, fontWeight: "800" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: Colors.textSecondary, fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: "900", marginTop: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 13, textAlign: "center", lineHeight: 19, marginTop: 5 },
});