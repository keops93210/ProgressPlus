export type NextSessionInput = {
  readiness: number | null;
  fatigue: "low" | "moderate" | "high";
  lastPerformance: "up" | "stable" | "down";
  weeklyCompletion: number;
};

export function getNextSessionGuidance(i: NextSessionInput) {
  if (i.fatigue === "high" || (i.readiness != null && i.readiness < 45)) {
    return {
      mode: "recover" as const,
      title: "Priorité récupération",
      message: "Garde la séance légère ou reporte l'intensité jusqu'à retrouver une meilleure disponibilité.",
    };
  }

  if (i.lastPerformance === "down") {
    return {
      mode: "consolidate" as const,
      title: "Consolide ta charge",
      message: "Garde les charges actuelles et cherche une exécution plus propre avant d'augmenter.",
    };
  }

  if (i.weeklyCompletion >= 1 && i.lastPerformance === "up") {
    return {
      mode: "progress" as const,
      title: "Tu peux progresser",
      message: "Les signaux sont favorables : applique une petite progression sur les exercices prévus.",
    };
  }

  return {
    mode: "normal" as const,
    title: "Séance normale",
    message: "Suis ton programme et laisse la performance guider la progression.",
  };
}
