export type WorkoutInsight = {
  type: "positive" | "warning" | "neutral" | "milestone";
  title: string;
  message: string;
  priority: number;
};

export type WorkoutInsightInput = {
  plannedSets: number;
  completedSets: number;
  averageRir?: number | null;
  hardestRir?: number | null;
  recoveryScore?: number | null;
  volume?: number;
  previousVolume?: number | null;
  personalRecords?: number;
  elapsedSeconds?: number;
};

export function buildWorkoutInsights(input: WorkoutInsightInput): WorkoutInsight[] {
  const insights: WorkoutInsight[] = [];
  const completion = input.plannedSets > 0 ? input.completedSets / input.plannedSets : 0;

  if (completion >= 1) {
    insights.push({ type: "positive", title: "Séance complète", message: "Toutes les séries prévues ont été réalisées.", priority: 10 });
  } else if (completion >= 0.75) {
    insights.push({ type: "neutral", title: "Séance presque complète", message: `${input.completedSets}/${input.plannedSets} séries réalisées. La prochaine séance pourra repartir de cette base.`, priority: 7 });
  } else if (input.plannedSets > 0) {
    insights.push({ type: "warning", title: "Volume réduit", message: `${input.completedSets}/${input.plannedSets} séries réalisées. Progress+ prendra la récupération en compte avant de pousser le volume.`, priority: 9 });
  }

  if (input.personalRecords && input.personalRecords > 0) {
    insights.push({ type: "milestone", title: `${input.personalRecords} nouveau${input.personalRecords > 1 ? "x" : ""} record${input.personalRecords > 1 ? "s" : ""}`, message: "Une nouvelle référence personnelle a été enregistrée.", priority: 10 });
  }

  if (input.averageRir != null) {
    if (input.averageRir <= 0.75) {
      insights.push({ type: "warning", title: "Effort très élevé", message: "La séance a été proche de l'échec en moyenne. Progress+ évitera de surcharger automatiquement la prochaine séance.", priority: 9 });
    } else if (input.averageRir >= 4) {
      insights.push({ type: "neutral", title: "Marge importante", message: "Tu avais beaucoup de réserve. Une progression de charge ou de répétitions pourra être envisagée.", priority: 6 });
    } else {
      insights.push({ type: "positive", title: "Effort productif", message: "Ton niveau d'effort moyen se situe dans une zone favorable à la progression.", priority: 5 });
    }
  }

  if (input.hardestRir != null && input.hardestRir <= 0) {
    insights.push({ type: "warning", title: "Échec détecté", message: "Une série a atteint l'échec. Le moteur de progression protégera la prochaine séance contre une surcharge inutile.", priority: 10 });
  }

  if (input.recoveryScore != null) {
    if (input.recoveryScore <= 2) {
      insights.push({ type: "warning", title: "Récupération à surveiller", message: "Ta récupération était basse. La progression sera plus conservatrice tant que les signaux ne remontent pas.", priority: 9 });
    } else if (input.recoveryScore >= 4.2) {
      insights.push({ type: "positive", title: "Bonne récupération", message: "Ton état du jour permettait une progression plus ambitieuse si la technique restait stable.", priority: 5 });
    }
  }

  if (input.volume != null && input.previousVolume != null && input.previousVolume > 0) {
    const deltaPercent = ((input.volume - input.previousVolume) / input.previousVolume) * 100;
    if (deltaPercent >= 10) {
      insights.push({ type: "positive", title: "Volume en hausse", message: `Le volume augmente de ${Math.round(deltaPercent)}% par rapport à la référence précédente.`, priority: 6 });
    } else if (deltaPercent <= -15) {
      insights.push({ type: "warning", title: "Volume en baisse", message: `Le volume est inférieur de ${Math.round(Math.abs(deltaPercent))}% à la référence précédente.`, priority: 7 });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority).slice(0, 5);
}
