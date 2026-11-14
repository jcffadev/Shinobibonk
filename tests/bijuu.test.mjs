// Bijū (Rodada 58 — "Corrigir o aparecimento das bijuus, animação"): lógica real de src/scene/bossCombat.ts no Node.
// Three.js sem renderizar; a imagem do atlas não carrega no Node, então o teste injeta uma imagem falsa quando precisa.
// A aparência final na tela é PENDENTE DE VALIDAÇÃO E2E.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { load, installCanvasStub, memoryStorage } from './helpers/load.mjs';

installCanvasStub();
globalThis.localStorage ??= memoryStorage();
const B = await load('/src/scene/bossCombat.ts');
const { BIJUU, BIJUU_BACK_SHEETS, bijuuFacesAway, bijuuSheetCell } = await load('/src/game/bijuu.ts');

function setup(id = BIJUU[0].id, extra = {}) {
  const scene = new THREE.Scene(), player = new THREE.Object3D();
  player.position.set(-6, 0, 0);
  const combat = B.createBossCombat({ scene, player, height: () => 0, zone: () => 3, hidden: () => false, hitPlayer: () => {}, viewRight: () => new THREE.Vector3(1, 0, 0), viewForward: () => new THREE.Vector3(0, 0, -1), ...extra });
  const oldArt = new THREE.Texture();
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: oldArt }));
  sprite.scale.set(B.BIJUU_SIZE, B.BIJUU_SIZE, 1);
  const host = { sprite, hp: 1000, heroId: id, guardian: true };
  combat.attach(host, 1000, true);
  return { combat, host, oldArt, scene };
}
const fakeImage = map => { map.image = { width: 1024, height: 768, naturalWidth: 1024, src: 'x' }; };

test('existem bijū no jogo e cada uma usa uma célula do atlas de movimento', () => {
  assert.ok(BIJUU.length >= 9, `${BIJUU.length} bijū`);
  for (const [index, beast] of BIJUU.entries()) {
    const { host } = setup(beast.id);
    assert.equal(host.boss.motionRow, index % 3, `${beast.id}: fileira ${index % 3}`);
    assert.ok(Math.abs(host.boss.motionMap.repeat.x - .25) < 1e-9 && Math.abs(host.boss.motionMap.repeat.y - 1 / 3) < 1e-9, 'célula = 1/4 × 1/3 do atlas');
  }
});

test('aparecimento: já nasce com a folha de movimento (não mostra a arte antiga antes)', () => {
  const { host, oldArt } = setup();
  assert.notEqual(host.sprite.material.map, oldArt);
  assert.equal(host.sprite.material.map, host.boss.motionMap);
});

test('atlas sem mipmaps (de longe não vazam quadros vizinhos)', () => {
  const { host } = setup();
  assert.equal(host.boss.motionMap.generateMipmaps, false);
  assert.equal(host.boss.motionMap.minFilter, THREE.NearestFilter);
  assert.equal(host.boss.motionMap.magFilter, THREE.NearestFilter);
});

test('entrada: surge do chão em BIJUU_ARRIVAL s (opacidade e tamanho crescem e terminam em 100%)', () => {
  const { combat, host } = setup();
  fakeImage(host.boss.motionMap);
  assert.equal(host.sprite.material.opacity, 0, 'começa invisível');
  let lastOpacity = -1, lastHeight = 0;
  for (let t = 0; t < B.BIJUU_ARRIVAL + .3; t += 1 / 30) {
    combat.update(host, 1 / 30, false);
    assert.ok(host.sprite.material.opacity >= lastOpacity - 1e-9, 'opacidade só sobe');
    lastOpacity = host.sprite.material.opacity; lastHeight = host.sprite.scale.y;
  }
  assert.equal(host.sprite.material.opacity, 1);
  assert.equal(host.boss.arrival, undefined, 'entrada termina');
  assert.ok(Math.abs(lastHeight / B.BIJUU_SIZE - 1) < .1, `tamanho final ≈ BIJUU_SIZE (${lastHeight})`);
});

