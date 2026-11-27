import { boxExit, foundationBlocks, foundationDistance, foundationNormal, type Foundation } from './villageCollision.ts';

/**
 * Colisão de movimento com o cenário (11/11/2026). Só bloqueia DESLOCAMENTO: hits, projéteis e áreas de técnica
 * continuam atravessando (invariante do AGENTS.md). Cada sólido é um círculo no plano XZ, na base do sprite.
 * `resolve` empurra o ponto para fora do círculo, o que faz o personagem deslizar pela borda em vez de travar,
 * inclusive andando na diagonal.
 */
export const COLLISION_RULES = {
  enabled: true,
  /**
   * Raio do corpo do jogador e dos inimigos, em metros. Rodada 70 (pedido do usuário: "Verifique ainda as paredes
   * invisíveis e os blocks invisíveis no caminhar do personagem"): o jogador foi reduzido a 40% (PLAYER_SIZE; desde a rodada 77 é ~72%, do tamanho do monstro comum), mas o
   * corpo continuava com 0,42 m — quase o dobro do desenho (~0,45 m de largura). Agora 0,42 × 0,4 ≈ 0,17 m.
   */
  playerRadius: .17, enemyRadius: .35,
  /**
   * Raio do tronco/pedra por tipo do atlas de ambiente: árvore, pinheiro, bambu, rocha. Rodada 70: medidos no próprio
   * desenho (environment-v2.png na escala do jogo) — tronco da árvore ≈ 0,57 m de largura, touceira do bambu ≈ 1,2 m,
   * rocha ≈ 1,8 m. Antes a árvore tinha 0,5 m de raio (o dobro do tronco).
   */
  scenery: [.3, .25, .55, .85],
  /** Rodada 70: folga (m) entre uma construção e a árvore/rocha mais próxima; as que ficariam escondidas são removidas. */
  sceneryClearance: 1,
  /** Fração da largura do sprite que vira raio da base de uma construção. */
  building: .18,
  buildingMaxRadius: 3,
  /** Folga ao posicionar eventos e coletáveis fora das construções. */
  placementMargin: 2.5,
  /**
   * Degrau que o inimigo sobe sem travar (m). 27/11/2026 — usuário: "monstros ainda conseguindo passaar dentro dessa escadaria...
   * não deve ser possivel eles entrarem dentro dela, só passar por cima ou do lado": degrau mais alto que os pés + isto é parede.
   */
  enemyStepUp: .3,
};
export type Solid = Foundation & { big: boolean; stair?: boolean };
type Point = { x: number; z: number };

