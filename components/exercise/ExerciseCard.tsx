import { router } from "expo-router";
import { ChevronRight, Trash2 } from "lucide-react-native";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { ProgramExercise } from "@/types/programExercise";

interface Props { exercise: ProgramExercise; onDelete?: () => void; }

export default function ExerciseCard({ exercise, onDelete }: Props) {
  const item = exercise.exercises;

  return (
    <Card>
      <Pressable
        onPress={() => router.push({ pathname: "/(app)/exercise-detail", params: { id: exercise.exercise_id } })}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={styles.thumbnailWrap}>
          {item.image_url ? <Image source={{ uri: item.image_url }} style={styles.thumbnail} resizeMode="cover" /> : <View style={styles.fallback}><Text style={styles.fallbackIcon}>💪</Text></View>}
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.muscle} numberOfLines={1}>💪 {item.primary_muscle}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statPill}><Text style={styles.statText}>{exercise.sets} séries</Text></View>
            <View style={styles.statPill}><Text style={styles.statText}>{exercise.min_reps}-{exercise.max_reps} reps</Text></View>
          </View>
          <Text style={styles.rest}>⏱ {exercise.rest_seconds}s de repos</Text>
          {item.equipment ? <Text style={styles.equipment} numberOfLines={1}>🏋️ {item.equipment}</Text> : null}
        </View>
        <View style={styles.actions}>
          <ChevronRight size={20} color={Colors.textMuted} />
          {onDelete ? <Pressable onPress={(event) => { event.stopPropagation(); onDelete(); }} hitSlop={10} style={styles.deleteButton}><Trash2 size={17} color="#DC2626" /></Pressable> : null}
        </View>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  pressed: { opacity: 0.72 },
  thumbnailWrap: { width: 78, height: 78, borderRadius: 15, overflow: "hidden", backgroundColor: Colors.surfaceLight, borderWidth: 1, borderColor: Colors.border },
  thumbnail: { width: "100%", height: "100%" },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center" },
  fallbackIcon: { fontSize: 28 },
  content: { flex: 1, minWidth: 0, marginLeft: 13, marginRight: 8 },
  name: { color: Colors.text, fontSize: 17, lineHeight: 21, fontWeight: "900" },
  muscle: { color: Colors.primary, marginTop: 4, fontSize: 12, fontWeight: "800" },
  statsRow: { flexDirection: "row", gap: 6, marginTop: 8 },
  statPill: { backgroundColor: Colors.surfaceLight, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  statText: { color: Colors.text, fontSize: 10, fontWeight: "800" },
  rest: { color: Colors.textSecondary, marginTop: 5, fontSize: 11 },
  equipment: { color: Colors.textMuted, marginTop: 2, fontSize: 10 },
  actions: { alignItems: "center", justifyContent: "space-between", alignSelf: "stretch", paddingVertical: 2 },
  deleteButton: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" },
});