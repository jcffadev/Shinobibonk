import * as THREE from 'three';

/**
 * Números de dano sem criar canvas/textura/material por acerto.
 * Antes: cada acerto criava um <canvas>, uma CanvasTexture (upload para a GPU) e um SpriteMaterial, descartados 0,8 s depois.
 * Agora: textura por rótulo ("123", "123!", "123!!") em cache LRU com contagem de uso, e sprites reaproveitados de um pool.
 * Rodada 48: spawnText adiciona rótulos livres (ex.: "Treinamento · Sorte +0,6%") reutilizando o mesmo pool.
 */
const CACHE_CAP = 256;
type Entry = { texture: THREE.CanvasTexture; refs: number };

export function createDamageNumbers(scene: THREE.Scene) {
  const cache = new Map<string, Entry>(), owner = new Map<THREE.Texture, string>(), pool: THREE.Sprite[] = [];
  function draw(label: string, color: string, wide = false) {
    const canvas = document.createElement('canvas'); canvas.width = wide ? 512 : 128; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = wide ? 'bold 28px sans-serif' : 'bold 36px sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 5; ctx.strokeStyle = '#111629'; ctx.strokeText(label, canvas.width / 2, 44);
    ctx.fillStyle = color; ctx.fillText(label, canvas.width / 2, 44);
    return new THREE.CanvasTexture(canvas);
  }
  function acquire(label: string, color: string, wide: boolean) {
    const key = label + '|' + color + (wide ? '|w' : '');
    let entry = cache.get(key);
    if (entry) cache.delete(key); // reinsere no fim (mais recente)
    else {
      entry = { texture: draw(label, color, wide), refs: 0 }; owner.set(entry.texture, key);
      if (cache.size >= CACHE_CAP) for (const [k, old] of cache) { if (old.refs > 0) continue; cache.delete(k); owner.delete(old.texture); old.texture.dispose(); if (cache.size < CACHE_CAP) break; }
    }
    cache.set(key, entry); entry.refs++;
    return entry.texture;
  }
  function release(texture: THREE.Texture | null) {
    if (!texture) return;
    const key = owner.get(texture), entry = key === undefined ? undefined : cache.get(key);
    if (entry) entry.refs = Math.max(0, entry.refs - 1); else if (key === undefined) texture.dispose();
  }
  return {
    /** Sprite pronto (na cena) com o número; o chamador posiciona e controla a vida. */
    spawn(amount: number, tier: number) {
      const label = Math.round(amount) + (tier === 2 ? '!!' : tier === 1 ? '!' : '');
      const map = acquire(label, tier === 2 ? '#ff8bdd' : tier === 1 ? '#ffe269' : '#ffffff', false);
      let sprite = pool.pop();
      if (sprite) { sprite.material.map = map; sprite.material.opacity = 1; sprite.visible = true; sprite.scale.set(2, 1, 1); }
      else { sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthTest: false })); sprite.scale.set(2, 1, 1); }
      scene.add(sprite);
      return sprite;
    },
    /** Rodada 48 — texto flutuante livre (HUD de treinamento): sprite largo com rótulo e cor próprias. */
    spawnText(label: string, color = '#8fe3ff') {
      const map = acquire(label, color, true);
      let sprite = pool.pop();
      if (sprite) { sprite.material.map = map; sprite.material.opacity = 1; sprite.visible = true; sprite.scale.set(6, 1.5, 1); }
      else { sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthTest: false })); sprite.scale.set(6, 1.5, 1); }
      scene.add(sprite);
      return sprite;
    },
    /** Devolve o sprite ao pool ao fim da vida (sem descartar material/textura). */
    recycle(sprite: THREE.Sprite) { scene.remove(sprite); release(sprite.material.map); sprite.material.map = null; pool.push(sprite); },
    stats() { return { cached: cache.size, pooled: pool.length }; },
    dispose() { for (const e of cache.values()) e.texture.dispose(); cache.clear(); owner.clear(); for (const s of pool) s.material.dispose(); pool.length = 0; },
  };
}
