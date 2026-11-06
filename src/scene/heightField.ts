/**
 * Altura do terreno pré-amostrada em grade com interpolação bilinear. groundHeight (terrainArt.ts) soma várias exponenciais
 * e senos; chamado para cada inimigo, drop e projétil a cada quadro, aparecia no perfil com hordas de 1600 inimigos.
 * Erro máximo da interpolação com passo de 0,5 m: ~2 mm (o relevo é suave). Fora da grade usa a função exata.
 */
export function createHeightField(exact: (x: number, z: number) => number, half: number, step = .5) {
  const n = Math.ceil(half * 2 / step) + 1, grid = new Float32Array(n * n);
  for (let iz = 0; iz < n; iz++) for (let ix = 0; ix < n; ix++) grid[iz * n + ix] = exact(-half + ix * step, -half + iz * step);
  const inv = 1 / step, last = n - 1;
  return (x: number, z: number) => {
    const fx = (x + half) * inv, fz = (z + half) * inv;
    if (!(fx >= 0 && fz >= 0 && fx < last && fz < last)) return exact(x, z);
    const ix = fx | 0, iz = fz | 0, tx = fx - ix, tz = fz - iz, i = iz * n + ix;
    const a = grid[i] + (grid[i + 1] - grid[i]) * tx, b = grid[i + n] + (grid[i + n + 1] - grid[i + n]) * tx;
    return a + (b - a) * tz;
  };
}
