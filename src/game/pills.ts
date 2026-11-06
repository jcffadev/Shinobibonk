import type { Bonuses, StatKey } from './catalog.ts';

// Fonte única das pílulas da run (cartas de level-up, drop rosa, caça-níquel, build e ficha).
// Formato: cada pílula eleva UM atributo por nível, acumulando até PILL_MAX níveis.
// Os bônus são somados em calculateStats a partir de knownPills a cada recálculo (sem buff residual).
// Pílulas nunca concedem Chakra diretamente; a Pílula Hiden apenas acelera a recarga da Ultimate.
// BALANCEAMENTO PROVISÓRIO: valores por nível derivados da referência de formato com ajustes leves.
export const PILL_MAX = 10;

export type PillDef = {
  id: string;
  name: string;
  /** Glifo curto exibido dentro da cápsula (sem assets externos). */
  glyph: string;
  /** Cor da cápsula na barra de pílulas, build e ficha. */
  color: string;
  /** Bônus concedido por nível. */
  perLevel: Bonuses;
  /** Texto de sabor curto do mundo ninja. */
  flavor: string;
  max: number;
};

const pill = (id: string, name: string, glyph: string, color: string, perLevel: Bonuses, flavor: string): PillDef =>
  ({ id, name, glyph, color, perLevel, flavor, max: PILL_MAX });

export const PILLS: PillDef[] = [
  pill('soldado', 'Pílula do Soldado', '兵', '#d9463b', { normal: .10 }, 'Ração de campanha que endurece os golpes corpo a corpo.'),
  pill('elemental', 'Pílula Elemental', '術', '#3f7be0', { element: .10 }, 'Afina a conversão de natureza nas técnicas.'),
  pill('ferro', 'Pílula de Ferro', '鉄', '#8d99a6', { defense: 4 }, 'Fórmula dos ferreiros da Névoa para enrijecer o corpo.'),
  pill('vento', 'Pílula do Vento', '風', '#4fc79a', { move: .06 }, 'Deixa os passos leves como a brisa do deserto.'),
  pill('akimichi', 'Pílula Akimichi', '食', '#e88a2e', { health: 18 }, 'Receita do clã: calorias convertidas em vigor.'),
  pill('clone', 'Pílula do Clone', '分', '#b9b4ff', { projectiles: .5 }, 'A cada 2 níveis, +1 projétil.'),
  pill('relampago', 'Pílula do Relâmpago', '雷', '#e0bd22', { attackSpeed: .08 }, 'Acelera os reflexos de lançamento.'),
  pill('arremesso', 'Pílula do Arremesso', '投', '#4f9fd8', { projectileSpeed: .10 }, 'Projéteis voam mais rápido; golpes e lançamentos saem antes.'),
  pill('falcao', 'Pílula Olho de Falcão', '眼', '#b0303f', { crit: .04 }, 'Foca o olhar nos pontos vitais.'),
  pill('nevoa', 'Pílula da Névoa', '霧', '#7fa8b8', { dodge: .03 }, 'Corpo difuso, difícil de acertar. Evasão limitada a 60%.'),
  pill('genjutsu', 'Pílula Genjutsu', '幻', '#a64ca6', { status: .12 }, 'Ilusões grudam com mais facilidade. Chance de status limitada a 90%.'),
  pill('expansao', 'Pílula da Expansão', '拡', '#ff8f4a', { area: .10 }, 'Espalha a técnica por um raio maior.'),
  pill('persistencia', 'Pílula da Persistência', '久', '#4a9e9e', { duration: .10 }, 'Efeitos e status duram mais.'),
  pill('cura', 'Pílula de Cura', '癒', '#45b552', { regen: .6 }, 'Fórmula médica de campo.'),
  pill('mercador', 'Pílula do Mercador', '銭', '#c99712', { gold: .12 }, 'Faro para Ryu durante a missão.'),
  pill('pergaminho', 'Pílula do Pergaminho', '巻', '#6b8fd6', { exp: .10 }, 'Absorve o aprendizado de cada luta.'),
  pill('fortuna', 'Pílula da Fortuna', '運', '#2fa874', { luck: 5 }, 'Amuleto comestível de boa sorte.'),
  pill('ima', 'Pílula Magnética', '引', '#8fa0bd', { pickupFlat: 1 }, 'Atrai drops de mais longe.'),
  pill('hiden', 'Pílula Hiden', '秘', '#7b5cff', { cool: .08 }, 'Técnica secreta que acelera a recarga da Ultimate. Não concede Chakra.'),
];

