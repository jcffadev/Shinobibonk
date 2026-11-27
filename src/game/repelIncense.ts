/**
 * Incenso Repelente (27/11/2026 — usuário, sobre o item: "Esse item deveria dar + Ryu +EXP · E quando cair 30% do hp afastar
 * os monstros · Além é claro do que esta ai como buffs").
 * Mantém −8% de inimigos e +6% de movimento por unidade e soma +8% de Ryu e +8% de experiência (catalog.ts). Com o HP em 30% ou
 * menos, uma onda de incenso empurra para longe os monstros em volta; recarrega e pode voltar enquanto o HP seguir baixo.
 * Guardião, Bijū e totem não são empurrados (immovableBoss). Valores PROPOSTOS — ajustar depois de jogar.
 */
export const REPEL_INCENSE = { hpShare: .3, radius: 7, radiusPerStack: 1, push: 6, cooldown: 20 } as const;

/** A onda dispara agora? (tem o item, HP em 30% ou menos, vivo e recarga pronta) */
export const repelDue = (hp: number, maxHp: number, stacks: number, cooldownLeft: number) =>
  stacks > 0 && cooldownLeft <= 0 && hp > 0 && hp <= maxHp * REPEL_INCENSE.hpShare;

/** Raio da onda: 7 m com 1 unidade, +1 m por unidade extra. */
export const repelRadius = (stacks: number) => REPEL_INCENSE.radius + Math.max(0, Math.floor(stacks) - 1) * REPEL_INCENSE.radiusPerStack;

/** Nova posição de um monstro dentro do raio: `push` metros para longe do jogador (no mesmo lugar se estiver em cima dele, sai para +x). */
export function repelPoint(x: number, z: number, px: number, pz: number, push: number = REPEL_INCENSE.push) {
  const dx = x - px, dz = z - pz, d = Math.hypot(dx, dz);
  const ux = d > 1e-6 ? dx / d : 1, uz = d > 1e-6 ? dz / d : 0;
  return { x: x + ux * push, z: z + uz * push };
}
