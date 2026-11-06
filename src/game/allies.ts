import type { Bonuses, StatKey } from './catalog';

/**
 * Buff passivo único que cada shinobi dá ao grupo quando é ajudante (selado na run).
 * Escalam com a força dos buffs de suporte (`allyBuff`: Estandarte da Aliança +40%).
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
  status: (v) => `+${pct(v)} chance de status`,
  move: (v) => `+${pct(v)} movimento`,
  exp: (v) => `+${pct(v)} XP`,
  duration: (v) => `+${pct(v)} duração de status`,
  dodge: (v) => `+${pct(v)} evasão`,
  cool: (v) => `+${pct(v)} recarga da Ultimate`,
  area: (v) => `+${pct(v)} área`,
  projectiles: (v) => `+${num(v)} projétil`,
  health: (v) => `+${num(v)} HP máximo`,
  pickupFlat: (v) => `+${num(v)} m de coleta`,
  dot: (v) => `+${pct(v)} veneno`,
};

/** Bônus de um ajudante já multiplicados pela força de suporte. */
export function allyBuffBonuses(id: string, strength = 1): Bonuses {
  const out: Bonuses = {};
  // Projéteis são inteiros no combate: a força de suporte não cria frações de projétil.
  for (const [key, value] of Object.entries(ALLY_BUFFS[id]?.bonuses ?? {})) out[key as StatKey] = key === 'projectiles' ? Math.floor((value as number) * strength) : (value as number) * strength;
  return out;
}

/** Soma dos buffs de todos os ajudantes (entra em calculateStats como buff da run). */
export function alliesBonuses(allies: readonly string[], strength = 1): Bonuses {
  const out: Bonuses = {};
  for (const id of allies) for (const [key, value] of Object.entries(allyBuffBonuses(id, strength))) out[key as StatKey] = (out[key as StatKey] || 0) + (value as number);
  return out;
}

/** Texto legível de um conjunto de bônus, ex.: "+12% dano total · +10 armadura". */
export function bonusText(bonuses: Bonuses): string {
  return Object.entries(bonuses).map(([key, value]) => LABEL[key as StatKey]?.(value as number) ?? `+${num(value as number)} ${key}`).join(' · ');
}

/** Texto do buff com os valores efetivos, ex.: "+12% dano total". */
export function allyBuffText(id: string, strength = 1): string {
  return bonusText(allyBuffBonuses(id, strength));
}
