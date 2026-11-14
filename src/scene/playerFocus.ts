type Point = {x: number; y: number; z: number};
type Size = {x: number; y: number};

/** Base ortográfica da câmera: direita, cima e em direção à câmera. */
export function setFocusView(view: Float64Array, matrix: readonly number[]) {
  for (let axis = 0; axis < 3; axis++) {
    for (let part = 0; part < 3; part++) view[axis * 3 + part] = matrix[axis * 4 + part];
  }
}

/** Reduz a opacidade de inimigos próximos cuja silhueta passa em frente ao jogador. */
export function focusOpacity(view: Float64Array, player: Point, playerSize: Size, enemy: Point, enemySize: Size) {
  const x = enemy.x - player.x, y = enemy.y - player.y, z = enemy.z - player.z;
  const depth = view[6] * x + view[7] * y + view[8] * z;
  if (depth < -.05 || depth > Math.max(5, enemySize.y + 2)) return 1;
  const dx = Math.abs(view[0] * x + view[1] * y + view[2] * z);
  const dy = Math.abs(view[3] * x + view[4] * y + view[5] * z);
  const side = dx / Math.max(.01, (playerSize.x + enemySize.x) * .34);
  const height = dy / Math.max(.01, (playerSize.y + enemySize.y) * .40);
  const overlap = 1 - Math.min(1, Math.max(side, height));
  return 1 - .72 * Math.min(1, overlap * 2);
}
