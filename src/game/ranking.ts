import type { MapId } from './maps';
import type { Difficulty } from './progression';

const KEY = 'sb_local_ranking_v1';
const TOP_COUNT = 25;

export type RankedRun = {
  heroId: string;
  victory: boolean;
  zone: number;
  kills: number;
  elapsed: number;
  level: number;
  totalDamage: number;
};
type Entry = RankedRun & { finishedAt: number };
export type LocalRank = { position: number; top: Entry[] };

function compare(a: Entry, b: Entry) {
  return Number(b.victory) - Number(a.victory) || b.zone - a.zone || b.kills - a.kills
    || (a.victory ? a.elapsed - b.elapsed : b.elapsed - a.elapsed) || b.totalDamage - a.totalDamage;
}

export function recordLocalRun(map: MapId, mission: Difficulty, run: RankedRun): LocalRank {
  const key = `${map}:${mission}`;
  let board: Record<string, Entry[]> = {};
  try { board = JSON.parse(localStorage.getItem(KEY) || '{}') ?? {}; } catch { /* Primeiro registro. */ }
  const entry = { ...run, finishedAt: Date.now() };
  const previous = Array.isArray(board[key]) ? board[key] : [];
  const sorted = [...previous, entry].sort(compare);
  board[key] = sorted.slice(0, TOP_COUNT);
  try { localStorage.setItem(KEY, JSON.stringify(board)); } catch { /* Mantém o resultado desta run na tela. */ }
  return { position: sorted.indexOf(entry) + 1, top: sorted.slice(0, 5) };
}
