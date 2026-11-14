import * as THREE from 'three';
import { compactNumber } from '../game/format';
import { BIJUU, BIJUU_BY_ID, BIJUU_BOMB, BIJUU_BACK_SHEETS, beastPhase, bijuuFacesAway, bijuuSheetCell } from '../game/bijuu';
import { HERO_BY_ID, ultimateBase, type Technique } from '../game/heroes';
import { animateTechniqueVisual, techniqueVisual, disposeObject } from './techniqueEffects';

/**
 * Mega elites e guardiões (chefes):
 * - barra de vida 3D com nome acima do sprite;
 * - usam as técnicas do próprio personagem contra o jogador, sempre com aviso vermelho no chão
 *   (a área marcada dá dano quando o aviso enche; sair dela evita o golpe).
 * Números são balanceamento provisório.
 */
export const BOSS_RULES = {
  /** Intervalo entre técnicas por zona (s); guardiões usam 80% disso. */
  cooldownByZone: [3.7, 2.9, 2.3],
  windup: 1.05,
  ultimateWindup: 1.7,
  /** Dano base por técnica, multiplicado pelo poder da técnica, pela ameaça e pela armadura do jogador. */
  baseDamage: 18,
  ultimatePower: 2.6,
  /** Lentidão no jogador quando a técnica tem controle (Sombra, Areia, Madeira, Raio, Genjutsu...). */
  slowSeconds: 1.2,
};

type CastShape = 'circle' | 'cone' | 'line' | 'lineV' | 'ring';
type Cast = { technique: Technique; shape: CastShape; center: THREE.Vector3; dir: THREE.Vector3; range: number; width: number; windup: number; total: number; power: number; marker: THREE.Group; ultimate: boolean };
export type BossState = { name: string; maxHp: number; guardian: boolean; cooldown: number; next: number; ultimateUsed: boolean; cast?: Cast; bar: THREE.Sprite; canvas: HTMLCanvasElement; lastRatio: number; lastCasting: string; hpText?:string; phase?:number; castCount:number; motionTime:number; recoil:number; motionMap?:THREE.Texture; motionRow?:number;
  /** Rodada 55: espelho com histerese, posição anterior (andar = deslocamento real) e quadro exibido (testes). */
  flip?:boolean; lastX?:number; lastZ?:number; walkBlend?:number; pose?:number;
  /** Rodada 58: segundos restantes da entrada (a bijū surge do chão; só visual). */
  arrival?:number;
  /** Rodada 59: folha de costas (quando existir) e a vista atual (true = de costas, andando para longe da câmera). */
  backMap?:THREE.Texture; away?:boolean };
/**
 * Bijū (Rodada 58 — pedido: "Corrigir o aparecimento das bijuus, animação"):
 * - tamanho na tela: as células dos atlas `bijuu/motion-v1-*` são quadradas (256×256), então a largura = altura
 *   (antes 5 × 5,5: esticava 10% na vertical);
 * - entrada: surge do chão em BIJUU_ARRIVAL s (escala e opacidade), sem mudar dano nem tempo de ataque.
 */
export const BIJUU_SIZE = 5.5, BIJUU_ARRIVAL = 1.2;
/** Curva da entrada (0 → 1), suave no fim. */
export function arrivalProgress(remaining:number){const k=1-Math.max(0,Math.min(BIJUU_ARRIVAL,remaining))/BIJUU_ARRIVAL;return 1-(1-k)*(1-k);}
export type BossHost = { sprite: THREE.Sprite; hp: number; heroId?: string; guardian?: boolean; boss?: BossState };

export type BossContext = {
  scene: THREE.Scene;
  player: THREE.Object3D;
  height: (x: number, z: number) => number;
  zone: () => number;
  hidden: () => boolean;
  /** Aplica o golpe no jogador (ameaça, armadura, evasão, invulnerabilidade e god mode ficam com a simulação). */
  hitPlayer: (base: number, slowSeconds: number) => void;
  /** Rodada 55: direita da tela projetada no chão (v2 da câmera). Espelha a bijū pela câmera e não pelo eixo X do mundo. */
  viewRight?: () => THREE.Vector3;
  /** Rodada 59: direção "para dentro da tela" no chão (v1 da câmera). Escolhe a folha de frente ou de costas. */
  viewForward?: () => THREE.Vector3;
  /** Folhas de costas por página (padrão: BIJUU_BACK_SHEETS). Testes injetam a sua. */
  backSheets?: (string | undefined)[];
};

