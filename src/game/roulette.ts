import { ITEM_BY_NAME, type Bonuses, type StatKey } from './catalog.ts';
import type { Difficulty } from './progression.ts';

/**
 * Caça-Níquel da Tsunade ("Lendária Perdedora"): evento de RNG com casas boas e ruins + 5 combos de 3 iguais
 * (rodada 37, 12/11: renomeado de "Roleta da Tsunade"). Regras puras (sem Three.js) para a simulação, a UI e o
 * verify-rules usarem os mesmos números. Valores são balanceamento provisório.
 */
export type RouletteKind = 'bom' | 'ruim' | 'neutro';
export type RouletteCasaId = 'kunai' | 'shuriken' | 'pill' | 'ryu' | 'buff' | 'item' | 'jackpot' | 'lose' | 'debuff' | 'ambush' | 'empty' | 'tsunade' | 'jiraiya' | 'hiruzen' | 'hidan' | 'kakuzu';
export type RouletteCasa = { id: SlotComboId; label: string; icon: string; kind: RouletteKind; weight: number; premium?: boolean; description: string };

/** Cinco casas em todos os giros novos. IDs antigos continuam válidos apenas nos prêmios já salvos. */
export const ROULETTE_CASAS: RouletteCasa[] = [
  { id: 'tsunade', label: 'Tsunade', icon: '👑', kind: 'bom', weight: .9, premium: true, description: 'Combo 3 Tsunades → "Sorte da Tsunade": +10% de dificuldade e +10% de monstros até o fim da run (mais XP e Ryu).' },
  { id: 'hiruzen', label: 'Hiruzen', icon: '🏮', kind: 'bom', weight: 1.2, premium: true, description: 'Combo 3 Hiruzens → 4 escolhas de item ao sair (E pega · V vende).' },
  { id: 'kakuzu', label: 'Kakuzu', icon: '💰', kind: 'bom', weight: .7, premium: true, description: 'Combo 3 Kakuzus → bônus de Ryu condicionado à sua Sorte e à dificuldade do jogo.' },
  { id: 'jiraiya', label: 'Jiraiya', icon: '📖', kind: 'bom', weight: .9, premium: true, description: 'Combo 3 Jirayas → 1 item Raro ou superior ao sair.' },
  { id: 'hidan', label: 'Hidan', icon: '🦇', kind: 'ruim', weight: 6, description: 'Combo 3 Hidan → −5% do HP total (não mata) e +5% de dificuldade/monstros até o fim da run.' },
];
export const ROULETTE_BY_ID = Object.fromEntries(ROULETTE_CASAS.map(c => [c.id, c])) as Record<SlotComboId, RouletteCasa>;

/**
 * Fórmula (documentada aqui e usada em toda parte):
 * - fatorSorte = 1 + min(luckCap, max(0, sorte) / luckDivisor). Casas boas × fatorSorte; casas premium × fatorSorte².
 * - pressão = (curse − 1) × curseWeight + (zona − 1) × zoneWeight + missionWeight[dificuldade]. Casas ruins × (1 + pressão).
 * - Depois de normalizar as cinco casas, a chance de Hidan fica em [minBad, maxBad].
 *   A tabela exibe as mesmas probabilidades do sorteio.
 * Custo (26/11/2026 — usuário: "Vamos considerar 20% do valor de acréscimo na roleta da Tsunade e não colocar 15% por minuto, nem 25% por zona, sempre subirá 20%. O mesmo para kunais/pergaminhos"): round(baseCost × costGrowth^(giros na run) × (1 − min(maxDiscount, desconto))). Sem inflação por minuto nem por zona.
 * Não reseta por zona.
 */
