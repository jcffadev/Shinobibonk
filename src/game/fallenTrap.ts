/**
 * Armadilha do ninja caído (Rodada 96 — pedido do usuário: "Ao clicar nos eventos dos ninjas caídos, na armadilha aumentar
 * 5% de inimigos da partida toda e aparecer 10 inimigos a 10m em redor do nosso personagem").
 * Ao investigar o corpo: +5% de inimigos até o fim da partida (soma em `runBuffs.enemyCount`) e 10 ninjas surgem num anel
 * de 10 m em volta do jogador (limitado pelo teto de vivos). Vencer a emboscada continua dando 1 nível.
 */
export const FALLEN_TRAP = { enemies: 10, radius: 10, enemyCount: .05 } as const;

/** Pontos do anel em volta de (x, z), igualmente espaçados, começando num ângulo sorteado. */
export function trapRing(x: number, z: number, count: number = FALLEN_TRAP.enemies, radius: number = FALLEN_TRAP.radius, start = 0) {
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const angle = start + i / Math.max(1, count) * Math.PI * 2;
    return { x: x + Math.cos(angle) * radius, z: z + Math.sin(angle) * radius };
  });
}
