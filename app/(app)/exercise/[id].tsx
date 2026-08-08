import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, Dumbbell, TriangleAlert } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import AnatomyFigure from "@/components/exercise/AnatomyFigure";
import Colors from "@/constants/colors";
import { getExerciseGuide } from "@/data/exercise-guides";

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string; muscle?: string; equipment?: string }>();
  const name = params.name ?? "Exercice";
  const guide = getExerciseGuide(name, params.muscle);

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
          <View style={styles.heroIcon}><Dumbbell size={24} color={Colors.primary} /></View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.intro}>{guide.intro}</Text>
          <View style={styles.metaRow}>
            <View style={styles.meta}><Text style={styles.metaText}>Muscle principal</Text><Text style={styles.metaValue}>{params.muscle ?? guide.primary}</Text></View>
            {params.equipment ? <View style={styles.meta}><Text style={styles.metaText}>Équipement</Text><Text style={styles.metaValue}>{params.equipment}</Text></View> : null}
          </View>
        </View>

        <View style={styles.anatomyCard}>
          <View>
            <Text style={styles.sectionTitle}>Zone travaillée</Text>
            <Text style={styles.sectionSubtitle}>Vue anatomique simplifiée</Text>
          </View>
          <View style={styles.figureWrap}>
            <AnatomyFigure primary={guide.primary} />
          </View>
          <View style={styles.primaryBadge}><View style={styles.dot} /><Text style={styles.primaryText}>Muscle principal : {params.muscle ?? guide.primary}</Text></View>
          {guide.secondary.length > 0 ? <Text style={styles.secondary}>Secondaires : {guide.secondary.join(" · ")}</Text> : null}
        </View>

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
  hero: { backgroundColor: Colors.surfaceLight, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: "#E4D9FF", marginBottom: 16 },
  heroIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginBottom: 14 },
  title: { color: Colors.text, fontSize: 28, fontWeight: "900" },
  intro: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  metaRow: { flexDirection: "row", gap: 10, marginTop: 16, flexWrap: "wrap" },
  meta: { backgroundColor: "#FFFFFF", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  metaText: { color: Colors.textMuted, fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  metaValue: { color: Colors.text, fontSize: 13, fontWeight: "800", marginTop: 3, textTransform: "capitalize" },
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