test('proporção: largura = altura (células quadradas), sem esticar', () => {
  const { combat, host } = setup();
  fakeImage(host.boss.motionMap);
  for (let t = 0; t < 3; t += 1 / 30) combat.update(host, 1 / 30, false);
  const ratio = host.sprite.scale.x / host.sprite.scale.y;
  assert.ok(Math.abs(ratio - 1) < .08, `largura/altura = ${ratio.toFixed(3)}`);
});

test('curva da entrada vai de 0 a 1 sem passar de 1', () => {
  assert.equal(B.arrivalProgress(B.BIJUU_ARRIVAL), 0);
  assert.equal(B.arrivalProgress(0), 1);
  for (let r = 0; r <= B.BIJUU_ARRIVAL; r += .05) { const k = B.arrivalProgress(r); assert.ok(k >= 0 && k <= 1); }
});

test('espelha pelo lado da tela onde está o jogador, sem piscar perto do centro', () => {
  const { combat, host } = setup();
  fakeImage(host.boss.motionMap);
  combat.update(host, 1 / 30, false);
  assert.equal(host.boss.flip, true, 'jogador à esquerda → vira para a esquerda');
  host.sprite.position.set(-6.3, 0, 0); // jogador quase alinhado (0,3 m)
  combat.update(host, 1 / 30, false);
  assert.equal(host.boss.flip, true, 'dentro da folga de 0,6 m não troca');
});

test('vista de costas: regra com histerese (igual ao jogador)', () => {
  assert.equal(bijuuFacesAway(false, .9), true, 'andando para dentro da tela → costas');
  assert.equal(bijuuFacesAway(true, -.9), false, 'vindo para a câmera → frente');
  assert.equal(bijuuFacesAway(true, .2), true, 'zona intermediária mantém');
  assert.equal(bijuuFacesAway(false, .2), false, 'zona intermediária mantém');
  assert.equal(bijuuFacesAway(true, undefined), true, 'parada mantém a última vista');
  assert.deepEqual(bijuuSheetCell(4), { page: 1, row: 1 });
});

test('sem arte de costas registrada: nenhuma folha extra é carregada (sem 404)', () => {
  assert.ok(Array.isArray(BIJUU_BACK_SHEETS));
  const { host } = setup(BIJUU[0].id, { backSheets: [] });
  assert.equal(host.boss.backMap, undefined);
});

test('com arte de costas: anda para dentro da tela → folha de costas; volta → frente', () => {
  const { combat, host } = setup(BIJUU[4].id, { backSheets: [undefined, '/assets/bijuu/costas-2.png'] });
  assert.ok(host.boss.backMap, 'folha de costas carregada para a página certa');
  assert.ok(Math.abs(host.boss.backMap.offset.y - (2 - 1) / 3) < 1e-9, 'mesma linha da folha de frente');
  fakeImage(host.boss.motionMap); fakeImage(host.boss.backMap);
  for (let t = 0; t < 1.5; t += 1 / 30) combat.update(host, 1 / 30, false); // termina a entrada parada
  for (let i = 0; i < 20; i++) { host.sprite.position.z -= .1; combat.update(host, 1 / 30, false); }
  assert.equal(host.sprite.material.map, host.boss.backMap, 'de costas ao se afastar da câmera');
  for (let i = 0; i < 20; i++) combat.update(host, 1 / 30, false);
  assert.equal(host.sprite.material.map, host.boss.backMap, 'parada mantém as costas');
  for (let i = 0; i < 20; i++) { host.sprite.position.z += .1; combat.update(host, 1 / 30, false); }
  assert.equal(host.sprite.material.map, host.boss.motionMap, 'de frente ao vir para a câmera');
});

test('com arte registrada mas ainda não carregada: usa a folha de frente', () => {
  const { combat, host } = setup(BIJUU[0].id, { backSheets: ['/assets/bijuu/costas-1.png'] });
  fakeImage(host.boss.motionMap);
  for (let i = 0; i < 40; i++) { host.sprite.position.z -= .1; combat.update(host, 1 / 30, false); }
  assert.equal(host.sprite.material.map, host.boss.motionMap);
});
