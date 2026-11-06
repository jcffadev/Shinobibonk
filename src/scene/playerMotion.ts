import * as THREE from 'three';
import { ASUMA_ATLAS, formAt } from '../game/evolution';
import { createPlayerPose } from './playerPose';
import { directionalArt } from '../game/directionalArt';

export function createPlayerMotion(scene: THREE.Scene, sprite: THREE.Sprite, heroId: string) {
  const hasWalkAtlas = heroId === 'naruto';
  const pose = createPlayerPose();
  const asuma = heroId === 'asuma' ? new THREE.TextureLoader().load(ASUMA_ATLAS) : null;
  if (asuma) {
    asuma.colorSpace = THREE.SRGBColorSpace;
    asuma.minFilter = asuma.magFilter = THREE.NearestFilter;
    asuma.generateMipmaps = false;
  }
  const width = sprite.scale.x, height = sprite.scale.y;
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 24;
  const paint = canvas.getContext('2d')!;
  const map = new THREE.CanvasTexture(canvas);
  map.magFilter = THREE.NearestFilter;
  const bar = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent:true, depthTest:false, depthWrite:false }));
  bar.scale.set(1.45,.21,1);
  bar.center.set(.5,1);
  bar.renderOrder = 30;
  scene.add(bar);
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
  const directionTextures = new Map<string, THREE.Texture>();
  const animatedMaps = new Set<THREE.Texture | null>([walk, diagonal, throwing, asuma]);
  let attack = 0, hurt = 0, stepTime = 0, lastHp = -1, lastMax = -1;
  return {
    attack: (weapon = false, left?: boolean, special = false) => {
      if (ultimate && attack > 0 && !special) return;
      attack = special ? .55 : weapon ? .25 : .22;
      ultimate = special;
      throwingWeapon = weapon;
      if (left !== undefined) mirror = left;
    },
    state: () => state,
    atlas: () => posePath,
    hurt: () => { hurt = .23; },
    update(dt: number, floor: number, hp: number, maxHp: number, walkingInput: boolean, backwardView: boolean, leftward: boolean, level: number, jumpHeight: number, sliding: boolean, diagonalInput: boolean) {
      if (!animatedMaps.has(sprite.material.map)) idleMap = sprite.material.map;
      if (level !== previousLevel) {
        previousLevel = level;
        directionSheet = directionalArt(heroId, formAt(heroId, level).level);
        directionMap = directionSheet && directionTextures.get(directionSheet.path);
        if (directionSheet && !directionMap) {
          directionMap = new THREE.TextureLoader().load(directionSheet.path);
          directionMap.colorSpace = THREE.SRGBColorSpace;
          directionMap.minFilter = directionMap.magFilter = THREE.NearestFilter;
          directionMap.generateMipmaps = false;
          directionTextures.set(directionSheet.path, directionMap);
          animatedMaps.add(directionMap);
        }
      }
      attack = Math.max(0, attack - dt);
      stepTime = walkingInput ? stepTime + dt : 0;
      hurt = Math.max(0, hurt - dt);
      if (walkingInput && !attack) { mirror = leftward; rear = backwardView; }
      state = hurt > 0 ? 'hurt' : sliding ? 'dash' : jumpHeight > 0 ? 'jump'
        : attack > 0 ? (ultimate ? 'ultimate' : 'attack') : walkingInput ? 'walk' : 'idle';
      const academy = hasWalkAtlas && level < 10;
      const casting = academy && state === 'attack' && throwing?.image;
      const walkAtlas = diagonalInput && diagonal?.image ? diagonal : walk;
      const walking = academy && state === 'walk' && walkAtlas?.image;
      if (casting && throwing) {
        const frame = throwingWeapon ? Math.min(3, Math.floor((.25 - attack) / .06)) : attack > .08 ? 2 : 3;
        throwing.repeat.x = mirror ? -.25 : .25;
        throwing.offset.x = (frame + Number(mirror)) / 4;
      } else if (walking && walkAtlas) {
        const frame = Math.floor(stepTime * 10) % 4;
        walkAtlas.repeat.x = leftward ? -.25 : .25;
        walkAtlas.offset.set((frame + Number(leftward)) / 4, backwardView ? 0 : .5);
      }
      const useAsuma = !!asuma?.image && state !== 'idle';
      if (useAsuma && asuma) {
        const frame = state === 'walk' ? (rear ? 4 : 0) + Math.floor(stepTime * 11) % 4
          : state === 'jump' ? 8 : state === 'dash' ? 9 : state === 'hurt' ? 10
          : state === 'ultimate' ? 15 : throwingWeapon ? Math.min(14, 12 + Math.floor((.25 - attack) / .08)) : 11;
        asuma.repeat.set(mirror ? -.25 : .25, .25);
        asuma.offset.set((frame % 4 + Number(mirror)) / 4, (3 - Math.floor(frame / 4)) / 4);
      }
      const directedCast = !!directionSheet?.cast && (state === 'attack' || state === 'ultimate');
      const useDirection = !!directionMap?.image && (state === 'walk' || directedCast);
      if (useDirection && directionMap && directionSheet) {
        const frame = directedCast ? Math.min(3, Math.floor((1 - attack / (ultimate ? .55 : throwingWeapon ? .25 : .22)) * 4))
          : Math.floor(stepTime * 10) % 4;
        const row = directedCast ? 2 : backwardView ? 1 : 0;
        const flip = directedCast ? mirror : leftward;
        directionMap.repeat.set(flip ? -.25 : .25, 1 / directionSheet.rows);
        directionMap.offset.set((frame + Number(flip)) / 4, (directionSheet.rows - 1 - row) / directionSheet.rows);
      }
      const usesSheet = useAsuma || useDirection || !!casting || !!walking;
      posePath = useDirection ? directionSheet!.path : '';
      sprite.material.map = useAsuma ? asuma : useDirection ? directionMap! : casting ? throwing : walking ? walkAtlas : idleMap;
      sprite.material.alphaTest = usesSheet || directionSheet ? .55 : .18;
      const stride = state === 'walk' ? Math.sin(stepTime * 16) * .075 : state === 'dash' ? .07 : 0;
      const lift = state === 'jump' ? .095 : state === 'dash' ? .04 : 0;
      const reach = state === 'attack' ? Math.sin(Math.PI * attack / (throwingWeapon ? .25 : .22)) * .11
        : state === 'ultimate' ? .09 : -stride * .55;
      const guard = state === 'ultimate' ? .085 : state === 'attack' ? .045 : state === 'hurt' ? .04 : 0;
      pose.apply(sprite.material, usesSheet ? 0 : stride, usesSheet ? 0 : lift,
        usesSheet ? 0 : reach, usesSheet ? 0 : guard, !usesSheet && mirror);
      sprite.material.rotation = usesSheet ? 0 : state === 'dash' ? (mirror ? .34 : -.34)
        : state === 'hurt' ? (mirror ? -.1 : .1) : state === 'walk' && backwardView ? (mirror ? .05 : -.05) : 0;
      sprite.scale.set(width,height,1);
      sprite.position.y = floor + jumpHeight + sprite.scale.y*.5;
      sprite.material.color.set(hurt>0 ? '#ffc0be' : '#ffffff');
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
    dispose(){scene.remove(bar);walk?.dispose();diagonal?.dispose();throwing?.dispose();asuma?.dispose();directionTextures.forEach(t=>t.dispose());map.dispose();bar.material.dispose();},
  };
}
