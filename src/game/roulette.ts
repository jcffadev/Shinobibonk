import { ITEM_BY_NAME, type Bonuses, type StatKey } from './catalog.ts';
import type { Difficulty } from './progression.ts';
import { runInflation } from './itemTrade.ts';

/**
 * Caça-Níquel da Tsunade ("Lendária Perdedora"): evento de RNG com casas boas e ruins + 5 combos de 3 iguais
 * (rodada 37, 12/11: renomeado de "Roleta da Tsunade"). Regras puras (sem Three.js) para a simulação, a UI e o
 * verify-rules usarem os mesmos números. Valores são balanceamento provisório.
 */
export type RouletteKind = 'bom' | 'ruim' | 'neutro';
export type RouletteCasaId = 'kunai' | 'shuriken' | 'pill' | 'ryu' | 'buff' | 'item' | 'jackpot' | 'lose' | 'debuff' | 'ambush' | 'empty' | 'tsunade' | 'jiraiya' | 'hiruzen' | 'hidan' | 'kakuzu';
export type RouletteCasa = { id: RouletteCasaId; label: string; icon: string; kind: RouletteKind; weight: number; premium?: boolean; description: string };

/** Casas na ordem em que aparecem nos rolos (alternando boas/ruins para a animação ficar legível). */
export const ROULETTE_CASAS: RouletteCasa[] = [
  { id: 'kunai', label: 'Kunai', icon: '🗡', kind: 'bom', weight: 6, description: '+1 kunai no contador da missão.' },
  { id: 'lose', label: 'Dívida de jogo', icon: '💸', kind: 'ruim', weight: 12, description: 'Perde Ryu igual ao custo do giro (ao sair).' },
  { id: 'empty', label: 'Casa vazia', icon: '·', kind: 'neutro', weight: 25, description: 'Nada acontece.' },
  { id: 'ryu', label: 'Ryu de volta', icon: '🪙', kind: 'bom', weight: 5, description: 'Recebe o dobro do custo do giro.' },
  { id: 'debuff', label: 'Azar da Lendária Perdedora', icon: '🌧', kind: 'ruim', weight: 10, description: '−10% de dano e −8% de movimento por 45 s.' },
  { id: 'item', label: 'Recompensa de item', icon: '🎁', kind: 'bom', weight: 2.5, premium: true, description: '+1 escolha de item (como uma kunai).' },
  { id: 'shuriken', label: 'Shuriken', icon: '🌀', kind: 'bom', weight: 6, description: '+1 shuriken no contador da missão.' },
  { id: 'ambush', label: 'Credores da Tsunade', icon: '⚔️', kind: 'ruim', weight: 9, description: 'Emboscada leve ao sair do caça-níquel.' },
  { id: 'buff', label: 'Bênção de Tsunade', icon: '✚', kind: 'bom', weight: 4, description: 'Buff temporário de 90 s (dano, velocidade de ataque ou vitalidade).' },
  { id: 'jackpot', label: 'Sorte Grande', icon: '🎰', kind: 'bom', weight: .5, premium: true, description: '+1 escolha de item e o triplo do custo em Ryu.' },
  // ───── Combos de 3 iguais (rodada 37, specs do usuário) — premium (Sorte favorece) ─────
  { id: 'tsunade', label: 'Tsunade', icon: '👑', kind: 'bom', weight: .9, premium: true, description: 'Combo 3 Tsunades → "Sorte da Tsunade": +10% de dificuldade e +10% de monstros até o fim da run (mais XP e Ryu).' },
  { id: 'jiraiya', label: 'Jiraiya', icon: '📖', kind: 'bom', weight: .9, premium: true, description: 'Combo 3 Jirayas → 1 item Raro ou superior ao sair.' },
  { id: 'hiruzen', label: 'Hiruzen', icon: '🏮', kind: 'bom', weight: 1.2, premium: true, description: 'Combo 3 Hiruzens → 4 escolhas de item ao sair (E pega · V vende).' },
  { id: 'hidan', label: 'Hidan', icon: '🦇', kind: 'ruim', weight: 6, description: 'Combo 3 Hidan → −5% do HP total (não mata) e +5% de dificuldade/monstros até o fim da run.' },
  { id: 'kakuzu', label: 'Kakuzu', icon: '💰', kind: 'bom', weight: .7, premium: true, description: 'Combo 3 Kakuzus → bônus de Ryu condicionado à sua Sorte e à dificuldade do jogo.' },
];
export const ROULETTE_BY_ID = Object.fromEntries(ROULETTE_CASAS.map(c => [c.id, c])) as Record<RouletteCasaId, RouletteCasa>;

