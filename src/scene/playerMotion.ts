import * as THREE from 'three';
import { ASUMA_ATLAS, formAt } from '../game/evolution';
import { createPlayerPose } from './playerPose';
import { actionArt, acrobaticsArt, directionalArt, handSealArt } from '../game/directionalArt';
import { familyOf } from '../game/heroes';

export type StrikePose = 'punch' | 'kick';
type Strike = { weapon: boolean; left?: boolean; special: boolean; pose?: StrikePose; seal: boolean; back?: boolean };
/** Fração do golpe a partir da qual um novo ataque pode encadear. Antes disso o pedido fica na fila (o mais recente vence)
 *  e começa assim que a soltura (3º quadro) terminou de aparecer; assim, com velocidade de ataque alta, o golpe nunca
 *  reinicia no quadro de preparação nem fica piscando. A Ultimate entra na hora. */
const CHAIN_AT = .75;

export function createPlayerMotion(scene: THREE.Scene, sprite: THREE.Sprite, heroId: string, healthBar=true) {
  // Versões usam as folhas da família na forma da versão (ex.: naruto-shippuden → folhas do Naruto no nível 25).
  const family = familyOf(heroId);
  const hasWalkAtlas = family === 'naruto' && formAt(heroId, 1).level === 1;
  const pose = createPlayerPose();
  const asuma = family === 'asuma' ? new THREE.TextureLoader().load(ASUMA_ATLAS) : null;
  if (asuma) {
    asuma.colorSpace = THREE.SRGBColorSpace;
    asuma.minFilter = asuma.magFilter = THREE.NearestFilter;
    asuma.generateMipmaps = false;
  }
  const width = sprite.scale.x, height = sprite.scale.y;
  const health = healthBar ? createHealthBar(scene) : null;
  const walk = hasWalkAtlas ? new THREE.TextureLoader().load('/assets/naruto-academia-walk-v1.png') : null;
  if (walk) {
    walk.colorSpace = THREE.SRGBColorSpace;
    walk.minFilter = walk.magFilter = THREE.NearestFilter;
    walk.generateMipmaps = false;
    walk.repeat.set(.25,.5);
  }
  const diagonal = hasWalkAtlas ? new THREE.TextureLoader().load('/assets/naruto-academia-diagonal-v1.png') : null;
  if (diagonal) {
    diagonal.colorSpace = THREE.SRGBColorSpace;
    diagonal.minFilter = diagonal.magFilter = THREE.NearestFilter;
    diagonal.generateMipmaps = false;
    diagonal.repeat.set(.25,.5);
  }
  const throwing = hasWalkAtlas ? new THREE.TextureLoader().load('/assets/naruto-academia-throw-v1.png') : null;
  if (throwing) {
    throwing.colorSpace = THREE.SRGBColorSpace;
    throwing.minFilter = throwing.magFilter = THREE.NearestFilter;
    throwing.generateMipmaps = false;
    throwing.repeat.set(.25,.82);
    throwing.offset.y = .075;
  }
  let idleMap = sprite.material.map;
  let throwingWeapon = false, mirror = false, rear = false, ultimate = false;
  let state = 'idle';
  let posePath = '';
  let previousLevel = 0;
  let directionSheet: ReturnType<typeof directionalArt>;
  let directionMap: THREE.Texture | undefined;
  let actionSheet: ReturnType<typeof actionArt>;
  let actionMap: THREE.Texture | undefined;
  let acrobaticsSheet:ReturnType<typeof acrobaticsArt>;
  let acrobaticsMap:THREE.Texture|undefined;
  let sealSheet: ReturnType<typeof handSealArt>;
  let sealMap: THREE.Texture | undefined;
  let handSign = false;
  let strike: StrikePose | undefined;
  const directionTextures = new Map<string, THREE.Texture>();
  const animatedMaps = new Set<THREE.Texture | null>([walk, diagonal, throwing, asuma]);
  const sheetTexture = (path: string) => {
    let texture = directionTextures.get(path);
    if (!texture) {
      texture = new THREE.TextureLoader().load(path);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = texture.magFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
      directionTextures.set(path, texture);
      animatedMaps.add(texture);
    }
    return texture;
  };
  let attack = 0, attackDuration = .22, hurt = 0, stepTime = 0, lastHp = -1, lastMax = -1;
  let queued: Strike | undefined;
  let frameShown = 0, strideShown = 0, walkAttack = false;
  const begin = (next: Strike) => {
    queued = undefined;
    attack = attackDuration = next.special ? .55 : next.weapon ? .25 : .22;
    ultimate = next.special;
    throwingWeapon = next.weapon;
    strike = next.pose;
    handSign = next.seal;
    if (next.back !== undefined) rear = next.back;
    if (next.left !== undefined) mirror = next.left;
  };
  // Rastro do dash (só no jogador): duas cópias translúcidas do quadro atual nas posições anteriores.
  const trail = healthBar ? [0, 1].map(() => {
    const ghost = new THREE.Sprite(new THREE.SpriteMaterial({ map: sprite.material.map, alphaTest: .18, transparent: true, depthWrite: false, color: '#9fd8ff' }));
    ghost.visible = false; ghost.renderOrder = 2; scene.add(ghost); return ghost;
  }) : null;
  const trailHistory: THREE.Vector3[] = [];
  return {
    attack: (weapon = false, left?: boolean, special = false, pose?: StrikePose, seal = false, back?: boolean) => {
      if (ultimate && attack > 0 && !special) return;
      const next: Strike = { weapon, left, special, pose, seal, back };
      // Golpe em andamento e ainda antes do ponto de encadeamento: não reinicia, guarda o pedido.
      if (!special && attack > 0 && 1 - attack / attackDuration < CHAIN_AT) { queued = next; return; }
      begin(next);
    },
    state: () => state,
    /** Inspeção de testes: quadro (coluna) em uso, progresso do golpe e se as pernas estão no passo durante o ataque. */
    debug: () => ({ state, frame: frameShown, progress: attack > 0 ? +(1 - attack / attackDuration).toFixed(3) : 1, walkAttack, stride: +strideShown.toFixed(4), queued: !!queued }),
    atlas: () => posePath,
    hurt: () => { hurt = .23; },
    update(dt: number, floor: number, hp: number, maxHp: number, walkingInput: boolean, backwardView: boolean, leftward: boolean, level: number, jumpHeight: number, sliding: boolean, diagonalInput: boolean, jumpProgress: number, slideProgress: number) {
      if (!animatedMaps.has(sprite.material.map)) idleMap = sprite.material.map;
      if (level !== previousLevel) {
        previousLevel = level;
        const form = formAt(heroId, level).level;
        directionSheet = directionalArt(family, form);
        actionSheet = actionArt(family, form);
        directionMap = directionSheet && sheetTexture(directionSheet.path);
        actionMap = actionSheet && sheetTexture(actionSheet.path);
        acrobaticsSheet=acrobaticsArt(family,form);
        acrobaticsMap=acrobaticsSheet&&sheetTexture(acrobaticsSheet.path);
        sealSheet = handSealArt(family, form);
        sealMap = sealSheet && sheetTexture(sealSheet.path);
      }
      attack = Math.max(0, attack - dt);
      if (queued && (attack === 0 || 1 - attack / attackDuration >= CHAIN_AT)) begin(queued);
      const attackProgress = attack > 0 ? 1 - attack / attackDuration : 1;
      stepTime = walkingInput ? stepTime + dt : 0;
      hurt = Math.max(0, hurt - dt);
      if (sliding || (walkingInput && !attack)) { mirror = leftward; rear = backwardView; }
      // Pulo e dash têm prioridade sobre o dano: no meio da horda o jogador recebe golpes o tempo todo e o estado 'hurt'
      // (0,23 s a cada acerto) escondia os quadros de pulo/dash do Naruto Academia. O dano continua visível pela tinta vermelha.
      // Andar atacando (pedido do usuário 11/11): o deslocamento nunca para (ele é da simulação, não daqui) e o golpe
      // toca INTEIRO pelos quadros de ataque da folha de ação; a passada continua nas pernas do próprio quadro
      // (deformação do playerPose, na mesma fase da caminhada), então ao terminar o golpe a caminhada segue sem pulo.
      const showAttack = attack > 0 && (actionSheet?.kind === 'full' || hurt === 0);
      state = sliding ? 'dash' : jumpHeight > 0 ? 'jump' : showAttack ? (ultimate ? 'ultimate' : 'attack')
        : hurt > 0 ? 'hurt' : walkingInput ? 'walk' : 'idle';
      // Pernas no passo durante o golpe: fora a Ultimate (pose especial), o chute de Lee/Guy (a perna é o golpe)
      // e o Gaara (flutua na areia).
      walkAttack = state === 'attack' && walkingInput && strike !== 'kick' && family !== 'gaara';
      const academy = hasWalkAtlas && formAt(heroId, level).level === 1;
      const casting = academy && state === 'attack' && throwing?.image;
      const walkAtlas = diagonalInput && diagonal?.image ? diagonal : walk;
      const walking = academy && state === 'walk' && walkAtlas?.image;
      if (casting && throwing) {
        const frame = throwingWeapon ? Math.min(3, Math.floor((.25 - attack) / .06)) : attack > .08 ? 2 : 3;
        frameShown = frame;
        throwing.repeat.x = mirror ? -.25 : .25;
        throwing.offset.x = (frame + Number(mirror)) / 4;
      } else if (walking && walkAtlas) {
        const frame = Math.floor(stepTime * 10) % 4;
        frameShown = frame;
        walkAtlas.repeat.x = leftward ? -.25 : .25;
        walkAtlas.offset.set((frame + Number(leftward)) / 4, backwardView ? 0 : .5);
      }
      const useAsuma = !!asuma?.image && state !== 'idle';
      if (useAsuma && asuma) {
        const frame = state === 'walk' ? (rear ? 4 : 0) + Math.floor(stepTime * 11) % 4
          : state === 'jump' ? 8 : state === 'dash' ? 9 : state === 'hurt' ? 10
          : state === 'ultimate' ? 15 : throwingWeapon ? Math.min(14, 12 + Math.floor((.25 - attack) / .08)) : 11;
        frameShown = frame % 4;
        asuma.repeat.set(mirror ? -.25 : .25, .25);
        asuma.offset.set((frame % 4 + Number(mirror)) / 4, (3 - Math.floor(frame / 4)) / 4);
      }
      const directedCast = !!directionSheet?.cast && (state === 'attack' || state === 'ultimate');
      const useDirection = !!directionMap?.image && (state === 'walk' || directedCast || state==='jump' || state==='dash');
      const attacking = state === 'attack' || state === 'ultimate';
      const useSeal = attacking && handSign && !!sealMap?.image;
      if (useSeal && sealMap && sealSheet) {
        const frame = (rear ? 2 : 0) + Number(attackProgress >= .22);
        frameShown = frame;
        sealMap.repeat.set(mirror ? -.25 : .25, .25);
        sealMap.offset.set((frame + Number(mirror)) / 4, (3 - sealSheet.row) / 4);
      }
      const poseSheet=(state==='jump'||state==='dash')&&acrobaticsSheet?acrobaticsSheet:actionSheet;
      const poseMap=(state==='jump'||state==='dash')&&acrobaticsSheet?acrobaticsMap:actionMap;
      const acrobatics = poseSheet?.kind === 'acrobatics' && (state === 'jump' || state === 'dash');
      const fullAction = poseSheet?.kind === 'full' && (attacking || state === 'jump' || state === 'dash');
      const useAction = !!poseMap?.image && (fullAction || acrobatics || (attacking && (poseSheet?.kind !== 'taijutsu' || !!strike) && !(academy && poseSheet?.kind==='acrobatics')));
      if (useAction && poseMap && poseSheet) {
        const progress = attackProgress;
        const castFrame = family === 'gaara' && (ultimate || handSign) && progress >= .35 && progress < .84
          ? 2 : Math.min(3, Math.floor(progress * 4));
        const frame = state === 'jump' ? Number(jumpProgress > .22 && jumpProgress < .77)
          : state === 'dash' ? 2 + Number(slideProgress > .7) : castFrame;
        frameShown = frame;
        const secondRow = (acrobatics && ('directional' in poseSheet ? backwardView : true)) || (poseSheet.kind === 'cast' && rear) || (poseSheet.kind === 'taijutsu' && strike === 'kick');
        const flip = acrobatics || (fullAction && !attacking) ? leftward : mirror;
        const rows=poseSheet.rows??2;
        const row = fullAction
          ? (poseSheet.firstRow ?? 0) + (attacking ? Number(rear) : 2 + Number(backwardView))
          : (poseSheet.firstRow ?? 0) + Number(secondRow);
        poseMap.repeat.set(flip ? -.25 : .25, 1/rows);
        poseMap.offset.set((frame + Number(flip)) / 4, (rows-1-row)/rows);
      }
      if (useDirection && directionMap && directionSheet) {
        const frame = directedCast ? Math.min(3, Math.floor(attackProgress * 4))
          : state==='jump' ? (jumpProgress<.24||jumpProgress>.76?0:2) : state==='dash' ? (slideProgress<.72?2:1) : Math.floor(stepTime * 10) % 4;
        if (!useSeal && !useAction) frameShown = frame;
        const row = directedCast ? 2 : (directionSheet.firstRow ?? 0) + Number(backwardView);
        const flip = directedCast ? mirror : leftward;
        directionMap.repeat.set(flip ? -.25 : .25, 1 / directionSheet.rows);
        directionMap.offset.set((frame + Number(flip)) / 4, (directionSheet.rows - 1 - row) / directionSheet.rows);
      }
      const usesSheet = useSeal || useAsuma || useAction || useDirection || !!casting || !!walking;
      posePath = useSeal ? sealSheet!.path : useAction ? poseSheet!.path : useDirection ? directionSheet!.path : '';
      sprite.material.map = useSeal ? sealMap! : useAsuma ? asuma : useAction ? poseMap! : useDirection ? directionMap! : casting ? throwing : walking ? walkAtlas : idleMap;
      sprite.material.alphaTest = usesSheet ? .55 : .18;
      // A passada do golpe em movimento usa a mesma frequência dos quadros de caminhada (10 quadros/s, ciclo de 4).
      const stride = state === 'walk' ? Math.sin(stepTime * 16) * .075 : walkAttack ? Math.sin(stepTime * Math.PI * 5) * (usesSheet ? .06 : .075)
        : state === 'dash' ? Math.sin(Math.PI*slideProgress)*.13 : 0;
      const lift = state === 'jump' ? Math.sin(Math.PI*jumpProgress)*.16 : state === 'dash' ? Math.sin(Math.PI*slideProgress)*.065 : 0;
      const reach = state === 'attack' ? Math.sin(Math.PI * attack / attackDuration) * .11
        : state === 'ultimate' ? .09 : -stride * .55;
      const guard = state === 'ultimate' ? .085 : state === 'attack' ? .045 : state === 'hurt' ? .04 : 0;
      const proceduralMotion=!usesSheet||useDirection&&!useAction&&(state==='jump'||state==='dash');
      strideShown = proceduralMotion || walkAttack ? stride : 0;
      if (!usesSheet) frameShown = 0;
      pose.apply(sprite.material, strideShown, proceduralMotion ? lift : 0,
        usesSheet ? 0 : reach, usesSheet ? 0 : guard, !usesSheet && mirror);
      sprite.material.rotation = !proceduralMotion ? 0 : state === 'dash' ? (mirror ? .34 : -.34)
        : state === 'hurt' ? (mirror ? -.1 : .1) : state === 'walk' && backwardView ? (mirror ? .05 : -.05) : 0;
      // Squash/stretch do pulo (estica na decolagem, achata na aterrissagem) e leve alongamento horizontal no dash,
      // somados aos quadros da folha. Os pés continuam ancorados porque a altura usa a escala final.
      const takeoff = state === 'jump' ? Math.max(0, 1 - jumpProgress / .22) : 0;
      const landing = state === 'jump' ? Math.max(0, (jumpProgress - .8) / .2) : 0;
      const squashY = 1 + takeoff * .1 - landing * .1 - (state === 'dash' ? .05 : 0);
      const squashX = 1 - takeoff * .07 + landing * .09 + (state === 'dash' ? .08 : 0);
      sprite.scale.set(width * squashX, height * squashY, 1);
      sprite.position.y = floor + jumpHeight + sprite.scale.y*.5;
      if (trail) {
        trailHistory.unshift(sprite.position.clone());
        trailHistory.length = Math.min(trailHistory.length, 6);
        trail.forEach((ghost, index) => {
          const point = trailHistory[(index + 1) * 2];
          ghost.visible = state === 'dash' && !!point;
          if (!ghost.visible || !point) return;
          ghost.material.map = sprite.material.map;
          ghost.material.alphaTest = sprite.material.alphaTest;
          ghost.material.opacity = .42 - index * .16;
          ghost.position.copy(point);
          ghost.scale.copy(sprite.scale);
        });
      }
      sprite.material.color.set(hurt>0 ? '#ffc0be' : '#ffffff');
      if(!health)return;
      const {bar,paint,map}=health;
      bar.position.set(sprite.position.x,floor+jumpHeight-.09,sprite.position.z);
      if(lastHp===hp&&lastMax===maxHp)return;
      lastHp=hp;lastMax=maxHp;
      const ratio = Math.max(0,Math.min(1,hp/Math.max(1,maxHp)));
      paint.clearRect(0,0,128,24);
      paint.fillStyle='#131726';paint.fillRect(0,4,128,16);
      paint.fillStyle='#3c2533';paint.fillRect(3,7,122,10);
      paint.fillStyle=ratio>.35?'#50df91':'#ff656c';paint.fillRect(3,7,Math.round(122*ratio),10);
      paint.fillStyle='#ffffff66';paint.fillRect(3,7,Math.round(122*ratio),2);
      map.needsUpdate=true;
    },
    dispose(){trail?.forEach(ghost=>{scene.remove(ghost);ghost.material.dispose();});if(health){scene.remove(health.bar);health.map.dispose();health.bar.material.dispose();}walk?.dispose();diagonal?.dispose();throwing?.dispose();asuma?.dispose();directionTextures.forEach(t=>t.dispose());},
  };
}

function createHealthBar(scene:THREE.Scene) {
  const canvas=document.createElement('canvas');
  canvas.width=128;canvas.height=24;
  const paint=canvas.getContext('2d')!;
  const map=new THREE.CanvasTexture(canvas);
  map.magFilter=THREE.NearestFilter;
  const bar=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false,depthWrite:false}));
  bar.scale.set(1.45,.21,1);
  bar.center.set(.5,1);
  bar.renderOrder=30;
  scene.add(bar);
  return {bar,paint,map};
}
