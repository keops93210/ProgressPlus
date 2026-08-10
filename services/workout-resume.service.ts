export type ResumeState = "new" | "resume" | "stale";

export interface SessionResumeInput {
  startedAt: string | Date;
  finishedAt?: string | Date | null;
  completedSets: number;
  plannedSets: number;
  now?: Date;
  staleAfterHours?: number;
}

export interface SessionResumeDecision {
  state: ResumeState;
  elapsedSeconds: number;
  completionPercent: number;
  ageHours: number;
  message: string;
}

export function getSessionResumeDecision(input: SessionResumeInput): SessionResumeDecision {
  const now = input.now ?? new Date();
  const startedAt = new Date(input.startedAt).getTime();
  const finishedAt = input.finishedAt ? new Date(input.finishedAt).getTime() : null;
  const elapsedSeconds = Math.max(0, Math.floor(((finishedAt ?? now.getTime()) - startedAt) / 1000));
  const ageHours = Math.max(0, (now.getTime() - startedAt) / 3_600_000);
  const completionPercent = input.plannedSets > 0
    ? Math.min(100, Math.round((input.completedSets / input.plannedSets) * 100))
    : 0;
  const staleAfterHours = input.staleAfterHours ?? 12;

  if (finishedAt) {
    return {
      state: "new",
      elapsedSeconds,
      completionPercent,
      ageHours,
      message: "Cette séance est déjà terminée. Une nouvelle séance peut être commencée.",
    };
  }

  if (ageHours >= staleAfterHours && input.completedSets > 0) {
    return {
      state: "stale",
      elapsedSeconds,
      completionPercent,
      ageHours,
      message: `Cette séance a été commencée il y a ${Math.floor(ageHours)} h. Tu peux la reprendre ou repartir sur une nouvelle séance.`,
    };
  }

  if (input.completedSets > 0) {
    return {
      state: "resume",
      elapsedSeconds,
      completionPercent,
      ageHours,
      message: `Séance en cours : ${completionPercent}% terminé. Reprendre permet de conserver tes séries déjà enregistrées.`,
    };
  }

  return {
    state: "resume",
    elapsedSeconds,
    completionPercent,
    ageHours,
    message: "Une séance est déjà ouverte mais aucune série n'a encore été enregistrée.",
  };
}
