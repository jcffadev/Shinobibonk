import * as THREE from 'three';
import { BIJUU_BY_ID, BIJUU_BOMB, beastPhase } from '../game/bijuu';
import { HERO_BY_ID, ultimateBase, type Technique } from '../game/heroes';
import { techniqueVisual, disposeObject } from './techniqueEffects';

/**
 * Mega elites e guardiões (chefes):
 * - barra de vida 3D com nome acima do sprite;
 * - usam as técnicas do próprio personagem contra o jogador, sempre com aviso vermelho no chão
 *   (a área marcada dá dano quando o aviso enche; sair dela evita o golpe).
 * Números são balanceamento provisório.
 */
export const BOSS_RULES = {
  /** Intervalo entre técnicas por zona (s); guardiões usam 80% disso. */
  cooldownByZone: [4.6, 3.8, 3.0],
  windup: 1.1,
  ultimateWindup: 1.7,
  /** Dano base por técnica, multiplicado pelo poder da técnica, pela ameaça e pela armadura do jogador. */
  baseDamage: 18,
  ultimatePower: 2.6,
  /** Lentidão no jogador quando a técnica tem controle (Sombra, Areia, Madeira, Raio, Genjutsu...). */
  slowSeconds: 1.2,
};

type CastShape = 'circle' | 'cone' | 'line' | 'lineV' | 'ring';
type Cast = { technique: Technique; shape: CastShape; center: THREE.Vector3; dir: THREE.Vector3; range: number; width: number; windup: number; total: number; power: number; marker: THREE.Group; ultimate: boolean };
export type BossState = { name: string; maxHp: number; guardian: boolean; cooldown: number; next: number; ultimateUsed: boolean; cast?: Cast; bar: THREE.Sprite; canvas: HTMLCanvasElement; lastRatio: number; lastCasting: string; phase?:number; castCount:number };
export type BossHost = { sprite: THREE.Sprite; hp: number; heroId?: string; guardian?: boolean; boss?: BossState };

export type BossContext = {
  scene: THREE.Scene;
  player: THREE.Object3D;
  height: (x: number, z: number) => number;
  zone: () => number;
  hidden: () => boolean;
  /** Aplica o golpe no jogador (ameaça, armadura, evasão, invulnerabilidade e god mode ficam com a simulação). */
  hitPlayer: (base: number, slowSeconds: number) => void;
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
    host.boss = { name, maxHp, guardian, cooldown, next: 2 + Math.random() * 1.5, ultimateUsed: false, bar, canvas, lastRatio: 1, lastCasting: '',phase:beast?beastPhase(host.hp/maxHp):undefined,castCount:0 };
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
    if (playerInside(c)) {
      const t = c.technique, controls = t.slow || t.status === 'Lentidão' || t.status === 'Paralisar' || t.status === 'Atordoar' || t.status === 'Dormir';
      ctx.hitPlayer(BOSS_RULES.baseDamage * c.power, controls ? BOSS_RULES.slowSeconds : 0);
    }
    if (!ctx.hidden()) {
      const visual = techniqueVisual(c.technique);
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
      if (state.cooldown <= 0) { startCast(host, state); state.cooldown = state.phase ? [0,2.7,1.65,.75][state.phase] : BOSS_RULES.cooldownByZone[Math.min(2, Math.max(0, ctx.zone() - 1))] * (state.guardian ? .8 : 1) * (.85 + Math.random() * .3); }
    }
    if (Math.abs(ratio - state.lastRatio) > .004 || state.cast) { state.lastRatio = ratio; drawBar(state, ratio); }
    return Boolean(state.cast);
  }

  /** Efeitos de impacto (somem sozinhos). */
  function updateEffects(dt: number) {
    for (let i = flashes.length - 1; i >= 0; i--) { const f = flashes[i]; f.life -= dt; f.object.rotation.y += dt * 4; if (f.life <= 0) { ctx.scene.remove(f.object); disposeObject(f.object); flashes.splice(i, 1); } }
  }

  /** Reescala o HP máximo quando o multiplicador de HP do debug muda. */
  function rescale(host: BossHost, ratio: number) { if (host.boss) { host.boss.maxHp *= ratio; host.boss.lastRatio = -1; } }

  function dispose(host: BossHost) {
    const state = host.boss; if (!state) return;
    clearCast(state);
    ctx.scene.remove(state.bar); state.bar.material.map?.dispose(); state.bar.material.dispose();
    host.boss = undefined;
  }

  return { attach, update, updateEffects, rescale, dispose };
}
