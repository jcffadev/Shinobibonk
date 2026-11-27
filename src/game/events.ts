import type { Difficulty } from './progression.ts';
import type { MapId } from './maps.ts';

/**
 * Eventos do anime (25/11/2026 — pedido do usuário: "missões de evento inspiradas no anime que liberam personagens"; "A
 * principio a primeira season só vai ter personagens da academia e genins, então se baseie nisso para a gente ir liberando
 * personagens, os chunnins e tudo mais"). Lógica pura; o progresso fica em `account.ts` e a luta usa o "Shinobi para selar"
 * que já existe no GameCanvas.
 *
 * Cada evento é uma lista de DUELOS da obra. Um duelo tem dois lados; o jogador joga com um deles (ou outra versão da mesma
 * família) e o outro aparece na partida, depois do minuto e dos abates pedidos. Derrotar e selar libera o oponente na conta e
 * marca o duelo. O duelo fica disponível quando um dos lados já é jogável, então a corrente vai abrindo o elenco a partir
 * dos iniciais (Naruto, Sasuke e Sakura).
 */
export type EventDuel = {
  id: string; phase: string; sides: readonly [string, string];
  map: MapId; difficulty: Difficulty; minute: number; kills: number; title: string; story: string;
};
/**
 * Prêmios do evento (25/11/2026 — escolha do usuário: Lamens no fim, título, moldura e Lamens por fase). Lamens são dados
 * uma vez (`claimEventPrize` em account.ts); título e moldura ficam liberados enquanto o evento estiver completo.
 */
export type EventPrizes = { phase: Readonly<Record<string, number>>; complete: number; title: string; frame: string };
export type AnimeEvent = { id: string; title: string; season: number; story: string; reward: string; prizes: EventPrizes; duels: readonly EventDuel[]; /** Shinobis liberados na conta ao completar o evento (27/11/2026). */ unlocks?: readonly string[] };
export type EventPrize = { id: string; label: string; lamens: number };

/** Elenco da 1ª temporada: Academia e Genin (inclui o Trio do Som, que era genin na Prova Chūnin). */
export const SEASON_ONE_ROSTER = [
  'naruto', 'naruto-genin', 'sasuke', 'sakura', 'ino', 'shikamaru', 'choji', 'kiba', 'hinata', 'shino',
  'lee', 'neji', 'tenten', 'gaara', 'temari', 'kankuro', 'dosu', 'zaku', 'kin', 'obito',
] as const;

const FOREST = { map: 'folha' as MapId, difficulty: 'Genin' as Difficulty, minute: 2, kills: 150, phase: 'Floresta da Morte' };
const PRELIM = { map: 'folha' as MapId, difficulty: 'Genin' as Difficulty, minute: 3, kills: 250, phase: 'Preliminares' };
const FINAL = { map: 'folha' as MapId, difficulty: 'Chunin' as Difficulty, minute: 4, kills: 400, phase: 'Final' };
const duel = (base: typeof FOREST, a: string, b: string, title: string, story: string): EventDuel => ({ ...base, id: `${a}-${b}`, sides: [a, b], title, story });

export const CHUNIN_EXAM: AnimeEvent = {
  id: 'prova-chunin', season: 1, title: 'Prova Chūnin',
  story: 'Os genin de Konoha, Suna e do Som disputam a promoção a chūnin: a sobrevivência na Floresta da Morte, as lutas preliminares e a final diante das vilas.',
  reward: 'Cada duelo vencido libera o oponente na conta. Fechar cada fase dá Lamens; vencer os 15 duelos dá 2.000 Lamens, o título "Chūnin", a moldura Jade e libera o Chūnin Iruka.',
  // 27/11/2026 — usuário: "os Chounins pelo evento"; Iruka é Chūnin na obra.
  unlocks: ['iruka'],
  prizes: { phase: { 'Floresta da Morte': 300, 'Preliminares': 600, 'Final': 600 }, complete: 2000, title: 'Chūnin', frame: 'jade' },
  duels: [
    duel(FOREST, 'sasuke', 'zaku', 'O Selo Amaldiçoado', 'Sasuke desperta o Selo Amaldiçoado e enfrenta Zaku para proteger o time.'),
    duel(FOREST, 'sakura', 'kin', 'A Determinação de Sakura', 'Sakura corta o cabelo e enfrenta o Trio do Som sozinha.'),
    duel(FOREST, 'lee', 'dosu', 'O Ninja da Folha Verde', 'Rock Lee aparece para defender Sakura e enfrenta Dosu.'),
    duel(PRELIM, 'shino', 'zaku', 'Os Insetos de Shino', 'Os insetos entopem os canos de ar de Zaku.'),
    duel(PRELIM, 'sakura', 'ino', 'Rivais de Infância', 'Sakura e Ino lutam de igual para igual.'),
    duel(PRELIM, 'temari', 'tenten', 'O Leque Contra as Armas', 'O vento de Temari desvia todas as armas de Tenten.'),
    duel(PRELIM, 'shikamaru', 'kin', 'A Sombra e os Sinos', 'Shikamaru prende Kin com a sombra e vence pela estratégia.'),
    duel(PRELIM, 'naruto', 'kiba', 'Naruto contra Kiba', 'Kiba e Akamaru subestimam o último colocado da Academia.'),
    duel(PRELIM, 'neji', 'hinata', 'O Destino dos Hyūga', 'Neji enfrenta a prima Hinata, que não desiste.'),
    duel(PRELIM, 'gaara', 'lee', 'Os Portões contra a Areia', 'Lee abre os Portões contra a defesa absoluta de Gaara.'),
    duel(PRELIM, 'choji', 'dosu', 'O Tanque Humano', 'Chōji rola contra o som de Dosu.'),
    duel(FINAL, 'naruto', 'neji', 'Naruto contra Neji', 'Naruto promete mudar o destino de Neji na arena.'),
    duel(FINAL, 'sasuke', 'gaara', 'O Chidori na Arena', 'Sasuke chega no último instante com o Chidori contra a esfera de areia.'),
    duel(FINAL, 'shikamaru', 'temari', 'O Estrategista Desiste', 'Shikamaru vence no plano e desiste da luta contra Temari.'),
    duel(FINAL, 'shino', 'kankuro', 'Marionete contra Insetos', 'Shino enfrenta Kankurō e o Karasu.'),
  ],
};
export const EVENTS: readonly AnimeEvent[] = [CHUNIN_EXAM];
export const EVENT_DUEL_BY_ID: Record<string, EventDuel> = Object.fromEntries(EVENTS.flatMap(e => e.duels.map(d => [d.id, d])));

