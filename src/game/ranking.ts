import { MAPS, type MapId } from './maps.ts';
import type { Difficulty } from './progression';

const KEY = 'sb_local_ranking_v1';
const TOP_COUNT = 100;

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

function readRankBoard(): Record<string, Entry[]> {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') ?? {}; } catch { return {}; }
}

export function readLocalRankHistory() {
  const board = readRankBoard();
  const difficulties: Difficulty[] = ['Genin', 'Chunin', 'Jonin', 'Kage'];
  return MAPS.flatMap(({ id: map }) => difficulties.flatMap(difficulty => {
    const history = board[`${map}:${difficulty}`];
    return Array.isArray(history) ? history.map(run => ({ ...run, map, difficulty })).filter(run =>
      Number.isFinite(run.finishedAt) && Number.isFinite(run.kills)) : [];
  }));
}

export function recordLocalRun(map: MapId, mission: Difficulty, run: RankedRun, finishedAt = Date.now()): LocalRank {
  const key = `${map}:${mission}`;
  const board = readRankBoard();
  const entry = { ...run, finishedAt };
  const previous = Array.isArray(board[key]) ? board[key] : [];
  const sorted = [...previous, entry].sort(compare);
  board[key] = sorted.slice(0, TOP_COUNT);
  try { localStorage.setItem(KEY, JSON.stringify(board)); } catch { /* Mantém o resultado desta run na tela. */ }
  return { position: sorted.indexOf(entry) + 1, top: sorted.slice(0, 5) };
}
