import { router } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Dumbbell,
  Target,
} from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const muscleZones = [
  {
    id: "upper",
    title: "Haut des pectoraux",
    subtitle: "Portion claviculaire",
    accent: "#FF4D7D",
  },
  {
    id: "middle",
    title: "Milieu des pectoraux",
    subtitle: "Portion sternocostale",
    accent: "#FF8A3D",
  },
  {
    id: "lower",
    title: "Fibres inférieures",
    subtitle: "Accent inférieur du grand pectoral",
    accent: "#FFD23F",
  },
];

const popularExercises = [
  {
    name: "Développé couché barre",
    accent: "Pectoraux",
  },
  {
    name: "Développé couché haltères",
    accent: "Pectoraux",
  },
  {
    name: "Développé incliné haltères",
    accent: "Accent haut",
  },
  {
    name: "Machine convergente",
    accent: "Pectoraux",
  },
];

export default function MuscleLibraryScreen() {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            <ArrowLeft color="#FFFFFF" size={22} />
          </Pressable>

          <View style={styles.headerTitle}>
            <Text style={styles.title}>Pectoraux</Text>
            <Text style={styles.subtitle}>Groupe musculaire</Text>
          </View>

          <View style={styles.iconButton}>
            <Dumbbell color="#4D7CFE" size={22} />
          </View>
        </View>

        {/* ANATOMIE - PLACEHOLDER */}
        <View style={styles.anatomyCard}>
          <View style={styles.anatomyHeader}>
            <View>
              <Text style={styles.sectionTitle}>Grand pectoral</Text>
              <Text style={styles.sectionSubtitle}>
                Muscle principal
              </Text>
            </View>

            <View style={styles.targetIcon}>
              <Target color="#4D7CFE" size={22} />
            </View>
          </View>

          <View style={styles.bodyPlaceholder}>
            <View style={styles.shoulderLeft} />
            <View style={styles.shoulderRight} />

            <View style={styles.pecLeft}>
              <View style={styles.pecHighlight} />
            </View>

            <View style={styles.pecRight}>
              <View style={styles.pecHighlight} />
            </View>

            <View style={styles.sternum} />

            <View style={styles.abs}>
              <View />
              <View />
              <View />
            </View>
          </View>

          <Text style={styles.anatomyInfo}>
            Le grand pectoral est sollicité dans son ensemble.
            L’angle de l’exercice peut simplement accentuer
            certaines portions des fibres.
          </Text>
        </View>

        {/* ZONES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Quelle zone veux-tu travailler ?
          </Text>

          <Text style={styles.sectionSubtitle}>
            Sélectionne une zone pour découvrir les exercices adaptés.
          </Text>

          {muscleZones.map((zone) => (
            <Pressable
              key={zone.id}
              style={({ pressed }) => [
                styles.zoneCard,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.zoneIndicator,
                  { backgroundColor: zone.accent },
                ]}
              />

              <View style={styles.zoneContent}>
                <Text style={styles.zoneTitle}>{zone.title}</Text>
                <Text style={styles.zoneSubtitle}>
                  {zone.subtitle}
                </Text>
              </View>

              <ChevronRight color="#A1A1AA" size={22} />
            </Pressable>
          ))}
        </View>

        {/* EXERCICES */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Exercices populaires
              </Text>
              <Text style={styles.sectionSubtitle}>
                Pour développer les pectoraux
              </Text>
            </View>

            <Pressable>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.exerciseList}
          >
            {popularExercises.map((exercise) => (
              <Pressable
                key={exercise.name}
                style={({ pressed }) => [
                  styles.exerciseCard,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.exerciseImagePlaceholder}>
                  <Dumbbell color="#4D7CFE" size={30} />
                </View>

                <Text style={styles.exerciseName}>
                  {exercise.name}
                </Text>

                <Text style={styles.exerciseAccent}>
                  {exercise.accent}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* PROGRESSION */}
        <Pressable style={styles.progressCard}>
          <View style={styles.progressIcon}>
            <Target color="#FFFFFF" size={22} />
          </View>

          <View style={styles.progressContent}>
            <Text style={styles.progressTitle}>
              Suivi & progression
            </Text>

            <Text style={styles.progressSubtitle}>
              Suis tes performances sur les pectoraux
            </Text>
          </View>

          <ChevronRight color="#FFFFFF" size={22} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0D10",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 58,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headerTitle: {
    alignItems: "center",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  subtitle: {
    color: "#7C83FF",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#171A20",
    alignItems: "center",
    justifyContent: "center",
  },

  anatomyCard: {
    backgroundColor: "#12151A",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#222731",
    marginBottom: 28,
  },

  anatomyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  targetIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#182044",
    alignItems: "center",
    justifyContent: "center",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#8B919D",
    fontSize: 13,
    marginTop: 4,
  },

  bodyPlaceholder: {
    height: 300,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 10,
  },

  shoulderLeft: {
    position: "absolute",
    width: 62,
    height: 90,
    borderRadius: 40,
    backgroundColor: "#303641",
    left: 45,
    top: 45,
    transform: [{ rotate: "25deg" }],
  },

  shoulderRight: {
    position: "absolute",
    width: 62,
    height: 90,
    borderRadius: 40,
    backgroundColor: "#303641",
    right: 45,
    top: 45,
    transform: [{ rotate: "-25deg" }],
  },

  pecLeft: {
    position: "absolute",
    width: 115,
    height: 82,
    borderRadius: 60,
    backgroundColor: "#D94368",
    left: 75,
    top: 75,
    transform: [{ rotate: "-8deg" }],
  },

  pecRight: {
    position: "absolute",
    width: 115,
    height: 82,
    borderRadius: 60,
    backgroundColor: "#D94368",
    right: 75,
    top: 75,
    transform: [{ rotate: "8deg" }],
  },

  pecHighlight: {
    width: "70%",
    height: "55%",
    borderRadius: 50,
    backgroundColor: "#FF5A83",
    opacity: 0.75,
    alignSelf: "center",
    marginTop: 12,
  },

  sternum: {
    position: "absolute",
    width: 8,
    height: 155,
    borderRadius: 4,
    backgroundColor: "#626A76",
    top: 67,
  },

  abs: {
    position: "absolute",
    top: 175,
    width: 105,
    gap: 7,
  },

  abs: {
    position: "absolute",
    top: 175,
    width: 105,
  },

  anatomyInfo: {
    color: "#A6ACB8",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },

  section: {
    marginBottom: 28,
  },

  zoneCard: {
    minHeight: 76,
    backgroundColor: "#14171C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242832",
    marginTop: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  zoneIndicator: {
    width: 5,
    height: 48,
    borderRadius: 3,
    marginRight: 14,
  },

  zoneContent: {
    flex: 1,
  },

  zoneTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  zoneSubtitle: {
    color: "#8B919D",
    fontSize: 12,
    marginTop: 4,
  },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seeAll: {
    color: "#5B7CFF",
    fontSize: 13,
    fontWeight: "700",
  },

  exerciseList: {
    gap: 12,
    paddingTop: 14,
  },

  exerciseCard: {
    width: 155,
    backgroundColor: "#14171C",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#242832",
    overflow: "hidden",
  },

  exerciseImagePlaceholder: {
    height: 105,
    backgroundColor: "#1A1E25",
    alignItems: "center",
    justifyContent: "center",
  },

  exerciseName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 12,
    paddingTop: 12,
  },

  exerciseAccent: {
    color: "#8B919D",
    fontSize: 12,
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 14,
  },

  progressCard: {
    backgroundColor: "#263DAD",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  progressIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3F5FE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  progressContent: {
    flex: 1,
  },

  progressTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  progressSubtitle: {
    color: "#DCE3FF",
    fontSize: 12,
    marginTop: 4,
  },

  pressed: {
    opacity: 0.75,
  },
});
