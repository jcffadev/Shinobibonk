import type { Rarity, StatKey } from './catalog.ts';
import { HERO_BASE, type Stats } from './progression.ts';
import { PILL_BY_NAME, PILL_RARITY_POWER } from './pills.ts';

/**
 * Prévia "atual → novo" das pílulas (cartas de level-up, ficha P, plano de build e barra de pílulas).
 * Lê os atributos finais já calculados (`Stats`) e soma o bônus do próximo nível com as mesmas regras de
 * `calculateStats` (src/game/progression.ts): multiplicadores somam ao bônus, HP respeita o % de HP, regeneração
 * respeita o multiplicador de regeneração, evasão (60%) e chance de status (90%) respeitam o teto.
 * É uma prévia: o bônus aleatório por nível (powerlevel) e bônus condicionais de combate não entram.
 */
export type PillStatLine = { label: string; from: string; to: string };

const num = (value: number, digits = 1) => value.toLocaleString('pt-BR', { maximumFractionDigits: digits });
const pct = (value: number) => num(value * 100) + '%';
const bonusPct = (multiplier: number) => (multiplier >= 1 ? '+' : '') + num((multiplier - 1) * 100) + '%';

type Rule = { label: string; read: (s: Stats) => number; next: (s: Stats, v: number, heroId: string) => number; show: (n: number) => string };
const mult = (label: string, key: keyof Stats): Rule => ({ label, read: s => s[key] as number, next: (s, v) => (s[key] as number) + v, show: bonusPct });

const RULES: Partial<Record<StatKey, Rule>> = {
  normal: mult('Dano de Taijutsu', 'physical'),
  element: mult('Dano de Ninjutsu', 'ninjutsu'),
  attackSpeed: mult('Velocidade de ataque', 'attackSpeed'),
  projectileSpeed: mult('Velocidade de projétil', 'projectileSpeed'),
  area: mult('Área', 'area'),
  duration: mult('Duração', 'duration'),
  exp: mult('Experiência', 'xpGain'),
  gold: mult('Ryu recebido', 'moneyGain'),
  cool: mult('Recarga da Ultimate', 'ultimateRate'),
  defense: { label: 'Armadura', read: s => s.armor, next: (s, v) => s.armor + v, show: n => num(n) },
  health: { label: 'HP máximo', read: s => s.maxHp, next: (s, v) => s.maxHp + Math.round(v * Math.max(.1, 1 + (s.extra.healthPct || 0))), show: n => num(n, 0) },
  move: { label: 'Movimento', read: s => s.moveSpeed, next: (s, v, heroId) => s.moveSpeed + (HERO_BASE[heroId]?.speed ?? 0) * v, show: n => num(n, 2) + ' m/s' },
  projectiles: { label: 'Projéteis', read: s => s.projectiles, next: (s, v) => s.projectiles + v, show: n => num(n) },
  crit: { label: 'Chance crítica', read: s => s.crit, next: (s, v) => s.crit + v, show: pct },
  dodge: { label: 'Evasão', read: s => s.evasion, next: (s, v) => Math.min(.6, s.evasion + v), show: pct },
  status: { label: 'Chance de status', read: s => s.status, next: (s, v) => Math.min(.9, s.status + v), show: pct },
  regen: { label: 'Regeneração', read: s => s.regen, next: (s, v) => s.regen + v * Math.max(0, 1 + (s.extra.regenMult || 0)), show: n => num(n, 2) + ' HP/s' },
  luck: { label: 'Sorte', read: s => s.luck, next: (s, v) => s.luck + v, show: n => num(n) },
  pickupFlat: { label: 'Alcance de coleta', read: s => s.pickup, next: (s, v) => s.pickup + v, show: n => num(n) + ' m' },
  enemyCount: { label: 'Densidade da horda', read: s => s.extra.enemyCount || 0, next: (s, v) => (s.extra.enemyCount || 0) + v, show: n => '+' + pct(n) },
  threat: { label: 'Dificuldade', read: s => s.extra.threat || 0, next: (s, v) => (s.extra.threat || 0) + v, show: n => '+' + pct(n) },
};

/** Níveis efetivos que a próxima carta concede (mesma conta de `pillOfferText`). */
export function pillLevelsGained(name: string, current: number, extraCap = 0, rarity: Rarity = 'Comum'): number {
  const def = PILL_BY_NAME[name];
  if (!def) return 0;
  const after = Math.min(def.max + extraCap, current + 1);
  return Math.max(0, after - current) * PILL_RARITY_POWER[rarity];
}

/** Linhas "atributo: atual → novo" para `levels` níveis da pílula sobre os atributos `stats`. */
export function pillStatPreview(name: string, stats: Stats, heroId: string, levels: number): PillStatLine[] {
  const def = PILL_BY_NAME[name];
  if (!def || levels <= 0) return [];
  return Object.entries(def.perLevel).flatMap(([key, value]) => {
    const rule = RULES[key as StatKey];
    if (!rule || !value) return [];
    const from = rule.read(stats), to = rule.next(stats, value * levels, heroId);
    return [{ label: rule.label, from: rule.show(from), to: rule.show(to) }];
  });
}

/** Texto curto (tooltip): "Chance crítica 5% → 9% · Armadura 12 → 16". */
export const pillStatText = (lines: PillStatLine[]) => lines.map(l => `${l.label} ${l.from} → ${l.to}`).join(' · ');
