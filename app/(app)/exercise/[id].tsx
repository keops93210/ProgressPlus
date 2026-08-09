import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, Dumbbell, Play, TriangleAlert, Video } from "lucide-react-native";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";

import PectoralAnatomyCard from "@/components/exercise/PectoralAnatomyCard";
import AnatomyFigure from "@/components/exercise/AnatomyFigure";
import Colors from "@/constants/colors";
import { getExerciseGuide } from "@/data/exercise-guides";
import { getExercises } from "@/services/exercise.service";
import { Exercise } from "@/types/exercise";

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string; muscle?: string; equipment?: string }>();
  const [exercise, setExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    if (!params.id) return;
    let cancelled = false;

    getExercises()
      .then((items) => {
        if (cancelled) return;
        setExercise((items ?? []).find((item) => item.id === params.id) ?? null);
      })
      .catch((error) => {
        if (!cancelled) console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const hasRealParamName = Boolean(params.name && params.name.trim() && params.name.trim().toLowerCase() !== "exercice");
  const name = exercise?.name ?? (hasRealParamName ? params.name! : "Exercice");
  const muscle = exercise?.primary_muscle ?? params.muscle;
  const equipment = exercise?.equipment ?? params.equipment;
  const guide = getExerciseGuide(name, muscle);
  const isPectoral = guide.primary === "chest" || /chest|pec|pectoral/i.test(muscle ?? "");
  const primaryLabel = isPectoral ? "Grand pectoral" : (muscle ?? guide.primary);
  const secondary = isPectoral && guide.secondary.length === 0 ? ["Deltoïde antérieur", "Triceps"] : guide.secondary;
  const hasImage = Boolean(exercise?.image_url);
  const hasVideo = Boolean(exercise?.video_url);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Fiche exercice</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          {hasImage ? (
            <View style={styles.heroImageWrap}>
              <Image source={{ uri: exercise!.image_url! }} style={styles.heroImage} resizeMode="cover" />
              <View style={styles.imageBadge}>
                <Dumbbell size={14} color={Colors.primary} />
                <Text style={styles.imageBadgeText}>Démonstration</Text>
              </View>
            </View>
          ) : (
            <View style={styles.heroIcon}><Dumbbell size={24} color={Colors.primary} /></View>
          )}

          <Text style={styles.title}>{name}</Text>
          <Text style={styles.intro}>{guide.intro}</Text>

          <View style={styles.metaRow}>
            <View style={styles.meta}><Text style={styles.metaText}>Muscle principal</Text><Text style={styles.metaValue}>{primaryLabel}</Text></View>
            {equipment ? <View style={styles.meta}><Text style={styles.metaText}>Équipement</Text><Text style={styles.metaValue}>{equipment}</Text></View> : null}
            {exercise?.difficulty ? <View style={styles.meta}><Text style={styles.metaText}>Niveau</Text><Text style={styles.metaValue}>{exercise.difficulty}</Text></View> : null}
          </View>

          {hasVideo ? (
            <Pressable onPress={() => Linking.openURL(exercise!.video_url!)} style={({ pressed }) => [styles.videoButton, pressed && styles.pressed]}>
              <View style={styles.videoIcon}><Play size={16} color="#FFFFFF" fill="#FFFFFF" /></View>
              <View style={styles.videoCopy}>
                <Text style={styles.videoTitle}>Voir le mouvement</Text>
                <Text style={styles.videoSubtitle}>Démonstration vidéo</Text>
              </View>
              <Video size={20} color={Colors.primary} />
            </Pressable>
          ) : null}
        </View>

        {isPectoral ? (
          <PectoralAnatomyCard exerciseName={name} secondary={secondary} />
        ) : (
          <View style={styles.anatomyCard}>
            <View>
              <Text style={styles.sectionTitle}>Zone travaillée</Text>
              <Text style={styles.sectionSubtitle}>Vue anatomique simplifiée</Text>
            </View>
            <View style={styles.figureWrap}><AnatomyFigure primary={guide.primary} /></View>
            <View style={styles.primaryBadge}><View style={styles.dot} /><Text style={styles.primaryText}>Muscle principal : {primaryLabel}</Text></View>
            {secondary.length > 0 ? <Text style={styles.secondary}>Secondaires : {secondary.join(" · ")}</Text> : null}
          </View>
        )}

        <GuideSection title="Position de départ" items={guide.setup} />
        <GuideSection title="Comment réaliser le mouvement" items={guide.movement} numbered />

        <View style={styles.warningCard}>
          <TriangleAlert size={22} color="#B45309" />
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>À éviter</Text>
            {guide.mistakes.map((item) => <Text key={item} style={styles.warningItem}>• {item}</Text>)}
          </View>
        </View>

        <View style={styles.tipCard}>
          <CheckCircle2 size={22} color={Colors.primary} />
          <View style={styles.tipCopy}>
            <Text style={styles.tipTitle}>Conseil Progress+</Text>
            <Text style={styles.tipText}>{guide.tip}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function GuideSection({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={item} style={styles.step}>
          <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{numbered ? index + 1 : "•"}</Text></View>
          <Text style={styles.stepText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  headerTitle: { color: Colors.text, fontSize: 18, fontWeight: "800" },
  headerSpacer: { width: 44 },
  hero: { backgroundColor: Colors.surfaceLight, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: "#E4D9FF", marginBottom: 16 },
  heroImageWrap: { height: 220, borderRadius: 18, overflow: "hidden", backgroundColor: "#FFFFFF", marginBottom: 16, position: "relative" },
  heroImage: { width: "100%", height: "100%" },
  imageBadge: { position: "absolute", left: 10, bottom: 10, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 },
  imageBadgeText: { color: Colors.primaryDark, fontSize: 11, fontWeight: "800" },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { color: Colors.text, fontSize: 28, fontWeight: "900" },
  intro: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 16, flexWrap: "wrap" },
  meta: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  metaText: { color: Colors.textMuted, fontSize: 9, fontWeight: "700", textTransform: "uppercase" },
  metaValue: { color: Colors.text, fontSize: 12, fontWeight: "800", marginTop: 3 },
  videoButton: { flexDirection: "row", alignItems: "center", marginTop: 14, padding: 11, borderRadius: 15, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: Colors.border },
  videoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  videoCopy: { flex: 1, marginLeft: 10 },
  videoTitle: { color: Colors.text, fontSize: 13, fontWeight: "900" },
  videoSubtitle: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  pressed: { opacity: 0.72 },
  anatomyCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 22 },
  sectionTitle: { color: Colors.text, fontSize: 19, fontWeight: "900" },
  sectionSubtitle: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  figureWrap: { alignItems: "center", marginVertical: 8 },
  primaryBadge: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceLight, borderRadius: 12, padding: 11 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginRight: 8 },
  primaryText: { color: Colors.primaryDark, fontSize: 13, fontWeight: "800" },
  secondary: { color: Colors.textSecondary, fontSize: 12, marginTop: 10, lineHeight: 18 },
  section: { marginBottom: 22 },
  step: { flexDirection: "row", alignItems: "flex-start", marginTop: 11 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center", marginRight: 10 },
  stepNumberText: { color: Colors.primary, fontSize: 13, fontWeight: "900" },
  stepText: { flex: 1, color: Colors.textSecondary, fontSize: 14, lineHeight: 20, paddingTop: 3 },
  warningCard: { flexDirection: "row", backgroundColor: "#FFF7ED", borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#FED7AA" },
  warningCopy: { flex: 1, marginLeft: 12 },
  warningTitle: { color: "#92400E", fontSize: 16, fontWeight: "900", marginBottom: 5 },
  warningItem: { color: "#92400E", fontSize: 13, lineHeight: 19 },
  tipCard: { flexDirection: "row", backgroundColor: Colors.surfaceLight, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: "#E4D9FF" },
  tipCopy: { flex: 1, marginLeft: 12 },
  tipTitle: { color: Colors.primaryDark, fontSize: 16, fontWeight: "900" },
  tipText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5 },
});