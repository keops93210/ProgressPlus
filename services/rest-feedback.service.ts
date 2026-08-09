import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { Vibration } from "react-native";

const SOUND_KEY = "progressplus.rest.sound";
const VIBRATION_KEY = "progressplus.rest.vibration";

export interface RestFeedbackSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const DEFAULT_SETTINGS: RestFeedbackSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
};

export async function getRestFeedbackSettings(): Promise<RestFeedbackSettings> {
  const [sound, vibration] = await Promise.all([AsyncStorage.getItem(SOUND_KEY), AsyncStorage.getItem(VIBRATION_KEY)]);
  return {
    soundEnabled: sound === null ? DEFAULT_SETTINGS.soundEnabled : sound === "true",
    vibrationEnabled: vibration === null ? DEFAULT_SETTINGS.vibrationEnabled : vibration === "true",
  };
}

export async function setRestSoundEnabled(enabled: boolean) {
  await AsyncStorage.setItem(SOUND_KEY, String(enabled));
}

export async function setRestVibrationEnabled(enabled: boolean) {
  await AsyncStorage.setItem(VIBRATION_KEY, String(enabled));
}

export async function requestRestSoundPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function triggerRestFinishedFeedback(settings: RestFeedbackSettings) {
  if (!settings.vibrationEnabled) return;
  Vibration.vibrate([0, 180, 80, 180]);
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    // Some devices may not expose the haptic engine.
  }
}