/** Lado do duelo que o shinobi ocupa (mesma família conta: Naruto Academia ou Genin), ou -1. */
export function duelSide(d: EventDuel, heroId: string, familyOf: (id: string) => string) {
  return d.sides.findIndex(side => familyOf(heroId) === familyOf(side));
}
/** Oponente que aparece na partida quando se joga com `heroId`. */
export function duelOpponent(d: EventDuel, heroId: string, familyOf: (id: string) => string) {
  const side = duelSide(d, heroId, familyOf);
  return side < 0 ? undefined : d.sides[1 - side];
}
/** O duelo está aberto quando um dos lados já é jogável. */
export const duelAvailable = (d: EventDuel, playable: (id: string) => boolean) => d.sides.some(playable);
/** O oponente aparece depois do minuto e dos abates do duelo. */
export const duelReady = (d: EventDuel, elapsed: number, kills: number) => elapsed >= d.minute * 60 && kills >= d.kills;

/** Duelos feitos de um evento, sobre o progresso salvo (`{ [duelo]: shinobi que venceu }`). */
export function eventProgress(e: AnimeEvent, done: Readonly<Record<string, string>>) {
  const finished = e.duels.filter(d => done[d.id]).length;
  return { finished, total: e.duels.length, complete: finished === e.duels.length };
}

/** Fases do evento na ordem da obra, com os duelos feitos de cada uma. */
export function eventPhases(e: AnimeEvent, done: Readonly<Record<string, string>>) {
  return [...new Set(e.duels.map(d => d.phase))].map(phase => {
    const duels = e.duels.filter(d => d.phase === phase);
    return { phase, finished: duels.filter(d => done[d.id]).length, total: duels.length, lamens: e.prizes.phase[phase] ?? 0 };
  });
}
/** Prêmios em Lamens já conquistados (fases fechadas e o evento completo). */
export function eventPrizes(e: AnimeEvent, done: Readonly<Record<string, string>>): EventPrize[] {
  const out: EventPrize[] = eventPhases(e, done).filter(p => p.finished === p.total && p.lamens > 0)
    .map(p => ({ id: `${e.id}:${p.phase}`, label: `${e.title} · ${p.phase}`, lamens: p.lamens }));
  if (eventProgress(e, done).complete) out.push({ id: `${e.id}:completo`, label: `${e.title} completa`, lamens: e.prizes.complete });
  return out;
}
/** Shinobis que os eventos completos liberam na conta. */
export const eventUnlocks = (done: Readonly<Record<string, string>>, events: readonly AnimeEvent[] = EVENTS) =>
  events.filter(e => eventProgress(e, done).complete).flatMap(e => e.unlocks ?? []);
/** Título mostrado no perfil e no ranking (o do último evento completo). */
export const earnedTitle = (done: Readonly<Record<string, string>>, events: readonly AnimeEvent[] = EVENTS) =>
  [...events].reverse().find(e => eventProgress(e, done).complete)?.prizes.title;
/** Molduras de perfil que algum evento libera, e se cada uma já foi conquistada. */
export function frameLock(frame: string, done: Readonly<Record<string, string>>, events: readonly AnimeEvent[] = EVENTS) {
  const owner = events.find(e => e.prizes.frame === frame);
  return owner && !eventProgress(owner, done).complete ? `Vença a ${owner.title} inteira` : undefined;
}
