import { supabase } from "@/lib/supabase";

export type CoachMode = "PUSH" | "NORMAL" | "HOLD";

export interface ExerciseRecommendation {
  exerciseId: string;
  recommendedWeight: number | null;
  recommendedReps: number | null;
  confidence: "low" | "medium" | "high";
  reason: string;
  historySessions: number;
  averageRir: number | null;
  trend: "up" | "stable" | "down" | "unknown";
}

export interface ReadinessInput {
  sleep: number;
  energy: number;
  mood: number;
  fatigue: number;
  pain: number;
}

export function getReadinessScore(input: ReadinessInput) {
  const raw = (input.sleep + input.energy + input.mood + (6 - input.fatigue) + (6 - input.pain)) / 5;
  return Math.round(raw * 10) / 10;
}

export function getCoachMode(readiness: number): CoachMode {
  if (readiness >= 4) return "PUSH";
  if (readiness >= 2.8) return "NORMAL";
  return "HOLD";
}

function roundWeight(weight: number) {
  return Math.max(0, Math.round(weight / 1.25) * 1.25);
}

function progressionIncrement(weight: number) {
  if (weight >= 80) return 2.5;
  if (weight >= 40) return 1.25;
  return 1;
}

export function recommendNextWeight(input: {
  lastWeight: number;
  lastReps: number;
  targetMinReps: number;
  targetMaxReps: number;
  readiness: number;
}) {
  const { lastWeight, lastReps, targetMinReps, targetMaxReps, readiness } = input;
  if (!lastWeight || !lastReps) return null;

  if (readiness < 2.8) {
    return { weight: lastWeight, reps: Math.min(lastReps, targetMaxReps), action: "HOLD" as CoachMode };
  }

  if (lastReps >= targetMaxReps) {
    return { weight: roundWeight(lastWeight + progressionIncrement(lastWeight)), reps: targetMinReps, action: "PUSH" as CoachMode };
  }

  return { weight: lastWeight, reps: Math.min(targetMaxReps, lastReps + 1), action: "NORMAL" as CoachMode };
}

type HistoricalSet = {
  weight: number;
  reps: number;
  rir: number | null;
  created_at: string;
};

function sessionKey(createdAt: string) {
  return createdAt.slice(0, 10);
}

function summarizeHistory(rows: HistoricalSet[]) {
  const sessions = new Map<string, HistoricalSet[]>();
  for (const row of rows) {
    const key = sessionKey(row.created_at);
    const current = sessions.get(key) ?? [];
    current.push(row);
    sessions.set(key, current);
  }

  const ordered = [...sessions.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 4)
    .map(([date, sets]) => ({ date, sets }));

  const sessionSummaries = ordered.map(({ date, sets }) => ({
    date,
    bestWeight: Math.max(...sets.map((set) => set.weight)),
    bestRepsAtBestWeight: Math.max(...sets.filter((set) => set.weight === Math.max(...sets.map((item) => item.weight))).map((set) => set.reps)),
    averageRir: sets.filter((set) => set.rir !== null).length
      ? sets.reduce((sum, set) => sum + (set.rir ?? 0), 0) / sets.filter((set) => set.rir !== null).length
      : null,
  }));

  const rirValues = rows.filter((row) => row.rir !== null).map((row) => row.rir as number);
  const averageRir = rirValues.length ? rirValues.reduce((sum, value) => sum + value, 0) / rirValues.length : null;
  const latest = sessionSummaries[0];
  const previous = sessionSummaries[1];
  const trend = !latest || !previous
    ? "unknown" as const
    : latest.bestWeight > previous.bestWeight || (latest.bestWeight === previous.bestWeight && latest.bestRepsAtBestWeight > previous.bestRepsAtBestWeight)
      ? "up" as const
      : latest.bestWeight < previous.bestWeight || (latest.bestWeight === previous.bestWeight && latest.bestRepsAtBestWeight < previous.bestRepsAtBestWeight)
        ? "down" as const
        : "stable" as const;

  return { historySessions: ordered.length, latest, averageRir, trend };
}

export async function getExerciseRecommendation(input: {
  userId: string;
  exerciseId: string;
  targetMinReps: number;
  targetMaxReps: number;
  readiness: number;
}): Promise<ExerciseRecommendation> {
  const { data, error } = await supabase
    .from("workout_sets")
    .select("weight, reps, rir, created_at")
    .eq("user_id", input.userId)
    .eq("exercise_id", input.exerciseId)
    .not("weight", "is", null)
    .not("reps", "is", null)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) throw error;

  const rows = (data ?? []).map((row) => ({
    weight: Number(row.weight),
    reps: Number(row.reps),
    rir: row.rir === null || row.rir === undefined ? null : Number(row.rir),
    created_at: row.created_at,
  })) as HistoricalSet[];

  if (!rows.length) {
    return {
      exerciseId: input.exerciseId,
      recommendedWeight: null,
      recommendedReps: input.targetMinReps,
      confidence: "low",
      reason: "Pas encore assez d'historique. Commence avec une charge maîtrisée.",
      historySessions: 0,
      averageRir: null,
      trend: "unknown",
    };
  }

  const history = summarizeHistory(rows);
  const latest = history.latest;
  if (!latest) throw new Error("Historique d'exercice invalide.");

  const lowReadiness = input.readiness < 2.8;
  const veryHard = history.averageRir !== null && history.averageRir <= 1;
  const enoughMargin = history.averageRir === null || history.averageRir >= 2;
  const repeatedTopRange = history.historySessions >= 2 && latest.bestRepsAtBestWeight >= input.targetMaxReps;

  let weight = latest.bestWeight;
  let reps = Math.min(input.targetMaxReps, Math.max(input.targetMinReps, latest.bestRepsAtBestWeight));
  let action: CoachMode = "NORMAL";
  let reason = "On consolide la charge avec les données de tes dernières séances.";

  if (lowReadiness || veryHard) {
    action = "HOLD";
    reps = Math.min(input.targetMaxReps, Math.max(input.targetMinReps, latest.bestRepsAtBestWeight));
    reason = lowReadiness
      ? "Ta récupération est basse : Progress+ protège la prochaine séance."
      : "Tes dernières séries étaient très proches de l'échec : on évite de surcharger.\n";
  } else if (repeatedTopRange && enoughMargin) {
    action = "PUSH";
    weight = roundWeight(latest.bestWeight + progressionIncrement(latest.bestWeight));
    reps = input.targetMinReps;
    reason = history.trend === "up"
      ? "Deux séances solides et une tendance positive : on augmente progressivement."
      : "La fourchette haute est maîtrisée sur plusieurs séances : on augmente légèrement. ";
  } else if (latest.bestRepsAtBestWeight >= input.targetMinReps) {
    action = "NORMAL";
    reps = Math.min(input.targetMaxReps, latest.bestRepsAtBestWeight + 1);
  } else if (history.trend === "down") {
    action = "HOLD";
    weight = roundWeight(latest.bestWeight * 0.975);
    reps = input.targetMinReps;
    reason = "La performance baisse sur plusieurs séances : on réduit légèrement pour repartir proprement.";
  }

  const confidence = history.historySessions >= 3 && history.averageRir !== null ? "high" : history.historySessions >= 2 ? "medium" : "low";

  return {
    exerciseId: input.exerciseId,
    recommendedWeight: weight,
    recommendedReps: reps,
    confidence,
    reason: reason.trim(),
    historySessions: history.historySessions,
    averageRir: history.averageRir === null ? null : Math.round(history.averageRir * 10) / 10,
    trend: history.trend,
  };
}
