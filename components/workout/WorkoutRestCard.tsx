import { useEffect, useRef, useState } from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";

import Card from "@/components/ui/Card";
import Colors from "@/constants/colors";
import { useRestTimerStore } from "@/stores/rest-timer.store";
import {
  getRestFeedbackSettings,
  requestRestSoundPermission,
  setRestSoundEnabled,
  setRestVibrationEnabled,
  triggerRestFinishedFeedback,
  RestFeedbackSettings,
} from "@/services/rest-feedback.service";

interface WorkoutRestCardProps {
  time: string;
  onAdd15: () => void;
  onRemove15: () => void;
  onSkip: () => void;
}

function parseTime(value: string) {
  const minuteMatch = value.match(/(\d+)m(\d+)$/);
  if (minuteMatch) return Number(minuteMatch[1]) * 60 + Number(minuteMatch[2]);
  const secondMatch = value.match(/(\d+)s$/);
  return secondMatch ? Number(secondMatch[1]) : 120;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return minutes === 0 ? `${remaining}s` : `${minutes}m${remaining.toString().padStart(2, "0")}`;
}

export default function WorkoutRestCard({ time, onAdd15, onRemove15, onSkip }: WorkoutRestCardProps) {
  const [settings, setSettings] = useState<RestFeedbackSettings>({ soundEnabled: true, vibrationEnabled: true });
  const notifiedRef = useRef(false);
  const startedRef = useRef(false);
  const { active, remaining, hydrated, start, add, remove, skip } = useRestTimerStore();

  useEffect(() => {
    getRestFeedbackSettings().then(setSettings).catch(error => console.log("REST SETTINGS ERROR =", error));
  }, []);

  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    startedRef.current = true;
    if (!active) void start(parseTime(time));
  }, [hydrated, active, start, time]);

  useEffect(() => {
    if (time !== "0s") {
      notifiedRef.current = false;
      return;
    }
    if (notifiedRef.current) return;
    notifiedRef.current = true;
    triggerRestFinishedFeedback(settings).catch(error => console.log("REST FEEDBACK ERROR =", error));
  }, [time, settings]);

  async function toggleSound(value: boolean) {
    if (value) {
      const granted = await requestRestSoundPermission();
      if (!granted) return;
    }
    setSettings(previous => ({ ...previous, soundEnabled: value }));
    await setRestSoundEnabled(value);
  }

  async function toggleVibration(value: boolean) {
    setSettings(previous => ({ ...previous, vibrationEnabled: value }));
    await setRestVibrationEnabled(value);
  }

  const displayedTime = active ? formatTime(remaining) : time;

  return (
    <Card>
      <Text style={styles.title}>⏱️ Temps de repos</Text>
      <Text style={styles.timer}>{displayedTime}</Text>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => { onRemove15(); void remove(15); }}>
          <Text style={styles.buttonText}>-15 s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { onAdd15(); void add(15); }}>
          <Text style={styles.buttonText}>+15 s</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackTitle}>À la fin du chrono</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>🔊 Son</Text>
          <Switch value={settings.soundEnabled} onValueChange={toggleSound} trackColor={{ false: Colors.surfaceLight, true: Colors.primary }} />
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>📳 Vibration</Text>
          <Switch value={settings.vibrationEnabled} onValueChange={toggleVibration} trackColor={{ false: Colors.surfaceLight, true: Colors.primary }} />
        </View>
      </View>
      <TouchableOpacity style={styles.skipButton} onPress={() => { onSkip(); void skip(); }}>
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
  feedbackBox: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border, gap: 8 },
  feedbackTitle: { color: Colors.textSecondary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  optionRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { color: Colors.text, fontSize: 15, fontWeight: "600" },
  skipButton: { marginTop: 12, alignItems: "center" },
  skipText: { color: Colors.textSecondary, fontSize: 16, fontWeight: "600" },
});
