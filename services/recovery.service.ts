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
  sleep_score?: RecoveryValue;
  energy_score?: RecoveryValue;
  mood_score?: RecoveryValue;
  fatigue_score?: RecoveryValue;
  pain_score?: RecoveryValue;
}

export type RecoveryLevel = "low" | "moderate" | "good" | "excellent";

export type RecoveryAdvice = {
  level: RecoveryLevel;
  title: string;
  message: string;
  targetRir: number;
  allowLoadIncrease: boolean;
  maxLoadIncreasePercent: number;
  restMultiplier: number;
};

export function calculateRecoveryScore(input: RecoveryCheckinInput) {
  return Number(((input.sleep + input.energy + input.mood + input.fatigue + input.pain) / 5).toFixed(2));
}

/**
 * Turns the check-in into actionable training constraints.
 * Recovery sets the starting guardrails; live set quality can still make
 * the engine more conservative during the workout.
 */
export function getRecoveryAdvice(score: number): RecoveryAdvice {
  const normalized = Math.min(5, Math.max(1, score));

  if (normalized <= 2) {
    return {
      level: "low",
      title: "Récupération faible",
      message: "Aujourd'hui, priorité à la qualité. Garde une charge maîtrisée et évite de chercher un record.",
      targetRir: 3,
      allowLoadIncrease: false,
      maxLoadIncreasePercent: 0,
      restMultiplier: 1.15,
    };
  }

  if (normalized <= 3.2) {
    return {
      level: "moderate",
      title: "Récupération moyenne",
      message: "Séance normale, mais reste attentif à tes sensations et ne force pas si la technique se dégrade.",
      targetRir: 2.5,
      allowLoadIncrease: false,
      maxLoadIncreasePercent: 0,
      restMultiplier: 1.05,
    };
  }

  if (normalized <= 4.2) {
    return {
      level: "good",
      title: "Bonne récupération",
      message: "Tu peux suivre la progression prévue si tes séries restent propres.",
      targetRir: 2,
      allowLoadIncrease: true,
      maxLoadIncreasePercent: 2.5,
      restMultiplier: 1,
    };
  }

  return {
    level: "excellent",
    title: "Très bonne récupération",
    message: "Tu es dans de bonnes conditions. Si tes séries sont solides, Progress+ peut pousser la progression.",
    targetRir: 1.5,
    allowLoadIncrease: true,
    maxLoadIncreasePercent: 5,
    restMultiplier: 0.95,
  };
}

export async function saveRecoveryCheckin(userId: string, sessionId: string, input: RecoveryCheckinInput) {
  const recoveryScore = calculateRecoveryScore(input);
  const { data, error } = await supabase.from("workout_checkins").insert({
    user_id: userId,
    session_id: sessionId,
    sleep_score: input.sleep,
    energy_score: input.energy,
    mood_score: input.mood,
    fatigue_score: input.fatigue,
    pain_score: input.pain,
  }).select().single();
  if (error) throw error;

  const { error: sessionError } = await supabase.from("workout_sessions").update({
    recovery_score: recoveryScore,
    sleep_score: input.sleep,
    energy_score: input.energy,
    mood_score: input.mood,
    fatigue_score: input.fatigue,
    pain_score: input.pain,
  }).eq("id", sessionId);
  if (sessionError) throw sessionError;
  return data as RecoveryCheckin;
}

export async function getLatestRecoveryCheckin(userId: string) {
  const { data, error } = await supabase.from("workout_checkins").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data as RecoveryCheckin | null;
}
