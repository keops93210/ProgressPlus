export type RestTimerLiveActivityProps = {
  endAt: number;
  duration: number;
};

export function startRestTimerLiveActivity(
  _props: RestTimerLiveActivityProps
): null {
  return null;
}

export async function updateRestTimerLiveActivity(
  _props: RestTimerLiveActivityProps
): Promise<void> {}

export async function endRestTimerLiveActivity(): Promise<void> {}
