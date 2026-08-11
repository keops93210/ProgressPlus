export type ProgressFeature = "smart_coach" | "advanced_analytics" | "body_photo_compare" | "adaptive_progression" | "recovery_insights" | "unlimited_history";

const premiumFeatures: Record<ProgressFeature, boolean> = {
  smart_coach: true,
  advanced_analytics: true,
  body_photo_compare: true,
  adaptive_progression: true,
  recovery_insights: true,
  unlimited_history: true,
};

export function isPremiumFeature(feature: ProgressFeature) { return premiumFeatures[feature]; }

export function canUseFeature(feature: ProgressFeature, isPremium: boolean) { return !isPremiumFeature(feature) || isPremium; }

export function getFeatureLabel(feature: ProgressFeature) {
  const labels: Record<ProgressFeature, string> = {
    smart_coach: "Coach Progress+",
    advanced_analytics: "Analyses avancées",
    body_photo_compare: "Comparaison des transformations",
    adaptive_progression: "Progression adaptative",
    recovery_insights: "Analyse récupération",
    unlimited_history: "Historique illimité",
  };
  return labels[feature];
}
