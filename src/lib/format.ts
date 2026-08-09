export function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function totalDurationSeconds(stages: { duration: number }[]): number {
  return stages.reduce((sum, s) => sum + s.duration * 60, 0);
}
