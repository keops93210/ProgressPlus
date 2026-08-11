export type WeeklyPlanInput = {
  plannedSessions: number;
  completedSessions: number;
  fatigue: "low" | "moderate" | "high";
  goal: "gain" | "maintain" | "lose";
  performanceTrend: number | null;
};

export function getWeeklyPlanAdjustment(i: WeeklyPlanInput) {
  if (i.fatigue === "high") {
    return {
      action: "reduce" as const,
      delta: -1,
      message: "Réduis temporairement une séance ou son volume pour favoriser la récupération.",
    };
  }

  if (i.completedSessions < i.plannedSessions && i.performanceTrend != null && i.performanceTrend < 0) {
    return {
      action: "simplify" as const,
      delta: 0,
      message: "Simplifie le plan plutôt que d'ajouter du volume tant que la régularité et les performances baissent.",
    };
  }

  if (i.completedSessions >= i.plannedSessions && i.performanceTrend != null && i.performanceTrend > 0) {
    return {
      action: "progress" as const,
      delta: 0,
      message: "Le plan fonctionne : conserve la structure et progresse progressivement.",
    };
  }

  return {
    action: "maintain" as const,
    delta: 0,
    message: "Conserve le plan actuel et collecte davantage de données.",
  };
}
