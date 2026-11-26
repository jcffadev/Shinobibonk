/**
 * Papel de cada arte da horda (26/11/2026 — pedido do usuário, com a captura do ninja de capuz roxo com kunai: "Esse personagem
 * será ranged apenas").
 *
 * O atlas da horda (public/assets/shinobi-enemy-front-v3.png, com as versões de costas e de lado) tem 4 linhas:
 * 0 = ninja de capuz roxo com kunai · 1 = ninja de cachecol vermelho com lâmina · 2 = ninja do deserto de turbante ·
 * 3 = samurai de máscara com chifres.
 * - A linha 0 é sempre atirador (kunai, shuriken ou fūma) e só ataca à distância.
 * - As linhas 1 a 3 são corpo a corpo e nunca atiram.
 * A proporção de atiradores segue a de antes: 7% dos comuns no começo da zona, subindo até 20% aos 5 min. Elite, desafio e
 * Mega Elite nunca são atiradores, então não usam a arte do atirador.
 */
export const HORDE_ROWS = 4;
export const RANGED_ROW = 0;
export const RANGED_SHARE = { start: .07, extra: .13, rampSeconds: 300 };

export const rangedChance = (zoneSeconds: number) =>
  RANGED_SHARE.start + RANGED_SHARE.extra * Math.min(1, Math.max(0, zoneSeconds) / RANGED_SHARE.rampSeconds);

/** Arte (linha do atlas) e se o inimigo atira. `canShoot` = comum fora de desafio. */
export function hordeLook(canShoot: boolean, zoneSeconds: number, rng: () => number = Math.random) {
  if (canShoot && rng() < rangedChance(zoneSeconds)) return { row: RANGED_ROW, ranged: true };
  return { row: 1 + Math.min(HORDE_ROWS - 2, Math.floor(rng() * (HORDE_ROWS - 1))), ranged: false };
}
