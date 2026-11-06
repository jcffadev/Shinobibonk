import type { Bonuses, StatKey } from './catalog';
import { NPC_RULES } from './npcs.ts';

/**
 * Buff passivo único que cada shinobi dá ao grupo quando é ajudante (selado na run).
 * Escalam com a força dos buffs de suporte (`allyBuff`: Estandarte da Aliança +40%) e com a AFINIDADE do ajudante.
 * Médicos (Tsunade, Sakura) e Hashirama curam; ofensivos dão o tipo de dano/atributo que usam.
 * Valores são balanceamento provisório.
 */
export type AllyBuff = { title: string; bonuses: Bonuses };

export const ALLY_BUFFS: Record<string, AllyBuff> = {
  naruto: { title: 'Vontade do Fogo', bonuses: { damage: .12 } },
  gaara: { title: 'Escudo de Areia', bonuses: { defense: 10 } },
  madara: { title: 'Pressão Uchiha', bonuses: { crit: .06 } },
  hashirama: { title: 'Células Senju', bonuses: { regen: 1.2 } },
  sasuke: { title: 'Chakra de Raio', bonuses: { element: .15 } },
  sakura: { title: 'Ninjutsu Médico', bonuses: { regen: 1 } },
  kakashi: { title: 'Ritmo de Jonin', bonuses: { attackSpeed: .12 } },
  itachi: { title: 'Ilusão Persistente', bonuses: { status: .12 } },
  minato: { title: 'Passo Relâmpago', bonuses: { move: .12 } },
  tsunade: { title: 'Cura da Hokage', bonuses: { regen: 1.5 } },
  jiraiya: { title: 'Ensinamentos do Sábio', bonuses: { exp: .15 } },
  orochimaru: { title: 'Toxina Serpentina', bonuses: { duration: .25 } },
  lee: { title: 'Fogo da Juventude', bonuses: { normal: .15 } },
  neji: { title: 'Pontos Vitais', bonuses: { critDamage: .3 } },
  hinata: { title: 'Byakugan Protetor', bonuses: { dodge: .06 } },
  shikamaru: { title: 'Plano Nara', bonuses: { cool: .15 } },
  temari: { title: 'Vendaval', bonuses: { area: .12 } },
  tenten: { title: 'Arsenal Extra', bonuses: { projectiles: 1 } },
  pain: { title: 'Corpo dos Seis Caminhos', bonuses: { health: 40 } },
  tobirama: { title: 'Percepção Sensorial', bonuses: { pickupFlat: 1.5 } },
  kankuro: { title: 'Veneno de Marionete', bonuses: { dot: .2 } },
  guy: { title: 'Portões Abertos', bonuses: { normal: .1, move: .06 } },
  // NPC não jogável (evento da Iruka, src/game/npcs.ts): entra já com a passiva em força máxima.
  iruka: { title: 'Lições da Academia', bonuses: { exp: NPC_RULES.irukaAllyExp } },
};

const pct = (v: number) => `${Math.round(v * 1000) / 10}%`.replace('.', ',');
const num = (v: number) => (Math.round(v * 100) / 100).toLocaleString('pt-BR');
const LABEL: Partial<Record<StatKey, (v: number) => string>> = {
  damage: (v) => `+${pct(v)} dano total`,
  defense: (v) => `+${num(v)} armadura`,
  crit: (v) => `+${pct(v)} chance crítica`,
  critDamage: (v) => `+${pct(v)} dano crítico`,
  regen: (v) => `+${num(v)} HP/s de cura`,
  element: (v) => `+${pct(v)} dano de ninjutsu`,
  normal: (v) => `+${pct(v)} dano de taijutsu`,
  attackSpeed: (v) => `+${pct(v)} cadência`,
  projectileSpeed: (v) => `+${pct(v)} velocidade de projétil`,
  bounce: (v) => `+${num(v)} ricochete`,
  sage: () => 'elemento Sábio',
  status: (v) => `+${pct(v)} chance de status`,
  move: (v) => `+${pct(v)} movimento`,
  exp: (v) => `+${pct(v)} XP`,
  duration: (v) => `+${pct(v)} duração de status`,
  dodge: (v) => `+${pct(v)} evasão`,
  cool: (v) => `+${pct(v)} recarga da Ultimate`,
  area: (v) => `+${pct(v)} área`,
  projectiles: (v) => `+${num(v)} projétil`,
  projectileChance: (v) => `+${pct(v)} chance de projétil extra`,
  health: (v) => `+${num(v)} HP máximo`,
  pickupFlat: (v) => `+${num(v)} m de coleta`,
  dot: (v) => `+${pct(v)} veneno`,
};

