// Mouse preso na missão (Rodada 58): cursor virtual que repassa hover, clique e roda aos elementos da tela.
// DOM simulado no Node (EventTarget nativo) — nenhum navegador. O comportamento real do Pointer Lock (Esc, Alt+Tab,
// tecla Windows) é PENDENTE DE VALIDAÇÃO E2E.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { clampToScreen, scrollableAncestor, createVirtualCursor } from '../src/scene/virtualCursor.ts';

// Eventos de mouse mínimos (o Node não tem MouseEvent/PointerEvent).
globalThis.MouseEvent ??= class extends Event { constructor(type, init = {}) { super(type, init); Object.assign(this, { clientX: init.clientX, clientY: init.clientY, button: init.button ?? 0, buttons: init.buttons ?? 0, relatedTarget: init.relatedTarget ?? null }); } };
globalThis.PointerEvent ??= class extends globalThis.MouseEvent { constructor(type, init = {}) { super(type, init); this.pointerType = init.pointerType; } };

class FakeElement extends EventTarget {
  constructor(name, parent = null, box = {}) { super(); this.name = name; this.parentElement = parent; this.log = []; this.scrollTop = 0; this.scrollHeight = box.scrollHeight ?? 0; this.clientHeight = box.clientHeight ?? 0; this.focused = false; }
  contains(other) { for (let n = other; n; n = n.parentElement) if (n === this) return true; return false; }
  focus() { this.focused = true; }
  dispatchEvent(event) { for (let n = this; n; n = n.parentElement) if (n !== this && !event.bubbles) break; this.log.push(event.type); return super.dispatchEvent(event); }
}
globalThis.getComputedStyle = el => ({ overflowY: el.overflow ?? 'visible' });

function setup() {
  const page = new FakeElement('page');
  const list = new FakeElement('lista', page, { scrollHeight: 900, clientHeight: 300 }); list.overflow = 'auto';
  const left = new FakeElement('carta-esquerda', list), right = new FakeElement('carta-direita', list);
  const drawn = [];
  const dom = { width: () => 1000, height: () => 600, elementFromPoint: (x) => (x < 500 ? left : right), draw: (x, y, visible) => drawn.push({ x, y, visible }) };
  return { cursor: createVirtualCursor(dom), page, list, left, right, drawn };
}

test('clampToScreen mantém o cursor dentro da janela', () => {
  assert.deepEqual(clampToScreen(-50, 30, 800, 600), { x: 0, y: 30 });
  assert.deepEqual(clampToScreen(900, 700, 800, 600), { x: 799, y: 599 });
  assert.deepEqual(clampToScreen(10, 10, 0, 0), { x: 0, y: 0 });
});

test('ligado nasce no centro da tela e aparece; desligado some', () => {
  const { cursor, drawn } = setup();
  assert.equal(cursor.isActive(), false);
  cursor.setActive(true);
  assert.deepEqual(cursor.position(), { x: 500, y: 300 });
  assert.deepEqual(drawn.at(-1), { x: 500, y: 300, visible: true });
  cursor.setActive(false);
  assert.equal(drawn.at(-1).visible, false);
});

test('desligado não move nem clica em nada', () => {
  const { cursor, left, right } = setup();
  cursor.move(100, 0); cursor.down(0); cursor.up(0); cursor.wheel(50);
  assert.deepEqual([...left.log, ...right.log], []);
});

test('mover segue o mouse 1:1 e não sai da tela', () => {
  const { cursor } = setup();
  cursor.setActive(true);
  cursor.move(-120, 40);
  assert.deepEqual(cursor.position(), { x: 380, y: 340 });
  cursor.move(-5000, 5000);
  assert.deepEqual(cursor.position(), { x: 0, y: 599 });
});

test('passar por cima: sai de um elemento e entra no outro (hover das cartas)', () => {
  const { cursor, left, right } = setup();
  cursor.setActive(true);            // centro (x=500) = carta da direita
  cursor.move(-200, 0);              // vai para a esquerda
  assert.ok(right.log.includes('mouseout'), 'saiu da direita');
  assert.ok(left.log.includes('mouseover') && left.log.includes('mousemove'), 'entrou na esquerda');
});

test('apertar e soltar no mesmo elemento = clique; arrastar para outro não clica', () => {
  const { cursor, left, right } = setup();
  cursor.setActive(true); cursor.move(-200, 0);
  cursor.down(0); cursor.up(0);
  assert.deepEqual(left.log.filter(t => /down|up|click/.test(t)), ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']);
  assert.ok(left.focused, 'clique foca o elemento (botões e campos)');
  left.log.length = 0;
  cursor.down(0); cursor.move(400, 0); cursor.up(0);
  assert.ok(!left.log.includes('click') && !right.log.includes('click'), 'sem clique ao soltar em outro elemento');
});

test('clique dentro de um filho do elemento apertado também vale', () => {
  const page = new FakeElement('p'); const card = new FakeElement('carta', page); const icon = new FakeElement('ícone', card);
  let target = card;
  const cursor = createVirtualCursor({ width: () => 100, height: () => 100, elementFromPoint: () => target, draw() {} });
  cursor.setActive(true); cursor.down(0); target = icon; cursor.up(0);
  assert.ok(icon.log.includes('click'));
});

test('botão direito: menu de contexto, sem clique', () => {
  const { cursor, right } = setup();
  cursor.setActive(true); cursor.down(2); cursor.up(2);
  assert.ok(right.log.includes('contextmenu'));
  assert.ok(!right.log.includes('click'));
});

test('roda do mouse rola a lista debaixo do cursor', () => {
  const { cursor, list } = setup();
  cursor.setActive(true); cursor.wheel(120);
  assert.equal(list.scrollTop, 120);
  assert.equal(scrollableAncestor(new FakeElement('solto')), null, 'sem lista rolável, nada acontece');
});

test('GameCanvas: tela aberta na missão mantém o ponteiro preso e liga o cursor virtual', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.match(canvas, /if\(pointerLocked\(\)&&!cameraCanMove\(\)&&!ui\)document\.exitPointerLock\(\);cursor\.setActive\(pointerLocked\(\)&&ui\);/, 'só solta o ponteiro fora das telas da missão');
  assert.match(canvas, /const overlayUi=\(\)=>enabledRef\.current&&!cameraCanMove\(\)&&!debugOpenRef\.current&&!defeated&&!victory;/, 'telas da missão; debug, derrota e vitória soltam o mouse');
  assert.match(canvas, /const forwardButton=\(e:MouseEvent\)=>\{if\(!e\.isTrusted\|\|!cursor\.isActive\(\)\)return;/, 'eventos sintéticos não reentram');
  assert.match(canvas, /const onLockedMove=\(e:MouseEvent\)=>\{if\(!e\.isTrusted\)return;/);
  assert.match(canvas, /window\.addEventListener\('blur',onBlur\)/, 'Alt+Tab / tecla Windows (perda de foco) continua pausando');
  assert.match(canvas, /document\.addEventListener\('visibilitychange',onHidden\)/, 'janela escondida pausa');
});
