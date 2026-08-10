export type SessionResumeState = "new" | "resume" | "stale" | "completed";

export type SessionStateInput = {
  startedAt: string | Date;
  finishedAt?: string | Date | null;
  completedSets: number;
  plannedSets: number;
  now?: Date;
};

const MINUTE = 60_000;
const STALE_AFTER = 12 * 60 * MINUTE;

export function getSessionResumeState(input: SessionStateInput): SessionResumeState {
  if (input.finishedAt) return "completed";
  if (input.completedSets <= 0) return "new";

  const startedAt = new Date(input.startedAt).getTime();
  const now = (input.now ?? new Date()).getTime();
  const age = Math.max(0, now - startedAt);

  if (input.plannedSets > 0 && input.completedSets >= input.plannedSets) return "completed";
  if (age >= STALE_AFTER) return "stale";
  return "resume";
}

export function getSessionProgress(completedSets: number, plannedSets: number) {
  if (plannedSets <= 0) return 0;
  return Math.round(Math.max(0, Math.min(1, completedSets / plannedSets)) * 100);
}

export function getElapsedSeconds(startedAt: string | Date, now = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - new Date(startedAt).getTime()) / 1000));
}

export function shouldOfferResume(input: SessionStateInput) {
  return getSessionResumeState(input) === "resume";
}

export function getResumeMessage(state: SessionResumeState, progressPercent: number) {
  switch (state) {
    case "resume": return `Séance en cours · ${progressPercent}% terminé`;
    case "stale": return "Cette séance semble ancienne. Commence une nouvelle séance pour repartir sur un chrono propre.";
    case "completed": return "Cette séance est déjà terminée.";
    default: return "Prêt à commencer une nouvelle séance.";
  }
}
