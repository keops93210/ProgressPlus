import type { LiveActivity } from "expo-widgets";

import RestTimerActivity from "@/components/workout/RestTimerActivity";

export type RestTimerLiveActivityProps = {
  remaining: number;
  duration: number;
};

type RestTimerLiveActivity = LiveActivity<RestTimerLiveActivityProps>;

let currentActivity: RestTimerLiveActivity | null = null;

function recoverActivity() {
  if (currentActivity) return currentActivity;

  const instances = RestTimerActivity.getInstances();
  currentActivity = instances[0] ?? null;
  return currentActivity;
}

export function startRestTimerLiveActivity(
  props: RestTimerLiveActivityProps
): RestTimerLiveActivity | null {
  const existing = recoverActivity();

  if (existing) {
    void existing.update(props).catch((error) => {
      console.log("REST LIVE ACTIVITY UPDATE ERROR =", error);
    });
    return existing;
  }

  try {
    currentActivity = RestTimerActivity.start(props);
    return currentActivity;
  } catch (error) {
    console.log("REST LIVE ACTIVITY START ERROR =", error);
    currentActivity = null;
    return null;
  }
}

export async function updateRestTimerLiveActivity(
  props: RestTimerLiveActivityProps
): Promise<void> {
  const activity = recoverActivity();
  if (!activity) return;

  try {
    await activity.update(props);
  } catch (error) {
    console.log("REST LIVE ACTIVITY UPDATE ERROR =", error);
  }
}

export async function endRestTimerLiveActivity(): Promise<void> {
  const activity = recoverActivity();
  currentActivity = null;

  if (!activity) return;

  try {
    await activity.end("immediate", { remaining: 0, duration: 0 }, new Date());
  } catch (error) {
    console.log("REST LIVE ACTIVITY END ERROR =", error);
  }
}