export const ROULETTE_RULES = {
  baseCost: 30,
  /** +20% por giro na run: 30, 36, 43, 52, 62, ... (26/11/2026; era ×1,70 por giro, mais inflação por minuto e +25% por zona). */
  costGrowth: 1.2,
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
/**
 * Rodada 74 (pedido: "Ajuste as imagens do caça-níquel de acordo com a roleta e os personagens que rodam com as regras"):
 * cada casa de combo mostra o retrato do PRÓPRIO personagem jogável (HeroPortrait), a mesma imagem do elenco.
 * Antes Hiruzen, Hidan e Kakuzu apareciam como emoji e Tsunade/Jiraiya vinham de recortes fixos do atlas.
 */
export const SLOT_HEROES: Record<SlotComboId, string> = { tsunade: 'tsunade', jiraiya: 'jiraiya', hiruzen: 'hiruzen', hidan: 'hidan', kakuzu: 'kakuzu' };
/** Bônus de Ryu do combo 3 Kakuzus (sorte + dificuldade/pressão do jogo). */
export function slotKakuzuRyu(luck: number, pressure: number) {
  return Math.round(SLOT_COMBOS.kakuzu.ryuBase * luckFactor(luck) * (1 + Math.max(0, pressure)));
}

export function roulettePressure(curse: number, zone: number, mission: Difficulty) {
  return Math.max(0, curse - 1) * ROULETTE_RULES.curseWeight + Math.max(0, zone - 1) * ROULETTE_RULES.zoneWeight + (ROULETTE_RULES.missionWeight[mission] ?? 0);
}
export function luckFactor(luck: number) { return 1 + Math.min(ROULETTE_RULES.luckCap, Math.max(0, luck) / ROULETTE_RULES.luckDivisor); }

/** Probabilidade (0–1) de cada casa para a sorte e a pressão de dificuldade atuais. */
export function rouletteWeights(luck: number, pressure: number): Record<SlotComboId, number> {
  const f = luckFactor(luck), raw: Record<string, number> = {};
  for (const c of ROULETTE_CASAS) raw[c.id] = c.kind === 'bom' ? c.weight * f * (c.premium ? f : 1) : c.weight * (1 + Math.max(0, pressure));
  const total = Object.values(raw).reduce((a, b) => a + b, 0);
  const out: Record<string, number> = {};
  for (const id of Object.keys(raw)) out[id] = raw[id] / total;
  const bad = ROULETTE_CASAS.filter(c => c.kind === 'ruim').reduce((s, c) => s + out[c.id], 0);
  const target = Math.min(ROULETTE_RULES.maxBad, Math.max(ROULETTE_RULES.minBad, bad));
  if (Math.abs(target - bad) > 1e-12 && bad > 0) {
    const rest = 1 - bad, scaleBad = target / bad, scaleRest = (1 - target) / rest;
    for (const c of ROULETTE_CASAS) out[c.id] *= c.kind === 'ruim' ? scaleBad : scaleRest;
  }
  return out as Record<SlotComboId, number>;
}
export function badChance(w: Record<SlotComboId, number>) { return w.hidan; }
export function goodChance(w: Record<SlotComboId, number>) { return 1 - badChance(w); }

export function rollRoulette(w: Record<SlotComboId, number>, rng: () => number = Math.random): SlotComboId {
  let roll = rng();
  for (const c of ROULETTE_CASAS) { if (!(w[c.id] > 0)) continue; roll -= w[c.id]; if (roll < 0) return c.id; }
  // Diferenças de arredondamento caem na última casa da tabela.
  return ROULETTE_CASAS[ROULETTE_CASAS.length - 1].id;
}

export function rouletteCost(spins: number, discount: number) {
  return Math.round(ROULETTE_RULES.baseCost * Math.pow(ROULETTE_RULES.costGrowth, Math.max(0, spins)) * (1 - Math.min(ROULETTE_RULES.maxDiscount, Math.max(0, discount))));
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
export type RouletteView = { cost: number; spins: number; sessionSpins: number; sessionSpent: number; ryuSpent: number; discount: number; money: number; luck: number; pressure: number; weights: Record<SlotComboId, number>; pending: RoulettePrize[] };
