const WINDOW_SECONDS = 4;
export type KillStreak = { count: number; lastAt: number };

export function recentStreak(streak: KillStreak, elapsed: number) {
  return elapsed - streak.lastAt <= WINDOW_SECONDS ? streak.count : 0;
}

export function extendStreak(streak: KillStreak, elapsed: number): KillStreak {
  return { count: recentStreak(streak, elapsed) + 1, lastAt: elapsed };
}
