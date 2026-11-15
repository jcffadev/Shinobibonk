// Rodada 83: bordas da tela piscam em vermelho ao levar dano + som de hit recebido (lógica pura, sem navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  DAMAGE_FEEDBACK as F, createDamageFlash, flashOpacity, flashStrength, hurtSoundAllowed, lowHpOpacity, registerHit,
  sfxGain, vignetteOpacity,
} from '../src/game/damageFeedback.ts';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8');

test('intensidade do piscar cresce com o dano em relação à vida máxima, com piso e teto', () => {
  assert.equal(flashStrength(0, 100), 0);
  assert.equal(flashStrength(-5, 100), 0);
  assert.equal(flashStrength(NaN, 100), 0);
  const leve = flashStrength(1, 100), medio = flashStrength(10, 100), pesado = flashStrength(60, 100);
  assert.ok(leve >= F.minStrength && leve < medio && medio < pesado, `${leve} < ${medio} < ${pesado}`);
  assert.equal(pesado, F.maxStrength, 'golpe enorme fica no teto');
  assert.ok(Math.abs(medio - (F.minStrength + .1 * F.damageScale)) < 1e-9);
  assert.equal(flashStrength(10, 1000), flashStrength(1, 100), 'mesma fração da vida = mesma intensidade');
  assert.ok(flashStrength(5, 0) <= F.maxStrength, 'vida máxima 0 não quebra');
});

test('o piscar some em flashMs (entre 0,3 e 0,5 s)', () => {
  assert.ok(F.flashMs >= 300 && F.flashMs <= 500);
  const flash = createDamageFlash();
  assert.equal(flashOpacity(flash, 0), 0, 'sem golpe, sem vinheta');
  assert.equal(registerHit(flash, 1000, 20, 100), true);
  const topo = flashOpacity(flash, 1000);
  assert.equal(topo, flashStrength(20, 100));
  assert.ok(flashOpacity(flash, 1000 + F.flashMs / 2) < topo);
  assert.equal(flashOpacity(flash, 1000 + F.flashMs), 0);
  assert.equal(flashOpacity(flash, 999), 0, 'antes do golpe não pisca');
});

test('limite de frequência: muitos golpes seguidos não viram estroboscópio', () => {
  const flash = createDamageFlash();
  let starts = 0;
  // 40 golpes em 1 s (um a cada 25 ms): no máximo ceil(1000 / minGapMs) piscares começam.
  for (let t = 0; t < 1000; t += 25) if (registerHit(flash, t, 5, 100)) starts++;
  assert.ok(starts <= Math.ceil(1000 / F.minGapMs), `${starts} piscares em 1 s`);
  assert.ok(starts >= 2, 'golpes contínuos ainda piscam de vez em quando');
  assert.ok(F.minGapMs >= 250, 'no máximo ~4 piscares por segundo');
});

test('golpe mais forte dentro do intervalo reforça o piscar sem reiniciá-lo', () => {
  const flash = createDamageFlash();
  registerHit(flash, 0, 1, 100);
  const startedAt = flash.startedAt;
  assert.equal(registerHit(flash, 100, 50, 100), false);
  assert.equal(flash.startedAt, startedAt, 'o brilho não volta ao topo');
  assert.equal(flash.strength, flashStrength(50, 100));
  assert.equal(registerHit(flash, 150, 1, 100), false);
  assert.equal(flash.strength, flashStrength(50, 100), 'golpe fraco não reduz');
  assert.equal(registerHit(flash, 200, 0, 100), false, 'sem dano não registra');
});

test('novo piscar nunca começa mais fraco que o que ainda está na tela', () => {
  const flash = createDamageFlash();
  registerHit(flash, 0, 80, 100);
  registerHit(flash, F.minGapMs, 1, 100);
  assert.ok(flash.strength >= flashStrength(1, 100));
  assert.ok(flashOpacity(flash, F.minGapMs) > flashStrength(1, 100) - 1e-9);
});

test('vida baixa: vinheta fraca e contínua, mais forte quanto menos vida', () => {
  assert.equal(lowHpOpacity(100, 100, 0), 0);
  assert.equal(lowHpOpacity(F.lowHpRatio * 100, 100, 0), 0, 'no limite ainda não aparece');
  assert.equal(lowHpOpacity(0, 100, 0), 0, 'derrotado: sem vinheta');
  for (let t = 0; t < 2000; t += 50) {
    const pouco = lowHpOpacity(25, 100, t), quase = lowHpOpacity(2, 100, t);
    assert.ok(pouco > 0 && pouco < quase, `t=${t}: ${pouco} < ${quase}`);
    assert.ok(quase <= F.lowHpMax && quase < F.minStrength + .1, 'mais fraca que um piscar de golpe');
  }
  const amostras = Array.from({ length: 40 }, (_, i) => lowHpOpacity(10, 100, i * 25));
  assert.ok(Math.max(...amostras) - Math.min(...amostras) > .01, 'pulsa devagar');
});

test('vinheta final: maior entre piscar e vida baixa; opção desligada zera; H deixa mais discreta', () => {
  const flash = createDamageFlash();
  registerHit(flash, 0, 30, 100);
  const on = { enabled: true };
  assert.equal(vignetteOpacity(flash, 0, 100, 100, on), flashStrength(30, 100));
  assert.equal(vignetteOpacity(flash, 0, 100, 100, { enabled: false }), 0);
  assert.ok(Math.abs(vignetteOpacity(flash, 0, 100, 100, { enabled: true, hiddenEffects: true }) - flashStrength(30, 100) * F.hiddenEffectsFactor) < 1e-9);
  assert.equal(vignetteOpacity(flash, 5000, 10, 100, on), lowHpOpacity(10, 100, 5000), 'depois do piscar fica a vida baixa');
  assert.equal(vignetteOpacity(flash, 5000, 10, 100, { enabled: false }), 0, 'desligado some também a vida baixa');
  assert.ok(vignetteOpacity(flash, 0, 1, 100, on) <= 1);
});

