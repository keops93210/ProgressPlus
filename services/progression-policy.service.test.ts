import { calculateNextPrescription } from './progression-policy.service';

describe('calculateNextPrescription', () => {
  it('adds reps before adding load', () => {
    const result = calculateNextPrescription({
      minReps: 8, maxReps: 12, targetReps: 10, completedReps: 10,
      currentLoad: 80, rir: 2, readiness: 80, trend: 'up',
    });
    expect(result.action).toBe('add_reps');
    expect(result.nextLoad).toBe(80);
    expect(result.nextTargetReps).toBe(11);
  });

  it('adds load after reaching the rep ceiling', () => {
    const result = calculateNextPrescription({
      minReps: 8, maxReps: 12, targetReps: 12, completedReps: 12,
      currentLoad: 80, rir: 3, readiness: 85, trend: 'up',
    });
    expect(result.action).toBe('add_load');
    expect(result.nextLoad).toBe(82.5);
    expect(result.nextTargetReps).toBe(8);
  });

  it('reduces load when readiness is low', () => {
    const result = calculateNextPrescription({
      minReps: 8, maxReps: 12, targetReps: 10, completedReps: 9,
      currentLoad: 80, rir: 2, readiness: 35, trend: 'flat',
    });
    expect(result.action).toBe('reduce_load');
    expect(result.nextLoad).toBe(77.5);
  });

  it('holds when signals are mixed', () => {
    const result = calculateNextPrescription({
      minReps: 8, maxReps: 12, targetReps: 10, completedReps: 10,
      currentLoad: 50, rir: 1, readiness: 60, trend: 'flat',
    });
    expect(result.action).toBe('hold');
  });
});
