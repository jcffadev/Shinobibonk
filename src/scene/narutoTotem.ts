import * as THREE from 'three';

/** Barra 3D do Naruto Totem: nome, HP e segundos restantes acima do sprite. */
export function createTotemBar(scene: THREE.Scene) {
  const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 60;
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false }));
  sprite.scale.set(4.4, .82, 1); sprite.renderOrder = 10; scene.add(sprite);
  let lastKey = '';
  function draw(ratio: number, remaining: number) {
    const key = Math.round(ratio * 200) + ':' + Math.ceil(remaining); if (key === lastKey) return; lastKey = key;
    const ctx = canvas.getContext('2d')!, w = canvas.width;
    ctx.clearRect(0, 0, w, canvas.height); ctx.textAlign = 'center'; ctx.font = 'bold 22px sans-serif'; ctx.lineWidth = 5; ctx.strokeStyle = '#0b0f1c';
    const label = `Naruto Totem · ${Math.ceil(remaining)} s`;
    ctx.strokeText(label, w / 2, 24); ctx.fillStyle = '#ffe9a8'; ctx.fillText(label, w / 2, 24);
    ctx.fillStyle = '#0b0f1ce6'; ctx.fillRect(8, 34, w - 16, 22);
    ctx.fillStyle = '#ff9a2e'; ctx.fillRect(11, 37, Math.max(0, (w - 22) * Math.max(0, Math.min(1, ratio))), 16);
    ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = 2; ctx.strokeRect(9, 35, w - 18, 20);
    texture.needsUpdate = true;
  }
  function follow(target: THREE.Object3D) { sprite.position.set(target.position.x, target.position.y + target.scale.y * .62, target.position.z); }
  function dispose() { scene.remove(sprite); texture.dispose(); sprite.material.dispose(); }
  return { draw, follow, dispose };
}
