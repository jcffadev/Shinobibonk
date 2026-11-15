export const MAP_SIZE = 160;
export const WORLD_LIMIT = MAP_SIZE / 2 - 4;
export const ZONE_SECONDS = 600;
export const ACTOR_SCALE = .68;
export const ATTACK_SCALE = .7;

/**
 * Escala visual do personagem controlado durante a missão.
 * Rodada 77 (pedido do usuário: "aumente os ninja para ficar do tamanho dos monstros"): era .4 (redução de 50% e depois
 * mais 20%), e o ninja ficava com ~0,63 m de altura visível contra ~1,13 m do monstro comum. Altura visível do ninja =
 * actorVisibleHeight (2,32) × ACTOR_SCALE × PLAYER_SIZE; do monstro comum = 2,0 × ACTOR_SCALE × 0,83 (figura ocupa 83% da
 * célula do atlas de inimigos). Igualando: PLAYER_SIZE = 2,0 × 0,83 / 2,32 ≈ .72.
 */
export const MONSTER_VISIBLE_HEIGHT = 2.0 * .83;
export const PLAYER_SIZE = Math.round(MONSTER_VISIBLE_HEIGHT / 2.32 * 100) / 100;
