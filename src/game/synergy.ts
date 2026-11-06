import type { Bonuses, StatKey } from './catalog';
import { HERO_BY_ID, ORGANIZATIONS } from './heroes.ts';
import { bonusText } from './allies.ts';

/**
 * Sinergias de equipe por aldeia (`Hero.village`) e por organização (`ORGANIZATIONS`).
 * Equipe = herói jogador + ajudantes selados. Uma sinergia ativa com 2+ membros da equipe,
 * desde que pelo menos 1 deles seja ajudante. Escala em 3 faixas: 2 / 3 / 4+ membros.
 * Um mesmo shinobi acumula a sinergia da aldeia e a de cada organização a que pertence
 * (ex.: Itachi conta para Vila da Folha, Akatsuki e Clã Uchiha).
 * Os bônus vão direto para o time (não são multiplicados pela força de suporte). Valores provisórios.
 */
export type SynergyKind = 'vila' | 'organizacao';
export type ActiveSynergy = {
  id: string; kind: SynergyKind; name: string; tag: string; icon: string;
  /** Membros presentes na equipe (herói incluído, se pertencer). */
  members: string[];
  /** Faixa atingida: 2, 3 ou 4 (= 4 ou mais). */
  tier: number;
  bonuses: Bonuses; text: string;
};

type SynergyDef = { id: string; kind: SynergyKind; name: string; tag: string; icon: string; members: string[]; base: Bonuses; tiers?: Bonuses[] };

/** Fator por faixa de membros: 2 → ×1, 3 → ×1,75, 4+ → ×2,5. */
const TIER_FACTOR = [1, 1.75, 2.5];

/** Bônus por aldeia (menores e genéricos, porque a Folha tem muitos membros). */
const VILLAGE_BASE: Record<string, { tag: string; icon: string; base: Bonuses }> = {
  'Vila da Folha': { tag: 'FOLHA', icon: '🍃', base: { damage: .03 } },
  'Vila da Areia': { tag: 'AREIA', icon: '🏜️', base: { defense: 4 } },
  'Vila do Som': { tag: 'SOM', icon: '🎵', base: { status: .05 } },
  'Vila da Chuva': { tag: 'CHUVA', icon: '🌧️', base: { health: 20 } },
};
const VILLAGE_DEFAULT: Bonuses = { damage: .03 };

/** Bônus temáticos por organização. */
const ORG_BONUS: Record<string, { tag: string; icon: string; base: Bonuses; tiers?: Bonuses[] }> = {
  akatsuki: { tag: 'AKATSUKI', icon: '☁️', base: { damage: .08, crit: .04 } },
  sannin: { tag: 'SANNIN', icon: '🐸', base: { health: 30, regen: .6 } },
  hokage: { tag: 'HOKAGE', icon: '🔥', base: { exp: .08, area: .06 } },
  time7: { tag: 'TIME 7', icon: '7️⃣', base: { damage: .1 } },
  timeguy: { tag: 'TIME GUY', icon: '💪', base: { normal: .1, attackSpeed: .06 } },
  // Substitui a antiga sandSynergy: com os 3 irmãos mantém +12 armadura / +15% dano.
  areia: { tag: 'IRMÃOS', icon: '🪶', base: { defense: 6, damage: .07 }, tiers: [{ defense: 6, damage: .07 }, { defense: 12, damage: .15 }] },
  uchiha: { tag: 'UCHIHA', icon: '👁️', base: { crit: .03, critDamage: .15 } },
  hyuga: { tag: 'HYUGA', icon: '🤍', base: { critDamage: .12, dodge: .03 } },
  senju: { tag: 'SENJU', icon: '🌳', base: { regen: .6, health: 20 } },
};

function definitions(): SynergyDef[] {
  const villages = new Map<string, string[]>();
  for (const hero of Object.values(HERO_BY_ID)) villages.set(hero.village, [...(villages.get(hero.village) ?? []), hero.id]);
  const out: SynergyDef[] = [];
  for (const [village, members] of villages) {
    const cfg = VILLAGE_BASE[village];
    out.push({ id: 'vila:' + village, kind: 'vila', name: village, tag: cfg?.tag ?? village.toUpperCase(), icon: cfg?.icon ?? '🏯', members, base: cfg?.base ?? VILLAGE_DEFAULT });
  }
  for (const org of ORGANIZATIONS) {
    const cfg = ORG_BONUS[org.id];
    out.push({ id: 'org:' + org.id, kind: 'organizacao', name: org.name, tag: cfg?.tag ?? org.name.toUpperCase(), icon: cfg?.icon ?? '⭐', members: org.members, base: cfg?.base ?? { damage: .05 }, tiers: cfg?.tiers });
  }
  return out;
}
let cached: SynergyDef[] | null = null;
const defs = () => (cached ??= definitions());

function scaled(def: SynergyDef, count: number): Bonuses {
  const index = Math.min(count, 4) - 2;
  if (def.tiers) return { ...def.tiers[Math.min(index, def.tiers.length - 1)] };
  const out: Bonuses = {};
  for (const [key, value] of Object.entries(def.base)) out[key as StatKey] = Math.round((value as number) * TIER_FACTOR[index] * 1000) / 1000;
  return out;
}

/** Sinergias ativas da equipe (herói + ajudantes), aldeias primeiro. */
export function activeSynergies(heroId: string, allies: readonly string[]): ActiveSynergy[] {
  const allySet = new Set(allies.filter((id) => id !== heroId));
  const team = new Set([heroId, ...allySet]);
  const out: ActiveSynergy[] = [];
  for (const def of defs()) {
    const members = def.members.filter((id) => team.has(id));
    if (members.length < 2 || !members.some((id) => allySet.has(id))) continue;
    const bonuses = scaled(def, members.length);
    out.push({ id: def.id, kind: def.kind, name: def.name, tag: def.tag, icon: def.icon, members, tier: Math.min(4, members.length), bonuses, text: bonusText(bonuses) });
  }
  return out;
}

/** Soma dos bônus de todas as sinergias ativas (entra em calculateStats como buff da run). */
export function synergyBonuses(list: readonly ActiveSynergy[]): Bonuses {
  const out: Bonuses = {};
  for (const s of list) for (const [key, value] of Object.entries(s.bonuses)) out[key as StatKey] = (out[key as StatKey] || 0) + (value as number);
  return out;
}

/** Sinergias ativas para as quais um shinobi está contribuindo. */
export function synergiesOf(id: string, list: readonly ActiveSynergy[]): ActiveSynergy[] {
  return list.filter((s) => s.members.includes(id));
}
