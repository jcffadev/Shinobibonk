import { MAPS, type MapId } from './maps.ts';
import { readLocalRankHistory, type RankedRun } from './ranking.ts';
import type { Difficulty } from './progression.ts';
import type { LocalProfile } from './localProfile.ts';

const KEY = 'shinobibonk.league.v1';
const SEASON_START = Date.UTC(2026, 10, 1, 3);
const SEASON_MS = 28 * 24 * 60 * 60 * 1000;
const HISTORY_LIMIT = 30;
export const TOP_LIMIT = 100;
export const DIFFICULTIES: readonly Difficulty[] = ['Genin', 'Chunin', 'Jonin', 'Kage'];

type Identity = Pick<LocalProfile, 'id' | 'name'>;
export type LeagueBuild = {
  skills: Record<string, number>;
  items: Record<string, number>;
  pills: Record<string, number>;
  allies: string[];
};
export type LeagueMission = RankedRun & {
  map: MapId; difficulty: Difficulty; finishedAt: number; build?: LeagueBuild;
};
export type LeagueMember = {
  id: number; name: string; clan?: string; joinedAt: number; missions: number;
  wins: number; kills: number; seconds: number; highestLevel: number;
  best: Record<string, LeagueMission>; builds: Record<string, LeagueMission>; history: LeagueMission[];
};
export type LeagueClan = { tag: string; name: string; owner: number };
export type League = { members: Record<number, LeagueMember>; clans: Record<string, LeagueClan> };
export type Standing = { member: LeagueMember; score: number; regions: LeagueMission[]; featured: LeagueMission };
export type LeagueScope = { season: number; map?: MapId; difficulty?: Difficulty; heroId?: string };

export const emptyLeague = (): League => ({ members: {}, clans: {} });

export function leagueSeason(now = Date.now()) {
  const index = Math.floor((now - SEASON_START) / SEASON_MS);
  return { number: index + 1, endsAt: SEASON_START + (index + 1) * SEASON_MS };
}

export function readLeague(storage: Pick<Storage, 'getItem'> = localStorage): League {
  try {
    const data: League | null = JSON.parse(storage.getItem(KEY) ?? 'null');
    if (data?.members && data.clans) return data;
  } catch { /* Armazenamento indisponível. */ }
  return emptyLeague();
}

export function writeLeague(board: League, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(KEY, JSON.stringify(board));
}

function compareRun(a: LeagueMission, b: LeagueMission) {
  return b.kills - a.kills || Number(b.victory) - Number(a.victory) || b.zone - a.zone
    || (a.victory ? a.elapsed - b.elapsed : b.elapsed - a.elapsed)
    || a.finishedAt - b.finishedAt;
}

function addMission(member: LeagueMember, run: LeagueMission) {
  const key = [leagueSeason(run.finishedAt).number, run.map, run.difficulty, run.heroId].join('/');
  const old = member.best[key];
  if (!old || compareRun(run, old) < 0) member.best[key] = run;
  if (run.build) member.builds[run.heroId] = run;
  member.joinedAt = Math.min(member.joinedAt, run.finishedAt);
  member.missions++;
  member.wins += Number(run.victory);
  member.kills += run.kills;
  member.seconds += run.elapsed;
  member.highestLevel = Math.max(member.highestLevel, run.level);
  member.history = [run, ...member.history].slice(0, HISTORY_LIMIT);
}

export function ensureLeagueMember(
  board: League, profile: Identity, legacy: LeagueMission[] = [], now = Date.now(),
) {
  const current = board.members[profile.id];
  if (current?.name === profile.name) return board;
  const member = current ? { ...current, name: profile.name } : {
    id: profile.id, name: profile.name, joinedAt: now, missions: 0, wins: 0, kills: 0, seconds: 0,
    highestLevel: 0, best: {}, builds: {}, history: [],
  };
  if (!current) {
    const unique = new Map(legacy.map(run => [JSON.stringify(run), run]));
    [...unique.values()].sort((a, b) => a.finishedAt - b.finishedAt).forEach(run => addMission(member, run));
  }
  return { ...board, members: { ...board.members, [profile.id]: member } };
}

