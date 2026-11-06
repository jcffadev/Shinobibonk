import type { Bonuses, StatKey } from './catalog';
import { HERO_BY_ID, ORGANIZATIONS } from './heroes.ts';
import { NPC_ALLIES } from './npcs.ts';
import { bonusText, splitProjectiles } from './allies.ts';

/**
 * Combos de equipe por aldeia e por organização (pedido do usuário em 06/11/2026).
 * - Contam SOMENTE os AJUDANTES (o herói jogador fica fora da contagem). NPC ajudante conta pela aldeia dele (Iruka → Folha).
 * - Aldeias: faixa pequena com 2 ajudantes e faixas principais com 3 / 4 / 5. Com 5 de uma vila só o bônus é bem maior,
 *   porque fechar 5 depende do RNG de quais shinobi aparecem como mega elite.
 * - Cada aldeia tem uma FAMÍLIA de atributo própria, inspirada no tema canônico da Narutopedia (naruto.fandom.com):
 *   Nuvem → dano; Folha → projéteis/XP/coleta; Névoa → crítico; Pedra → armadura/HP; Areia → área/armadura;
 *   Som → velocidade de ataque/velocidade de projétil; Chuva → status/duração; Cachoeira → HP/cura; Grama → recarga da Ultimate/evasão.
 * - Regra dura: nenhum combo (aldeia ou organização) dá dano % e projétil juntos (validado em scripts/verify-rules.mjs).
 * - Organizações (Akatsuki, Sannin, Time 7...) seguem a mesma contagem por ajudantes (2+ ativa) e acumulam com a aldeia.
 * - Projétil fracionário vira chance por disparo de +1 projétil (`projectileChance`, ver splitProjectiles em allies.ts).
 * - Os bônus vão direto para o time (não são multiplicados pela força de suporte nem pela afinidade). Valores provisórios.
 */
export type SynergyKind = 'vila' | 'organizacao';
export type ActiveSynergy = {
  id: string; kind: SynergyKind; name: string; tag: string; icon: string;
  /** Ajudantes presentes que contam para o combo (herói nunca entra). */
  members: string[];
  /** Faixa atingida (= nº de ajudantes contados, limitado à maior faixa definida). */
  tier: number;
  /** Faixas existentes (nº de ajudantes) e a próxima faixa, se houver. */
  tiers: number[]; next?: number;
  bonuses: Bonuses; text: string;
};

/** Faixas: nº mínimo de ajudantes → bônus. */
type Tiers = Record<number, Bonuses>;
type SynergyDef = { id: string; kind: SynergyKind; name: string; tag: string; icon: string; theme: string; members: string[]; tiers: Tiers };

/**
 * Combos por aldeia (valores totais da faixa, não somam entre faixas).
 * Fonte do tema: páginas das aldeias na Narutopedia (Konohagakure, Kumogakure, Kirigakure, Iwagakure, Sunagakure,
 * Otogakure, Amegakure, Takigakure, Kusagakure).
 */
