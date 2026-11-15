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

test('câmera em perspectiva por padrão, com a ortográfica antiga nas Configurações (rodada 85)', async () => {
  const s = await withSaved(undefined);
  assert.equal(s.readSettings().cameraProjection, 'perspectiva');
  const d = s.perspectiveDistance(s.CAMERA_ZOOM.default);
  assert.ok(Math.abs(2 * d * Math.tan(s.CAMERA_VIEW.fov * Math.PI / 360) - s.CAMERA_ZOOM.default) < 1e-9, 'mesmo zoom nas duas vistas');
  assert.ok(s.CAMERA_VIEW.pitch < s.CAMERA_VIEW.fov * Math.PI / 360 + .1, 'horizonte perto do topo da tela');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const screen = fs.readFileSync(new URL('../src/ui/SettingsScreen.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes("const perspective=currentSettings().cameraProjection!=='ortografica';"));
  assert.ok(canvas.includes('new THREE.PerspectiveCamera(CAMERA_VIEW.fov'));
  assert.ok(canvas.includes('const orbitDistance=perspective?perspectiveDistance(zoom):zoom*1.65+10;'));
  assert.ok(screen.includes("set({ cameraProjection: v })"));
});

test('Ultimate automática e selamento direto continuam na próxima partida (rodada 88)', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('autoUlt=currentSettings().autoUltimate'), 'a partida começa com o que está salvo');
  assert.ok(canvas.includes('autoUlt=!autoUlt;const saved=readSettings();if(saved.autoUltimate!==autoUlt)saveSettings({...saved,autoUltimate:autoUlt});'), 'trocar na partida salva');
  assert.ok(canvas.includes('if(readSettings().sealAnimation){sealing=p;return;}'), 'selamento lê o salvo');
  assert.ok(main.includes('updateSettings({sealAnimation:!event.target.checked})'), 'a caixa do selamento salva');
  assert.ok(main.includes('const next = { ...readSettings(), ...patch };'), 'uma opção não desfaz a outra');
  assert.ok(main.includes("window.addEventListener('shinobi-settings', sync)"), 'a tela acompanha o que a partida salvou');
});
