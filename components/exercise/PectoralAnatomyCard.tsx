import { useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Maximize2, Info, Dumbbell, Users } from "lucide-react-native";

import Colors from "@/constants/colors";

const ANATOMY_IMAGE =
  "https://commons.wikimedia.org/wiki/Special:FilePath/Gray410_pectoralis_major.png";

type Props = {
  exerciseName: string;
  secondary: string[];
};

function getFocus(exerciseName: string) {
  const name = exerciseName.toLowerCase();
  if (name.includes("incliné") || name.includes("incline")) {
    return {
      title: "Faisceau claviculaire",
      description: "Priorité au haut des pectoraux avec l'inclinaison du banc.",
    };
  }
  if (name.includes("développé couché") || name.includes("bench")) {
    return {
      title: "Faisceau sternal",
      description: "Le faisceau central constitue la masse principale sollicitée.",
    };
  }
  return {
    title: "Grand pectoral",
    description: "Les trois portions participent au mouvement, avec une sollicitation qui dépend de l'angle et de la trajectoire.",
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
          <View style={styles.dot} />
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
        <Portion name="Faisceau claviculaire" label="Haut des pectoraux" active={focus.title === "Faisceau claviculaire"} />
        <Portion name="Faisceau sternal" label="Partie centrale" active={focus.title === "Faisceau sternal"} />
        <Portion name="Faisceau costal" label="Partie inférieure" active={false} />
        <Text style={styles.focusTitle}>Priorité sur cet exercice : {focus.title}</Text>
        <Text style={styles.focusText}>{focus.description}</Text>
      </View>

      <Modal visible={fullscreen} animationType="fade" transparent onRequestClose={() => setFullscreen(false)}>
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

function Portion({ name, label, active }: { name: string; label: string; active: boolean }) {
  return (
    <View style={[styles.portion, active && styles.portionActive]}>
      <View style={[styles.portionDot, active && styles.portionDotActive]} />
      <View style={styles.portionCopy}>
        <Text style={[styles.portionName, active && styles.portionNameActive]}>{name}</Text>
        <Text style={styles.portionLabel}>{label}</Text>
      </View>
      {active ? <Text style={styles.priority}>PRIORITÉ</Text> : null}
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
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Colors.primary, marginRight: 8 },
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
  portionActive: { borderColor: "#C4B5FD", backgroundColor: "#F7F2FF" },
  portionDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#CBD5E1", marginRight: 10 },
  portionDotActive: { backgroundColor: Colors.primary },
  portionCopy: { flex: 1 },
  portionName: { color: Colors.text, fontSize: 13, fontWeight: "800" },
  portionNameActive: { color: Colors.primaryDark },
  portionLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  priority: { color: Colors.primary, fontSize: 9, fontWeight: "900" },
  focusTitle: { color: Colors.text, fontSize: 13, fontWeight: "900", marginTop: 13 },
  focusText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(10,8,18,0.96)", alignItems: "center", justifyContent: "center", padding: 18 },
  fullscreenImage: { width: "100%", height: "82%" },
  modalClose: { position: "absolute", right: 18, top: 58, zIndex: 2, backgroundColor: "#FFFFFF", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  modalCloseText: { color: "#17141D", fontSize: 13, fontWeight: "800" },
});