/**
 * Fórmula (documentada aqui e usada em toda parte):
 * - fatorSorte = 1 + min(luckCap, max(0, sorte) / luckDivisor). Casas boas × fatorSorte; casas premium × fatorSorte².
 * - pressão = (curse − 1) × curseWeight + (zona − 1) × zoneWeight + missionWeight[dificuldade]. Casas ruins × (1 + pressão).
 * - Casa vazia não muda. Depois de normalizar, a soma das casas ruins fica presa em [minBad, maxBad]
 *   (nunca 100% bom; nunca mais de 60% ruim).
 * - Casas indisponíveis (ex.: Pílula quando todas as pílulas elegíveis estão no limite) saem do sorteio ANTES de normalizar:
 *   as porcentagens exibidas são exatamente as usadas no giro.
 * Custo (economia expansiva, rodada 37): round(baseCost × costGrowth^(giros na run) × inflação por minuto de run (itemTrade.ts) × (1 + (zona−1) × zoneCostWeight) × (1 − min(maxDiscount, desconto))).
 * Não reseta por zona.
 */
/**
 * Nerf 2 (pedido do usuário, 06/11/2026: "vem muita coisa boa"): Sorte 0 → boas ≈ 34,9% (antes 48,4%), ruins ≈ 36%, vazia ≈ 29%.
 * Pesos: kunai/shuriken 6, Ryu 5, bênção 4, item 2,5, Sorte Grande 0,5 · dívida 12, azar 10, credores 9 · vazia 25.
 */
export const ROULETTE_RULES = {
  baseCost: 30,
  /** Crescimento exponencial por giro na run: 30, 51, 87, 147, 251, 426, ... (×1,70 por giro — rodada 37: "cobrar mais por rodada, gradualmente, escalando consideravelmente"). */
  costGrowth: 1.7,
  /** Fator de zona (rodada 37): +25% de custo por zona acima da 1 — o giro escala como o Ryu dropado pela zona. */
  zoneCostWeight: .25,
  /** Teto do desconto total (Dente de Ouro + Bolsa Gama-chan). */
  maxDiscount: .4,
  luckDivisor: 100,
  luckCap: 2,
  curseWeight: 2.5,
  zoneWeight: .15,
  missionWeight: { Genin: 0, Chunin: .1, Jonin: .2, Kage: .35 } as Record<Difficulty, number>,
  minBad: .15,
  maxBad: .6,
  buffDuration: 90,
  debuffDuration: 45,
  /** Emboscada leve: inimigos = ambushBase + 2 × zona. */
  ambushBase: 3,
  /** Animação (ms): giro normal, giro rápido e tempo segurando E para entrar no giro rápido. */
  spinMs: 1600,
  fastSpinMs: 280,
  holdMs: 350,
};

export const BLESSINGS: { name: string; bonuses: Bonuses; text: string }[] = [
  { name: 'Bênção de Tsunade · Força', bonuses: { damage: .15 }, text: '+15% de dano' },
  { name: 'Bênção de Tsunade · Ímpeto', bonuses: { attackSpeed: .12 }, text: '+12% de velocidade de ataque' },
  { name: 'Bênção de Tsunade · Vitalidade', bonuses: { regen: 2.5, defense: 6 }, text: '+2,5 HP/s e +6 de armadura' },
];
export const BAD_LUCK = { name: 'Azar da Lendária Perdedora', bonuses: { damage: -.1, move: -.08 } as Bonuses, text: '−10% de dano e −8% de movimento' };

/**
 * Combos de 3 iguais (rodada 37, specs do usuário). Entregues em `closeRoulette()` (GameCanvas):
 * - tsunade/hidan: bônus permanentes da run (runBuffs → threat/enemyCount, como as trocas do Ebisu); Hidan ainda perde 5% do HP máximo (piso 1 HP — não mata).
 * - jiraiya: 1 item Raro/Épico/Lendário · hiruzen: 4 escolhas de item (pega ou vende cada uma).
 * - kakuzu: Ryu = ryuBase × luckFactor × (1 + pressão) — sorte e dificuldade do jogo aumentam o tesouro.
 */
export const SLOT_COMBOS = {
  tsunade: { name: 'Sorte da Tsunade', threat: .1, enemyCount: .1 },
  jiraiya: { name: 'Página da Lenda', minRarity: 'Raro' },
  hiruzen: { name: 'Conselho do Hokage', choices: 4 },
  hidan: { name: 'Sangue do Imortal', hpLoss: .05, threat: .05, enemyCount: .05 },
  kakuzu: { name: 'Tesouro de Kakuzu', ryuBase: 120 },
} as const;
export type SlotComboId = keyof typeof SLOT_COMBOS;
/** Bônus de Ryu do combo 3 Kakuzus (sorte + dificuldade/pressão do jogo). */
export function slotKakuzuRyu(luck: number, pressure: number) {
  return Math.round(SLOT_COMBOS.kakuzu.ryuBase * luckFactor(luck) * (1 + Math.max(0, pressure)));
}

