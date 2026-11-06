import type { Bonuses, StatKey } from './catalog';
import type { Technique } from './heroes';

/**
 * NPCs de evento que NÃO são personagens jogáveis (não entram em HEROES, na seleção, no total do elenco
 * nem no selamento): Ebisu e Iruka. Também guarda as regras do evento Naruto Totem.
 * Fonte canônica dos dados de personagem: Narutopedia (naruto.fandom.com).
 * - Ebisu: Konohagakure, Tokubetsu Jōnin, "Personal Trainer" (tutor de elite).
 * - Iruka Umino: Konohagakure, Chūnin, professor da Academia.
 * Percentuais são regras provisórias do protótipo.
 */

/** Atributos "base 100%" da ficha (P) usados nas trocas. Ganho e custo usam a mesma unidade: pontos percentuais aditivos. */
export const DEAL_STATS: { key: StatKey; label: string }[] = [
  { key: 'damage', label: 'dano total' },
  { key: 'attackSpeed', label: 'velocidade de ataque' },
  { key: 'projectileSpeed', label: 'velocidade de projétil' },
  { key: 'move', label: 'movimento' },
  { key: 'area', label: 'raio de área' },
  { key: 'healthPct', label: 'HP máximo' },
  { key: 'normal', label: 'dano de Taijutsu' },
  { key: 'element', label: 'dano de Ninjutsu' },
  { key: 'critDamage', label: 'dano crítico' },
  { key: 'duration', label: 'duração de status' },
  { key: 'exp', label: 'experiência' },
  { key: 'gold', label: 'ganho de Ryu' },
  { key: 'cool', label: 'recarga da Ultimate' },
];
const LABEL = Object.fromEntries(DEAL_STATS.map((s) => [s.key, s.label])) as Record<string, string>;
export const dealLabel = (key: StatKey) => LABEL[key] ?? key;

/** Regras numéricas (provisórias). */
export const NPC_RULES = {
  /** Ebisu: ganho sorteado entre min e max; custo = ganho × costFactor (10% a mais). */
  ebisu: { min: .08, max: .2, costFactor: 1.1 },
  /** Iruka (1): lição rápida sem custo. */
  irukaLesson: { min: .03, max: .06 },
  /** Iruka (2): custo fixo do pergaminho lendário. */
  irukaLegendaryCost: .2,
  /** Iruka (3): passiva de ajudante; ele entra com afinidade máxima (AFFINITY_RULES em allies.ts), então vale 100%. */
  irukaAllyExp: .25,
  /** Proteção: um custo não pode deixar o bônus aditivo do atributo abaixo deste piso. */
  costFloor: -.5,
};

/** Valores máximos ("nível lendário") por atributo para o pergaminho da Iruka. */
export const LEGENDARY_VALUES: Partial<Record<StatKey, number>> = {
  damage: .3, attackSpeed: .25, projectileSpeed: .35, move: .2, area: .3, healthPct: .25, normal: .35,
  element: .35, critDamage: .6, duration: .4, exp: .35, gold: .4, cool: .35,
};

export type StatDeal = { key: StatKey; value: number; costKey?: StatKey; cost?: number };

