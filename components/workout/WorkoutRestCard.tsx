import { useEffect, useRef } from "react";

import { useRestTimerStore } from "@/stores/rest-timer.store";

interface WorkoutRestCardProps {
  time: string;
  onAdd15: () => void;
  onRemove15: () => void;
  onSkip: () => void;
}

function parseTime(value: string) {
  const minuteMatch = value.match(/^(\d+)m(\d+)$/);
  if (minuteMatch) return Number(minuteMatch[1]) * 60 + Number(minuteMatch[2]);
  const secondMatch = value.match(/^(\d+)s$/);
  return secondMatch ? Number(secondMatch[1]) : 0;
}

/**
 * Compatibility bridge for the workout screen.
 *
 * The rest timer UI is now rendered globally by GlobalRestTimer so it stays
 * pinned while the user navigates. This component only starts/synchronizes
 * the global timer and deliberately renders no local card.
 */
export default function WorkoutRestCard({ time, onSkip }: WorkoutRestCardProps) {
  const startedRef = useRef(false);
  const start = useRestTimerStore((state) => state.start);
  const active = useRestTimerStore((state) => state.active);
  const hydrated = useRestTimerStore((state) => state.hydrated);

  useEffect(() => {
    const seconds = parseTime(time);
    if (seconds <= 0) return;
    startedRef.current = true;
    void start(seconds);
  }, [start, time]);

  useEffect(() => {
    if (!hydrated || !startedRef.current || active) return;
    onSkip();
  }, [active, hydrated, onSkip]);

  return null;
}