const markerMaterial = () => new THREE.MeshBasicMaterial({ color: '#ff2f4f', transparent: true, opacity: .22, side: THREE.DoubleSide, depthWrite: false });

function drawBar(state: BossState, ratio: number) {
  const ctx = state.canvas.getContext('2d')!;
  const { width: w, height: h } = state.canvas;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#0b0f1c';
  // Nome normal; durante a técnica mostra o golpe com aviso. A fonte encolhe para caber.
  const label = state.lastCasting ? '⚠ ' + state.lastCasting : (state.phase ? 'Bijuu · Fase '+state.phase+' · ' : state.guardian ? 'Guardião · ' : 'Mega Elite · ') + state.name;
  let size = 24; do { ctx.font = `bold ${size}px sans-serif`; size -= 1; } while (size > 12 && ctx.measureText(label).width > w - 12);
  ctx.strokeText(label, w / 2, 24); ctx.fillStyle = state.lastCasting ? '#ffb4c0' : '#ffffff'; ctx.fillText(label, w / 2, 24);
  ctx.fillStyle = '#0b0f1ce6'; ctx.fillRect(8, 34, w - 16, 22);
  ctx.fillStyle = state.guardian ? '#ff7a3d' : '#b46cff'; ctx.fillRect(11, 37, Math.max(0, (w - 22) * ratio), 16);
  ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2; ctx.strokeRect(9, 35, w - 18, 20);
  ctx.font='bold 14px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#111729';ctx.fillStyle='#fff';
  const hp=state.hpText??compactNumber(state.maxHp)+' / '+compactNumber(state.maxHp);
  ctx.strokeText(hp,w/2,50);ctx.fillText(hp,w/2,50);
  (state.bar.material.map as THREE.CanvasTexture).needsUpdate = true;
}

function shapeOf(t: Technique): CastShape {
  if (t.shape === 'Área') return 'circle';
  if (t.shape === 'Cone') return 'cone';
  if (t.shape === 'Em V') return 'lineV';
  if (t.shape === 'Linha' || t.shape === 'Projétil') return 'line';
  if (t.shape === 'Onda' || t.shape === 'Órbita') return 'ring';
  return 'circle'; // Corpo a corpo: círculo em volta do chefe
}