/**
 * Afinidade do ajudante (pedido do usuário em 06/11/2026: "definição de afinidade para buffs").
 * Cada ajudante acumula pontos enquanto está na equipe: +1 por segundo de missão com ele e +0,2 por abate da equipe.
 * O nível (1 a 5) define quanto da PASSIVA individual está ativo: 40% / 55% / 70% / 85% / 100%.
 * Iruka (NPC) entra já no máximo. Quem entra por substituição começa no Nv. 1. Valores provisórios.
 */
export const AFFINITY_RULES = {
  max: 5,
  /** Pontos mínimos de cada nível (índice 0 = Nv. 1). */
  thresholds: [0, 40, 100, 180, 280],
  /** Fração da passiva ativa em cada nível. */
  factor: [.4, .55, .7, .85, 1],
  perSecond: 1,
  perKill: .2,
};
export const maxAffinityPoints = () => AFFINITY_RULES.thresholds[AFFINITY_RULES.max - 1];
/** Nível de afinidade (1..max) a partir dos pontos acumulados. */
export function affinityLevel(points: number): number {
  let level = 1;
  AFFINITY_RULES.thresholds.forEach((min, i) => { if (points >= min) level = i + 1; });
  return level;
}
export const affinityFactor = (points: number) => AFFINITY_RULES.factor[affinityLevel(points) - 1];
/** Progresso dentro do nível atual (0..1; 1 no máximo). */
export function affinityProgress(points: number): number {
  const level = affinityLevel(points);
  if (level >= AFFINITY_RULES.max) return 1;
  const min = AFFINITY_RULES.thresholds[level - 1], next = AFFINITY_RULES.thresholds[level];
  return Math.max(0, Math.min(1, (points - min) / (next - min)));
}

/**
 * Projéteis fracionários: a parte inteira vira `projectiles`; a fração vira `projectileChance`
 * (chance, por disparo, de +1 projétil). Ex.: 1,5 → +1 projétil e 50% de chance de mais 1.
 */
export function splitProjectiles(out: Bonuses): Bonuses {
  const total = out.projectiles ?? 0;
  if (!total) return out;
  const whole = Math.floor(total + 1e-9), frac = Math.round((total - whole) * 1000) / 1000;
  if (whole) out.projectiles = whole; else delete out.projectiles;
  if (frac > 0) out.projectileChance = (out.projectileChance ?? 0) + frac;
  return out;
}

/**
 * Bônus de um ajudante já multiplicados pela força de suporte e pela afinidade.
 * `affinity` = pontos de afinidade; omitido = afinidade máxima (100% da passiva).
 */
export function allyBuffBonuses(id: string, strength = 1, affinity?: number): Bonuses {
  const out: Bonuses = {}, factor = strength * (affinity === undefined ? 1 : affinityFactor(affinity));
  for (const [key, value] of Object.entries(ALLY_BUFFS[id]?.bonuses ?? {})) out[key as StatKey] = Math.round((value as number) * factor * 1000) / 1000;
  return splitProjectiles(out);
}

/** Soma dos buffs de todos os ajudantes (entra em calculateStats como buff da run). */
export function alliesBonuses(allies: readonly string[], strength = 1, affinity: Record<string, number> = {}): Bonuses {
  const out: Bonuses = {};
  for (const id of allies) for (const [key, value] of Object.entries(allyBuffBonuses(id, strength, affinity[id] ?? maxAffinityPoints()))) out[key as StatKey] = (out[key as StatKey] || 0) + (value as number);
  return out;
}

/** Texto legível de um conjunto de bônus, ex.: "+12% dano total · +10 armadura". */
export function bonusText(bonuses: Bonuses): string {
  return Object.entries(bonuses).map(([key, value]) => LABEL[key as StatKey]?.(value as number) ?? `+${num(value as number)} ${key}`).join(' · ');
}

/** Texto do buff com os valores efetivos, ex.: "+12% dano total". */
export function allyBuffText(id: string, strength = 1, affinity?: number): string {
  return bonusText(allyBuffBonuses(id, strength, affinity));
}
