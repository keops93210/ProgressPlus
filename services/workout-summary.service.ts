import { supabase } from "@/lib/supabase";
import { getWorkoutQualityScore } from "@/services/workout-effort.service";

export type WorkoutSummary = {
  durationSeconds: number;
  volume: number;
  totalSets: number;
  plannedSets: number;
  previousVolume: number | null;
  volumeChangePercent: number | null;
  previousDurationSeconds: number | null;
  personalRecords: number;
  bestExercise: { name: string; weight: number; reps: number; estimated1rm: number } | null;
  averageRir: number | null;
  hardSets: number;
  failureSets: number;
  qualityScore: number;
  completionPercent: number;
  recoveryScore: number | null;
  message: string;
  nextSessionAdvice: string;
};

export async function getWorkoutSummary(sessionId: string): Promise<WorkoutSummary> {
  const { data: session, error: sessionError } = await supabase
    .from("workout_sessions")
    .select("id, user_id, program_id, started_at, recovery_score, duration_seconds, total_volume, total_sets, finished_at")
    .eq("id", sessionId)
    .single();
  if (sessionError) throw sessionError;

  const { data: sets, error: setsError } = await supabase
    .from("workout_sets")
    .select("exercise_id, weight, reps, rir, set_number, exercises(name)")
    .eq("session_id", sessionId)
    .eq("completed", true)
    .order("exercise_id")
    .order("set_number");
  if (setsError) throw setsError;

  let plannedSets = Number(session.total_sets ?? 0);
  if (session.program_id) {
    const { data: plannedExercises, error: plannedError } = await supabase.from("program_exercises").select("sets").eq("program_id", session.program_id);
    if (plannedError) throw plannedError;
    plannedSets = (plannedExercises ?? []).reduce((sum, row) => sum + Math.max(0, Number(row.sets) || 0), 0);
  }

  const currentVolume = Number(session.total_volume ?? 0);
  const currentDuration = Math.max(0, Number(session.duration_seconds ?? 0));
  const currentSets = Number(session.total_sets ?? sets?.length ?? 0);
  const targetSets = Math.max(currentSets, plannedSets);
  const completionPercent = targetSets > 0 ? Math.min(100, Math.round((currentSets / targetSets) * 100)) : 0;
  const rirValues = (sets ?? []).map((row) => Number(row.rir)).filter((value) => Number.isFinite(value));
  const averageRir = rirValues.length ? Number((rirValues.reduce((sum, value) => sum + value, 0) / rirValues.length).toFixed(1)) : null;
  const hardSets = rirValues.filter((value) => value <= 1).length;
  const failureSets = rirValues.filter((value) => value <= 0).length;

  let previousQuery = supabase
    .from("workout_sessions")
    .select("id, total_volume, duration_seconds, finished_at")
    .eq("user_id", session.user_id)
    .not("finished_at", "is", null)
    .lt("finished_at", session.finished_at ?? new Date().toISOString())
    .order("finished_at", { ascending: false })
    .limit(1);

  if (session.program_id) previousQuery = previousQuery.eq("program_id", session.program_id);

  const { data: previousSessions, error: previousError } = await previousQuery;
  if (previousError) throw previousError;
  const previous = previousSessions?.[0] ?? null;
  const previousVolume = previous ? Number(previous.total_volume ?? 0) : null;
  const volumeChangePercent = previousVolume && previousVolume > 0 ? Math.round(((currentVolume - previousVolume) / previousVolume) * 100) : null;

  const grouped = new Map<string, { name: string; weight: number; reps: number }>();
  for (const row of sets ?? []) {
    const exercise = Array.isArray(row.exercises) ? row.exercises[0] : row.exercises;
    const name = exercise?.name ?? "Exercice";
    const estimated1rm = Number(row.weight) * (1 + Number(row.reps) / 30);
    const current = grouped.get(row.exercise_id);
    if (!current || estimated1rm > current.weight * (1 + current.reps / 30)) grouped.set(row.exercise_id, { name, weight: Number(row.weight), reps: Number(row.reps) });
  }

  const best = Array.from(grouped.values()).sort((a, b) => (b.weight * (1 + b.reps / 30)) - (a.weight * (1 + a.reps / 30)))[0] ?? null;
  const bestExercise = best ? { ...best, estimated1rm: Number((best.weight * (1 + best.reps / 30)).toFixed(1)) } : null;

  const personalRecordExercises = new Set<string>();
  for (const row of sets ?? []) {
    const estimated1rm = Number(row.weight) * (1 + Number(row.reps) / 30);
    let query = supabase
      .from("personal_records")
      .select("exercise_id, estimated_1rm, created_at")
      .eq("user_id", session.user_id)
      .eq("exercise_id", row.exercise_id)
      .order("created_at", { ascending: false })
      .limit(1);
    if (session.started_at) query = query.lt("created_at", session.started_at);
    const { data: records } = await query;
    const record = records?.[0];
    if (!record || estimated1rm > Number(record.estimated_1rm ?? 0)) personalRecordExercises.add(row.exercise_id);
  }

  const prCount = personalRecordExercises.size;
  const qualityScore = getWorkoutQualityScore({ completedSets: currentSets, plannedSets: targetSets, averageRir: averageRir ?? 2.5, personalRecords: prCount });

  let message = "Séance enregistrée. Le Coach va utiliser ces données pour ajuster ta prochaine séance.";
  if (completionPercent < 100) message = `Séance terminée à ${completionPercent}% : le Coach va privilégier la consolidation avant une surcharge.`;
  else if (prCount > 0) message = `${prCount} record${prCount > 1 ? "s" : ""} personnel${prCount > 1 ? "s" : ""} détecté${prCount > 1 ? "s" : ""}. Ta performance progresse.`;
  else if (hardSets >= 3) message = `Bonne intensité, mais ${hardSets} séries très difficiles : Progress+ va privilégier la récupération avant une nouvelle surcharge.`;
  else if (volumeChangePercent !== null && volumeChangePercent > 0) message = `Tu as augmenté ton volume de ${volumeChangePercent}% par rapport à ta dernière séance.`;
  else if (volumeChangePercent !== null && volumeChangePercent < 0) message = `Ton volume est ${Math.abs(volumeChangePercent)}% plus bas que la dernière séance : la qualité et la récupération restent prioritaires.`;

  let nextSessionAdvice = "Repars de cette performance comme référence et laisse le Coach ajuster ta progression série par série.";
  if (completionPercent < 100) nextSessionAdvice = "Complète d'abord les séries prévues avec une exécution propre avant de chercher une surcharge.";
  else if (failureSets >= 2) nextSessionAdvice = "Deux séries ou plus ont atteint l'échec : récupère avant de chercher une surcharge à la prochaine séance.";
  else if (hardSets >= 3) nextSessionAdvice = "Plusieurs séries étaient très exigeantes : consolide les charges avant d'augmenter.";
  else if (volumeChangePercent !== null && volumeChangePercent >= 5) nextSessionAdvice = "Le volume progresse bien. Confirme la technique et la récupération avant toute nouvelle surcharge.";
  else if (volumeChangePercent !== null && volumeChangePercent <= -5) nextSessionAdvice = "Conserve les charges maîtrisées et cherche d'abord à retrouver ton niveau de performance.";
  if (prCount > 0 && completionPercent === 100) nextSessionAdvice = "Tes records deviennent la nouvelle référence. Le Coach cherchera d'abord à les consolider.";

  return { durationSeconds: currentDuration, volume: currentVolume, totalSets: currentSets, plannedSets: targetSets, previousVolume, volumeChangePercent, previousDurationSeconds: previous ? Number(previous.duration_seconds ?? 0) : null, personalRecords: prCount, bestExercise, averageRir, hardSets, failureSets, qualityScore, completionPercent, recoveryScore: session.recovery_score == null ? null : Number(session.recovery_score), message, nextSessionAdvice };
}
