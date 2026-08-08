import { supabase } from "@/lib/supabase";

export type RecoveryValue = 1 | 2 | 3 | 4 | 5;

export interface RecoveryCheckinInput {
  sleep: RecoveryValue;
  energy: RecoveryValue;
  mood: RecoveryValue;
  fatigue: RecoveryValue;
  pain: RecoveryValue;
}

export interface RecoveryCheckin extends RecoveryCheckinInput {
  id: string;
  user_id: string;
  session_id: string | null;
  recovery_score: number;
  created_at: string;
}

export function calculateRecoveryScore(input: RecoveryCheckinInput) {
  // Every selector is already oriented so that 5 = best condition.
  return Number(
    ((input.sleep + input.energy + input.mood + input.fatigue + input.pain) / 5).toFixed(2)
  );
}

export function getRecoveryAdvice(score: number) {
  if (score <= 2) {
    return {
      level: "low" as const,
      title: "Récupération faible",
      message: "On privilégie la qualité. Garde une charge maîtrisée et évite de chercher un record aujourd'hui.",
    };
  }

  if (score <= 3.2) {
    return {
      level: "moderate" as const,
      title: "Récupération moyenne",
      message: "Séance normale, mais reste attentif à tes sensations et ne force pas si la technique se dégrade.",
    };
  }

  if (score <= 4.2) {
    return {
      level: "good" as const,
      title: "Bonne récupération",
      message: "Tu peux suivre la progression prévue si tes séries restent propres.",
    };
  }

  return {
    level: "excellent" as const,
    title: "Très bonne récupération",
    message: "Tu es dans de bonnes conditions. Si tes séries sont solides, Progress+ peut pousser la progression.",
  };
}

export async function saveRecoveryCheckin(
  userId: string,
  sessionId: string,
  input: RecoveryCheckinInput
) {
  const recoveryScore = calculateRecoveryScore(input);

  const { data, error } = await supabase
    .from("workout_checkins")
    .insert({
      user_id: userId,
      session_id: sessionId,
      sleep_score: input.sleep,
      energy_score: input.energy,
      mood_score: input.mood,
      fatigue_score: input.fatigue,
      pain_score: input.pain,
      recovery_score: recoveryScore,
    })
    .select()
    .single();

  if (error) throw error;

  const { error: sessionError } = await supabase
    .from("workout_sessions")
    .update({
      recovery_score: recoveryScore,
      sleep_score: input.sleep,
      energy_score: input.energy,
      mood_score: input.mood,
      fatigue_score: input.fatigue,
      pain_score: input.pain,
    })
    .eq("id", sessionId);

  if (sessionError) throw sessionError;

  return data as RecoveryCheckin;
}

export async function getLatestRecoveryCheckin(userId: string) {
  const { data, error } = await supabase
    .from("workout_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as RecoveryCheckin | null;
}
