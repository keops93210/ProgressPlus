import { supabase } from "@/lib/supabase";

export type ReadinessValue = 1 | 2 | 3 | 4 | 5;

export interface WorkoutCheckin {
  id: string;
  user_id: string;
  session_id: string | null;
  sleep_score: ReadinessValue;
  energy_score: ReadinessValue;
  mood_score: ReadinessValue;
  fatigue_score: ReadinessValue;
  pain_score: ReadinessValue;
  recovery_score: number;
  created_at: string;
}

export type CoachingMode = "push" | "normal" | "recover";

export interface ReadinessResult {
  score: number;
  mode: CoachingMode;
  title: string;
  message: string;
}

export function calculateReadiness(input: {
  sleep: number;
  energy: number;
  mood: number;
  fatigue: number;
  pain: number;
}): ReadinessResult {
  const score = Math.round(
    (input.sleep + input.energy + input.mood + (6 - input.fatigue) + (6 - input.pain)) / 5
  );

  if (score >= 4 && input.pain <= 2) {
    return {
      score,
      mode: "push",
      title: "Tu es en forme 🟢",
      message: "Tes indicateurs sont bons. Progress+ peut te proposer une progression si tes séries sont solides.",
    };
  }

  if (score <= 2 || input.pain >= 4) {
    return {
      score,
      mode: "recover",
      title: "On adapte aujourd'hui 🟠",
      message: "Ta récupération est faible. Garde une charge confortable et évite de chercher un record aujourd'hui.",
    };
  }

  return {
    score,
    mode: "normal",
    title: "Séance normale 🟡",
    message: "Tes indicateurs sont corrects. Suis ta progression habituelle et écoute tes sensations.",
  };
}

export async function saveWorkoutCheckin(
  userId: string,
  sessionId: string | null,
  input: {
    sleep: ReadinessValue;
    energy: ReadinessValue;
    mood: ReadinessValue;
    fatigue: ReadinessValue;
    pain: ReadinessValue;
  }
) {
  const readiness = calculateReadiness(input);

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
      recovery_score: readiness.score,
    })
    .select()
    .single();

  if (error) throw error;
  return { checkin: data as WorkoutCheckin, readiness };
}

export async function getLatestWorkoutCheckin(userId: string) {
  const { data, error } = await supabase
    .from("workout_checkins")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as WorkoutCheckin | null;
}
