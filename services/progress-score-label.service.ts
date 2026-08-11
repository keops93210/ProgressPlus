export type ScoreTone = "success" | "primary" | "warning" | "danger";

export function getProgressScoreLabel(score: number | null) {
  if (score == null) return { title: "Construisons ton score", tone: "primary" as ScoreTone };
  if (score >= 85) return { title: "Niveau exceptionnel", tone: "success" as ScoreTone };
  if (score >= 75) return { title: "Très bonne progression", tone: "success" as ScoreTone };
  if (score >= 60) return { title: "Bonne progression", tone: "primary" as ScoreTone };
  if (score >= 45) return { title: "Progression à renforcer", tone: "warning" as ScoreTone };
  return { title: "Plan à ajuster", tone: "danger" as ScoreTone };
}

export function getPriorityFromScores(scores: Record<string, number | null>) {
  const available = Object.entries(scores).filter(([, value]) => typeof value === "number" && Number.isFinite(value)) as [string, number][];
  if (!available.length) return null;
  return available.sort((a, b) => a[1] - b[1])[0][0];
}
