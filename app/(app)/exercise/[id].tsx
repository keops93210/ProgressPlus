import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CheckCircle2, Dumbbell, Maximize2, TriangleAlert } from "lucide-react-native";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { getExerciseGuide } from "@/data/exercise-guides";

const pectoralAnatomyImage = "https://commons.wikimedia.org/wiki/Special:Redirect/file/Pectoralis-major.png";

export default function ExerciseDetailScreen() {
  const params = useLocalSearchParams<{ id: string; name?: string; muscle?: string; equipment?: string }>();
  const name = params.name ?? "Exercice";
  const guide = getExerciseGuide(name, params.muscle);
  const isPectoral = guide.primary === "chest" || /chest|pec|pectoral/i.test(params.muscle ?? "");
  const primaryLabel = isPectoral ? "Grand pectoral" : (params.muscle ?? guide.primary);
  const secondary = isPectoral && guide.secondary.length === 0 ? ["Deltoïde antérieur", "Triceps"] : guide.secondary;

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
            <View style={styles.meta}><Text style={styles.metaText}>Muscle principal</Text><Text style={styles.metaValue}>{primaryLabel}</Text></View>
            {params.equipment ? <View style={styles.meta}><Text style={styles.metaText}>Équipement</Text><Text style={styles.metaValue}>{params.equipment}</Text></View> : null}
          </View>
        </View>

        <View style={styles.anatomyCard}>
          <View style={styles.anatomyHeader}>
            <View>
              <Text style={styles.sectionKicker}>ZONE TRAVAILLÉE</Text>
              <Text style={styles.sectionTitle}>Anatomie du muscle sollicité</Text>
            </View>
            <View style={styles.infoBadge}><Text style={styles.infoText}>i</Text></View>
          </View>

          <View style={styles.figureFrame}>
            {isPectoral ? (
              <Image source={{ uri: pectoralAnatomyImage }} style={styles.anatomyImage} resizeMode="contain" />
            ) : (
              <View style={styles.genericFigure}>
                <Dumbbell size={42} color={Colors.primary} />
                <Text style={styles.genericTitle}>Illustration anatomique à venir</Text>
                <Text style={styles.genericText}>Une vue dédiée sera ajoutée pour ce groupe musculaire.</Text>
              </View>
            )}
            <View style={styles.imageLabel}><View style={styles.dot} /><Text style={styles.imageLabelText}>{primaryLabel}</Text></View>
            <Pressable style={styles.fullscreenButton} accessibilityRole="button" accessibilityLabel="Agrandir l'anatomie">
              <Maximize2 size={17} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>MUSCLE PRINCIPAL</Text>
              <Text style={styles.summaryValue}>{primaryLabel}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryBlock}>
              <Text style={styles.summaryLabel}>MUSCLES SECONDAIRES</Text>
              <Text style={styles.summarySecondary}>{secondary.length ? secondary.join(" • ") : "—"}</Text>
            </View>
          </View>

          {isPectoral && (
            <View style={styles.anatomyExplanation}>
              <Text style={styles.explanationTitle}>Les portions du grand pectoral</Text>
              <Text style={styles.explanationText}>• Faisceau claviculaire : participe davantage aux mouvements de poussée vers le haut.</Text>
              <Text style={styles.explanationText}>• Faisceau sternal : contribue fortement à l'adduction et à la poussée horizontale.</Text>
              <Text style={styles.explanationText}>• Faisceau costal : intervient notamment dans l'adduction du bras.</Text>
            </View>
          )}
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
  metaValue: { color: Colors.text, fontSize: 13, fontWeight: "800", marginTop: 3 },
  anatomyCard: { backgroundColor: Colors.surface, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: Colors.border, marginBottom: 22 },
  anatomyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionKicker: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 1.2 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: "900" },
  infoBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  infoText: { color: Colors.primary, fontSize: 20, fontWeight: "900" },
  figureFrame: { height: 380, borderRadius: 20, backgroundColor: "#FAFAFC", borderWidth: 1, borderColor: Colors.border, overflow: "hidden", position: "relative" },
  anatomyImage: { width: "100%", height: "100%" },
  genericFigure: { flex: 1, alignItems: "center", justifyContent: "center", padding: 30 },
  genericTitle: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 12 },
  genericText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center", marginTop: 7 },
  imageLabel: { position: "absolute", left: 12, bottom: 12, flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 14, paddingHorizontal: 11, paddingVertical: 8, borderWidth: 1, borderColor: Colors.border },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginRight: 7 },
  imageLabelText: { color: Colors.primaryDark, fontSize: 12, fontWeight: "900" },
  fullscreenButton: { position: "absolute", top: 12, right: 12, width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(20,20,28,0.82)", alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 14, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  summaryBlock: { flex: 1 },
  summaryDivider: { width: 1, backgroundColor: Colors.border },
  summaryLabel: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  summaryValue: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 5 },
  summarySecondary: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5 },
  anatomyExplanation: { marginTop: 14, padding: 14, borderRadius: 16, backgroundColor: Colors.surfaceLight },
  explanationTitle: { color: Colors.primaryDark, fontSize: 15, fontWeight: "900", marginBottom: 7 },
  explanationText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 3 },
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