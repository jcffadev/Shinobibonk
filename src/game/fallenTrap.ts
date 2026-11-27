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

/*
 * 27/11/2026 (usuário: "Shurikens de enboscadas e shinobi no chão / armadilhas ainda estão dando os buffs/recompensa sem
 * aparecer os ninjas a mais de armadilhas"):
 * - a Shuriken Amaldiçoada limitava os ninjas à vaga até o teto de vivos; com a horda cheia surgiam 0 e o +8% vinha de graça.
 *   Agora a emboscada da shuriken sempre invoca os seus ninjas, como o corpo;
 * - os ninjas das duas armadilhas nascem no anel de 10 m fora de casas e escadarias e não são cortados pelo teto de 1.600
 *   do Final Swarm (o corte tira outros comuns no lugar).
 */
/** Ninjas da emboscada da Shuriken Amaldiçoada: 4·√(peso da missão) + 2 por zona depois da 1ª, sem depender da vaga. */
export const CURSED_AMBUSH = { base: 4, perZone: 2 } as const;
export const cursedAmbushCount = (missionTier: number, zone: number) =>
  Math.max(1, Math.round(CURSED_AMBUSH.base * Math.sqrt(Math.max(0, missionTier))) + Math.max(0, zone - 1) * CURSED_AMBUSH.perZone);
