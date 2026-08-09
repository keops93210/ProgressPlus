import { ArrowLeft, Bell, ChevronRight, Volume2, Vibrate } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import {
  getRestFeedbackSettings,
  requestRestSoundPermission,
  setRestSoundEnabled,
  setRestVibrationEnabled,
} from "@/services/rest-feedback.service";

export default function SettingsScreen() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  useEffect(() => {
    getRestFeedbackSettings().then((settings) => {
      setSoundEnabled(settings.soundEnabled);
      setVibrationEnabled(settings.vibrationEnabled);
    }).catch(console.error);
  }, []);

  async function toggleSound(value: boolean) {
    if (value) {
      const granted = await requestRestSoundPermission();
      if (!granted) return;
    }
    setSoundEnabled(value);
    await setRestSoundEnabled(value);
  }

  async function toggleVibration(value: boolean) {
    setVibrationEnabled(value);
    await setRestVibrationEnabled(value);
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={Colors.text} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>PROGRESS+</Text>
            <Text style={styles.title}>Options</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SÉANCE</Text>
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <View style={styles.sectionIcon}><Bell size={18} color={Colors.primary} /></View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>Minuteur de repos</Text>
              <Text style={styles.cardSubtitle}>Choisis ce qui se passe quand ton repos est terminé.</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <SettingRow
            icon={<Volume2 size={19} color={Colors.textSecondary} />}
            title="Son à la fin du repos"
            subtitle="Notification sonore"
            value={soundEnabled}
            onValueChange={toggleSound}
          />
          <SettingRow
            icon={<Vibrate size={19} color={Colors.textSecondary} />}
            title="Vibration à la fin du repos"
            subtitle="Retour haptique"
            value={vibrationEnabled}
            onValueChange={toggleVibration}
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 Pendant ta séance</Text>
          <Text style={styles.infoText}>Le minuteur reste volontairement minimal : temps, ±15 secondes et bouton Prêt. Tous les réglages sont regroupés ici pour ne pas gêner ton entraînement.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({ icon, title, subtitle, value, onValueChange }: { icon: React.ReactNode; title: string; subtitle: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor="#FFFFFF" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 18, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 30 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, alignItems: "center", justifyContent: "center" },
  headerCopy: { flex: 1 },
  eyebrow: { color: Colors.primary, fontSize: 10, fontWeight: "900", letterSpacing: 1.5 },
  title: { color: Colors.text, fontSize: 30, fontWeight: "900", marginTop: 2 },
  sectionLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, marginBottom: 9 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 22, padding: 17 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  sectionIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: Colors.surfaceLight, alignItems: "center", justifyContent: "center" },
  cardCopy: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: "900" },
  cardSubtitle: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 13 },
  row: { minHeight: 66, flexDirection: "row", alignItems: "center", gap: 11 },
  rowIcon: { width: 34, alignItems: "center" },
  rowCopy: { flex: 1 },
  rowTitle: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  rowSubtitle: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  infoBox: { marginTop: 16, borderRadius: 18, backgroundColor: Colors.surfaceLight, padding: 16 },
  infoTitle: { color: Colors.text, fontSize: 14, fontWeight: "900" },
  infoText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 19, marginTop: 6 },
});
