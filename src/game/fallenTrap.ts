/**
 * Armadilha do ninja caído (Rodada 96 — pedido do usuário: "Ao clicar nos eventos dos ninjas caídos, na armadilha aumentar
 * 5% de inimigos da partida toda e aparecer 10 inimigos a 10m em redor do nosso personagem").
 * Ao investigar o corpo: +5% de inimigos até o fim da partida (soma em `runBuffs.enemyCount`) e 10 ninjas surgem num anel
 * de 10 m em volta do jogador. Desde 25/11: sempre os 10, 1 deles elite, e vencer dá 1 item (pergaminho grátis).
 */
export const FALLEN_TRAP = { enemies: 10, elites: 1, radius: 10, enemyCount: .05 } as const;
/*
 * 25/11/2026 (pedido do usuário: "armadilha do ninja deitado no chão deveria dar 1 item por matar os ninjas que invoca,
 * além disso não está invocando ninjas · a ideia é invocar 10 ninjas e 1 deles sendo elite"):
 * - os 10 ninjas surgem SEMPRE (antes eram limitados pela vaga até o teto de vivos; com a horda cheia surgiam 0 e a
 *   emboscada nunca terminava);
 * - 1 deles é elite;
 * - vencer a emboscada solta 1 pergaminho de recompensa grátis (1 item) no lugar do +1 nível.
 */
/** O i-ésimo ninja da armadilha é elite? (os primeiros `FALLEN_TRAP.elites`). */
export const trapIsElite = (index: number) => index < FALLEN_TRAP.elites;

/** Pontos do anel em volta de (x, z), igualmente espaçados, começando num ângulo sorteado. */
export function trapRing(x: number, z: number, count: number = FALLEN_TRAP.enemies, radius: number = FALLEN_TRAP.radius, start = 0) {
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const angle = start + i / Math.max(1, count) * Math.PI * 2;
    return { x: x + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius };
  });
}