export function syncLeagueProfile(profile: Identity) {
  const previous = readLeague();
  const board = ensureLeagueMember(previous, profile, previous.members[profile.id] ? [] : readLocalRankHistory());
  if (board !== previous) writeLeague(board);
  return board;
}

export function addLeagueMission(board: League, profile: Identity, run: LeagueMission) {
  const ready = ensureLeagueMember(board, profile, [], run.finishedAt);
  const previous = ready.members[profile.id];
  const member = { ...previous, best: { ...previous.best }, builds: { ...previous.builds } };
  addMission(member, run);
  return { ...ready, members: { ...ready.members, [profile.id]: member } };
}

export function leagueStandings(board: League, scope: LeagueScope): Standing[] {
  const standings = Object.values(board.members).flatMap(member => {
    const best = new Map<MapId, LeagueMission>();
    for (const run of Object.values(member.best)) {
      if (leagueSeason(run.finishedAt).number !== scope.season || (scope.map && run.map !== scope.map)
        || (scope.difficulty && run.difficulty !== scope.difficulty) || (scope.heroId && run.heroId !== scope.heroId)) continue;
      const previous = best.get(run.map);
      if (!previous || compareRun(run, previous) < 0) best.set(run.map, run);
    }
    const regions = MAPS.flatMap(map => best.get(map.id) ?? []);
    const featured = regions.slice().sort(compareRun)[0];
    return featured ? [{ member, score: regions.reduce((sum, run) => sum + run.kills, 0), regions, featured }] : [];
  });
  return standings.sort((a, b) => b.score - a.score || compareRun(a.featured, b.featured) || a.member.id - b.member.id);
}

export function clanMembers(board: League, tag: string) {
  return Object.values(board.members).filter(member => member.clan === tag);
}

export function clanStandings(board: League, standings: Standing[]) {
  const scores = new Map(standings.map(entry => [entry.member.id, entry.score]));
  return Object.values(board.clans).map(clan => {
    const members = clanMembers(board, clan.tag);
    return { clan, members, score: members.reduce((sum, member) => sum + (scores.get(member.id) ?? 0), 0) };
  }).sort((a, b) => b.score - a.score || a.clan.tag.localeCompare(b.clan.tag));
}

export function createClan(board: League, id: number, name: string, tag: string): League {
  name = name.trim();
  tag = tag.trim().toUpperCase();
  if (name.length < 3 || name.length > 32) throw new Error('Use um nome com 3 a 32 caracteres.');
  if (!/^[A-Z0-9]{2,5}$/.test(tag)) throw new Error('Use uma sigla de 2 a 5 letras ou números.');
  if (Object.hasOwn(board.clans, tag)) throw new Error('Essa sigla já pertence a um clã.');
  return joinClan({ ...board, clans: { ...board.clans, [tag]: { tag, name, owner: id } } }, id, tag);
}

export function joinClan(board: League, id: number, tag: string): League {
  const member = board.members[id];
  if (!member) throw new Error('Perfil indisponível.');
  if (member.clan) throw new Error('Saia do seu clã antes de entrar em outro.');
  if (!Object.hasOwn(board.clans, tag)) throw new Error('Clã indisponível.');
  return { ...board, members: { ...board.members, [id]: { ...member, clan: tag } } };
}

export function leaveClan(board: League, id: number): League {
  const member = board.members[id];
  const tag = member?.clan;
  if (!tag) return board;
  const clans = { ...board.clans };
  const replacement = clanMembers(board, tag).find(entry => entry.id !== id);
  if (!replacement) delete clans[tag];
  else if (clans[tag]?.owner === id) clans[tag] = { ...clans[tag], owner: replacement.id };
  return { clans, members: { ...board.members, [id]: { ...member, clan: undefined } } };
}

export function resetLeagueMember(board: League, id: number): League {
  const next = leaveClan(board, id);
  const members = { ...next.members };
  delete members[id];
  return { ...next, members };
}
