export type WorkoutResumeDecision =
  | { type: "new" }
  | { type: "resume"; sessionId: string }
  | { type: "stale"; sessionId: string; ageMinutes: number };

const STALE_SESSION_MINUTES = 6 * 60;

export function getWorkoutResumeDecision(input: {
  activeSessionId: string | null | undefined;
  startedAt: string | Date | null | undefined;
  now?: Date;
}): WorkoutResumeDecision {
  if (!input.activeSessionId || !input.startedAt) return { type: "new" };

  const startedAt = new Date(input.startedAt).getTime();
  const now = (input.now ?? new Date()).getTime();
  const ageMinutes = Math.max(0, Math.floor((now - startedAt) / 60000));

  if (!Number.isFinite(startedAt) || ageMinutes >= STALE_SESSION_MINUTES) {
    return {
      type: "stale",
      sessionId: input.activeSessionId,
      ageMinutes,
    };
  }

  return { type: "resume", sessionId: input.activeSessionId };
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
