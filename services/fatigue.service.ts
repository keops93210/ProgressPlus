export type FatigueSignal = "low" | "normal" | "high" | "critical";

export type FatigueInput = {
  readiness?: number | null;
  averageRir?: number | null;
  hardSets?: number;
  consecutiveHardSets?: number;
  performanceTrend?: number | null;
};

export function getFatigueSignal(input: FatigueInput): FatigueSignal {
  const readiness = input.readiness ?? 3.5;
  const rir = input.averageRir ?? 2.5;
  const hardSets = input.hardSets ?? 0;
  const consecutive = input.consecutiveHardSets ?? 0;
  const trend = input.performanceTrend ?? 0;

  let score = 0;
  if (readiness <= 2) score += 3;
  else if (readiness < 3.5) score += 1;
  if (rir <= 1) score += 2;
  else if (rir <= 2) score += 1;
  if (hardSets >= 6) score += 2;
  else if (hardSets >= 4) score += 1;
  if (consecutive >= 3) score += 2;
  else if (consecutive >= 2) score += 1;
  if (trend <= -5) score += 2;
  else if (trend < -2) score += 1;

  if (score >= 7) return "critical";
  if (score >= 4) return "high";
  if (score <= 1) return "low";
  return "normal";
}

export function getFatigueAdvice(signal: FatigueSignal) {
  switch (signal) {
    case "critical": return { title: "Fatigue critique", message: "Évite la surcharge. Priorité à la technique, au repos et à la récupération." };
    case "high": return { title: "Fatigue élevée", message: "Consolide la charge et augmente le repos avant de chercher une nouvelle progression." };
    case "low": return { title: "Bonne fraîcheur", message: "Les conditions sont favorables à une progression si la technique reste propre." };
    default: return { title: "Fatigue normale", message: "Continue selon la cible Progress+ et ajuste avec ton RIR réel." };
  }
}
