import { attackCooldown, NO_GROWTH, techniqueCritical, techniqueHitDamage, techniquePassiveMultiplier, type SkillGrowth } from './combat.ts';
import { finiteBossHp } from './missions.ts';
import type { Element, Technique } from './heroes.ts';
import type { Stats } from './progression.ts';

/**
 * Piso de vida dos chefes pelo poder atual do jogador (25/11/2026 — pedido do usuário: "Precisamos do scale dos portais e
 * das bijus escalem bastante e considerem o nivel atual no nosso personagem na partida para não nascer com a vida baixa
 * demais e morrer com 1 ataque apenas").
 *
 * Na invocação, o Guardião (portal da zona) e a Bijū calculam o dano de alvo único que a build tem naquele instante (nível,
 * itens, pílulas, afixos, crítico esperado, recarga e a defesa do próprio chefe). A vida fica no mínimo em
 * `segundos × esse dano`, mais 33% por plano do Shikamaru. A fórmula da zona (tempo, Final Swarm, dificuldade) continua
 * valendo quando for maior. Ultimate, aliados e procs ficam fora da estimativa: a luta real tende a ser um pouco mais curta.
 */
export const BOSS_POWER = { guardianSeconds: 30, bijuuSeconds: 60, perPlan: .33 };

type DpsStats = Pick<Stats, 'damage' | 'physical' | 'ninjutsu' | 'genjutsu' | 'armor' | 'extra' | 'crit' | 'critDamage' | 'attackSpeed'>;

/** Golpe médio de uma técnica com o crítico esperado e a passiva do personagem (antes da defesa do alvo). */
export function expectedHit(heroId: string, t: Technique, g: SkillGrowth, stats: DpsStats, level: number,
  options: { affinity?: Element; sageInfused?: boolean; healthShare?: number; trained?: boolean } = {}) {
  const c = techniqueCritical(t, level);
  const chance = Math.max(0, stats.crit + c.chance), mult = stats.critDamage + c.damage;
  const critical = chance < 1 ? 1 + chance * (mult - 1) : mult + .5 * Math.min(1, chance - 1);
  const sageInfused = options.sageInfused ?? false;
  return techniqueHitDamage(t, g, stats, { affinity: options.affinity, sageInfused, trained: options.trained })
    * techniquePassiveMultiplier(heroId, t, options.healthShare ?? 1, sageInfused) * critical;
}

/** Dano por segundo contra um alvo com `defense`, somando as técnicas de ataque aprendidas. */
export function singleTargetDps(o: {
  heroId: string; techniques: readonly Technique[]; skillLevels: Record<string, number>; growth: Record<string, SkillGrowth>;
  stats: DpsStats; defense: number; affinity?: Element; sageInfused?: boolean; healthShare?: number; trained?: readonly string[]; multiplier?: number;
}) {
  let sum = 0;
  for (const t of o.techniques) {
    const level = o.skillLevels[t.name];
    if (!level || t.setup || !(t.power > 0)) continue;
    const g = o.growth[t.name] ?? NO_GROWTH;
    sum += expectedHit(o.heroId, t, g, o.stats, level, { affinity: o.affinity, sageInfused: o.sageInfused, healthShare: o.healthShare, trained: o.trained?.includes(t.name) })
      / attackCooldown(t, level, g, o.stats.attackSpeed);
  }
  return Math.max(0, sum * (1 - o.defense) * (o.multiplier ?? 1));
}

/** Vida mínima do chefe para durar `seconds` contra esse dano por segundo, com +33% por plano. */
export function bossPowerFloor(dps: number, seconds: number, plans = 0) {
  return finiteBossHp(Math.round(Math.max(0, dps) * seconds * (1 + BOSS_POWER.perPlan * Math.max(0, plans))));
}

/** Vida final do chefe: a maior entre a fórmula da zona e o piso pelo poder do jogador. */
export const bossHpWithFloor = (formulaHp: number, dps: number, seconds: number, plans = 0) => Math.max(formulaHp, bossPowerFloor(dps, seconds, plans));