export function createBossCombat(ctx: BossContext) {
  const flat = (geometry: THREE.BufferGeometry) => { const mesh = new THREE.Mesh(geometry, markerMaterial()); mesh.rotation.x = -Math.PI / 2; return mesh; };

  function attach(host: BossHost, maxHp: number, guardian: boolean) {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 60;
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const bar = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
    bar.scale.set(4.2, .8, 1); bar.renderOrder = 10; ctx.scene.add(bar);
    const beast=BIJUU_BY_ID[host.heroId??''];
    const name = beast?.name ?? HERO_BY_ID[host.heroId ?? '']?.name ?? 'Shinobi';
    const zoneIndex = Math.min(2, Math.max(0, ctx.zone() - 1));
    const cooldown = BOSS_RULES.cooldownByZone[zoneIndex] * (guardian ? .8 : 1);
    host.boss = { name, maxHp, guardian, cooldown, next: 2 + Math.random() * 1.5, ultimateUsed: false, bar, canvas, lastRatio: 1, lastCasting: '',phase:beast?beastPhase(host.hp/maxHp):undefined,castCount:0,motionTime:0,recoil:0 };
    if(beast){
      const index=BIJUU.indexOf(beast),map=new THREE.TextureLoader().load('/assets/bijuu/motion-v1-'+(1+Math.floor(index/3))+'.png');
      // Sem mipmaps: num atlas eles misturam os quadros vizinhos e, de longe, aparecem restos de outras poses nas bordas.
      map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;
      map.repeat.set(.25,1/3);map.offset.set(0,(2-index%3)/3);host.boss.motionMap=map;host.boss.motionRow=index%3;
      // Já nasce com a folha de movimento (antes mostrava a arte antiga até a folha carregar e trocava de tamanho na tela).
      host.sprite.material.map=map;host.sprite.material.transparent=true;host.sprite.material.opacity=0;host.sprite.material.needsUpdate=true;
      host.boss.arrival=BIJUU_ARRIVAL;
      // Folha de costas só se o arquivo estiver registrado (nada de 404 enquanto a arte não existe).
      const backPath=(ctx.backSheets??BIJUU_BACK_SHEETS)[bijuuSheetCell(index).page];
      if(backPath){const back=new THREE.TextureLoader().load(backPath);back.colorSpace=THREE.SRGBColorSpace;back.magFilter=THREE.NearestFilter;back.minFilter=THREE.NearestFilter;back.generateMipmaps=false;back.repeat.set(.25,1/3);back.offset.set(0,(2-index%3)/3);host.boss.backMap=back;}
    }
    drawBar(host.boss, 1);
  }

  function clearCast(state: BossState) {
    if (!state.cast) return;
    ctx.scene.remove(state.cast.marker); disposeObject(state.cast.marker); state.cast = undefined;
  }

  function startCast(host: BossHost, state: BossState) {
    const hero = HERO_BY_ID[host.heroId ?? ''];
    const beast=BIJUU_BY_ID[host.heroId??''];
    if (!hero&&!beast) return;
    const origin = host.sprite.position;
    const toPlayer = new THREE.Vector3(ctx.player.position.x - origin.x, 0, ctx.player.position.z - origin.z);
    const dir = toPlayer.lengthSq() > .0001 ? toPlayer.normalize() : new THREE.Vector3(1, 0, 0);
    const lowHp = host.hp / state.maxHp < .5;
    let technique: Technique, shape: CastShape, range: number, width = 1.5, power: number, ultimate = false;
    if(beast){
      const phase=state.phase??1,attackIndex=state.castCount++;
      technique=phase>=2&&attackIndex%(phase===3?3:4)===2?BIJUU_BOMB:beast.attacks[attackIndex%beast.attacks.length];
      shape=shapeOf(technique);range=technique.range*(1+(phase-1)*.12);width=1.5+(phase-1)*.3;power=technique.power*(1+(phase-1)*.16);
    }else if (hero&&state.guardian && lowHp && !state.ultimateUsed) {
      // Ultimate do guardião, uma vez, abaixo de 50% de HP: grande área em volta dele.
      technique = { ...ultimateBase(hero), name: hero.ultimate, setup: undefined, shape: 'Área' };
      shape = 'circle'; range = 5.6; power = BOSS_RULES.ultimatePower; ultimate = true; state.ultimateUsed = true;
    } else if(hero) {
      // Mega elites usam mais técnicas conforme a zona; guardiões usam o kit todo.
      // Técnicas de setup (buff puro) não causam dano e ficam fora do repertório do chefe.
      const available = hero.techniques.slice(0, state.guardian ? 4 : Math.min(4, 1 + ctx.zone())).filter((t) => !t.setup);
      technique = available[state.next % Math.max(1, available.length)] ?? hero.techniques[0];
      state.next = Math.floor(Math.random() * 1000);
      shape = shapeOf(technique); power = technique.power;
      range = shape === 'circle' ? (technique.shape === 'Corpo a corpo' ? 2.6 : 2.4) : shape === 'cone' ? 6 : shape === 'ring' ? (technique.shape === 'Onda' ? 4.4 : 3.2) : 10;
    }
    else return;
    // Círculo de técnica em Área cai sobre a posição atual do jogador; os demais saem do chefe.
    range*=state.phase?1.24:state.guardian?1.22:1.15;
    width*=state.phase?1.28:1.2;
    const center = (shape === 'circle' && !ultimate && technique.shape === 'Área') ? new THREE.Vector3(ctx.player.position.x, 0, ctx.player.position.z) : new THREE.Vector3(origin.x, 0, origin.z);
    const marker = new THREE.Group();
    const y = ctx.height(center.x, center.z) + .22;
    if (shape === 'circle') { const m = flat(new THREE.CircleGeometry(range, 40)); marker.add(m); const edge = flat(new THREE.RingGeometry(range - .12, range, 40)); marker.add(edge); }
    else if (shape === 'ring') { marker.add(flat(new THREE.RingGeometry(Math.max(.6, range - 1.6), range, 40))); }
    else if (shape === 'cone') { const m = flat(new THREE.CircleGeometry(range, 24, -Math.PI / 4.5, Math.PI / 2.25)); m.rotation.z = Math.atan2(-dir.z, dir.x); marker.add(m); } // rotation.x=-90° leva +Y local para -Z do mundo
    else {
      for (const angle of shape === 'lineV' ? [-.28, .28] : [0]) {
        const d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        const m = flat(new THREE.PlaneGeometry(range, width)); m.geometry.translate(range / 2, 0, 0); m.rotation.z = Math.atan2(-d.z, d.x); marker.add(m);
      }
    }
    marker.position.set(center.x, y, center.z); ctx.scene.add(marker);
    const windup = state.phase ? (technique===BIJUU_BOMB?1.45:1.15-(state.phase-1)*.16) : ultimate ? BOSS_RULES.ultimateWindup : BOSS_RULES.windup;
    state.cast = { technique, shape, center, dir, range, width, windup, total: windup, power, marker, ultimate };
    state.lastCasting = (state.phase?'Fase '+state.phase+' · ':'') + technique.name;
  }

  function playerInside(c: Cast) {
    const px = ctx.player.position.x - c.center.x, pz = ctx.player.position.z - c.center.z, d = Math.hypot(px, pz);
    if (c.shape === 'circle') return d <= c.range;
    if (c.shape === 'ring') return d <= c.range && d >= Math.max(.6, c.range - 1.6) - .4; // borda interna tolera o hitbox do jogador
    if (c.shape === 'cone') { if (d > c.range) return false; if (d < .4) return true; return (px * c.dir.x + pz * c.dir.z) / d > Math.cos(Math.PI / 4.5); }
    const dirs = c.shape === 'lineV' ? [-.28, .28] : [0];
    return dirs.some((angle) => { const v = c.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), angle); const along = px * v.x + pz * v.z, cross = Math.abs(px * v.z - pz * v.x); return along >= 0 && along <= c.range && cross <= c.width / 2 + .3; });
  }

  function fire(host: BossHost, state: BossState) {
    const c = state.cast!;
    state.recoil=1;
    if (playerInside(c)) {
      const t = c.technique, controls = t.slow || t.status === 'Lentidão' || t.status === 'Paralisar' || t.status === 'Atordoar' || t.status === 'Dormir';
      ctx.hitPlayer(BOSS_RULES.baseDamage * c.power, controls ? BOSS_RULES.slowSeconds : 0);
    }
    if (!ctx.hidden()) {
      const visual = techniqueVisual(c.technique);
      animateTechniqueVisual(visual,0,c.dir);
      visual.position.set(c.shape === 'circle' ? c.center.x : host.sprite.position.x + c.dir.x * Math.min(3, c.range / 2), ctx.height(c.center.x, c.center.z) + .9, c.shape === 'circle' ? c.center.z : host.sprite.position.z + c.dir.z * Math.min(3, c.range / 2));
      visual.scale.multiplyScalar(Math.max(1.2, c.range * .7));
      ctx.scene.add(visual);
      flashes.push({ object: visual, life: .45 });
    }
    clearCast(state);
    state.lastCasting = '';
  }

  const flashes: { object: THREE.Object3D; life: number }[] = [];

  /** Atualiza barra e técnicas. Retorna true enquanto o chefe está conjurando (não anda nem dá golpe corpo a corpo). */
  function update(host: BossHost, dt: number, canAct: boolean) {
    const state = host.boss; if (!state) return false;
    const ratio = Math.max(0, Math.min(1, host.hp / state.maxHp));
    const phase=state.phase?beastPhase(ratio):undefined;
    if(phase&&phase!==state.phase){state.phase=phase;state.cooldown=Math.min(state.cooldown,.25);state.lastRatio=-1;}
    state.bar.position.set(host.sprite.position.x, host.sprite.position.y + host.sprite.scale.y * .62, host.sprite.position.z);
    if (state.cast) {
      state.cast.windup -= dt;
      const progress = 1 - Math.max(0, state.cast.windup) / state.cast.total;
      state.cast.marker.traverse((child) => { if (child instanceof THREE.Mesh) (child.material as THREE.MeshBasicMaterial).opacity = .18 + progress * .5; });
      if (state.cast.windup <= 0) fire(host, state);
    } else if (canAct) {
      state.cooldown -= dt;
      if (state.cooldown <= 0) { startCast(host, state); state.cooldown = state.phase ? [0,2.2,1.35,.68][state.phase] : BOSS_RULES.cooldownByZone[Math.min(2, Math.max(0, ctx.zone() - 1))] * (state.guardian ? .8 : 1) * (.85 + Math.random() * .3); }
    }
    if(phase){
      // Rodada 55 — anda só quando DE FATO se desloca (antes: 'pode agir' = andando, então a bijū colada no jogador
      // ou presa no relevo ficava trocando os quadros de passo parada). Velocidade medida pela posição do quadro anterior.
      const px=host.sprite.position.x,pz=host.sprite.position.z;
      const stepX=state.lastX===undefined?0:px-state.lastX,stepZ=state.lastZ===undefined?0:pz-state.lastZ,stepLength=Math.hypot(stepX,stepZ);
      const speed=dt<=0?0:stepLength/dt;
      state.lastX=px;state.lastZ=pz;
      const movingNow=!state.cast&&speed>.25;
      // Rodada 59: de costas quando anda para longe da câmera (com histerese; parada mantém a vista).
      const fwd=ctx.viewForward?.();
      state.away=bijuuFacesAway(state.away??false,movingNow&&fwd&&stepLength>1e-6?(stepX*fwd.x+stepZ*fwd.z)/stepLength:undefined);
      state.walkBlend=(state.walkBlend??0)+((movingNow?1:0)-(state.walkBlend??0))*(1-Math.exp(-dt*10));
      const moving=state.walkBlend>.5;
      state.motionTime+=dt*(moving?5:2.5);
      const step=Math.sin(state.motionTime);
      const windup=state.cast?1-Math.max(0,state.cast.windup)/state.cast.total:0;
      state.recoil=Math.max(0,state.recoil-dt*3.4);
      const isFlying=host.heroId==='chomei';
      const lift=isFlying?.28+Math.abs(step)*.24:moving?Math.abs(step)*.14:0;
      const sheet=state.away&&state.backMap?.image?state.backMap:state.motionMap;
      if(sheet?.image){
        // Parada: quadro 0 (a respiração vem da escala); andando: alterna os dois quadros de passo da folha.
        const pose=state.recoil>0?3:state.cast?2:moving?Number(step<0):0;
        state.pose=pose;
        // Andando, o espelho segue o passo real. Parada ou conjurando, a bijū volta a mirar no jogador.
        const right = ctx.viewRight?.();
        const horizontal = right && movingNow ? (stepX * right.x + stepZ * right.z) / stepLength : undefined;
        const side = right ? (ctx.player.position.x - px) * right.x + (ctx.player.position.z - pz) * right.z : Math.sign(ctx.player.position.x - px);
        const value = horizontal ?? side;
        const threshold = horizontal === undefined ? .6 : .1;
        if (state.flip === undefined) state.flip = value < 0;
        else if (value < -threshold) state.flip = true;
        else if (value > threshold) state.flip = false;
        const flip=state.flip;
        sheet.repeat.x=flip?-.25:.25;
        sheet.offset.set((pose+Number(flip))/4,(2-(state.motionRow??0))/3);
        host.sprite.material.map=sheet;
      }
      const wide=1+windup*.10+state.recoil*.13;
      const tall=1+(moving?step*.055:step*.018)-windup*.08+state.recoil*.08;
      // Entrada: cresce de 35% a 100% e aparece (opacidade) em BIJUU_ARRIVAL s.
      if(state.arrival!==undefined){state.arrival=Math.max(0,state.arrival-dt);const k=arrivalProgress(state.arrival);host.sprite.material.opacity=k;if(state.arrival<=0){state.arrival=undefined;host.sprite.material.opacity=1;}}
      const grow=state.arrival!==undefined?.35+.65*arrivalProgress(state.arrival):1;
      host.sprite.scale.set(BIJUU_SIZE*wide*grow,BIJUU_SIZE*tall*grow,1);
      host.sprite.position.y=ctx.height(host.sprite.position.x,host.sprite.position.z)+host.sprite.scale.y*.46+lift;
      host.sprite.material.rotation=(isFlying?.06:.022)*step+.09*windup-.12*state.recoil;
    }
    const hpText=compactNumber(Math.ceil(host.hp))+' / '+compactNumber(state.maxHp);
    if (Math.abs(ratio - state.lastRatio) > .004 || state.hpText!==hpText || state.cast) {
      state.lastRatio = ratio;state.hpText=hpText;drawBar(state, ratio);
    }
    return Boolean(state.cast);
  }

  /** Efeitos de impacto (somem sozinhos). */
  function updateEffects(dt: number) {
    for (let i = flashes.length - 1; i >= 0; i--) { const f = flashes[i]; f.life -= dt; animateTechniqueVisual(f.object,dt); if (f.life <= 0) { ctx.scene.remove(f.object); disposeObject(f.object); flashes.splice(i, 1); } }
  }

  /** Reescala o HP máximo quando o multiplicador de HP do debug muda. */
  function rescale(host: BossHost, ratio: number) { if (host.boss) { host.boss.maxHp *= ratio; host.boss.lastRatio = -1; } }

  function dispose(host: BossHost) {
    const state = host.boss; if (!state) return;
    clearCast(state);state.motionMap?.dispose();state.backMap?.dispose();
    ctx.scene.remove(state.bar); state.bar.material.map?.dispose(); state.bar.material.dispose();
    host.boss = undefined;
  }

  return { attach, update, updateEffects, rescale, dispose };
}
