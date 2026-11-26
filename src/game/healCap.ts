/**
 * Teto da cura por roubo de vida e por abate (26/11/2026 — pedido do usuário: "30min de final swarm deveria ser 'quase'
 * impossível" → proposta aceita: "Sim, aplicar teto").
 *
 * O roubo de vida cura uma fração do dano causado; no fim de jogo o dano está na casa dos bilhões e qualquer item devolvia
 * por segundo mais que a vida máxima inteira, deixando o jogador imortal contra a horda. Agora roubo de vida e cura por abate
 * dividem uma reserva que enche `perSecond` da vida máxima por segundo e guarda no máximo 1 s disso. Regeneração, bolinhos,
 * Naraka e outras curas não entram no teto.
 */
export const HEAL_CAP = { perSecond: .1 };

/** Enche a reserva com o tempo (até 1 s de cura). */
export const refillHealBudget = (budget: number, maxHp: number, dt: number) =>
  Math.min(maxHp * HEAL_CAP.perSecond, Math.max(0, budget) + maxHp * HEAL_CAP.perSecond * Math.max(0, dt));

/** Quanto da cura pedida passa pela reserva, e quanto sobra nela. */
export function spendHeal(budget: number, amount: number) {
  const heal = Math.max(0, Math.min(budget, amount));
  return { heal, budget: budget - heal };
}
