export type WorkoutResumeDecision =
  | { type: "new" }
  | { type: "resume"; sessionId: string; progress: number; elapsedSeconds: number }
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
  if (!input.activeSessionId || !input.startedAt) return { type: "new" };

  const now = input.now ?? new Date();
  const startedAt = new Date(input.startedAt).getTime();
  const ageMinutes = Math.max(0, Math.floor((now.getTime() - startedAt) / 60000));
  const completedSets = Math.max(0, input.completedSets ?? 0);
  const plannedSets = Math.max(0, input.plannedSets ?? 0);
  const progress = plannedSets > 0 ? Math.min(1, completedSets / plannedSets) : 0;
  const elapsed = elapsedSeconds(input.startedAt, now);
  const staleLimit = Math.max(30, input.staleAfterMinutes ?? STALE_SESSION_MINUTES);

  if (!Number.isFinite(startedAt) || input.finishedAt) {
    return { type: "stale", sessionId: input.activeSessionId, ageMinutes, progress, elapsedSeconds: elapsed };
  }

  if (plannedSets > 0 && completedSets >= plannedSets) {
    return { type: "stale", sessionId: input.activeSessionId, ageMinutes, progress: 1, elapsedSeconds: elapsed };
  }

  if (ageMinutes >= staleLimit) {
    return { type: "stale", sessionId: input.activeSessionId, ageMinutes, progress, elapsedSeconds: elapsed };
  }

  return { type: "resume", sessionId: input.activeSessionId, progress, elapsedSeconds: elapsed };
}

export function formatResumeAge(ageMinutes: number) {
  if (ageMinutes < 60) return `${ageMinutes} min`;
  const hours = Math.floor(ageMinutes / 60);
  const minutes = ageMinutes % 60;
  return minutes ? `${hours} h ${minutes} min` : `${hours} h`;
}

export const WORKOUT_RESUME_COPY = {
  resumeTitle: "Reprendre la séance ?",
  resumeMessage: "Une séance non terminée existe déjà. Tu peux reprendre exactement où tu t'es arrêté.",
  newTitle: "Nouvelle séance",
  newMessage: "Commence une nouvelle séance sans modifier l'historique de la précédente.",
  staleTitle: "Séance interrompue détectée",
  staleMessage: "Cette séance semble avoir été interrompue il y a longtemps. Vérifie avant de la reprendre.",
} as const;
