import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Dumbbell, Flame, Lightbulb, Play, Target, TriangleAlert } from "lucide-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import Colors from "@/constants/colors";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const exercises = await getExercises();
      setExercise((exercises ?? []).find((item) => item.id === id) ?? null);
    }
    load().catch(console.error);
  }, [id]);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.loading}>Chargement de l'exercice…</Text>
      </SafeAreaView>
    );
  }

  const secondary = exercise.secondary_muscles ?? [];
  const instructions = exercise.instructions?.trim() || "Installe-toi correctement, contrôle chaque répétition et garde une amplitude confortable.";
  const steps = instructions
    .split(/\.|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>GUIDE EXERCICE</Text>
            <Text style={styles.headerTitle} numberOfLines={2}>{exercise.name}</Text>
            <Text style={styles.subtitle}>{exercise.primary_muscle} · {exercise.difficulty || "Tous niveaux"}</Text>
          </View>
          <View style={styles.starButton}>
            <Text style={styles.star}>★</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          <View style={styles.activeTab}><Text style={styles.activeTabText}>Aperçu</Text></View>
          <Text style={styles.tabText}>Technique</Text>
          <Text style={styles.tabText}>Muscles</Text>
          <Text style={styles.tabText}>Conseils</Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>MUSCLE PRINCIPAL</Text>
            <Text style={styles.heroTitle}>{exercise.primary_muscle}</Text>
            <View style={styles.pill}><Text style={styles.pillText}>Zone ciblée</Text></View>
            <Text style={styles.heroDescription}>
              Travaille principalement {exercise.primary_muscle.toLowerCase()}, avec une sollicitation des muscles secondaires.
            </Text>
            {secondary.length > 0 && (
              <>
                <Text style={styles.eyebrowSecondary}>MUSCLES SECONDAIRES</Text>
                {secondary.slice(0, 3).map((muscle) => (
                  <Text key={muscle} style={styles.secondary}>•  {muscle}</Text>
                ))}
              </>
            )}
          </View>

          <View style={styles.anatomyPanel}>
            {exercise.image_url ? (
              <Image source={{ uri: exercise.image_url }} style={styles.heroImage} resizeMode="cover" />
            ) : (
              <View style={styles.anatomyFallback}>
                <View style={styles.fallbackIcon}>
                  <Dumbbell size={34} color={Colors.primary} strokeWidth={2.2} />
                </View>
                <Text style={styles.fallbackTitle}>Zone travaillée</Text>
                <Text style={styles.fallbackMuscle}>{exercise.primary_muscle}</Text>
                <Text style={styles.fallbackHint}>Illustration disponible dès qu'elle est renseignée pour cet exercice.</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.metaGrid}>
          <Meta icon={<Target size={20} color={Colors.primary} />} label="Catégorie" value={exercise.is_compound ? "Composé" : "Isolation"} />
          <Meta icon={<Dumbbell size={20} color={Colors.primary} />} label="Niveau" value={exercise.difficulty || "Tous niveaux"} />
          <Meta icon={<Dumbbell size={20} color={Colors.primary} />} label="Équipement" value={exercise.equipment || "Libre"} />
          <Meta icon={<Flame size={20} color={Colors.primary} />} label="Objectif" value="Progression" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Muscles sollicités</Text>
          <View style={styles.mainMuscle}><Text style={styles.mainMuscleText}>Principal · {exercise.primary_muscle}</Text></View>
          {secondary.length > 0 && (
            <View style={styles.chips}>
              {secondary.slice(0, 5).map((muscle) => (
                <View key={muscle} style={styles.chip}>
                  <View style={styles.dot} />
                  <Text style={styles.chipText}>{muscle}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <Play size={22} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Comment réaliser l'exercice</Text>
          </View>
          <Text style={styles.instructions}>{instructions}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Technique étape par étape</Text>
          <View style={styles.steps}>
            {steps.map((step, index) => (
              <View key={`${index}-${step}`} style={styles.stepCard}>
                <View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View>
                <Text style={styles.stepTitle}>{index === 0 ? "Position de départ" : index === 1 ? "Mouvement" : "Contrôle"}</Text>
                <Text style={styles.stepText}>{step}.</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.warningCard}>
          <TriangleAlert size={22} color={Colors.danger} />
          <View style={styles.messageCopy}>
            <Text style={styles.warningTitle}>Erreurs à éviter</Text>
            <Text style={styles.warningText}>Ne sacrifie pas la technique pour charger plus lourd. Contrôle la phase négative et garde une amplitude maîtrisée.</Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <Lightbulb size={22} color={Colors.success} />
          <View style={styles.messageCopy}>
            <Text style={styles.tipTitle}>Conseil Progress+</Text>
            <Text style={styles.tipText}>La qualité du mouvement passe avant la charge. Quand toutes tes séries sont propres, augmente progressivement le poids.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <View style={styles.meta}>{icon}<Text style={styles.metaLabel}>{label}</Text><Text style={styles.metaValue} numberOfLines={1}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: { minHeight: 76, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  headerCopy: { flex: 1 },
  kicker: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  headerTitle: { color: Colors.text, fontSize: 22, lineHeight: 27, fontWeight: "900", marginTop: 2 },
  subtitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: "700", marginTop: 3 },
  starButton: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center", backgroundColor: "#FFFFFF" },
  star: { color: Colors.primary, fontSize: 27 },
  tabs: { height: 48, flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", borderBottomWidth: 1, borderBottomColor: Colors.border, paddingHorizontal: 8 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: Colors.primary, paddingHorizontal: 16, paddingBottom: 11 },
  activeTabText: { color: Colors.primary, fontSize: 14, fontWeight: "900" },
  tabText: { color: Colors.textSecondary, fontSize: 14, fontWeight: "600", paddingBottom: 12 },
  heroCard: { margin: 16, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surfaceLight, padding: 18, flexDirection: "row", minHeight: 300 },
  heroCopy: { flex: 1.1, paddingRight: 10 },
  eyebrow: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.1, marginBottom: 5 },
  heroTitle: { color: Colors.text, fontSize: 26, fontWeight: "900" },
  pill: { alignSelf: "flex-start", backgroundColor: "#EDE5FF", borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6, marginTop: 8 },
  pillText: { color: Colors.primary, fontWeight: "800", fontSize: 11 },
  heroDescription: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 12 },
  eyebrowSecondary: { color: Colors.primary, fontSize: 10, fontWeight: "900", marginTop: 15, marginBottom: 6 },
  secondary: { color: Colors.text, fontSize: 13, lineHeight: 22 },
  anatomyPanel: { width: 142, minHeight: 240, borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: Colors.border },
  heroImage: { width: "100%", height: "100%" },
  anatomyFallback: { flex: 1, padding: 14, alignItems: "center", justifyContent: "center" },
  fallbackIcon: { width: 62, height: 62, borderRadius: 31, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  fallbackTitle: { color: Colors.textSecondary, fontSize: 11, fontWeight: "800", marginTop: 12 },
  fallbackMuscle: { color: Colors.primary, fontSize: 17, fontWeight: "900", textAlign: "center", marginTop: 3 },
  fallbackHint: { color: Colors.textMuted, fontSize: 9, lineHeight: 13, textAlign: "center", marginTop: 8 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16, marginBottom: 16 },
  meta: { width: "47.5%", minHeight: 76, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#FFFFFF", padding: 11 },
  metaLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 5 },
  metaValue: { color: Colors.text, fontSize: 14, fontWeight: "800", marginTop: 2 },
  sectionCard: { marginHorizontal: 16, marginBottom: 16, borderRadius: 22, borderWidth: 1, borderColor: Colors.border, backgroundColor: "#FFFFFF", padding: 18 },
  sectionHeading: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: "900", marginBottom: 8 },
  mainMuscle: { alignSelf: "flex-start", backgroundColor: Colors.surfaceLight, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9 },
  mainMuscleText: { color: Colors.primary, fontSize: 13, fontWeight: "900" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceLight, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 6 },
  chipText: { color: Colors.text, fontSize: 12, fontWeight: "700" },
  instructions: { color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
  steps: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 6 },
  stepCard: { width: "48%", borderRadius: 17, backgroundColor: Colors.surfaceLight, padding: 13, minHeight: 150 },
  number: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 9 },
  numberText: { color: "#FFFFFF", fontWeight: "900" },
  stepTitle: { color: Colors.primaryDark, fontWeight: "900", fontSize: 13, marginBottom: 6 },
  stepText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  warningCard: { marginHorizontal: 16, marginBottom: 12, borderRadius: 18, borderWidth: 1, borderColor: "#F4CACA", backgroundColor: "#FFF7F7", padding: 16, flexDirection: "row", gap: 12 },
  messageCopy: { flex: 1 },
  warningTitle: { color: Colors.danger, fontWeight: "900", fontSize: 17, marginBottom: 4 },
  warningText: { color: "#6B3030", fontSize: 13, lineHeight: 20 },
  tipCard: { marginHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: "#CBE8D1", backgroundColor: "#F4FFF6", padding: 16, flexDirection: "row", gap: 12 },
  tipTitle: { color: Colors.success, fontWeight: "900", fontSize: 17, marginBottom: 4 },
  tipText: { color: "#315A38", fontSize: 13, lineHeight: 20 },
  loading: { margin: 24, color: Colors.textSecondary, fontSize: 16 },
});
