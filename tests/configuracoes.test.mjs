// Configurações (rodada 55): música padrão em 10% e migração sem apagar a escolha do jogador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { memoryStorage } from './helpers/load.mjs';

// Cada cenário precisa de settings.ts recém-carregado (ele lê o localStorage ao importar).
async function settingsWith(saved) {
  globalThis.localStorage = memoryStorage(saved === undefined ? {} : { shinobibonk_settings_v1: JSON.stringify(saved) });
  const server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null } });
  try { return await server.ssrLoadModule('/src/game/settings.ts'); } finally { await server.close(); }
}

test('primeira abertura: música em 10%', async () => {
  const S = await settingsWith(undefined);
  assert.equal(S.DEFAULT_SETTINGS.musicVolume, .1);
  assert.equal(S.readSettings().musicVolume, .1);
});

test('quem estava no padrão antigo (70%) e nunca mexeu passa para 10%', async () => {
  const key = await storageKey();
  globalThis.__key = key;
  const S = await settingsWithKey(key, { musicVolume: .7 });
  assert.equal(S.readSettings().musicVolume, .1);
});

test('volume escolhido pelo jogador é mantido', async () => {
  const key = await storageKey();
  const S = await settingsWithKey(key, { musicVolume: .4 });
  assert.equal(S.readSettings().musicVolume, .4);
});

test('opção "Mostrar áreas das técnicas" vem ligada', async () => {
  const S = await settingsWith(undefined);
  assert.equal(S.DEFAULT_SETTINGS.showTechniqueAreas, true);
});

// O nome da chave do localStorage é lido do próprio código (não fica fixo no teste).
async function storageKey() {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../src/game/settings.ts', import.meta.url), 'utf8');
  const match = src.match(/const KEY\s*=\s*['"]([^'"]+)['"]/);
  assert.ok(match, 'chave de configurações encontrada em settings.ts');
  return match[1];
}
async function settingsWithKey(key, saved) {
  globalThis.localStorage = memoryStorage({ [key]: JSON.stringify(saved) });
  const server = await createServer({ appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false, watch: null } });
  try { return await server.ssrLoadModule('/src/game/settings.ts'); } finally { await server.close(); }
}