export function roulettePressure(curse: number, zone: number, mission: Difficulty) {
  return Math.max(0, curse - 1) * ROULETTE_RULES.curseWeight + Math.max(0, zone - 1) * ROULETTE_RULES.zoneWeight + (ROULETTE_RULES.missionWeight[mission] ?? 0);
}
export function luckFactor(luck: number) { return 1 + Math.min(ROULETTE_RULES.luckCap, Math.max(0, luck) / ROULETTE_RULES.luckDivisor); }

/** Probabilidade (0–1) de cada casa para a sorte e a pressão de dificuldade atuais. */
export function rouletteWeights(luck: number, pressure: number, exclude: readonly RouletteCasaId[] = []): Record<RouletteCasaId, number> {
  const f = luckFactor(luck), raw: Record<string, number> = { pill: 0 };
  for (const c of ROULETTE_CASAS) raw[c.id] = exclude.includes(c.id) ? 0 : c.kind === 'bom' ? c.weight * f * (c.premium ? f : 1) : c.kind === 'ruim' ? c.weight * (1 + Math.max(0, pressure)) : c.weight;
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  for (const id of Object.keys(raw)) out[id] = raw[id] / total;
  const bad = ROULETTE_CASAS.filter(c => c.kind === 'ruim').reduce((s, c) => s + out[c.id], 0);
  const target = Math.min(ROULETTE_RULES.maxBad, Math.max(ROULETTE_RULES.minBad, bad));
  if (Math.abs(target - bad) > 1e-12 && bad > 0) {
    const rest = 1 - bad, scaleBad = target / bad, scaleRest = (1 - target) / rest;
    for (const c of ROULETTE_CASAS) out[c.id] *= c.kind === 'ruim' ? scaleBad : scaleRest;
  }
  return out as Record<RouletteCasaId, number>;
}
export function badChance(w: Record<RouletteCasaId, number>) { return ROULETTE_CASAS.filter(c => c.kind === 'ruim').reduce((s, c) => s + w[c.id], 0); }
export function goodChance(w: Record<RouletteCasaId, number>) { return ROULETTE_CASAS.filter(c => c.kind === 'bom').reduce((s, c) => s + w[c.id], 0); }

export function rollRoulette(w: Record<RouletteCasaId, number>, rng: () => number = Math.random): RouletteCasaId {
  let roll = rng();
  for (const c of ROULETTE_CASAS) { if (!(w[c.id] > 0)) continue; roll -= w[c.id]; if (roll < 0) return c.id; }
  // Arredondamento: última casa com peso > 0 (nunca uma casa excluída).
  return [...ROULETTE_CASAS].reverse().find(c => w[c.id] > 0)?.id ?? 'empty';
}

export function rouletteCost(spins: number, discount: number, runSeconds = 0, zone = 1) {
  const zoneFactor = 1 + Math.max(0, zone - 1) * ROULETTE_RULES.zoneCostWeight;
  return Math.round(ROULETTE_RULES.baseCost * Math.pow(ROULETTE_RULES.costGrowth, Math.max(0, spins)) * runInflation(runSeconds) * zoneFactor * (1 - Math.min(ROULETTE_RULES.maxDiscount, Math.max(0, discount))));
}

/** Gerador determinístico (LCG) para testes com semente. */
export function seededRng(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(1664525, s) + 1013904223) >>> 0) / 4294967296); }

/**
 * Buff por Ryu gasto na run (itens com `spendDamage`/`spendStep`/`spendCap`): +spendDamage de dano a cada `step` Ryu gastos, até `cap`.
 * Recalculado das fontes (itens possuídos + total gasto) a cada refreshStats; não deixa resíduo.
 */
export const SPEND_RULES = { step: 250, cap: .3 };
export function spendBonuses(items: Record<string, number>, spent: number): Bonuses {
  let perStep = 0;
  for (const [name, count] of Object.entries(items)) { const it = ITEM_BY_NAME[name]; const v = it?.bonuses.spendDamage; if (v) perStep += v * Math.min(it.max, Math.max(0, count)); }
  if (perStep <= 0) return {};
  return { damage: Math.min(SPEND_RULES.cap, Math.floor(Math.max(0, spent) / SPEND_RULES.step) * perStep) } as Partial<Record<StatKey, number>>;
}

export type RoulettePrize = { seq: number; id: RouletteCasaId; label: string; icon: string; kind: RouletteKind; detail: string; cost: number; /** Ryu (ryu/lose/jackpot), inimigos (ambush) ou NÍVEIS de pílula (pill). */ amount?: number; pill?: string; item?: string; blessing?: number; /** Raridade sorteada da pílula (define os níveis). */ rarity?: string; /** Casa Pílula com tudo no máximo: +1 nível de Treino (powerlevel). */ training?: boolean };
export type RouletteView = { cost: number; spins: number; sessionSpins: number; sessionSpent: number; ryuSpent: number; discount: number; money: number; luck: number; pressure: number; weights: Record<RouletteCasaId, number>; pending: RoulettePrize[] };
