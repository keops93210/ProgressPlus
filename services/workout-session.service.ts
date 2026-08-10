import { supabase } from "@/lib/supabase";

export async function startWorkoutSession(userId: string | null, programId: string) {
  if (!userId) throw new Error("Utilisateur non connecté.");
  const { data: activeSession, error: activeError } = await supabase.from("workout_sessions").select("*").eq("user_id", userId).eq("program_id", programId).is("finished_at", null).order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (activeError) throw activeError;
  if (activeSession) return activeSession;
  const { data, error } = await supabase.from("workout_sessions").insert({ user_id: userId, program_id: programId }).select().single();
  if (error) throw error;
  return data;
}

export async function finishWorkoutSession(sessionId: string, duration: number, volume: number, totalSets: number) {
  const { error } = await supabase.from("workout_sessions").update({ finished_at: new Date().toISOString(), duration_seconds: duration, total_volume: volume, total_sets: totalSets }).eq("id", sessionId).is("finished_at", null);
  if (error) throw error;
}

export async function saveWorkoutSet(sessionId: string, exerciseId: string, setNumber: number, weight: number, reps: number) {
  if (weight <= 0 || reps <= 0 || setNumber <= 0) throw new Error("Les valeurs de la série sont invalides.");
  const { data: existingSet, error: existingError } = await supabase.from("workout_sets").select("id, weight, reps").eq("session_id", sessionId).eq("exercise_id", exerciseId).eq("set_number", setNumber).maybeSingle();
  if (existingError) throw existingError;
  const isNew = !existingSet;
  const previousWeight = existingSet ? Number(existingSet.weight) || 0 : 0;
  const previousReps = existingSet ? Number(existingSet.reps) || 0 : 0;
  const payload = { weight, reps, completed: true };
  const query = existingSet
    ? supabase.from("workout_sets").update(payload).eq("id", existingSet.id).select().single()
    : supabase.from("workout_sets").insert({ session_id: sessionId, exercise_id: exerciseId, set_number: setNumber, ...payload }).select().single();
  const { data, error } = await query;
  if (error) throw error;
  const isPersonalRecord = await updatePersonalRecord(sessionId, exerciseId, weight, reps);
  return { ...data, isNew, previousWeight, previousReps, isPersonalRecord };
}

async function updatePersonalRecord(sessionId: string, exerciseId: string, weight: number, reps: number) {
  const { data: session, error: sessionError } = await supabase.from("workout_sessions").select("user_id").eq("id", sessionId).single();
  if (sessionError) throw sessionError;
  const estimated1rm = weight * (1 + reps / 30);
  const { data: current, error: currentError } = await supabase.from("personal_records").select("weight, reps, estimated_1rm").eq("user_id", session.user_id).eq("exercise_id", exerciseId).maybeSingle();
  if (currentError) throw currentError;
  if (current && estimated1rm <= Number(current.estimated_1rm ?? 0)) return false;
  const { error } = await supabase.from("personal_records").upsert({ user_id: session.user_id, exercise_id: exerciseId, weight, reps, estimated_1rm: Number(estimated1rm.toFixed(2)) }, { onConflict: "user_id,exercise_id" });
  if (error) throw error;
  return true;
}

export async function getWorkoutSession(sessionId: string) {
  const { data, error } = await supabase.from("workout_sessions").select(`*, workout_sets (*)`).eq("id", sessionId).single();
  if (error) throw error;
  return data;
}

export async function getWorkoutExercises(programId: string) {
  const { data, error } = await supabase.from("program_exercises").select(`*, exercises (*)`).eq("program_id", programId).order("position");
  if (error) throw error;
  return data;
}

