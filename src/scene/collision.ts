/**
 * Colisão de movimento com o cenário (11/11/2026). Só bloqueia DESLOCAMENTO: hits, projéteis e áreas de técnica
 * continuam atravessando (invariante do AGENTS.md). Cada sólido é um círculo no plano XZ, na base do sprite.
 * `resolve` empurra o ponto para fora do círculo, o que faz o personagem deslizar pela borda em vez de travar,
 * inclusive andando na diagonal.
 */
export const COLLISION_RULES = {
  enabled: true,
  /** Raio do corpo do jogador e dos inimigos, em metros. */
  playerRadius: .42, enemyRadius: .35,
  /** Raio do tronco/pedra por tipo do atlas de ambiente: árvore, pinheiro, bambu, rocha. */
  scenery: [.5, .42, .55, .85],
  /** Fração da largura do sprite que vira raio da base de uma construção. */
  building: .3,
  /** Folga ao posicionar eventos e coletáveis fora das construções. */
  placementMargin: 2.5,
};
export type Solid = { x: number; z: number; r: number; big: boolean };
type Point = { x: number; z: number };

export function createSolids() {
  const all: Solid[] = [], big: Solid[] = [];
  const push = (list: Solid[], p: Point, radius: number) => {
    let moved = false;
    for (const s of list) {
      const dx = p.x - s.x, dz = p.z - s.z, min = s.r + radius, d2 = dx * dx + dz * dz;
      if (d2 >= min * min) continue;
      const d = Math.sqrt(d2);
      if (d < 1e-4) p.x = s.x + min; else { p.x = s.x + dx / d * min; p.z = s.z + dz / d * min; }
      moved = true;
    }
    return moved;
  };
  return {
    all, big,
    /** `building` também desvia inimigos e afasta eventos e coletáveis. */
    add(x: number, z: number, r: number, building = false) { const s = { x, z, r, big: building }; all.push(s); if (building) big.push(s); },
    /** Jogador: colide com tudo. Duas passadas resolvem cantos entre dois sólidos vizinhos. */
    resolve(p: Point, radius = COLLISION_RULES.playerRadius) { if (!COLLISION_RULES.enabled) return false; const moved = push(all, p, radius); if (moved) push(all, p, radius); return moved; },
    /** Inimigos: só contornam construções (poucos sólidos; barato com milhares de inimigos). */
    resolveBig(p: Point, radius = COLLISION_RULES.enemyRadius) { return COLLISION_RULES.enabled && push(big, p, radius); },
    /** O ponto está fora de todas as construções, com folga? */
    isFree(x: number, z: number, margin = COLLISION_RULES.placementMargin) { return big.every(s => Math.hypot(x - s.x, z - s.z) > s.r + margin); },
    /** Devolve o ponto mais próximo fora das construções. */
    freeSpot(x: number, z: number, margin = 1) { const p = { x, z }; push(big, p, margin); push(big, p, margin); return p; },
  };
}
