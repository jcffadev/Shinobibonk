import type { Bonuses, Rarity } from './catalog';

/**
 * Treinamento do Hagoromo (pedido do usuário, 15/11/2026; especificação em docs/01 → "Evento Treinamento do Hagoromo").
 * Lógica pura: chaves, raridade, hordas, ferramentas do Sábio dos Seis Caminhos, sorteio da recompensa e troca.
 * - 1 chave a cada `killsPerKey` abates (até `maxKeys`); abates dentro do evento não contam.
 * - Clássico: depois do chefe da zona a chave para de recarregar naquela zona. Sobrevivência: sempre recarrega.
 * - Raridade sorteada a cada ativação → hordas × monstros; no fim, um Mega Elite.
 * - Recompensa: 1 de 3 ferramentas (ou nenhuma); no máximo `maxTools`, com troca.
 */
export const HAGOROMO = { killsPerKey: 500, maxKeys: 3, maxTools: 3, offers: 3, arenaRadius: 13, waveRing: [9, 12] as const } as const;

export const HAGOROMO_RARITIES: readonly Rarity[] = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
/** Hordas e monstros por horda de cada raridade (pedido do usuário). */
export const HAGOROMO_WAVES: Record<Rarity, { waves: number; perWave: number }> = {
  Comum: { waves: 3, perWave: 50 }, Incomum: { waves: 4, perWave: 100 }, Raro: { waves: 5, perWave: 150 },
  'Épico': { waves: 6, perWave: 200 }, 'Lendário': { waves: 7, perWave: 400 },
};
/** Peso de cada raridade no sorteio da ativação (PROPOSTO). */
export const RARITY_WEIGHTS: Record<Rarity, number> = { Comum: 45, Incomum: 27, Raro: 16, 'Épico': 9, 'Lendário': 3 };

export type ToolEffect = 'sealBurst' | 'polarPull' | 'statusSpread' | 'critSlash' | 'windGust' | 'goldRope' | 'gourdRyu' | 'smokeCrit' | 'sevenBlades';
export type SageTool = { id: string; name: string; rarity: Rarity; bonus: Bonuses; stat: string; effect: ToolEffect; detail: string };
/** As 9 ferramentas (2 Comum, 2 Incomum, 2 Raro, 2 Épico, 1 Lendário). Valores PROPOSTOS — calibrar no simulador. */
export const SAGE_TOOLS: readonly SageTool[] = [
  { id: 'amuleto', name: 'Amuleto de Selamento', rarity: 'Comum', bonus: { healthPct: .08 }, stat: '+8% de HP máximo', effect: 'sealBurst', detail: 'A cada 100 abates, um selo explode em volta e paralisa os inimigos a 6 m por 1 s.' },
  { id: 'particulas', name: 'Partículas Polares', rarity: 'Comum', bonus: { area: .06 }, stat: '+6% de área', effect: 'polarPull', detail: 'A cada 8 s, partículas puxam os drops a 7 m (Ryu, XP, chakra).' },
  { id: 'shakujo', name: 'Shakujō', rarity: 'Incomum', bonus: { duration: .1 }, stat: '+10% de duração de status', effect: 'statusSpread', detail: 'A cada 6 s, o status de um inimigo próximo se espalha para 2 vizinhos.' },
  { id: 'espada', name: 'Espada', rarity: 'Incomum', bonus: { normal: .12 }, stat: '+12% de dano de Taijutsu', effect: 'critSlash', detail: 'Crítico abre um corte em linha que atravessa até 3 inimigos com 50% do golpe.' },
  { id: 'bashosen', name: 'Bashōsen', rarity: 'Raro', bonus: { projectiles: 1 }, stat: '+1 projétil', effect: 'windGust', detail: 'A cada 8 s, uma rajada de vento empurra e corta tudo a 8 m.' },
  { id: 'kokinjo', name: 'Kōkinjō', rarity: 'Raro', bonus: { eliteDamage: .15 }, stat: '+15% de dano em elites', effect: 'goldRope', detail: 'Ao acertar elite ou Mega Elite, a corda dourada o prende por 1,5 s (no máximo 1 vez a cada 10 s por alvo).' },
  { id: 'benihisago', name: 'Benihisago', rarity: 'Épico', bonus: { gold: .15, exp: .1 }, stat: '+15% de Ryu e +10% de XP', effect: 'gourdRyu', detail: 'A cada 100 abates, a cabaça entrega uma grande quantidade de Ryu.' },
  { id: 'kohaku', name: 'Kohaku no Jōhei', rarity: 'Épico', bonus: { crit: .12 }, stat: '+12 pontos de chance crítica', effect: 'smokeCrit', detail: 'Crítico estoura uma bomba de fumaça shinobi: inimigos a 4 m ficam lentos e cegos (sem atacar) por 2 s.' },
  { id: 'shichiseiken', name: 'Shichiseiken', rarity: 'Lendário', bonus: { damage: .25 }, stat: '+25% de dano total', effect: 'sevenBlades', detail: 'A cada 7 s, sete lâminas de luz caem sobre os 7 inimigos mais fortes a 15 m.' },
];
export const TOOL_BY_ID: Record<string, SageTool> = Object.fromEntries(SAGE_TOOLS.map(t => [t.id, t]));