export const VILLAGE_COMBOS: Record<string, { tag: string; icon: string; theme: string; tiers: Tiers }> = {
  'Vila da Folha': {
    tag: 'FOLHA', icon: '🍃', theme: 'Maior aldeia, muitos ninjas trabalhando juntos: projéteis, experiência e coleta.',
    tiers: { 2: { exp: .03, pickupFlat: .5 }, 3: { projectiles: 1, exp: .05, pickupFlat: 2 }, 4: { projectiles: 1.5, exp: .05, pickupFlat: 2 }, 5: { projectiles: 2, exp: .1, pickupFlat: 3 } },
  },
  'Vila da Nuvem': {
    tag: 'NUVEM', icon: '⚡', theme: 'País do Relâmpago; aldeia que prioriza o poder militar: dano.',
    tiers: { 2: { damage: .04 }, 3: { damage: .08 }, 4: { damage: .12 }, 5: { damage: .2, attackSpeed: .05 } },
  },
  'Vila da Névoa': {
    tag: 'NÉVOA', icon: '🌫️', theme: 'País da Água; "Névoa Sangrenta", espadachins e caçadores-nin: crítico.',
    tiers: { 2: { crit: .03 }, 3: { crit: .04, critDamage: .15 }, 4: { crit: .06, critDamage: .25 }, 5: { crit: .09, critDamage: .45 } },
  },
  'Vila da Pedra': {
    tag: 'PEDRA', icon: '🪨', theme: 'País da Terra; fortaleza natural e shinobi "duros como rocha": armadura e HP.',
    tiers: { 2: { defense: 3 }, 3: { defense: 5, health: 25 }, 4: { defense: 8, health: 40 }, 5: { defense: 12, health: 70 } },
  },
  'Vila da Areia': {
    tag: 'AREIA', icon: '🏜️', theme: 'País do Vento; deserto como defesa natural e Futon com leques: área e armadura.',
    tiers: { 2: { area: .05 }, 3: { area: .1, defense: 3 }, 4: { area: .14, defense: 5 }, 5: { area: .22, defense: 8 } },
  },
  'Vila do Som': {
    tag: 'SOM', icon: '🎵', theme: 'Rede de laboratórios do Orochimaru; ondas sonoras: velocidade de ataque e velocidade de projétil.',
    tiers: { 2: { attackSpeed: .04 }, 3: { attackSpeed: .07, projectileSpeed: .1 }, 4: { attackSpeed: .1, projectileSpeed: .15 }, 5: { attackSpeed: .15, projectileSpeed: .25 } },
  },
  'Vila da Chuva': {
    tag: 'CHUVA', icon: '🌧️', theme: 'Chuva constante, assassinatos e propensão a genjutsu: chance e duração de status.',
    tiers: { 2: { status: .05 }, 3: { status: .08, duration: .15 }, 4: { status: .11, duration: .2 }, 5: { status: .15, duration: .35 } },
  },
  'Vila da Cachoeira': {
    tag: 'CACHOEIRA', icon: '💧', theme: 'Água do Herói e os corações roubados por Kakuzu: HP e cura.',
    tiers: { 2: { regen: .4 }, 3: { regen: .7, health: 20 }, 4: { regen: 1, health: 35 }, 5: { regen: 1.6, health: 60 } },
  },
  'Vila da Grama': {
    tag: 'GRAMA', icon: '🌿', theme: 'Diplomacia e análise das técnicas alheias; difíceis de ler: recarga da Ultimate e evasão.',
    tiers: { 2: { cool: .06 }, 3: { cool: .1, dodge: .03 }, 4: { cool: .14, dodge: .04 }, 5: { cool: .22, dodge: .06 } },
  },
};

/** Fator das faixas de organização: 2 → ×1, 3 → ×1,6, 4 → ×2,2, 5+ → ×3. */
const ORG_FACTOR: Record<number, number> = { 2: 1, 3: 1.6, 4: 2.2, 5: 3 };
/** Combos por organização/equipe canônica (base com 2 ajudantes). */
export const ORG_COMBOS: Record<string, { tag: string; icon: string; theme: string; base?: Bonuses; tiers?: Tiers }> = {
  akatsuki: { tag: 'AKATSUKI', icon: '☁️', theme: 'Dupla de criminosos rank S: crítico.', base: { crit: .03, critDamage: .1 } },
  sannin: { tag: 'SANNIN', icon: '🐸', theme: 'Os três ninjas lendários: vida e cura.', base: { health: 30, regen: .6 } },
  hokage: { tag: 'HOKAGE', icon: '🔥', theme: 'Líderes da Folha: experiência e área.', base: { exp: .06, area: .05 } },
  time7: { tag: 'TIME 7', icon: '7️⃣', theme: 'Trabalho em equipe do Time Kakashi: dano.', base: { damage: .05 } },
  timeguy: { tag: 'TIME GUY', icon: '💪', theme: 'Juventude e taijutsu: taijutsu e velocidade de ataque.', base: { normal: .1, attackSpeed: .05 } },
  areia: { tag: 'IRMÃOS', icon: '🪶', theme: 'Gaara, Temari e Kankuro juntos: armadura e dano.', tiers: { 2: { defense: 6, damage: .07 }, 3: { defense: 12, damage: .15 } } },
  uchiha: { tag: 'UCHIHA', icon: '👁️', theme: 'Sharingan: crítico.', base: { crit: .03, critDamage: .15 } },
  hyuga: { tag: 'HYUGA', icon: '🤍', theme: 'Byakugan e Punho Gentil: dano crítico e evasão.', base: { critDamage: .12, dodge: .03 } },
  senju: { tag: 'SENJU', icon: '🌳', theme: 'Vitalidade Senju: cura e vida.', base: { regen: .6, health: 20 } },
  uzumaki: { tag: 'UZUMAKI', icon: '🌀', theme: 'Chakra Uzumaki: vida e resistência.', base: { health: 30, defense: 3 } },
  time10: { tag: 'INO-SHIKA-CHŌ', icon: '🦌', theme: 'Formação Ino-Shika-Chō: área e duração de status.', base: { area: .06, duration: .1 } },
  time8: { tag: 'TIME 8', icon: '🐕', theme: 'Equipe de rastreamento: coleta e movimento.', base: { pickupFlat: .8, move: .05 } },
  espadachins: { tag: 'ESPADACHINS', icon: '🗡️', theme: 'Sete Espadachins da Névoa: dano crítico e velocidade de ataque.', base: { critDamage: .2, attackSpeed: .05 } },
};

