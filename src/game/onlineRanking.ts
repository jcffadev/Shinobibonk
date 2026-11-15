import type { ProfilePortrait } from './profilePortrait';
import { useEffect, useState } from 'react';
import type { LeagueMember, LeagueMission } from './league';
import type { MapId } from './maps';
import type { Difficulty } from './progression';

export const onlineRankingEnabled = import.meta.env.VITE_RANKING_ONLINE === '1';
export type RankPlayer = { id:string; alias?:string };
const SESSION_EVENT = 'shinobi-rank-session';
export type RankMode = 'classic' | 'survival' | 'time-attack' | 'coop';
export type OnlineFilters = { map?: MapId; difficulty?: Difficulty; heroId?: string; mode: RankMode; size: number };
export type Place = { place: number; points: number };
export type OnlineEntry = Place & { subject: string; member: ProfilePortrait & { id: string; name: string; clan?: string }; featured: LeagueMission };
export type OnlineBoard = {
  season: number; endsAt: number; total: number; top: OnlineEntry[]; mine?: Place; projected?: Place;
};
type OnlineClan = Place & { tag: string; name: string; owner: string | null; members: number };
export type OnlineClans = {
  top: OnlineClan[]; mine?: string; selected?: { clan: OnlineClan; members: { id: string; name: string }[] };
};
export type ResultStatus = 'accepted' | 'review' | 'queued' | 'invalid';
const OUTBOX = 'shinobibonk.rank-outbox.v1';
type Pending = { uid: string; ticket: string; result: LeagueMission };

async function callRanking<T>(payload: Record<string, unknown>): Promise<T> {
  const response = await fetch('/.netlify/functions/ranking', {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data?.error ?? 'Ranking temporariamente indisponível.'), {code:data?.code});
  return data as T;
}

export function useRankSession() {
  const [player, setPlayer] = useState<RankPlayer>();
  useEffect(() => {
    if (!onlineRankingEnabled) return;
    let mounted = true;
    const refresh = () => {
      callRanking<RankPlayer | null>({action:'session'})
        .then(value => { if (mounted) setPlayer(value ?? undefined); })
        .catch(() => {});
    };
    refresh();
    window.addEventListener(SESSION_EVENT, refresh);
    return () => { mounted = false; window.removeEventListener(SESSION_EVENT, refresh); };
  }, []);
  return player;
}

export async function rankAuth(action:'login'|'signup'|'logout'|'alias', details:Record<string,string> = {}) {
  const result = await callRanking<{confirmEmail?:boolean}|null>({action,...details});
  window.dispatchEvent(new Event(SESSION_EVENT));
  return result ?? {};
}

function rpc<T>(method:string, args:Record<string,unknown> = {}) {
  return callRanking<T>({action:'rpc',method,args});
}
export const setOnlineAvatar = ({avatar,frame}:ProfilePortrait) => rpc<void>('sb_rank_set_avatar',{p_hero:avatar??null,p_frame:frame??'default'});

export function openRankTicket(map: MapId, difficulty: Difficulty, hero: string) {
  return rpc<string>('sb_rank_start', { p_map: map, p_difficulty: difficulty, p_hero: hero });
}
export function onlineBoard(filters: OnlineFilters, ticket?: string, kills?: number) {
  return rpc<OnlineBoard>('sb_rank_board', { p_map: filters.map, p_difficulty: filters.difficulty,
    p_hero: filters.heroId, p_mode: filters.mode, p_size: filters.size, p_ticket: ticket, p_live: kills });
}
export function onlineHeroPlaces(filters: OnlineFilters) {
  return rpc<Record<string, number>>('sb_rank_hero_places', { p_map: filters.map, p_difficulty: filters.difficulty, p_mode: filters.mode });
}
export const onlineProfile = (id: string) => rpc<(Omit<LeagueMember, 'id'> & { id: string }) | null>('sb_rank_profile', { p_id: id });
export const onlineClans = (tag?: string) => rpc<OnlineClans>('sb_rank_clans', { p_tag: tag });
export const changeOnlineClan = (action: 'join'|'leave'|'create', tag?: string, name?: string) =>
  rpc<void>('sb_rank_change_clan', { p_action: action, p_tag: tag, p_name: name });
export const registerRankName = (name: string) => rpc<void>('sb_rank_register', { p_name: name });

function outbox(): Pending[] {
  try { const data: unknown = JSON.parse(localStorage.getItem(OUTBOX) ?? '[]'); return Array.isArray(data) ? data : []; }
  catch { return []; }
}
function updateOutbox(entry: Pending, keep: boolean) {
  try {
    const other = outbox().filter(run => run.ticket !== entry.ticket);
    localStorage.setItem(OUTBOX, JSON.stringify(keep ? [...other, entry] : other));
  } catch { /* O envio ainda pode funcionar na sessão atual. */ }
}
async function deliver(entry: Pending): Promise<ResultStatus> {
  const r = entry.result;
  try {
    const status = await rpc<'accepted'|'review'>('sb_rank_finish', { p_ticket: entry.ticket,
      p_kills: r.kills, p_elapsed: Math.floor(r.elapsed), p_zone: r.zone, p_level: r.level,
      p_victory: r.victory, p_damage: r.totalDamage, p_build: r.build });
    updateOutbox(entry, false);
    return status;
  } catch (error) {
    if ((error as { code?: string }).code !== 'P0001') return 'queued';
    updateOutbox(entry, false);
    return 'invalid';
  }
}
export function submitRankResult(uid: string, ticket: string, result: LeagueMission) {
  const entry = { uid, ticket, result };
  updateOutbox(entry, true);
  return deliver(entry);
}
export async function retryRankResults(uid: string) {
  for (const entry of outbox().filter(run => run.uid === uid)) await deliver(entry);
}
