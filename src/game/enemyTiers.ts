/**
 * Tipos de inimigo (regra do usuário em 06/11/2026). Valores provisórios; os multiplicadores do debug (tuning.ts)
 * valem como base Genin e as dificuldades seguintes multiplicam por cima (MISSION_TIER).
 * - normal: EXP/Ryu/Chakra normais.
 * - elite (contorno amarelo): não captura, mais forte, mais defesa, sem habilidades; mais Ryu/Chakra/EXP (pelo HP e pela dificuldade).
 * - mega: Mega Elite, pode ser selado como ajudante da run (NÃO libera na conta), muito mais forte e resistente, sem habilidades.
 * - account: "Shinobi para selar": libera o shinobi na CONTA; não dá buff nem EXP nem drops.
 * Guardião (chefe da zona) e Naruto Totem têm regras próprias e mantêm as técnicas de chefe.
 * defense = fração do dano recebido que é bloqueada (0,3 = recebe 70%).
 */
export type EnemyTier = 'normal' | 'elite' | 'mega' | 'account';
export const ENEMY_TIERS: Record<EnemyTier, { hp: number; damage: number; defense: number; speed: number; loot: number }> = {
  normal: { hp: 22, damage: 1, defense: 0, speed: 1, loot: 1 },
  elite: { hp: 95, damage: 1.6, defense: .3, speed: 1.25, loot: 3 },
  mega: { hp: 420, damage: 2.6, defense: .55, speed: .95, loot: 9 },
  account: { hp: 180, damage: 1.5, defense: .25, speed: 1, loot: 0 },
};
/** Chance de um inimigo comum surgir como elite amarelo (× tuning.eliteRate). */
export const ELITE_CHANCE = .08;
export const eliteSpawnChance = (rate = 1, bonus = 0) => Math.min(1, Math.max(0, ELITE_CHANCE * rate * (1 + bonus)));
/** Drops base de um inimigo normal (EXP, Ryu, Chakra) e chances. Elites e mega elites garantem Ryu e Chakra. */
export const BASE_LOOT = { xp: 5, ryu: 3, chakra: 9, ryuChance: .72, chakraChance: .28 }; // Rodada 48 — XP por mob alta (8→5), pedido do usuário; drop por abate segue garantido
/** Peso da dificuldade da missão no tamanho dos drops: tier^0,5 (Genin 1, Chunin 1,18, Jonin 1,38, Kage 1,61). */
export function missionLootFactor(tier: number) { return Math.sqrt(Math.max(1, tier)); }
/**
 * Multiplicador de saque de um tier: base do tier × peso do HP real (HP atual do inimigo ÷ HP de um normal no mesmo momento)^0,35
 * × dificuldade da missão. O expoente baixo faz o HP pesar sem explodir os valores.
 */
export function lootScale(tier: EnemyTier, maxHp: number, normalHp: number, missionTier: number) {
  if (tier === 'account') return 0;
  const hpWeight = tier === 'normal' ? 1 : Math.pow(Math.max(1, maxHp / Math.max(1, normalHp * ENEMY_TIERS[tier].hp / ENEMY_TIERS.normal.hp)), .35);
  return ENEMY_TIERS[tier].loot * hpWeight * missionLootFactor(missionTier);
}

/** Rodada 50 (pedido do usuário: "o primeiro mega-elite nascer com 20K de vida é elevado, deveria ser cerca de 9 a 10 meio aleatório") —
 * base 9.500 com variação aleatória ±5% (9.025–9.975) por nascimento. O tempo total continua contando entre zonas. */
export function megaEliteHp(seconds:number, threatMultiplier:number, rng=Math.random) {
  return Math.round(9500*(1+(rng()-.5)*.1)*2**(Math.max(0,seconds-55)/80)*threatMultiplier);
}

/** 4 a 6 encontros distribuídos ao longo da zona, com variação dentro de cada janela. */
export function rollMegaSchedule(rng=Math.random) {
  const count=4+Math.floor(rng()*3);
  const interval=465/(count-1);
  return Array.from({length:count},(_,index)=>index===0?42+26*rng():52+index*interval+(rng()-.5)*interval*.58);
}

/** Elites ganham a vida completa do tipo após cinco minutos de zona. */
export function eliteHpRamp(tier: EnemyTier, zoneSeconds: number) {
  const initial = tier === 'elite' ? .45 : 1;
  const progress = Math.min(1, Math.max(0, zoneSeconds) / 300);
  return initial + (1 - initial) * progress;
}
