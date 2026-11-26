/**
 * Qualidade pela Sorte (26/11/2026 — usuário: "A qualidade dos buffs dos altares/npcs/hagoromo também são influenciados pela
 * sorte. Não sei se hoje isso esta sendo considerado").
 *
 * Uma régua só para os buffs de evento: 0 com Sorte 10 ou menos e 1 com Sorte 70, a mesma faixa do altar
 * (`altarLuckMultiplier`: +2% por ponto acima de 10, teto +120% em Sorte 70). Onde entra:
 * - Treinamento do Hagoromo: puxa a raridade do treino e das ferramentas oferecidas (`quality` de hagoromoTraining.ts);
 * - Ebisu e lição rápida do Iruka: o valor sorteado entre o mínimo e o máximo tende ao máximo (`skewedRoll`).
 * Cartas de nível, Mercador e Caça-Níquel já usavam a Sorte pelas regras próprias; o altar continua com o multiplicador dele.
 */
export const LUCK_QUALITY = { from: 10, to: 70 };

export function luckQuality(luck: number) {
  return Math.max(0, Math.min(1, (luck - LUCK_QUALITY.from) / (LUCK_QUALITY.to - LUCK_QUALITY.from)));
}

/** Sorteio de 0 a 1 que tende a 1 com a qualidade: média 0,5 sem Sorte e 0,75 com qualidade 1. */
export function skewedRoll(rng: () => number, quality = 0) {
  return Math.pow(rng(), 1 / (1 + 2 * Math.max(0, Math.min(1, quality))));
}
