export type WorkoutResumeDecision =
  | { type: "new"; progress: 0; elapsedSeconds: 0; ageMinutes: 0 }
  | { type: "resume"; sessionId: string; progress: number; elapsedSeconds: number; ageMinutes: number }
  | { type: "stale"; sessionId: string; ageMinutes: number; progress: number; elapsedSeconds: number };

const STALE_SESSION_MINUTES = 6 * 60;

function elapsedSeconds(startedAt: string | Date, now: Date) {
  const start = new Date(startedAt).getTime();
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((now.getTime() - start) / 1000));
}

export function getWorkoutResumeDecision(input: {
  activeSessionId: string | null | undefined;
  startedAt: string | Date | null | undefined;
  completedSets?: number;
  plannedSets?: number;
  finishedAt?: string | Date | null;
  now?: Date;
  staleAfterMinutes?: number;
}): WorkoutResumeDecision {
  if (!input.activeSessionId || !input.startedAt) return { type: "new", progress: 0, elapsedSeconds: 0, ageMinutes: 0 };
  const now = input.now ?? new Date();
  const startedAt = new Date(input.startedAt).getTime();
  const ageMinutes = Math.max(0, Math.floor((now.getTime() - startedAt) / 60000));
  const completedSets = Math.max(0, input.completedSets ?? 0);
  const plannedSets = Math.max(0, input.plannedSets ?? 0);
  const progress = plannedSets > 0 ? Math.min(1, completedSets / plannedSets) : 0;
  const elapsed = elapsedSeconds(input.startedAt, now);
  const staleLimit = Math.max(30, input.staleAfterMinutes ?? STALE_SESSION_MINUTES);
  if (!Number.isFinite(startedAt) || input.finishedAt || (plannedSets > 0 && completedSets >= plannedSets) || ageMinutes >= staleLimit) {
    return { type: "stale", sessionId: input.activeSessionId, ageMinutes, progress: plannedSets > 0 && completedSets >= plannedSets ? 1 : progress, elapsedSeconds: elapsed };
  }
  return { type: "resume", sessionId: input.activeSessionId, progress, elapsedSeconds: elapsed, ageMinutes };
}

export function formatResumeAge(ageMinutes: number) {
  if (ageMinutes < 60) return `${ageMinutes} min`;
  const hours = Math.floor(ageMinutes / 60);
  const minutes = ageMinutes % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export function formatElapsedWorkoutTime(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export const WORKOUT_RESUME_COPY = {
  resumeTitle: "Reprendre la séance ?",
  resumeMessage: "Une séance non terminée existe déjà. Tu peux reprendre exactement où tu t'es arrêté.",
  newTitle: "Nouvelle séance",
  newMessage: "Commence une nouvelle séance sans modifier l'historique de la précédente.",
  staleTitle: "Séance interrompue détectée",
  staleMessage: "Cette séance semble avoir été interrompue il y a longtemps. Vérifie avant de la reprendre.",
} as const;
