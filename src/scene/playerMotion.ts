import * as THREE from 'three';

export function createPlayerMotion(scene: THREE.Scene, sprite: THREE.Sprite, hasWalkAtlas: boolean) {
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
  let throwingWeapon = false, mirror = false;
  let attack = 0, hurt = 0, stepTime = 0, lastHp = -1, lastMax = -1;
  return {
    attack: (weapon = false, left?: boolean) => { attack = weapon ? .25 : .22; throwingWeapon = weapon; if(left!==undefined)mirror=left; },
    hurt: () => { hurt = .23; },
    update(dt: number, floor: number, hp: number, maxHp: number, walkingInput: boolean, backwardView: boolean, leftward: boolean, animatedForm: boolean, jumpHeight: number, sliding: boolean, diagonalInput: boolean) {
      if (sprite.material.map !== walk && sprite.material.map !== diagonal && sprite.material.map !== throwing) idleMap = sprite.material.map;
      attack = Math.max(0, attack - dt);
      stepTime = walkingInput ? stepTime + dt : 0;
      const casting = animatedForm && attack > 0 && throwing?.image;
      const walkAtlas = diagonalInput && diagonal?.image ? diagonal : walk;
      const walking = animatedForm && (walkingInput || jumpHeight > 0 || sliding) && !casting && walkAtlas?.image;
      if (casting && throwing) {
        const frame = throwingWeapon ? Math.min(3, Math.floor((.25 - attack) / .06)) : attack > .08 ? 2 : 3;
        throwing.repeat.x = mirror ? -.25 : .25;
        throwing.offset.x = (frame + Number(mirror)) / 4;
      } else if (walking && walkAtlas) {
        const frame = sliding ? 0 : jumpHeight > 0 ? 1 : Math.floor(stepTime * 10) % 4;
        walkAtlas.repeat.x = leftward ? -.25 : .25;
        walkAtlas.offset.set((frame + Number(leftward)) / 4, backwardView ? 0 : .5);
      }
      sprite.material.map = casting ? throwing : walking ? walkAtlas : idleMap;
      // Margens semitransparentes do atlas diagonal não pertencem à silhueta.
      sprite.material.alphaTest = casting || walking ? .55 : .1;
      hurt = Math.max(0, hurt - dt);
      const squash = casting || walkingInput ? 0 : Math.sin(Math.min(1,attack/.22)*Math.PI)*.12;
      sprite.material.rotation = (sliding ? (leftward ? .32 : -.32) : -squash) + hurt*.24;
      sprite.scale.set(width*(1+squash),height*(1-squash)*(sliding ? .72 : 1),1);
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
    dispose(){scene.remove(bar);walk?.dispose();diagonal?.dispose();throwing?.dispose();map.dispose();bar.material.dispose();},
  };
}
