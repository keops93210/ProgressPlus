import type { AdaptiveCycleDecision, AdaptiveCycleInput } from './adaptive-cycle.types';

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function decideAdaptiveCycle(input: AdaptiveCycleInput): AdaptiveCycleDecision {
  const recovery = input.recoveryScore ?? 70;
  const fatigue = input.fatigueScore ?? 30;
  const rir = input.rirAverage ?? 2;
  const performance = input.performanceScore;

  if (
    input.consecutiveDownSessions >= 2 ||
    (fatigue >= 85 && recovery <= 45) ||
    input.missedReps >= 3
  ) {
    return {
      action: 'deload',
      loadMultiplier: 0.9,
      volumeMultiplier: 0.6,
      repAdjustment: 0,
      confidence: 0.94,
      reason: 'Fatigue accumulée ou baisse répétée des performances : semaine de deload recommandée.',
    };
  }

  if (recovery <= 45 || fatigue >= 80) {
    return {
      action: 'reduce',
      loadMultiplier: 0.95,
      volumeMultiplier: 0.8,
      repAdjustment: 0,
      confidence: 0.88,
      reason: 'Récupération insuffisante : réduction temporaire de la charge et du volume.',
    };
  }

  if (
    performance >= 85 &&
    rir >= 2 &&
    rir <= 4 &&
    recovery >= 70 &&
    fatigue <= 60 &&
    input.consecutiveGoodSessions >= 2
  ) {
    return {
      action: 'push',
      loadMultiplier: 1.025,
      volumeMultiplier: 1.05,
      repAdjustment: 0,
      confidence: 0.9,
      reason: 'Performances solides et récupération favorable : progression progressive.',
    };
  }

  if (performance >= 72 && rir >= 1 && rir <= 4) {
    return {
      action: 'progress',
      loadMultiplier: 1.01,
      volumeMultiplier: 1,
      repAdjustment: 1,
      confidence: 0.78,
      reason: 'Progression maîtrisée : une répétition supplémentaire avant d’augmenter fortement la charge.',
    };
  }

  if (performance < 55 || rir < 1) {
    return {
      action: 'reduce',
      loadMultiplier: clamp(0.97 - (55 - performance) / 500, 0.9, 0.97),
      volumeMultiplier: 0.9,
      repAdjustment: -1,
      confidence: 0.82,
      reason: 'La séance est trop proche de l’échec ou la performance baisse : consolidation nécessaire.',
    };
  }

  return {
    action: 'hold',
    loadMultiplier: 1,
    volumeMultiplier: 1,
    repAdjustment: 0,
    confidence: 0.7,
    reason: 'Signaux mixtes : maintien de la prescription pour confirmer la tendance.',
  };
}
