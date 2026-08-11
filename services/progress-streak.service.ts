export type StreakEntry = { date: string; completed: boolean };

export function getConsistencyStreak(entries: StreakEntry[]) {
  const days = new Set(entries.filter((e) => e.completed).map((e) => e.date.slice(0, 10)));
  const sorted = [...days].sort().reverse();
  if (!sorted.length) return { current: 0, best: 0 };
  let current = 1;
  const today = new Date();
  const latest = new Date(sorted[0]);
  const gap = Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(latest.getFullYear(), latest.getMonth(), latest.getDate())) / 86400000);
  if (gap > 1) current = 0;
  else for (let i = 1; i < sorted.length; i++) { const a = new Date(sorted[i - 1]); const b = new Date(sorted[i]); const diff = Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000); if (diff === 1) current++; else break; }
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) { const a = new Date(sorted[i - 1]); const b = new Date(sorted[i]); const diff = Math.round((Date.UTC(a.getFullYear(), a.getMonth(), a.getDate()) - Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())) / 86400000); run = diff === 1 ? run + 1 : 1; best = Math.max(best, run); }
  return { current, best };
}
