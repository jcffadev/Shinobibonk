// Configurações (Rodada 55): música padrão em 10% e migração sem apagar a escolha do jogador.
// settings.ts lê o localStorage ao carregar: cada cenário usa um carregamento limpo (loadFresh).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { loadFresh, memoryStorage } from './helpers/load.mjs';

const source = fs.readFileSync(new URL('../src/game/settings.ts', import.meta.url), 'utf8');
const KEY = source.match(/const KEY\s*=\s*['"]([^'"]+)['"]/)?.[1];

async function withSaved(saved) {
  globalThis.localStorage = memoryStorage(saved === undefined ? {} : { [KEY]: JSON.stringify(saved) });
  return loadFresh('/src/game/settings.ts');
}

test('a chave de armazenamento das configurações existe no código', () => {
  assert.ok(KEY, 'KEY encontrada em settings.ts');
});

test('primeira abertura (nada salvo): música em 10%', async () => {
  const S = await withSaved(undefined);
  assert.equal(S.DEFAULT_SETTINGS.musicVolume, .1);
  assert.equal(S.readSettings().musicVolume, .1);
});

test('save antigo no padrão de 70% (sem versão) migra para 10%', async () => {
  const S = await withSaved({ musicVolume: .7 });
  assert.equal(S.readSettings().musicVolume, .1);
});

test('volume escolhido pelo jogador é mantido (40%, 70% já na versão nova, 0%)', async () => {
  assert.equal((await withSaved({ musicVolume: .4 })).readSettings().musicVolume, .4);
  const current = (await withSaved(undefined)).DEFAULT_SETTINGS.settingsVersion;
  assert.equal((await withSaved({ musicVolume: .7, settingsVersion: current })).readSettings().musicVolume, .7, 'quem escolheu 70% depois da migração mantém');
  assert.equal((await withSaved({ musicVolume: 0 })).readSettings().musicVolume, 0);
});

test('save corrompido não quebra: volta ao padrão', async () => {
  globalThis.localStorage = memoryStorage({ [KEY]: '{isto não é json' });
  const S = await loadFresh('/src/game/settings.ts');
  assert.equal(S.readSettings().musicVolume, .1);
});

test('demais preferências salvas sobrevivem à migração', async () => {
  const S = await withSaved({ musicVolume: .7, sfxVolume: .3, showFps: false });
  const s = S.readSettings();
  assert.equal(s.sfxVolume, .3);
  assert.equal(s.showFps, false);
});

test('"Mostrar áreas das técnicas" vem ligado por padrão', async () => {
  assert.equal((await withSaved(undefined)).DEFAULT_SETTINGS.showTechniqueAreas, true);
});

test('câmera mais perto por padrão, com limite para afastar (rodada 77: "o inicial está MUITO distante")', async () => {
  const fresh = await withSaved(undefined);
  assert.equal(fresh.readSettings().cameraDistance, 12, 'padrão novo');
  assert.ok(fresh.CAMERA_ZOOM.max <= 22 && fresh.CAMERA_ZOOM.min >= 8, 'faixa limitada');
  const old = await withSaved({ cameraDistance: 19, settingsVersion: 2 });
  assert.equal(old.readSettings().cameraDistance, 12, 'padrão antigo 19 migra para 12');
  const chosen = await withSaved({ cameraDistance: 15, settingsVersion: 2 });
  assert.equal(chosen.readSettings().cameraDistance, 15, 'escolha do jogador fica');
  const far = await withSaved({ cameraDistance: 32, settingsVersion: 2 });
  assert.equal(far.readSettings().cameraDistance, 22, 'longe demais volta ao limite');
  const music = await withSaved({ musicVolume: .7, settingsVersion: 2 });
  assert.equal(music.readSettings().musicVolume, .7, 'migração da música não roda de novo na v2');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(canvas, /CAMERA_ZOOM\.min,CAMERA_ZOOM\.max/, 'a roda do mouse respeita o limite');
});
