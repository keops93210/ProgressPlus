import { useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Minus, Plus, Timer, Zap } from "lucide-react-native";

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
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

export default function WorkoutRestCard({ time, onAdd15, onRemove15, onSkip }: WorkoutRestCardProps) {
  const [settings, setSettings] = useState<RestFeedbackSettings>({ soundEnabled: true, vibrationEnabled: true });
  const notifiedRef = useRef(false);
  const startedRef = useRef(false);
  const { active, remaining, duration, hydrated, start, add, remove, skip, sync } = useRestTimerStore();

  useEffect(() => {
    getRestFeedbackSettings().then(setSettings).catch(error => console.log("REST SETTINGS ERROR =", error));
  }, []);

  useEffect(() => {
    void useRestTimerStore.getState().hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated || startedRef.current) return;
    startedRef.current = true;
    if (!active) void start(parseTime(time));
  }, [hydrated, active, start, time]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(sync, 1000);
    return () => clearInterval(interval);
  }, [active, sync]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", state => {
      if (state === "active") sync();
    });
    return () => subscription.remove();
  }, [sync]);

  useEffect(() => {
    if (remaining > 0) {
      notifiedRef.current = false;
      return;
    }
    if (!active || notifiedRef.current) return;
    notifiedRef.current = true;
    triggerRestFinishedFeedback(settings).catch(error => console.log("REST FEEDBACK ERROR =", error));
  }, [active, remaining, settings]);

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

  const displayedSeconds = active ? remaining : parseTime(time);
  const progress = duration > 0 ? Math.max(0, Math.min(1, displayedSeconds / duration)) : 0;

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.icon}><Timer size={18} color="#FFFFFF" /></View>
          <View>
            <Text style={styles.eyebrow}>RÉCUPÉRATION</Text>
            <Text style={styles.title}>Temps de repos</Text>
          </View>
        </View>
        <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>EN COURS</Text></View>
      </View>

      <Text style={styles.timer}>{formatTime(displayedSeconds)}</Text>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.control} onPress={() => { onRemove15(); void remove(15); }}>
          <Minus size={17} color={Colors.text} />
          <Text style={styles.controlText}>15 s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlPrimary} onPress={() => { onAdd15(); void add(15); }}>
          <Plus size={17} color="#FFFFFF" />
          <Text style={styles.controlPrimaryText}>15 s</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipButton} onPress={() => { onSkip(); void skip(); }}>
        <Zap size={16} color={Colors.primary} />
        <Text style={styles.skipText}>Je suis prêt — passer le repos</Text>
      </TouchableOpacity>

      <View style={styles.feedbackBox}>
        <Text style={styles.feedbackTitle}>À la fin du chrono</Text>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>🔊 Son de notification</Text>
          <Switch value={settings.soundEnabled} onValueChange={toggleSound} trackColor={{ false: Colors.surfaceLight, true: Colors.primary }} />
        </View>
        <View style={styles.optionRow}>
          <Text style={styles.optionText}>📳 Vibration</Text>
          <Switch value={settings.vibrationEnabled} onValueChange={toggleVibration} trackColor={{ false: Colors.surfaceLight, true: Colors.primary }} />
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  titleRow: { flexDirection: "row", alignItems: "center" },
  icon: { width: 40, height: 40, borderRadius: 13, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", marginRight: 10 },
  eyebrow: { color: Colors.primary, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 17, fontWeight: "900", marginTop: 2 },
  liveBadge: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.surfaceLight, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginRight: 5 },
  liveText: { color: Colors.primary, fontSize: 9, fontWeight: "900" },
  timer: { color: Colors.text, fontSize: 58, lineHeight: 66, fontWeight: "900", textAlign: "center", marginTop: 14 },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: Colors.surfaceLight, overflow: "hidden", marginTop: 4 },
  progressFill: { height: "100%", borderRadius: 4, backgroundColor: Colors.primary },
  controls: { flexDirection: "row", gap: 10, marginTop: 18 },
  control: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  controlText: { color: Colors.text, fontSize: 14, fontWeight: "900" },
  controlPrimary: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: Colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  controlPrimaryText: { color: "#FFFFFF", fontSize: 14, fontWeight: "900" },
  skipButton: { minHeight: 46, borderRadius: 14, backgroundColor: Colors.surfaceLight, marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7 },
  skipText: { color: Colors.primary, fontSize: 13, fontWeight: "900" },
  feedbackBox: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.border },
  feedbackTitle: { color: Colors.textMuted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 1 },
  optionRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText: { color: Colors.textSecondary, fontSize: 13, fontWeight: "700" },
});