export function createSolids() {
  const all: Solid[] = [], big: Solid[] = [], stairs: Solid[] = [];
  const cells=new Map<number,Solid[]>(),stairCells=new Map<number,Solid[]>();
  const cellSize=8,indexMargin=.75;
  const key=(x:number,z:number)=>x+1024*z;
  const positionKey=(p:Point)=>key(Math.floor(p.x/cellSize),Math.floor(p.z/cellSize));
  const push = (list: Solid[], p: Point, radius: number, elevation = -Infinity) => {
    let moved = false;
    for (const s of list) {
      if (elevation!==-Infinity&&!foundationBlocks(s,elevation)) continue;
      if (s.halfZ!==undefined) {
        const distance=foundationDistance(p.x,p.z,s);
        if(distance<radius) {
          const normal=foundationNormal(p,s);
          p.x+=normal.x*(radius-distance+.001);
          p.z+=normal.z*(radius-distance+.001);
          moved=true;
        }
        continue;
      }
      const dx = p.x - s.x, dz = p.z - s.z, min = s.r + radius, d2 = dx * dx + dz * dz;
      if (d2 >= min * min) continue;
      const d = Math.sqrt(d2);
      if (d < 1e-4) p.x = s.x + min; else { p.x = s.x + dx / d * min; p.z = s.z + dz / d * min; }
      moved = true;
    }
    return moved;
  };
  function add(x: number, z: number, r: number, building = false, top?:number, bottom?:number, halfZ?:number) {
    const solid:Solid = { x, z, r, big: building, top, bottom, halfZ };
    all.push(solid);
    if (building) {
      big.push(solid);
      const xPad=r+indexMargin,zPad=(halfZ??r)+indexMargin;
      for(let iz=Math.floor((z-zPad)/cellSize);iz<=Math.floor((z+zPad)/cellSize);iz++){
        for(let ix=Math.floor((x-xPad)/cellSize);ix<=Math.floor((x+xPad)/cellSize);ix++){
          const id=key(ix,iz),bucket=cells.get(id);
          if(bucket)bucket.push(solid);
          else cells.set(id,[solid]);
        }
      }
    }
    return solid;
  }
  /**
   * Rodada 70: árvores e rochas são espalhadas antes das construções e podiam nascer atrás de uma casa ou de um
   * monumento — escondidas pelo desenho, mas bloqueando o caminho ("parede invisível"). Remove os sólidos pequenos que
   * encostam numa construção (com `margin` de folga) e avisa quem desenhou cada um para tirar o sprite também.
   */
  function prune(margin: number, onRemove: (solid: Solid) => void) {
    let removed = 0;
    for (let i = all.length - 1; i >= 0; i--) {
      const s = all[i];
      if (s.big||s.stair) continue;
      if (big.some(b => foundationDistance(s.x,s.z,b)<s.r+margin)) { all.splice(i, 1); onRemove(s); removed++; }
    }
    return removed;
  }
  return {
    all, big,
    /** `building` também desvia inimigos e afasta eventos e coletáveis. */
    add, prune,
    addStair(x:number,z:number,halfX:number,halfZ:number,top:number) {
      const stair=add(x,z,halfX,false,top,undefined,halfZ);
      stair.stair=true;stairs.push(stair);
      const xPad=halfX+indexMargin,zPad=halfZ+indexMargin;
      for(let iz=Math.floor((z-zPad)/cellSize);iz<=Math.floor((z+zPad)/cellSize);iz++)
        for(let ix=Math.floor((x-xPad)/cellSize);ix<=Math.floor((x+xPad)/cellSize);ix++){const id=key(ix,iz),bucket=stairCells.get(id);if(bucket)bucket.push(stair);else stairCells.set(id,[stair]);}
    },
    /**
     * Inimigos e degraus (27/11/2026): o degrau bloqueia quando o topo está acima dos pés + `enemyStepUp` — o monstro sobe a
     * escada pelos degraus ou contorna pelo lado, mas não atravessa a parede. Grade espacial própria (8 m) para a horda grande.
     */
    /** Altura do degrau sob o inimigo que ele alcança a partir dos pés (sobe um degrau por vez), ou -Infinity. */
    enemyStairTop(x:number,z:number,foot:number){
      if(!stairs.length)return -Infinity;
      const nearby=stairCells.get(key(Math.floor(x/cellSize),Math.floor(z/cellSize)));if(!nearby)return -Infinity;
      let height=-Infinity;
      for(const s of nearby)if(s.top!<=foot+COLLISION_RULES.enemyStepUp&&foundationDistance(x,z,s)<=0)height=Math.max(height,s.top!);
      return height;
    },
    resolveStairs(p:Point,foot:number,radius=COLLISION_RULES.enemyRadius){
      if(!COLLISION_RULES.enabled||!stairs.length)return false;
      const nearby=stairCells.get(positionKey(p));if(!nearby)return false;
      const walls=nearby.filter(s=>s.top!>foot+COLLISION_RULES.enemyStepUp);
      const overlaps=(x:number,z:number)=>walls.some(w=>foundationDistance(x,z,w)<radius-1e-6);
      if(!overlaps(p.x,p.z))return false;
      // Encostou por fora: sai pelo lado de menor penetração de cada degrau (desliza pela parede).
      for(const w of walls){const dx=p.x-w.x,dz=p.z-w.z,hz=w.halfZ??w.r,penX=w.r+radius-Math.abs(dx),penZ=hz+radius-Math.abs(dz);
        if(penX<=0||penZ<=0||foundationDistance(p.x,p.z,w)>=radius)continue;
        if(penX<penZ)p.x+=(dx>=0?1:-1)*(penX+.001);else p.z+=(dz>=0?1:-1)*(penZ+.001);}
      if(!overlaps(p.x,p.z))return true;
      // Ainda dentro (ex.: empurrado para o meio da escada): sai pelo caminho livre mais curto nas 4 direções.
      let best:{d:number;ux:number;uz:number}|undefined;
      for(const [ux,uz] of [[1,0],[-1,0],[0,1],[0,-1]] as const)for(let d=.25;d<=12;d+=.25)if(!overlaps(p.x+ux*d,p.z+uz*d)){if(!best||d<best.d)best={d,ux,uz};break;}
      if(best){p.x+=best.ux*best.d;p.z+=best.uz*best.d;}
      return true;
    },
    stairTop(x:number,z:number,from:number) {
      let height=-Infinity;
      for(const stair of stairs) {
        if(stair.top!<=from+.205&&foundationDistance(x,z,stair)<COLLISION_RULES.playerRadius)
          height=Math.max(height,stair.top!);
      }
      return height;
    },
    addBox(x:number,z:number,halfX:number,halfZ:number,top:number) {return add(x,z,halfX,true,top,undefined,halfZ);},
    addBuilding(x: number, z: number, width: number) {
      add(x, z, Math.min(COLLISION_RULES.buildingMaxRadius, width * COLLISION_RULES.building), true);
    },
    /** Jogador: colide com tudo. Duas passadas resolvem cantos entre dois sólidos vizinhos. */
    resolve(p: Point, radius = COLLISION_RULES.playerRadius, elevation = -Infinity) { if (!COLLISION_RULES.enabled) return false; const moved = push(all, p, radius,elevation); if (moved) push(all, p, radius,elevation); return moved; },
    /**
     * Rodada 70 (pedido do usuário: "Precisamos andar livre, o máximo que pode ter é travar ao esbarrar, mas ao dar dash
     * conseguir passar"): o dash atravessa árvores, rochas e construções. Se terminar por dentro de um sólido, sai pelo
     * lado para onde ia (dir), nunca de volta para trás.
     */
    exitAlong(p: Point, dir: Point, radius = COLLISION_RULES.playerRadius, elevation = -Infinity) {
      if (!COLLISION_RULES.enabled) return false;
      const len = Math.hypot(dir.x, dir.z);
      if (len < 1e-6) return false;
      const ux = dir.x / len, uz = dir.z / len;
      let moved = false;
      for (let pass = 0; pass < 4; pass++) {
        const s = all.find(o => (elevation===-Infinity||foundationBlocks(o,elevation))&&foundationDistance(p.x,p.z,o)<radius-1e-6);
        if (!s) break;
        if(s.halfZ!==undefined) {
          const t=boxExit(p,s,radius,ux,uz)+.001;
          p.x+=ux*t;p.z+=uz*t;moved=true;
          continue;
        }
        const dx = p.x - s.x, dz = p.z - s.z, min = s.r + radius, b = dx * ux + dz * uz;
        const t = -b + Math.sqrt(Math.max(0, b * b - (dx * dx + dz * dz - min * min)));
        p.x += ux * (t + 1e-3); p.z += uz * (t + 1e-3); moved = true;
      }
      return moved;
    },
    /** Inimigos: só contornam construções (poucos sólidos; barato com milhares de inimigos). */
    resolveBig(p: Point, radius = COLLISION_RULES.enemyRadius) {
      if(!COLLISION_RULES.enabled)return false;
      if(radius>indexMargin)return push(big,p,radius);
      const id=positionKey(p),nearby=cells.get(id);
      if(!nearby)return false;
      const moved=push(nearby,p,radius);
      // Empurrões que cruzam uma célula resolvem também o novo vizinho.
      const next=positionKey(p);
      if(moved&&next!==id){
        const nextNearby=cells.get(next);
        if(nextNearby)push(nextNearby,p,radius);
      }
      return moved;
    },
    /** O ponto está fora de todas as construções, com folga? */
    isFree(x:number,z:number,margin=COLLISION_RULES.placementMargin,includeStairs=false) {
      return big.every(s=>foundationDistance(x,z,s)>margin)&&(!includeStairs||stairs.every(s=>foundationDistance(x,z,s)>margin));
    },
    /** Devolve o ponto mais próximo fora das construções. */
    freeSpot(x: number, z: number, margin = 1) { const p = { x, z }; push(big, p, margin); push(big, p, margin); return p; },
    /**
     * Ponto para coletáveis (26/11/2026 — usuário: "As vezes está nascendo pergaminhos dentro das casas, isso não pode ser
     * possível"). O freeSpot empurrava só 1 m e em duas passadas: no meio de casas vizinhas podia cair dentro da outra, e as
     * escadarias não contavam. Aqui o ponto sai das construções E das escadarias com a folga de posicionamento; se ainda não
     * estiver livre, procura em anéis de 2 em 2 m em volta do ponto pedido.
     */
    safeSpot(x: number, z: number, margin = COLLISION_RULES.placementMargin) {
      const free = (px: number, pz: number) => big.every(s => foundationDistance(px, pz, s) > margin) && stairs.every(s => foundationDistance(px, pz, s) > margin);
      const p = { x, z };
      for (let pass = 0; pass < 3; pass++) { push(big, p, margin + .01); push(stairs, p, margin + .01); }
      if (free(p.x, p.z)) return p;
      for (let ring = 1; ring <= 10; ring++) for (let k = 0; k < 12; k++) {
        const a = (k + ring * .5) / 12 * Math.PI * 2, qx = x + Math.cos(a) * ring * 2, qz = z + Math.sin(a) * ring * 2;
        if (free(qx, qz)) return { x: qx, z: qz };
      }
      return p;
    },
  };
}

