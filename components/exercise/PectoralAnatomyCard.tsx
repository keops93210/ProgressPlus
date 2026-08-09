import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Maximize2, Info, Dumbbell, Users } from "lucide-react-native";

import Colors from "@/constants/colors";

const ANATOMY_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Gray410_pectoralis_major.png";

const PORTION_COLORS = {
  clavicular: "#8B5CF6",
  sternal: "#F97316",
  costal: "#3B82F6",
};

type PortionKey = "clavicular" | "sternal" | "costal";

type Props = {
  exerciseName: string;
  secondary: string[];
};

function getFocus(exerciseName: string): {
  key: PortionKey | null;
  title: string;
  description: string;
} {
  const name = exerciseName.toLowerCase();

  if (name.includes("incliné") || name.includes("incline")) {
    return {
      key: "clavicular",
      title: "Faisceau claviculaire",
      description: "Priorité au haut des pectoraux avec l'inclinaison du banc.",
    };
  }

  if (name.includes("développé couché") || name.includes("bench")) {
    return {
      key: "sternal",
      title: "Faisceau sternal",
      description: "Le faisceau central constitue la masse principale sollicitée.",
    };
  }

  if (
    name.includes("dips") ||
    name.includes("dip ") ||
    name.includes("décliné") ||
    name.includes("decline")
  ) {
    return {
      key: "costal",
      title: "Faisceau costal",
      description: "La trajectoire et l'orientation du mouvement favorisent davantage la partie inférieure du grand pectoral.",
    };
  }

  return {
    key: null,
    title: "Grand pectoral",
    description:
      "Les trois portions participent au mouvement. La sollicitation dépend de l'angle et de la trajectoire.",
  };
}

export default function PectoralAnatomyCard({ exerciseName, secondary }: Props) {
  const [fullscreen, setFullscreen] = useState(false);
  const focus = getFocus(exerciseName);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Dumbbell size={18} color={Colors.primary} />
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>ZONE TRAVAILLÉE</Text>
          <Text style={styles.title}>Anatomie du muscle sollicité</Text>
        </View>
        <View style={styles.infoButton}>
          <Info size={20} color={Colors.primary} />
        </View>
      </View>

      <Pressable onPress={() => setFullscreen(true)} style={styles.imageCard}>
        <Image source={{ uri: ANATOMY_IMAGE }} style={styles.image} resizeMode="contain" />
        <View style={styles.expandButton}>
          <Maximize2 size={19} color="#FFFFFF" />
        </View>
        <View style={styles.imageLabel}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.imageLabelText}>Grand pectoral</Text>
        </View>
      </Pressable>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryIcon}>
            <Dumbbell size={18} color="#FFFFFF" />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryKicker}>MUSCLE PRINCIPAL</Text>
            <Text style={styles.summaryValue}>Grand pectoral</Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <View style={styles.secondaryIcon}>
            <Users size={18} color={Colors.primary} />
          </View>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryKicker}>MUSCLES SECONDAIRES</Text>
            <Text style={styles.secondaryText}>
              {secondary.length ? secondary.join(" · ") : "Selon l'exercice"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.portionsCard}>
        <Text style={styles.portionsTitle}>Les portions du grand pectoral</Text>
        <Portion
          name="Faisceau claviculaire"
          label="Haut des pectoraux"
          color={PORTION_COLORS.clavicular}
          active={focus.key === "clavicular"}
        />
        <Portion
          name="Faisceau sternal"
          label="Partie centrale"
          color={PORTION_COLORS.sternal}
          active={focus.key === "sternal"}
        />
        <Portion
          name="Faisceau costal"
          label="Partie inférieure"
          color={PORTION_COLORS.costal}
          active={focus.key === "costal"}
        />
        <View style={styles.focusCard}>
          <Text style={styles.focusTitle}>
            {focus.key ? "🎯 Priorité sur cet exercice" : "💡 Sollicitation"}
          </Text>
          <Text style={styles.focusName}>{focus.title}</Text>
          <Text style={styles.focusText}>{focus.description}</Text>
        </View>
      </View>

      <Modal
        visible={fullscreen}
        animationType="fade"
        transparent
        onRequestClose={() => setFullscreen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalClose} onPress={() => setFullscreen(false)}>
            <Text style={styles.modalCloseText}>Fermer</Text>
          </Pressable>
          <Image source={{ uri: ANATOMY_IMAGE }} style={styles.fullscreenImage} resizeMode="contain" />
        </View>
      </Modal>
    </View>
  );
}

function Portion({
  name,
  label,
  color,
  active,
}: {
  name: string;
  label: string;
  color: string;
  active: boolean;
}) {
  return (
    <View style={[styles.portion, active && styles.portionActive, active && { borderColor: color }]}>
      <View style={[styles.portionDot, { backgroundColor: color }]} />
      <View style={styles.portionCopy}>
        <Text style={[styles.portionName, active && { color }]}>{name}</Text>
        <Text style={styles.portionLabel}>{label}</Text>
      </View>
      {active ? <Text style={[styles.priority, { color }]}>PRIORITÉ</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 22 },
  headerRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center", marginRight: 10 },
  headerCopy: { flex: 1 },
  kicker: { color: Colors.primary, fontSize: 12, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 20, lineHeight: 24, fontWeight: "900", marginTop: 2 },
  infoButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  imageCard: { height: 330, borderRadius: 20, overflow: "hidden", backgroundColor: "#FAFAFC", borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  image: { width: "100%", height: "100%" },
  expandButton: { position: "absolute", right: 12, top: 12, width: 44, height: 44, borderRadius: 14, backgroundColor: "#27272F", alignItems: "center", justifyContent: "center" },
  imageLabel: { position: "absolute", left: 12, bottom: 12, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  imageLabelText: { color: Colors.primaryDark, fontSize: 14, fontWeight: "900" },
  summaryCard: { marginTop: 12, backgroundColor: Colors.surfaceLight, borderRadius: 18, borderWidth: 1, borderColor: "#E4D9FF", paddingHorizontal: 14 },
  summaryRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13 },
  summaryIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginRight: 11 },
  secondaryIcon: { width: 36, height: 36, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center", marginRight: 11 },
  summaryCopy: { flex: 1 },
  summaryKicker: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  summaryValue: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  secondaryText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 2 },
  divider: { height: 1, backgroundColor: "#E4D9FF" },
  portionsCard: { marginTop: 12, backgroundColor: Colors.surfaceLight, borderRadius: 18, padding: 14 },
  portionsTitle: { color: Colors.primaryDark, fontSize: 17, fontWeight: "900", marginBottom: 8 },
  portion: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 13, padding: 10, marginTop: 7, borderWidth: 1, borderColor: Colors.border },
  portionActive: { backgroundColor: "#F7F2FF" },
  portionDot: { width: 12, height: 12, borderRadius: 6, marginRight: 10 },
  portionCopy: { flex: 1 },
  portionName: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  portionLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  priority: { fontSize: 9, fontWeight: "900" },
  focusCard: { marginTop: 12, padding: 12, borderRadius: 14, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4D9FF" },
  focusTitle: { color: Colors.primary, fontSize: 11, fontWeight: "900", letterSpacing: 0.7 },
  focusName: { color: Colors.text, fontSize: 15, fontWeight: "900", marginTop: 3 },
  focusText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(10,8,18,0.96)", alignItems: "center", justifyContent: "center", padding: 18 },
  fullscreenImage: { width: "100%", height: "82%" },
  modalClose: { position: "absolute", right: 18, top: 58, zIndex: 2, backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  modalCloseText: { color: "#17141D", fontSize: 13, fontWeight: "800" },
});