export const PILL_BY_NAME: Record<string, PillDef> = Object.fromEntries(PILLS.map(p => [p.name, p]));
export const PILL_NAMES: string[] = PILLS.map(p => p.name);
export const isPill = (name: string) => Boolean(PILL_BY_NAME[name]);

type StatFormat = { label: string; percent: boolean };
const STAT_FORMAT: Partial<Record<StatKey, StatFormat>> = {
  normal: { label: 'dano de Taijutsu', percent: true },
  element: { label: 'dano de Ninjutsu', percent: true },
  damage: { label: 'dano total', percent: true },
  defense: { label: 'armadura', percent: false },
  move: { label: 'movimento', percent: true },
  health: { label: 'HP máximo', percent: false },
  projectiles: { label: 'projéteis', percent: false },
  attackSpeed: { label: 'velocidade de ataque', percent: true },
  projectileSpeed: { label: 'velocidade de projétil', percent: true },
  crit: { label: 'chance crítica', percent: true },
  dodge: { label: 'evasão', percent: true },
  status: { label: 'chance de status', percent: true },
  area: { label: 'área', percent: true },
  duration: { label: 'duração', percent: true },
  regen: { label: 'HP/s de regeneração', percent: false },
  gold: { label: 'Ryu recebido', percent: true },
  exp: { label: 'experiência', percent: true },
  luck: { label: 'sorte', percent: false },
  pickupFlat: { label: 'm de coleta', percent: false },
  cool: { label: 'recarga da Ultimate', percent: true },
};

const num = (value: number) => value.toLocaleString('pt-BR', { maximumFractionDigits: 1 });

/** Texto do efeito acumulado para `levels` níveis (ex.: "+30% dano de Taijutsu"). */
export function pillEffectText(name: string, levels = 1): string {
  const def = PILL_BY_NAME[name];
  if (!def) return '';
  return Object.entries(def.perLevel).map(([key, value]) => {
    const fmt = STAT_FORMAT[key as StatKey] ?? { label: key, percent: false };
    const total = (value || 0) * levels;
    return '+' + (fmt.percent ? num(total * 100) + '%' : num(total)) + ' ' + fmt.label;
  }).join(' · ');
}

/** Descrição de catálogo (build/pool): efeito por nível + limite + sabor. */
export function pillDescription(name: string): string {
  const def = PILL_BY_NAME[name];
  return def ? `${pillEffectText(name, 1)} por nível (máx. ${def.max}). ${def.flavor}` : '';
}

/** Descrição da carta de level-up gerada dos dados. */
export function pillOfferText(name: string, current: number): string {
  const def = PILL_BY_NAME[name];
  if (!def) return '';
  return `${pillEffectText(name, 1)}. Nv. ${current} → ${current + 1} / ${def.max}`;
}

/** Nível efetivo de uma pílula, limitado ao máximo. */
export const pillLevel = (pills: Record<string, number>, name: string) =>
  Math.max(0, Math.min(PILL_BY_NAME[name]?.max ?? 0, pills[name] || 0));

/** Soma os bônus de todas as pílulas conhecidas, recalculado sempre das fontes. */
export function pillBonuses(pills: Record<string, number>): Bonuses {
  const out: Bonuses = {};
  for (const def of PILLS) {
    const n = pillLevel(pills, def.name);
    if (!n) continue;
    for (const [key, value] of Object.entries(def.perLevel)) {
      const k = key as StatKey;
      out[k] = (out[k] || 0) + (value || 0) * n;
    }
  }
  return out;
}

/**
 * Concede `amount` níveis de uma pílula por nome, respeitando o limite.
 * Muta `pills` e retorna true se o nível mudou. Usável por drops, cartas e pelo painel de debug.
 */
export function grantPill(pills: Record<string, number>, name: string, amount = 1, extraCap = 0): boolean {
  const def = PILL_BY_NAME[name];
  if (!def) return false;
  // extraCap: níveis extras de itens (Cabaça de Pílulas: +2, até 12).
  const before = pills[name] || 0, after = Math.max(0, Math.min(def.max + Math.max(0, extraCap), before + amount));
  if (after === before) return false;
  if (after) pills[name] = after; else delete pills[name];
  return true;
}
