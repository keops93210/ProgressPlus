import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { create } from "zustand";

import { getRestFeedbackSettings } from "@/services/rest-feedback.service";
import {
  endRestTimerLiveActivity,
  startRestTimerLiveActivity,
} from "@/services/rest-timer-live-activity.service";

const STORAGE_KEY = "progressplus.rest.timer";
const NOTIFICATION_KEY = "progressplus.rest.timer.notification";
const CHANNEL_ID = "progressplus-rest";

export interface RestTimerState {
  active: boolean;
  endAt: number | null;
  duration: number;
  remaining: number;
  notificationId: string | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  start: (seconds: number) => Promise<void>;
  add: (seconds: number) => Promise<void>;
  remove: (seconds: number) => Promise<void>;
  skip: () => Promise<void>;
  sync: () => void;
}

async function cancelNotification(id: string | null) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (error) {
    console.log("REST NOTIFICATION CANCEL ERROR =", error);
  }
}

async function clearStorage() {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEY),
    AsyncStorage.removeItem(NOTIFICATION_KEY),
  ]);
}

async function prepareNotifications() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Temps de repos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 150, 250],
    });
  }
}

async function scheduleNotification(seconds: number) {
  try {
    await prepareNotifications();
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted) {
      const requested = await Notifications.requestPermissionsAsync();
      if (!requested.granted) return null;
    }
    const settings = await getRestFeedbackSettings();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Repos terminé 💪",
        body: "C'est reparti. Ta prochaine série t'attend.",
        sound: settings.soundEnabled ? "default" : false,
        data: { type: "rest-timer" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
        repeats: false,
        ...(Platform.OS === "android" ? { channelId: CHANNEL_ID } : {}),
      },
    });
  } catch (error) {
    console.log("REST NOTIFICATION SCHEDULE ERROR =", error);
    return null;
  }
}

export const useRestTimerStore = create<RestTimerState>((set, get) => ({
  active: false,
  endAt: null,
  duration: 0,
  remaining: 0,
  notificationId: null,
  hydrated: false,

  hydrate: async () => {
    try {
      const [raw, notificationId] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(NOTIFICATION_KEY),
      ]);

      if (!raw) {
        set({ hydrated: true });
        return;
      }

      const parsed = JSON.parse(raw) as { endAt: number; duration: number };
      const remaining = Math.max(
        0,
        Math.ceil((parsed.endAt - Date.now()) / 1000)
      );

      if (!parsed.endAt || remaining <= 0) {
        await cancelNotification(notificationId);
        await clearStorage();
        set({
          hydrated: true,
          active: false,
          endAt: null,
          duration: 0,
          remaining: 0,
          notificationId: null,
        });
        void endRestTimerLiveActivity();
        return;
      }

      set({
        hydrated: true,
        active: true,
        endAt: parsed.endAt,
        duration: parsed.duration,
        remaining,
        notificationId,
      });

      startRestTimerLiveActivity({
        endAt: parsed.endAt,
        duration: parsed.duration,
      });
    } catch (error) {
      console.log("REST TIMER HYDRATE ERROR =", error);
      set({ hydrated: true });
    }
  },

  start: async (seconds) => {
    const safeSeconds = Math.max(1, Math.round(seconds));
    await cancelNotification(get().notificationId);

    const endAt = Date.now() + safeSeconds * 1000;
    const notificationId = await scheduleNotification(safeSeconds);

    await Promise.all([
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ endAt, duration: safeSeconds })
      ),
      notificationId
        ? AsyncStorage.setItem(NOTIFICATION_KEY, notificationId)
        : AsyncStorage.removeItem(NOTIFICATION_KEY),
    ]);

    set({
      active: true,
      endAt,
      duration: safeSeconds,
      remaining: safeSeconds,
      notificationId,
    });

    startRestTimerLiveActivity({
      endAt,
      duration: safeSeconds,
    });
  },

  add: async (seconds) => {
    const { active, endAt } = get();
    if (!active || !endAt) return;

    const remaining = Math.max(
      0,
      Math.ceil((endAt - Date.now()) / 1000)
    );
    await get().start(remaining + seconds);
  },

  remove: async (seconds) => {
    const { active, endAt } = get();
    if (!active || !endAt) return;

    const remaining = Math.max(
      0,
      Math.ceil((endAt - Date.now()) / 1000)
    );

    if (remaining <= seconds) {
      await get().skip();
      return;
    }

    await get().start(remaining - seconds);
  },

  skip: async () => {
    await cancelNotification(get().notificationId);
    await clearStorage();
    set({
      active: false,
      endAt: null,
      duration: 0,
      remaining: 0,
      notificationId: null,
    });
    await endRestTimerLiveActivity();
  },

  sync: () => {
    const { active, endAt } = get();
    if (!active || !endAt) return;

    const remaining = Math.max(
      0,
      Math.ceil((endAt - Date.now()) / 1000)
    );

    if (remaining <= 0) {
      set({
        active: false,
        endAt: null,
        duration: 0,
        remaining: 0,
        notificationId: null,
      });
      void clearStorage();
      void endRestTimerLiveActivity();
      return;
    }

    set({ remaining });
  },
}));