export const pctText = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('pt-BR')}%`;
export const dealBonuses = (d: StatDeal): Bonuses => {
  const out: Bonuses = { [d.key]: d.value };
  if (d.costKey && d.cost) out[d.costKey] = (out[d.costKey] || 0) - d.cost;
  return out;
};
export const dealText = (d: StatDeal) => `+${pctText(d.value)} ${dealLabel(d.key)}` + (d.costKey && d.cost ? ` · −${pctText(d.cost)} ${dealLabel(d.costKey)}` : '');

const pick = <T,>(list: T[], rng: () => number) => list.splice(Math.floor(rng() * list.length), 1)[0];
/** Custo em um atributo diferente do ganho, que ainda suporte a perda (canLose). */
function costKeyFor(buff: StatKey, cost: number, canLose: (key: StatKey, cost: number) => boolean, rng: () => number): StatKey | undefined {
  const options = DEAL_STATS.map((s) => s.key).filter((k) => k !== buff && canLose(k, cost));
  return options.length ? options[Math.floor(rng() * options.length)] : undefined;
}

/** Ebisu: 3 trocas com atributos de ganho distintos; custo = 110% do ganho, em outro atributo. */
export function rollEbisuDeals(canLose: (key: StatKey, cost: number) => boolean, rng = Math.random): StatDeal[] {
  const keys = DEAL_STATS.map((s) => s.key), out: StatDeal[] = [];
  while (out.length < 3 && keys.length) {
    const key = pick(keys, rng), r = NPC_RULES.ebisu;
    const value = Math.round((r.min + rng() * (r.max - r.min)) * 100) / 100;
    const cost = Math.round(value * r.costFactor * 1000) / 1000;
    const costKey = costKeyFor(key, cost, canLose, rng);
    if (costKey) out.push({ key, value, costKey, cost });
  }
  return out;
}

/** Iruka (1): pequeno ganho sem custo. */
export function rollIrukaLesson(rng = Math.random): StatDeal {
  const r = NPC_RULES.irukaLesson, key = DEAL_STATS[Math.floor(rng() * DEAL_STATS.length)].key;
  return { key, value: Math.round((r.min + rng() * (r.max - r.min)) * 100) / 100 };
}

/** Iruka (2): 3 atributos lendários distintos, cada um com custo de 20% em outro atributo. */
export function rollIrukaLegendary(canLose: (key: StatKey, cost: number) => boolean, rng = Math.random): StatDeal[] {
  const keys = Object.keys(LEGENDARY_VALUES) as StatKey[], out: StatDeal[] = [], cost = NPC_RULES.irukaLegendaryCost;
  while (out.length < 3 && keys.length) {
    const key = pick(keys, rng), costKey = costKeyFor(key, cost, canLose, rng);
    if (costKey) out.push({ key, value: LEGENDARY_VALUES[key]!, costKey, cost });
  }
  return out;
}

/** Ajudantes que não são heróis jogáveis. */
export type NpcAlly = { id: string; name: string; village: string; technique: Technique };
export const NPC_ALLIES: Record<string, NpcAlly> = {
  iruka: {
    id: 'iruka', name: 'Iruka Umino', village: 'Vila da Folha',
    // Kunai (ferramenta ninja), não jutsu do kit canônico. Valores provisórios.
    technique: { name: 'Kunai da Academia', school: 'Taijutsu', element: 'Neutro', shape: 'Projétil', color: '#c9d3df', power: 1, range: 8, cooldown: 1.5, statusChance: 0, unlockLevel: 1 },
  },
};
export const isNpcAlly = (id: string) => id in NPC_ALLIES;

/*
 * Retratos/sprites dos NPCs: pixel art chibi original no mesmo enquadramento de uma célula do atlas
 * shinobi-roster-v2.png (quadrado, imagem inteira). Gerados por `node scripts/generate-sprites.mjs --npcs`.
 * Usados pelo sprite 3D no mapa, pelo cartão de ajudante (Iruka) e pela ficha (via portraitRegion).
 */
export const NPC_PORTRAITS: Record<string, string> = { iruka: '/assets/shinobis/iruka-1.svg', ebisu: '/assets/shinobis/ebisu-1.svg' };
export const NPC_NAMES: Record<string, string> = { iruka: 'Iruka Umino', ebisu: 'Ebisu' };

/** Naruto Totem: evento fixo do minuto 7 (relógio regressivo 7:00 → 6:00). Valores provisórios. */
export const TOTEM_RULES = {
  /** elapsed (s) de início e fim: 600−180 = 7:00 restantes; 600−240 = 6:00. */
  start: 180, end: 240,
  /** HP = baseHp × ameaça de HP do momento. */
  baseHp: 650,
  /** Distância de surgimento a partir do jogador. */
  distance: 14,
  /** Clones: a cada `interval` s surgem `perWave`, até `maxClones` vivos ao mesmo tempo. */
  interval: .6, perWave: 4, maxClones: 48,
  /** Área de surgimento dos clones ao redor do jogador (m). */
  radiusMin: 6, radius: 50,
  cloneHp: 14, cloneSpeed: 3.9, cloneXp: 5,
  /** Níveis concedidos ao derrotar o totem (entram na fila normal de level-up). */
  levels: 2,
};
