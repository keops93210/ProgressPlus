import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { resolveExerciseImage } from "@/services/exercise-image.service";
import { Exercise } from "@/types/exercise";

interface ExerciseHeroProps { exercise: Exercise; currentSet: number; totalSets: number; }
function label(value: string | null | undefined) { if (!value) return null; return value.replace(/_/g, " "); }

export default function ExerciseHero({ exercise, currentSet, totalSets }: ExerciseHeroProps) {
  const imageUri = resolveExerciseImage(exercise);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: "/(app)/exercise-detail", params: { id: exercise.id, name: exercise.name, muscle: exercise.primary_muscle ?? "", equipment: exercise.equipment ?? "" } })}
      accessibilityRole="button"
      accessibilityLabel={`Voir les détails de ${exercise.name}`}
    >
      {imageUri ? <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" /> : <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>PROGRESS+</Text></View>}
      <View style={styles.imageWash} />
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>SÉRIE {currentSet}/{totalSets}</Text></View>
          {exercise.is_compound && <View style={styles.compoundBadge}><Text style={styles.compoundText}>COMPOSÉ</Text></View>}
        </View>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{label(exercise.primary_muscle)}</Text>
          {exercise.equipment && <Text style={styles.meta}>{label(exercise.equipment)}</Text>}
          {exercise.difficulty && <Text style={styles.meta}>{label(exercise.difficulty)}</Text>}
        </View>
        <Text style={styles.detailHint}>Voir la technique et les muscles →</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { height: 230, borderRadius: 24, overflow: "hidden", backgroundColor: "#FAFAFC", borderWidth: 1, borderColor: Colors.border },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  image: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  imagePlaceholder: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surfaceLight },
  placeholderText: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 3 },
  imageWash: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15,15,25,0.30)" },
  content: { flex: 1, justifyContent: "flex-end", padding: 18 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: Colors.primary },
  badgeText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900" },
  compoundBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.14)" },
  compoundText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  title: { color: "#FFFFFF", fontSize: 28, fontWeight: "900" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  meta: { color: "#FFFFFF", fontSize: 12, fontWeight: "600", textTransform: "capitalize", backgroundColor: "rgba(0,0,0,0.38)", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
  detailHint: { color: "#E9D5FF", fontSize: 11, fontWeight: "800", marginTop: 9 },
});
