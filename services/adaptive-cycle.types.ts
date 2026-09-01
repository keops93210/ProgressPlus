export type AdaptiveAction =
  | 'push'
  | 'progress'
  | 'hold'
  | 'reduce'
  | 'deload'
  | 'resume';

export type AdaptiveCycleInput = {
  performanceScore: number;
  rirAverage: number | null;
  recoveryScore: number | null;
  fatigueScore: number | null;
  missedReps: number;
  sessionsCompleted: number;
  consecutiveDownSessions: number;
  consecutiveGoodSessions: number;
};

export type AdaptiveCycleDecision = {
  action: AdaptiveAction;
  loadMultiplier: number;
  volumeMultiplier: number;
  repAdjustment: number;
  confidence: number;
  reason: string;
};