/**
 * Inimigo encostado numa construção desliza ao longo dela (25/11/2026 — pedido do usuário: elites "presos em construções").
 * `pushed` é a posição depois do empurrão do sólido, `unpushed` a de antes; a parede fica na direção do empurrão. Move `pushed`
 * `step` m ao longo da parede, para o lado que aproxima de `toward`. Devolve true se deslizou.
 */
export function slideAlong(unpushed: Point, pushed: Point, toward: Point, step: number) {
  const nx = pushed.x - unpushed.x, nz = pushed.z - unpushed.z, len = Math.hypot(nx, nz);
  if (len < 1e-5 || step <= 0) return false;
  let tx = -nz / len, tz = nx / len;
  if (tx * (toward.x - pushed.x) + tz * (toward.z - pushed.z) < 0) { tx = -tx; tz = -tz; }
  pushed.x += tx * step; pushed.z += tz * step;
  return true;
}

/**
 * Contorno com memória (27/11/2026 — usuário: "monstros não podem ficar travados nos objetos eles tem que saber contornar").
 * O `slideAlong` escolhe a cada quadro o lado da parede mais perto do alvo; no meio de uma parede comprida (cerca, muro,
 * escadaria) com o jogador bem atrás, esse lado troca de um quadro para o outro e o monstro treme no lugar. Aqui o monstro
 * escolhe um lado na primeira batida e o mantém enquanto continuar encostando (e por `hold` segundos depois), até dar a volta.
 */
export type Detour = { side: 1 | -1; until: number };
export const DETOUR_RULES = { hold: 1.2 };
export function steerAround(unpushed: Point, pushed: Point, toward: Point, step: number, now: number, memory?: Detour): Detour | undefined {
  const nx = pushed.x - unpushed.x, nz = pushed.z - unpushed.z, len = Math.hypot(nx, nz);
  if (len < 1e-5 || step <= 0) return memory;
  const tx = -nz / len, tz = nx / len;
  const side: 1 | -1 = memory && now < memory.until ? memory.side : tx * (toward.x - pushed.x) + tz * (toward.z - pushed.z) < 0 ? -1 : 1;
  pushed.x += tx * side * step; pushed.z += tz * side * step;
  return { side, until: now + DETOUR_RULES.hold };
}
