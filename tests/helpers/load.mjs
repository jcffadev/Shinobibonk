// Carrega módulos do jogo (TypeScript, imports sem extensão, aliases do Vite) DENTRO do Node, sem abrir navegador.
// Usa o carregador SSR do próprio Vite; cada arquivo de teste roda em processo separado (node --test), então o
// estado de módulos como settings.ts começa limpo em cada arquivo.
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

/** localStorage em memória para módulos que leem configurações ao carregar. */
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
