import { useEffect, useState } from "react";
import {
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import {
  getRestFeedbackSettings,
  RestFeedbackSettings,
  setRestSoundEnabled,
  setRestVibrationEnabled,
  triggerRestFinishedFeedback,
} from "@/services/rest-feedback.service";

interface WorkoutRestCardProps {
  time: string;
  onAdd15: () => void;
  onRemove15: () => void;
  onSkip: () => void;
}

export default function WorkoutRestCard({
  time,
  onAdd15,
  onRemove15,
  onSkip,
}: WorkoutRestCardProps) {
  const [settings, setSettings] = useState<RestFeedbackSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
  });

  useEffect(() => {
    getRestFeedbackSettings().then(setSettings).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (time !== "0s") return;
    triggerRestFinishedFeedback(settings).catch(() => undefined);
  }, [time]);

  async function toggleSound(value: boolean) {
    setSettings((current) => ({ ...current, soundEnabled: value }));
    await setRestSoundEnabled(value);
  }

  async function toggleVibration(value: boolean) {
    setSettings((current) => ({ ...current, vibrationEnabled: value }));
    await setRestVibrationEnabled(value);
  }

  return (
    <Card>
      <Text style={styles.title}>⏱️ Temps de repos</Text>
      <Text style={styles.timer}>{time}</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={onRemove15}>
          <Text style={styles.buttonText}>-15 s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onAdd15}>
          <Text style={styles.buttonText}>+15 s</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackTitle}>À la fin du chrono</Text>

        <View style={styles.settingRow}>
          <View style={styles.copy}>
            <Text style={styles.settingLabel}>🔊 Son</Text>
            <Text style={styles.settingDescription}>
              Signal sonore quand le repos est terminé
            </Text>
          </View>
          <Switch
            value={settings.soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: Colors.border, true: Colors.primaryDark }}
            thumbColor={settings.soundEnabled ? Colors.primaryLight : "#888"}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.copy}>
            <Text style={styles.settingLabel}>📳 Vibration</Text>
            <Text style={styles.settingDescription}>
              Vibration + haptique quand le repos est terminé
            </Text>
          </View>
          <Switch
            value={settings.vibrationEnabled}
            onValueChange={toggleVibration}
            trackColor={{ false: Colors.border, true: Colors.primaryDark }}
            thumbColor={settings.vibrationEnabled ? Colors.primaryLight : "#888"}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
        <Text style={styles.skipText}>Passer le repos</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "700", color: Colors.primary, textAlign: "center" },
  timer: { marginTop: 20, marginBottom: 20, fontSize: 52, fontWeight: "800", color: Colors.text, textAlign: "center" },
  buttons: { flexDirection: "row", gap: 10 },
  button: { flex: 1, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  feedbackBox: { marginTop: 18, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.border, gap: 12 },
  feedbackTitle: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  copy: { flex: 1 },
  settingLabel: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  settingDescription: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
  skipButton: { marginTop: 16, alignItems: "center" },
  skipText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "600" },
});
