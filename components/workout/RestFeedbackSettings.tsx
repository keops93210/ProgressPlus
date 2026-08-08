import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import Colors from "@/constants/colors";
import {
  getRestFeedbackSettings,
  RestFeedbackSettings,
  setRestSoundEnabled,
  setRestVibrationEnabled,
} from "@/services/rest-feedback.service";

export default function RestFeedbackSettingsPanel() {
  const [settings, setSettings] = useState<RestFeedbackSettings>({
    soundEnabled: true,
    vibrationEnabled: true,
  });

  useEffect(() => {
    getRestFeedbackSettings().then(setSettings).catch(() => undefined);
  }, []);

  async function toggleSound(value: boolean) {
    setSettings((current) => ({ ...current, soundEnabled: value }));
    await setRestSoundEnabled(value);
  }

  async function toggleVibration(value: boolean) {
    setSettings((current) => ({ ...current, vibrationEnabled: value }));
    await setRestVibrationEnabled(value);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>À la fin du chrono</Text>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>🔊 Son</Text>
          <Text style={styles.description}>Signal sonore à la fin du repos</Text>
        </View>
        <Switch
          value={settings.soundEnabled}
          onValueChange={toggleSound}
          trackColor={{ false: Colors.border, true: Colors.primaryDark }}
          thumbColor={settings.soundEnabled ? Colors.primaryLight : "#888"}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.label}>📳 Vibration</Text>
          <Text style={styles.description}>Retour haptique à la fin du repos</Text>
        </View>
        <Switch
          value={settings.vibrationEnabled}
          onValueChange={toggleVibration}
          trackColor={{ false: Colors.border, true: Colors.primaryDark }}
          thumbColor={settings.vibrationEnabled ? Colors.primaryLight : "#888"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18, gap: 14 },
  title: { color: Colors.text, fontSize: 14, fontWeight: "800" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  copy: { flex: 1 },
  label: { color: Colors.text, fontSize: 15, fontWeight: "700" },
  description: { color: Colors.textSecondary, fontSize: 11, marginTop: 3 },
});