export type HagoromoEncounterHud = { rarity:Rarity; wave:number; total:number; remaining:number; phase:'wave'|'boss'|'complete' };

export type HagoromoState = { keys: number; progress: number; tools: string[] };
export const createHagoromo = (): HagoromoState => ({ keys: 0, progress: 0, tools: [] });

/** Soma abates ao progresso da chave. Não conta dentro do evento nem quando a recarga está parada. */
export function addHagoromoKills(state: HagoromoState, kills: number, options: { inEvent: boolean; recharge: boolean }) {
  if (options.inEvent || !options.recharge || state.keys >= HAGOROMO.maxKeys || !(kills > 0)) return state;
  state.progress += kills;
  while (state.progress >= HAGOROMO.killsPerKey && state.keys < HAGOROMO.maxKeys) { state.progress -= HAGOROMO.killsPerKey; state.keys++; }
  if (state.keys >= HAGOROMO.maxKeys) state.progress = 0;
  return state;
}
/** Clássico: depois do chefe da zona, sem recarga naquela zona. Sobrevivência: sempre. */
export const hagoromoRecharges = (mode: 'classico' | 'sobrevivencia', zoneBossDefeated: boolean) => mode === 'sobrevivencia' || !zoneBossDefeated;

/** Sorteia a raridade do evento; `quality` (0–1) puxa para as raridades altas (item de qualidade). */
export function rollHagoromoRarity(rng: () => number = Math.random, quality = 0): Rarity {
  const weights = HAGOROMO_RARITIES.map((r, i) => RARITY_WEIGHTS[r] * (1 + quality * i));
  let roll = rng() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) { roll -= weights[i]; if (roll < 0) return HAGOROMO_RARITIES[i]; }
  return 'Lendário';
}

/** Monta o pool da recompensa: `count` ferramentas diferentes que o jogador ainda não tem (raridade puxada pela do evento). */
export function rollToolOffers(owned: readonly string[], eventRarity: Rarity, rng: () => number = Math.random, count: number = HAGOROMO.offers, quality = 0) {
  const pool = SAGE_TOOLS.filter(t => !owned.includes(t.id));
  const tier = HAGOROMO_RARITIES.indexOf(eventRarity);
  const picks: SageTool[] = [];
  while (picks.length < count && pool.length) {
    const weights = pool.map(t => { const gap = Math.abs(HAGOROMO_RARITIES.indexOf(t.rarity) - tier); return Math.max(.15, 1 - gap * .3) * (1 + quality * HAGOROMO_RARITIES.indexOf(t.rarity)); });
    let roll = rng() * weights.reduce((a, b) => a + b, 0), index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { roll -= weights[i]; if (roll < 0) { index = i; break; } }
    picks.push(pool.splice(index, 1)[0]);
  }
  return picks;
}

/**
 * Escolha na recompensa. Com menos de 3 ferramentas, a nova entra. Com 3: `replace` = a que sai;
 * `replace` igual à nova (ou ausente) dispensa a nova e mantém o conjunto (pedido do usuário).
 */
export function chooseTool(owned: readonly string[], newId: string, replace?: string): string[] {
  if (owned.includes(newId)) return [...owned];
  if (owned.length < HAGOROMO.maxTools) return [...owned, newId];
  if (!replace || replace === newId || !owned.includes(replace)) return [...owned];
  return owned.map(id => id === replace ? newId : id);
}

/** Bônus somados das ferramentas do jogador (entram na ficha como os itens). */
export function toolBonuses(owned: readonly string[]): Bonuses {
  const total: Bonuses = {};
  for (const id of owned) for (const [key, value] of Object.entries(TOOL_BY_ID[id]?.bonus ?? {})) total[key as keyof Bonuses] = (total[key as keyof Bonuses] ?? 0) + (value ?? 0);
  return total;
}

/** Próxima etapa depois que o último inimigo da etapa atual foi derrotado. */
export function nextHagoromoStage(rarity:Rarity,wavesStarted:number,enemiesRemaining:boolean,bossSpawned:boolean) {
  if(enemiesRemaining)return 'wait';
  if(bossSpawned)return 'reward';
  return wavesStarted<HAGOROMO_WAVES[rarity].waves?'wave':'boss';
}

/** Posições de uma horda: anel entre `waveRing[0]` e `waveRing[1]` m em volta de (x, z). */
export function waveSpots(x: number, z: number, count: number, rng: () => number = Math.random) {
  const [inner, outer] = HAGOROMO.waveRing;
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const angle = i / Math.max(1, count) * Math.PI * 2 + rng() * .3, radius = inner + rng() * (outer - inner);
    return { x: x + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius };
  });
}