export async function getLastPerformance(userId: string | null, exerciseId: string): Promise<{ weight: number; reps: number } | null> {
  if (!userId) throw new Error("Utilisateur non connecté.");
  const { data, error } = await supabase.from("workout_sets").select(`weight, reps, created_at, workout_sessions!inner (user_id, finished_at)`).eq("exercise_id", exerciseId).eq("workout_sessions.user_id", userId).not("workout_sessions.finished_at", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { weight: Number(data.weight) || 0, reps: Number(data.reps) || 0 };
}

export interface ProgressionRecommendation { action: "increase_weight" | "keep_weight" | "increase_reps" | "start"; currentWeight: number; recommendedWeight: number; currentReps: number; recommendedReps: number; minReps: number; maxReps: number; completedSets: number; message: string; trend?: "up" | "stable" | "down"; trendPercent?: number; readinessScore?: number | null; }
type ProgressionSet = { weight: number; reps: number; set_number: number };
type SessionSummary = { averageReps: number; averageVolume: number; weight: number; estimated1rm: number; completedSets: number };

async function getRecentExerciseSessions(userId: string, exerciseId: string, limit = 3): Promise<SessionSummary[]> {
  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sets")
    .select("session_id, weight, reps, created_at, workout_sessions!inner(user_id, finished_at)")
    .eq("exercise_id", exerciseId)
    .eq("workout_sessions.user_id", userId)
    .not("workout_sessions.finished_at", "is", null)
    .order("created_at", { ascending: false });
  if (sessionsError) throw sessionsError;

  const grouped = new Map<string, ProgressionSet[]>();
  for (const row of sessions ?? []) {
    const sessionId = String(row.session_id);
    const existing = grouped.get(sessionId);
    if (!existing && grouped.size >= limit) continue;
    const list = existing ?? [];
    list.push({ weight: Number(row.weight) || 0, reps: Number(row.reps) || 0, set_number: list.length + 1 });
    grouped.set(sessionId, list);
  }

  return Array.from(grouped.values()).map((sets) => {
    const averageReps = sets.reduce((sum, set) => sum + set.reps, 0) / Math.max(1, sets.length);
    const averageVolume = sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
    const weight = sets[0]?.weight ?? 0;
    const estimated1rm = Math.max(...sets.map((set) => set.weight * (1 + set.reps / 30)), 0);
    return { averageReps, averageVolume, weight, estimated1rm, completedSets: sets.length };
  });
}

async function getCurrentReadiness(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("recovery_score")
    .eq("user_id", userId)
    .is("finished_at", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (data?.recovery_score === null || data?.recovery_score === undefined) return null;
  return Number(data.recovery_score);
}

function readinessMessage(score: number | null) {
  if (score === null) return "";
  if (score <= 2) return " Récupération faible : on évite la surcharge aujourd'hui.";
  if (score <= 3.2) return " Récupération moyenne : priorité à une progression propre, sans forcer.";
  if (score >= 4.2) return " Très bonne récupération : si la technique reste solide, on peut pousser la progression.";
  return " Récupération correcte : on progresse sans forcer.";
}

export async function getProgressionRecommendation(userId: string | null, exerciseId: string, minReps: number, maxReps: number, plannedSets: number): Promise<ProgressionRecommendation> {
  if (!userId) throw new Error("Utilisateur non connecté.");
  const readinessScore = await getCurrentReadiness(userId);
  const { data: latestSet, error: latestSetError } = await supabase.from("workout_sets").select("session_id, workout_sessions!inner(id, user_id, finished_at)").eq("exercise_id", exerciseId).eq("workout_sessions.user_id", userId).not("workout_sessions.finished_at", "is", null).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (latestSetError) throw latestSetError;
  if (!latestSet) return { action: "start", currentWeight: 0, recommendedWeight: 0, currentReps: minReps, recommendedReps: minReps, minReps, maxReps, completedSets: 0, message: `Commence à ${minReps}–${maxReps} répétitions et trouve ton poids de travail.${readinessMessage(readinessScore)}`, readinessScore };

  const { data: rawSets, error: setsError } = await supabase.from("workout_sets").select("weight, reps, set_number").eq("session_id", latestSet.session_id).eq("exercise_id", exerciseId).eq("completed", true).order("set_number", { ascending: true });
  if (setsError) throw setsError;
  const sets: ProgressionSet[] = (rawSets ?? []).map((set) => ({ weight: Number(set.weight) || 0, reps: Number(set.reps) || 0, set_number: Number(set.set_number) || 0 }));
  if (!sets.length) return { action: "start", currentWeight: 0, recommendedWeight: 0, currentReps: minReps, recommendedReps: minReps, minReps, maxReps, completedSets: 0, message: `Commence à ${minReps}–${maxReps} répétitions et trouve ton poids de travail.${readinessMessage(readinessScore)}`, readinessScore };

  const currentWeight = sets[0].weight;
  const averageReps = sets.reduce((sum, set) => sum + set.reps, 0) / sets.length;
  const weakestReps = Math.min(...sets.map((set) => set.reps));
  const topSetCount = sets.filter((set) => set.reps >= maxReps).length;
  const topSetRatio = topSetCount / sets.length;
  const consistency = Math.max(0, 1 - (Math.max(...sets.map((set) => set.reps)) - weakestReps) / Math.max(1, maxReps));
  const allAtTop = sets.length >= plannedSets && topSetCount === sets.length;
  const recentSessions = await getRecentExerciseSessions(userId, exerciseId, 3);
  const latestSummary = recentSessions[0];
  const previousSummary = recentSessions[1];
  const trendPercent = previousSummary && previousSummary.estimated1rm > 0
    ? Math.round(((latestSummary.estimated1rm - previousSummary.estimated1rm) / previousSummary.estimated1rm) * 100)
    : 0;
  const trend: "up" | "stable" | "down" = trendPercent >= 3 ? "up" : trendPercent <= -3 ? "down" : "stable";
  const trendSuffix = trend === "up" ? ` Ta force estimée monte de ${Math.abs(trendPercent)}%.` : trend === "down" ? ` Ta force estimée baisse de ${Math.abs(trendPercent)}% : on consolide plutôt que de forcer.` : " Ta force estimée est stable : on cherche une petite progression propre.";
  const recoverySuffix = readinessMessage(readinessScore);
  const lowReadiness = readinessScore !== null && readinessScore <= 2;
  const conservativeMode = lowReadiness || trend === "down";

  if (allAtTop && currentWeight > 0 && trend !== "down" && !lowReadiness) {
    const recommendedWeight = currentWeight + 2.5;
    return { action: "increase_weight", currentWeight, recommendedWeight, currentReps: Math.round(averageReps), recommendedReps: minReps, minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `Toutes tes séries sont à ${maxReps} reps. Tu es prêt pour ${recommendedWeight} kg.${trendSuffix}${recoverySuffix}` };
  }

  if (currentWeight > 0 && weakestReps < minReps) {
    return { action: "keep_weight", currentWeight, recommendedWeight: currentWeight, currentReps: Math.round(averageReps), recommendedReps: minReps, minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `La série la plus faible est sous ${minReps} reps. Garde ${currentWeight} kg jusqu'à stabiliser toutes tes séries.${trendSuffix}${recoverySuffix}` };
  }

  if (conservativeMode && currentWeight > 0) {
    const recommendedReps = Math.min(maxReps, Math.max(minReps, Math.round(averageReps)));
    const reason = lowReadiness && trend === "down"
      ? "Ta récupération est basse et ta tendance récente est en baisse."
      : lowReadiness
        ? "Ta récupération est basse aujourd'hui."
        : "Ta tendance récente est en baisse.";
    return { action: "keep_weight", currentWeight, recommendedWeight: currentWeight, currentReps: Math.round(averageReps), recommendedReps, minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `${reason} On garde ${currentWeight} kg et on consolide ${recommendedReps} reps avant toute surcharge.${trendSuffix}${recoverySuffix}` };
  }

  if (currentWeight > 0 && topSetRatio >= 0.75 && consistency >= 0.75) {
    const recommendedReps = Math.min(maxReps, Math.round(averageReps) + 1);
    return { action: recommendedReps >= maxReps ? "keep_weight" : "increase_reps", currentWeight, recommendedWeight: currentWeight, currentReps: Math.round(averageReps), recommendedReps, minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `Très bonne maîtrise à ${currentWeight} kg. Vise ${recommendedReps} reps avec une exécution propre.${trendSuffix}${recoverySuffix}` };
  }

  if (averageReps >= minReps && currentWeight > 0) {
    const recommendedReps = Math.min(maxReps, Math.max(minReps, Math.round(averageReps) + 1));
    return { action: "increase_reps", currentWeight, recommendedWeight: currentWeight, currentReps: Math.round(averageReps), recommendedReps, minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `Garde ${currentWeight} kg. Cherche ${recommendedReps} reps sans sacrifier l'amplitude ni la technique.${trendSuffix}${recoverySuffix}` };
  }

  return { action: "keep_weight", currentWeight, recommendedWeight: currentWeight, currentReps: Math.round(averageReps), recommendedReps: Math.max(minReps, Math.round(averageReps)), minReps, maxReps, completedSets: sets.length, trend, trendPercent, readinessScore, message: `Garde ${currentWeight} kg et consolide ta technique dans la zone ${minReps}–${maxReps} reps.${trendSuffix}${recoverySuffix}` };
}

export interface PersonalRecordItem { id: string; exercise_id: string; weight: number; reps: number; estimated_1rm: number | null; created_at: string | null; exercises: { name: string } | null; }
export async function getPersonalRecords(userId: string, limit = 10): Promise<PersonalRecordItem[]> {
  const { data, error } = await supabase.from("personal_records").select(`id, exercise_id, weight, reps, estimated_1rm, created_at, exercises (name)`).eq("user_id", userId).order("estimated_1rm", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as PersonalRecordItem[];
}

export interface WorkoutHistoryItem { id: string; program_id: string; started_at: string; finished_at: string | null; duration_seconds: number | null; total_volume: number | null; total_sets: number | null; workout_programs: { name: string } | null; }
export async function getWorkoutHistory(userId: string, limit = 20): Promise<WorkoutHistoryItem[]> {
  const { data, error } = await supabase.from("workout_sessions").select(`id, program_id, started_at, finished_at, duration_seconds, total_volume, total_sets, workout_programs (name)`).eq("user_id", userId).not("finished_at", "is", null).order("finished_at", { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as WorkoutHistoryItem[];
}