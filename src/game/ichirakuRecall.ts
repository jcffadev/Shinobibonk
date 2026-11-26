/**
 * Ichiraku · "Tente lembrar o planejado" (26/11/2026 — pedido do usuário: "No Ichiraku teremos uma opção: 'Tente lembrar o
 * planejado'. Vai dar pra selecionar, faltando habilidades para completar todas as primárias ou esquecermos, vai aparecer um
 * pop-up… Sera uma escolha de 1 a 3 habilidades aleatórias, porém o peso para habilidades planejadas será 50% a mais. Uma vez
 * por zona").
 *
 * - Só abre com espaço livre de técnica (menos técnicas que o limite: 3, ou 4 com a Passiva "Quarta técnica").
 * - Sorteia de 1 a 3 técnicas novas elegíveis, sem repetir; cada técnica planejada pesa `plannedWeight` (×1,5).
 * - Uma vez por zona e sem custo em Ryu. Fechar sem escolher guarda a mesma oferta até o fim da zona.
 */
export const ICHIRAKU_RECALL = { plannedWeight: 1.5, minCards: 1, maxCards: 3 };

/** Quantas técnicas a lembrança mostra (1 a 3, sorteado). */
export function recallCardCount(rng: () => number = Math.random) {
  const { minCards, maxCards } = ICHIRAKU_RECALL;
  return Math.min(maxCards, minCards + Math.floor(rng() * (maxCards - minCards + 1)));
}

/** Sorteio sem repetição; técnicas planejadas pesam `plannedWeight`. */
export function rollRecall<T extends { name: string }>(candidates: readonly T[], planned: readonly string[], rng: () => number = Math.random): T[] {
  const pool = [...candidates], picks: T[] = [], count = Math.min(pool.length, recallCardCount(rng));
  const weight = (t: T) => planned.includes(t.name) ? ICHIRAKU_RECALL.plannedWeight : 1;
  while (picks.length < count) {
    let roll = rng() * pool.reduce((sum, t) => sum + weight(t), 0), index = pool.length - 1;
    for (let i = 0; i < pool.length; i++) { roll -= weight(pool[i]); if (roll < 0) { index = i; break; } }
    picks.push(pool.splice(index, 1)[0]);
  }
  return picks;
}

/** Motivo para a opção ficar indisponível (ou undefined quando pode abrir). */
export function recallBlocked(o: { learned: number; maxSkills: number; usedZone: number; zone: number; candidates: number }) {
  if (o.usedZone === o.zone) return 'Já usada nesta zona.';
  if (o.learned >= o.maxSkills) return 'Todas as técnicas primárias já estão ocupadas.';
  if (o.candidates <= 0) return 'Nenhuma técnica nova disponível no seu nível.';
  return undefined;
}