test('som de hit recebido: limite de frequência e volume geral × efeitos', () => {
  assert.equal(hurtSoundAllowed(-Infinity, 0), true);
  assert.equal(hurtSoundAllowed(1000, 1000 + F.sfxGapMs - 1), false);
  assert.equal(hurtSoundAllowed(1000, 1000 + F.sfxGapMs), true);
  let last = -Infinity, plays = 0;
  for (let t = 0; t < 1000; t += 10) if (hurtSoundAllowed(last, t)) { last = t; plays++; }
  assert.ok(plays <= Math.ceil(1000 / F.sfxGapMs), `${plays} sons em 1 s`);
  assert.equal(sfxGain({ volume: .7, sfxVolume: 1 }), .7);
  assert.equal(sfxGain({ volume: .5, sfxVolume: .4 }), .2);
  assert.equal(sfxGain({ volume: 1, sfxVolume: 0 }), 0, 'efeitos no 0 = mudo');
  assert.equal(sfxGain({ volume: 2, sfxVolume: 2 }), 1);
  assert.equal(sfxGain({ volume: NaN, sfxVolume: 1 }), 0);
});

test('o jogo usa as funções testadas (GameCanvas, sfx, Configurações e CSS)', () => {
  const canvas = read('../src/scene/GameCanvas.tsx');
  assert.match(canvas, /registerHit\(damageFlash,/);
  assert.match(canvas, /playHurt\(flashStrength\(/);
  assert.match(canvas, /vignetteOpacity\(damageFlash,.*currentSettings\(\)\.damageFlash/, 'vinheta respeita a opção damageFlash');
  const sfx = read('../src/audio/sfx.ts');
  assert.match(sfx, /export function playHurt/);
  assert.match(sfx, /hurtSoundAllowed\(lastHurt/);
  assert.match(sfx, /sfxGain\(S\)/);
  assert.match(read('../src/game/settings.ts'), /damageFlash: true/, 'ligada por padrão');
  assert.match(read('../src/ui/SettingsScreen.tsx'), /set\(\{ damageFlash: v \}\)/);
  const css = read('../src/style.css').match(/\.player-damage-vignette \{[^}]*\}/)?.[0] ?? '';
  assert.match(css, /pointer-events:none/);
  assert.match(css, /rgba\(150,0,14,0\) 48%/, 'centro transparente: só bordas e cantos');
});

test('proteção de nível continua e só o HP perdido produz número vermelho', async () => {
  const { calculateStats, incomingDamage } = await import('../src/game/progression.ts');
  const stats = calculateStats('naruto', 53);
  assert.ok(incomingDamage(7, stats.armor) >= 1, 'a armadura do Nv. 53 reduz, mas não zera a shuriken');
  const canvas = read('../src/scene/GameCanvas.tsx');
  assert.match(canvas, /if\(xp>=xpNext\|\|pendingLevels>0\)\{[^\n]+openLevelReward\(\);invulnerability=3;/);
  assert.match(canvas, /if\(invulnerability>0\|\|defeated\|\|debugState\.god\)return false/);
  assert.match(canvas, /if\(hit\)damagePlayer\(shot\.damage\)/);
  assert.match(canvas, /if\(hp<hpBefore\)\{\s*playerMotion\.hurt\(\);\s*damageNumber\(player\.position,hpBefore-hp,0,true\);/);
  assert.match(canvas, /protection:debugState\.god\?'debug':invulnerability>\.25\?'temporary'/);
  assert.match(read('../src/main.tsx'), /world\.protection&&<span className="run-protection"/);
  assert.match(read('../src/scene/damageNumbers.ts'), /const color = received \? '#ff605b'/);
});

test('dano bem visível e audível: vinheta forte, personagem pisca vermelho e baque dissonante (rodada 90)', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
  assert.ok(!/prefers-reduced-motion[^}]*player-damage-vignette[^}]*display:\s*none/.test(css), 'não some com animações reduzidas');
  assert.ok(F.minStrength >= .5 && F.maxStrength === 1, 'golpe fraco já aparece');
  const { HURT_BLINK, hurtColor } = await import('../src/game/damageFeedback.ts');
  assert.equal(hurtColor(0), '#ffffff');
  const colors = new Set(Array.from({ length: 6 }, (_, i) => hurtColor(HURT_BLINK.seconds - i * HURT_BLINK.period - .001)));
  assert.ok(colors.has(HURT_BLINK.on) && colors.has(HURT_BLINK.off), 'alterna vermelho vivo e rosa');
  assert.ok(HURT_BLINK.seconds >= .3, 'pisca por tempo suficiente para ver');
  assert.ok(HURT_BLINK.on !== HURT_BLINK.off && parseInt(HURT_BLINK.on.slice(1, 3), 16) > 220 && parseInt(HURT_BLINK.on.slice(3, 5), 16) < 80, 'pico em vermelho vivo');
  const sfx = fs.readFileSync(new URL('../src/audio/sfx.ts', import.meta.url), 'utf8');
  assert.match(sfx, /tones: \[\[246, 72\], \[262, 76\]\]/, 'duas serras desafinadas (dissonância)');
  assert.ok(sfx.includes("osc.type = 'sawtooth'"));
});
