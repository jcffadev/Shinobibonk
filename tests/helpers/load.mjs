// Ferramentas comuns dos testes do ShinobiBonk — tudo roda no Node, SEM navegador.
//
// • load(path): carrega um módulo do jogo pelo carregador SSR do Vite (resolve TypeScript, imports sem extensão e
//   aliases). Use para módulos de src/scene/ ou que importam sem ".ts". Módulos de src/game/ com imports ".ts"
//   podem (e devem, por pureza) ser importados direto com `import ... from '../src/game/x.ts'`.
// • seeded(n): gerador pseudoaleatório determinístico — sorteios testados ficam reproduzíveis.
// • memoryStorage(): localStorage em memória.
// • installCanvasStub(): `document.createElement('canvas')` com um contexto 2D falso, para módulos Three.js que
//   desenham texturas em canvas (sem pintar nada de verdade).
import { createServer } from 'vite';
import { after } from 'node:test';

let server;
export async function load(path) {
  if (!server) {
    server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null } });
    after(() => server.close());
  }
  return server.ssrLoadModule(path);
}

/** Vite novo e isolado (estado de módulo limpo) — para módulos que leem o ambiente ao carregar, como settings.ts. */
export async function loadFresh(path) {
  const fresh = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null } });
  try { return await fresh.ssrLoadModule(path); } finally { await fresh.close(); }
}

/** Mulberry32: mesmo `seed` → mesma sequência em [0, 1). */
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); },
    clear: () => data.clear(),
    key: i => [...data.keys()][i] ?? null,
    get length() { return data.size; },
  };
}

export function installCanvasStub() {
  const gradient = { addColorStop() {} };
  const ctx = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => gradient;
      if (key === 'getImageData') return (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4), width: w, height: h });
      if (key === 'measureText') return () => ({ width: 0 });
      return () => {};
    },
    set(target, key, value) { target[key] = value; return true; },
  });
  const canvas = () => ({ width: 0, height: 0, style: {}, getContext: () => ctx, toDataURL: () => '', addEventListener() {} });
  globalThis.document ??= {};
  globalThis.document.createElement = tag => (tag === 'canvas' ? canvas() : { style: {} });
  globalThis.document.createElementNS = () => canvas();
}

/** Igualdade com tolerância relativa. */
export function close(actual, expected, tolerance = 1e-9) {
  return Math.abs(actual - expected) <= tolerance * Math.max(1, Math.abs(expected));
}
