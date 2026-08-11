export type WorkoutEntry = { date: string; completed: boolean };

function weekKey(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export function getWeeklyConsistency(entries: WorkoutEntry[], targetPerWeek = 4) {
  const counts = new Map<string, number>();
  for (const entry of entries) if (entry.completed) counts.set(weekKey(new Date(entry.date)), (counts.get(weekKey(new Date(entry.date))) ?? 0) + 1);
  const weeks = [...counts.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  if (!weeks.length) return { currentWeek: 0, targetPerWeek, completion: 0, successfulWeeks: 0 };
  const currentWeek = weeks[0][1];
  const successfulWeeks = weeks.filter(([, count]) => count >= targetPerWeek).length;
  return { currentWeek, targetPerWeek, completion: Math.min(1, currentWeek / targetPerWeek), successfulWeeks };
}
