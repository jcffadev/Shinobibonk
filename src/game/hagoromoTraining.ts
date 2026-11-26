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

export type ToolEffect = 'sealBurst' | 'polarPull' | 'statusSpread' | 'critSlash' | 'windGust' | 'goldRope' | 'gourdRyu' | 'smokeCrit' | 'sevenBlades' | 'passive';
export type SageTool = { id: string; name: string; rarity: Rarity; bonus: Bonuses; stat: string; effect: ToolEffect; detail: string; icon: string };
/** As 9 ferramentas com efeito (2 Comum, 2 Incomum, 2 Raro, 2 Épico, 1 Lendário) + 25 de atributo (5 por raridade, 26/11/2026). Valores PROPOSTOS — calibrar no simulador. */
export const SAGE_TOOLS: readonly SageTool[] = [
  { id: 'amuleto', name: 'Amuleto de Selamento', rarity: 'Comum', bonus: { healthPct: .08 }, stat: '+8% de HP máximo', effect: 'sealBurst', detail: 'A cada 100 abates, um selo explode em volta e paralisa os inimigos a 6 m por 1 s.', icon: '🧿' },
  { id: 'particulas', name: 'Partículas Polares', rarity: 'Comum', bonus: { area: .06 }, stat: '+6% de área', effect: 'polarPull', detail: 'A cada 8 s, partículas puxam os drops a 7 m (Ryu, XP, chakra).', icon: '✨' },
  { id: 'shakujo', name: 'Shakujō', rarity: 'Incomum', bonus: { duration: .1 }, stat: '+10% de duração de status', effect: 'statusSpread', detail: 'A cada 6 s, o status de um inimigo próximo se espalha para 2 vizinhos.', icon: '🔱' },
  { id: 'espada', name: 'Espada', rarity: 'Incomum', bonus: { normal: .12 }, stat: '+12% de dano de Taijutsu', effect: 'critSlash', detail: 'Crítico abre um corte em linha que atravessa até 3 inimigos com 50% do golpe.', icon: '🗡️' },
  { id: 'bashosen', name: 'Bashōsen', rarity: 'Raro', bonus: { projectiles: 1 }, stat: '+1 projétil', effect: 'windGust', detail: 'A cada 8 s, uma rajada de vento empurra e corta tudo a 8 m.', icon: '🪭' },
  { id: 'kokinjo', name: 'Kōkinjō', rarity: 'Raro', bonus: { eliteDamage: .15 }, stat: '+15% de dano em elites', effect: 'goldRope', detail: 'Ao acertar elite ou Mega Elite, a corda dourada o prende por 1,5 s (no máximo 1 vez a cada 10 s por alvo).', icon: '🪢' },
  { id: 'benihisago', name: 'Benihisago', rarity: 'Épico', bonus: { gold: .15, exp: .1 }, stat: '+15% de Ryu e +10% de XP', effect: 'gourdRyu', detail: 'A cada 100 abates, a cabaça entrega uma grande quantidade de Ryu.', icon: '🏺' },
  { id: 'kohaku', name: 'Kohaku no Jōhei', rarity: 'Épico', bonus: { crit: .12 }, stat: '+12 pontos de chance crítica', effect: 'smokeCrit', detail: 'Crítico estoura uma bomba de fumaça shinobi: inimigos a 4 m ficam lentos e cegos (sem atacar) por 2 s.', icon: '⚱️' },
  { id: 'shichiseiken', name: 'Shichiseiken', rarity: 'Lendário', bonus: { damage: .25 }, stat: '+25% de dano total', effect: 'sevenBlades', detail: 'A cada 7 s, sete lâminas de luz caem sobre os 7 inimigos mais fortes a 15 m.', icon: '⚔️' },
  // 26/11/2026 — usuário: "Criar mais recompensas do Hagoromo, pelo menos mais 5 itens de cada raridade". 25 ferramentas de atributo
  // (efeito 'passive': só o bônus), tesouros e armas da obra; valores PROPOSTOS, crescendo com a raridade.
  { id: 'etiqueta', name: 'Etiqueta Explosiva', rarity: 'Comum', bonus: { element: .07 }, stat: '+7% de dano de Ninjutsu', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '💥' },
  { id: 'kunai-tres', name: 'Kunai de Três Pontas', rarity: 'Comum', bonus: { projectileSpeed: .12 }, stat: '+12% de velocidade de projétil', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '📍' },
  { id: 'hitai-ate', name: 'Hitai-ate da Folha', rarity: 'Comum', bonus: { defense: 5 }, stat: '+5 de armadura', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🎽' },
  { id: 'cantil', name: 'Cantil de Chakra', rarity: 'Comum', bonus: { regen: .8 }, stat: '+0,8 HP/s de regeneração', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🧉' },
  { id: 'zori', name: 'Zōri de Chakra', rarity: 'Comum', bonus: { move: .06 }, stat: '+6% de movimento', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🩴' },
  { id: 'corrente', name: 'Corrente de Chakra', rarity: 'Incomum', bonus: { status: .05 }, stat: '+5 pontos de chance de status', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '⛓️' },
  { id: 'pergaminho-invocacao', name: 'Pergaminho de Invocação', rarity: 'Incomum', bonus: { cool: .07 }, stat: '+7% de recarga', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '📜' },
  { id: 'mascara-anbu', name: 'Máscara ANBU', rarity: 'Incomum', bonus: { dodge: .025 }, stat: '+2,5 pontos de evasão', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🎭' },
  { id: 'luvas-ferro', name: 'Luvas de Ferro', rarity: 'Incomum', bonus: { critDamage: .18 }, stat: '+18% de dano crítico', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🥊' },
  { id: 'bolsa-ninja', name: 'Bolsa Ninja', rarity: 'Incomum', bonus: { pickup: .25, gold: .06 }, stat: '+25% de coleta e +6% de Ryu', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '👝' },
  { id: 'grande-leque', name: 'Grande Leque de Ferro', rarity: 'Raro', bonus: { area: .1, move: .04 }, stat: '+10% de área e +4% de movimento', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🌀' },
  { id: 'samehada', name: 'Samehada', rarity: 'Raro', bonus: { regen: 2, healthPct: .06 }, stat: '+2 HP/s e +6% de HP máximo', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🦈' },
  { id: 'kiba', name: 'Kiba, as Presas do Raio', rarity: 'Raro', bonus: { attackSpeed: .08, crit: .04 }, stat: '+8% de velocidade de ataque e +4 pontos de crítico', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '⚡' },
  { id: 'hiramekarei', name: 'Hiramekarei', rarity: 'Raro', bonus: { element: .12 }, stat: '+12% de dano de Ninjutsu', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🗡' },
  { id: 'kabutowari', name: 'Kabutowari', rarity: 'Raro', bonus: { eliteDamage: .2 }, stat: '+20% de dano em elites', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🔨' },
  { id: 'oito-trigramas', name: 'Selo dos Oito Trigramas', rarity: 'Épico', bonus: { healthPct: .15, defense: 8 }, stat: '+15% de HP máximo e +8 de armadura', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '☯️' },
  { id: 'cajado-rikudo', name: 'Cajado dos Seis Caminhos', rarity: 'Épico', bonus: { cool: .12, duration: .1 }, stat: '+12% de recarga e +10% de duração de status', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🪄' },
  { id: 'busca-verdade', name: 'Esfera da Busca da Verdade', rarity: 'Épico', bonus: { damage: .12, area: .08 }, stat: '+12% de dano total e +8% de área', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '⚫' },
  { id: 'manto-kage', name: 'Manto do Kage', rarity: 'Épico', bonus: { luck: 15, exp: .1 }, stat: '+15 de Sorte e +10% de XP', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🧥' },
  { id: 'kunai-hiraishin', name: 'Kunai do Hiraishin', rarity: 'Épico', bonus: { move: .12, attackSpeed: .1 }, stat: '+12% de movimento e +10% de velocidade de ataque', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🔱' },
  { id: 'yata', name: 'Espelho de Yata', rarity: 'Lendário', bonus: { defense: 25, healthPct: .2 }, stat: '+25 de armadura e +20% de HP máximo', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🪞' },
  { id: 'totsuka', name: 'Espada de Totsuka', rarity: 'Lendário', bonus: { damage: .2, critDamage: .3 }, stat: '+20% de dano total e +30% de dano crítico', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🗡️' },
  { id: 'gunbai', name: 'Gunbai do Uchiha', rarity: 'Lendário', bonus: { area: .15, status: .08 }, stat: '+15% de área e +8 pontos de chance de status', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🏮' },
  { id: 'magatama', name: 'Magatama dos Seis Caminhos', rarity: 'Lendário', bonus: { crit: .1, critDamage: .2 }, stat: '+10 pontos de crítico e +20% de dano crítico', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🔮' },
  { id: 'manto-kurama', name: 'Manto de Chakra da Kurama', rarity: 'Lendário', bonus: { regen: 5, damage: .12, move: .08 }, stat: '+5 HP/s, +12% de dano total e +8% de movimento', effect: 'passive', detail: 'Ferramenta de atributo: só o bônus, sem efeito especial.', icon: '🦊' },
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