const round = (v: number) => Math.round(v * 1000) / 1000;
function scaledTiers(base: Bonuses): Tiers {
  const out: Tiers = {};
  for (const [n, f] of Object.entries(ORG_FACTOR)) { const b: Bonuses = {}; for (const [k, v] of Object.entries(base)) b[k as StatKey] = round((v as number) * f); out[Number(n)] = b; }
  return out;
}

/** Aldeia de um ajudante (herói jogável ou NPC). */
export const villageOf = (id: string): string | undefined => HERO_BY_ID[id]?.village ?? NPC_ALLIES[id]?.village;

function definitions(): SynergyDef[] {
  const villages = new Map<string, string[]>();
  for (const id of [...Object.keys(HERO_BY_ID), ...Object.keys(NPC_ALLIES)]) { const v = villageOf(id)!; villages.set(v, [...(villages.get(v) ?? []), id]); }
  for (const v of Object.keys(VILLAGE_COMBOS)) if (!villages.has(v)) villages.set(v, []);
  const out: SynergyDef[] = [];
  for (const [village, members] of villages) {
    const cfg = VILLAGE_COMBOS[village];
    if (!cfg) continue;
    out.push({ id: 'vila:' + village, kind: 'vila', name: village, tag: cfg.tag, icon: cfg.icon, theme: cfg.theme, members, tiers: cfg.tiers });
  }
  for (const org of ORGANIZATIONS) {
    const cfg = ORG_COMBOS[org.id];
    if (!cfg) continue;
    out.push({ id: 'org:' + org.id, kind: 'organizacao', name: org.name, tag: cfg.tag, icon: cfg.icon, theme: cfg.theme, members: org.members, tiers: cfg.tiers ?? scaledTiers(cfg.base ?? {}) });
  }
  return out;
}
let cached: SynergyDef[] | null = null;
export const synergyDefinitions = () => (cached ??= definitions());

/** Faixa atingida com `count` ajudantes (maior faixa ≤ count), ou undefined se nenhuma. */
function tierFor(def: SynergyDef, count: number): number | undefined {
  return Object.keys(def.tiers).map(Number).filter((n) => n <= count).sort((a, b) => b - a)[0];
}

/** Sinergias ativas: contam só os ajudantes (heroId fica fora). Aldeias primeiro. */
export function activeSynergies(_heroId: string, allies: readonly string[]): ActiveSynergy[] {
  // O jogador fica fora, mas um ajudante recrutado do mesmo shinobi ocupa uma vaga real.
  const team = new Set(allies);
  const out: ActiveSynergy[] = [];
  for (const def of synergyDefinitions()) {
    const members = def.members.filter((id) => team.has(id));
    const tier = tierFor(def, members.length);
    if (tier === undefined) continue;
    const tiers = Object.keys(def.tiers).map(Number).sort((a, b) => a - b);
    const bonuses = splitProjectiles({ ...def.tiers[tier] });
    out.push({ id: def.id, kind: def.kind, name: def.name, tag: def.tag, icon: def.icon, members, tier, tiers, next: tiers.find((n) => n > tier), bonuses, text: bonusText(bonuses) });
  }
  return out;
}

/** Soma dos bônus de todas as sinergias ativas (entra em calculateStats como buff da run). */
export function synergyBonuses(list: readonly ActiveSynergy[]): Bonuses {
  const out: Bonuses = {};
  for (const s of list) for (const [key, value] of Object.entries(s.bonuses)) out[key as StatKey] = round((out[key as StatKey] || 0) + (value as number));
  return out;
}

/** Sinergias ativas para as quais um shinobi está contribuindo. */
export function synergiesOf(id: string, list: readonly ActiveSynergy[]): ActiveSynergy[] {
  return list.filter((s) => s.members.includes(id));
}

/** Texto de uma faixa qualquer (tooltips/tabelas). */
export function tierText(def: SynergyDef, tier: number): string {
  return bonusText(splitProjectiles({ ...def.tiers[tier] }));
}
