// Rodada 97: Treinamento do Hagoromo — chaves, raridade, hordas, ferramentas do Sábio, troca e ligação na partida (sem navegador).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  HAGOROMO, HAGOROMO_WAVES, SAGE_TOOLS, TOOL_BY_ID, addHagoromoKills, chooseTool, createHagoromo, hagoromoRecharges, nextHagoromoStage,
  rollHagoromoRarity, rollToolOffers, toolBonuses, waveSpots,
} from '../src/game/hagoromoTraining.ts';

const seeded = (seed = 1) => () => (seed = seed * 48271 % 2147483647) / 2147483647;

test('1 chave a cada 500 abates, até 3; abates do evento e sem recarga não contam', () => {
  const s = createHagoromo();
  addHagoromoKills(s, 499, { inEvent: false, recharge: true }); assert.equal(s.keys, 0);
  addHagoromoKills(s, 1, { inEvent: false, recharge: true }); assert.equal(s.keys, 1);
  addHagoromoKills(s, 400, { inEvent: true, recharge: true }); assert.equal(s.progress, 0, 'hordas do evento não recarregam');
  addHagoromoKills(s, 400, { inEvent: false, recharge: false }); assert.equal(s.progress, 0, 'sem recarga depois do chefe');
  addHagoromoKills(s, 5000, { inEvent: false, recharge: true }); assert.equal(s.keys, HAGOROMO.maxKeys, 'acumula até 3');
  assert.equal(hagoromoRecharges('classico', true), false); assert.equal(hagoromoRecharges('classico', false), true);
  assert.equal(hagoromoRecharges('sobrevivencia', true), true, 'na Sobrevivência sempre recarrega');
});

test('raridades e hordas pedidas pelo usuário', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(HAGOROMO_WAVES).map(([r, w]) => [r, [w.waves, w.perWave]])),
    { Comum: [3, 50], Incomum: [4, 100], Raro: [5, 150], 'Épico': [6, 200], 'Lendário': [7, 400] });
  const rng = seeded(7), seen = new Set();
  for (let i = 0; i < 2000; i++) seen.add(rollHagoromoRarity(rng));
  assert.equal(seen.size, 5, 'todas as raridades podem sair');
  const spots = waveSpots(10, 10, 50, seeded(3));
  assert.equal(spots.length, 50);
  for (const p of spots) { const d = Math.hypot(p.x - 10, p.z - 10); assert.ok(d >= HAGOROMO.waveRing[0] - 1e-9 && d <= HAGOROMO.waveRing[1] + 1e-9, 'horda em volta do jogador'); }
});

test('em cada raridade, a próxima horda e o chefe só vêm depois do último inimigo', () => {
  for (const [rarity, { waves }] of Object.entries(HAGOROMO_WAVES)) {
    for(let wave=0;wave<waves;wave++) assert.equal(nextHagoromoStage(rarity, wave, false, false), 'wave');
    assert.equal(nextHagoromoStage(rarity, waves, true, false), 'wait');
    assert.equal(nextHagoromoStage(rarity, waves, false, false), 'boss');
    assert.equal(nextHagoromoStage(rarity, waves, true, true), 'wait');
    assert.equal(nextHagoromoStage(rarity, waves, false, true), 'reward');
  }
});

test('ferramentas do Sábio: 9 com subefeito (2·2·2·2·1) + 5 de atributo por raridade (26/11/2026)', () => {
  // "Criar mais recompensas do Hagoromo, pelo menos mais 5 itens de cada raridade".
  assert.equal(SAGE_TOOLS.length, 34);
  const special = SAGE_TOOLS.filter(t => t.effect !== 'passive'), passive = SAGE_TOOLS.filter(t => t.effect === 'passive');
  const count = (list, r) => list.filter(t => t.rarity === r).length, rarities = ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'];
  assert.deepEqual(rarities.map(r => count(special, r)), [2, 2, 2, 2, 1]);
  assert.deepEqual(rarities.map(r => count(passive, r)), [5, 5, 5, 5, 5]);
  for (const t of SAGE_TOOLS) { assert.ok(Object.keys(t.bonus).length && t.stat && t.detail && t.effect && t.icon, t.name); }
  assert.equal(new Set(SAGE_TOOLS.map(t => t.id)).size, 34, 'ids únicos');
  assert.equal(new Set(SAGE_TOOLS.map(t => t.name)).size, 34, 'nomes únicos');
  assert.equal(new Set(special.map(t => t.effect)).size, 9, 'subefeitos diferentes');
  assert.deepEqual(toolBonuses(['benihisago', 'shichiseiken']), { gold: .15, exp: .1, damage: .25 });
});

test('recompensa: 3 opções que o jogador não tem; máximo 3 com troca ("Manter?")', () => {
  const offers = rollToolOffers(['amuleto', 'espada'], 'Raro', seeded(5));
  assert.equal(offers.length, 3); assert.ok(offers.every(t => !['amuleto', 'espada'].includes(t.id)));
  assert.equal(new Set(offers.map(t => t.id)).size, 3);
  assert.deepEqual(chooseTool([], 'kohaku'), ['kohaku'], 'com menos de 3, entra');
  const full = ['amuleto', 'espada', 'kohaku'];
  assert.deepEqual(chooseTool(full, 'shichiseiken'), full, 'com 3 e sem escolher qual sai, a nova é dispensada');
  assert.deepEqual(chooseTool(full, 'shichiseiken', 'shichiseiken'), full, 'clicar na nova dispensa');
  assert.deepEqual(chooseTool(full, 'shichiseiken', 'espada'), ['amuleto', 'shichiseiken', 'kohaku'], 'clicar numa que já tem troca');
  assert.equal(rollToolOffers(SAGE_TOOLS.map(t => t.id), 'Comum').length, 0, 'com todas, nada a oferecer');
});

test('a partida liga o evento: tecla C, clareira, hordas, Mega Elite, recompensa, recarga e HUD', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  const settings = fs.readFileSync(new URL('../src/game/settings.ts', import.meta.url), 'utf8');
  for (const wired of [
    "if(key==='c')activateHagoromo();",
    "addHagoromoKills(hagoromo, 1, { inEvent: !!hagoromoEvent, recharge: hagoromoRecharges('classico', hagoromoBossDown) })",
    'if(!sealing&&!hagoromoEvent){elapsed+=dt;',
    'if(hagoromoEvent&&!enemy.hagoromo)continue;',
    'waveSpots(HAGOROMO_ARENA.x,HAGOROMO_ARENA.z,count)',
    'outsideEnemies:enemyList.splice(0),outsideDrops:drops',
    'drops=hagoromoGround;',
    'if(hagoromoEvent.completed)finishHagoromo();',
    'stage:hagoromoStage()',
    'm.arrivalGuard=1;',
    'enemy.boss?.arrival!==undefined',
    "events.filter(mapEventAvailable)",
    "event.active&&event.uses===0",
    'if(enemy.guardian){hagoromoBossDown=true;',
    'scheduleWeather();hagoromoBossDown=false;',
    'if(enemy.megaElite&&!enemy.guardian&&!enemy.hagoromo&&',
    'choiceLevel=-11;choiceData=offers.map(tool=>toolCard(tool));',
    'pendingTool=id;choiceLevel=-12;',
    'Object.entries(toolBonuses(hagoromo.tools))',
    'if(!ally)toolHitHooks(enemy,damage,crit.tier>0);',
  ]) assert.ok(canvas.includes(wired), wired);
  assert.ok(settings.includes("hagoromo: 'c'"), 'tecla C remapeável');
  assert.ok(main.includes('<HagoromoButton') && main.includes('<SageToolSlots'), 'botão e vagas na HUD');
  assert.ok(main.includes("world.choice.level===-11?'TREINAMENTO DO HAGOROMO'"));
  const hud = fs.readFileSync(new URL('../src/ui/HagoromoButton.tsx', import.meta.url), 'utf8');
  assert.ok(hud.includes('<b>{keys}/{HAGOROMO.maxKeys}</b>'));
  assert.ok(hud.includes('/assets/hagoromo-portrait-v1.png'));
  assert.ok(main.includes('<HagoromoStatus stage={world.hagoromo.stage}'));
  assert.match(canvas, /instanceArenas\.update\(animClock,hagoromoPhase\(\),dt,hiddenEffects\)/);
});

test('clareira do treinamento plana em todos os mapas e longe da água e do começo', async () => {
  const { load } = await import('./helpers/load.mjs');
  const { groundHeight, HAGOROMO_ARENA } = await load('/src/scene/terrainArt.ts');
  const { waterDistance } = await load('/src/scene/water.ts');
  for (const map of ['folha', 'areia', 'pedra', 'nevoa']) {
    for (const [dx, dz] of [[0, 0], [10, 0], [0, -10], [-9, 9]]) assert.ok(Math.abs(groundHeight(map, HAGOROMO_ARENA.x + dx, HAGOROMO_ARENA.z + dz)) < .02, map + ' plana');
    assert.ok(waterDistance(map, HAGOROMO_ARENA.x, HAGOROMO_ARENA.z).outside > HAGOROMO.arenaRadius, map + ' longe da água');
  }
  assert.ok(Math.hypot(HAGOROMO_ARENA.x, HAGOROMO_ARENA.z) > 40, 'longe do começo');
  assert.ok(TOOL_BY_ID.shichiseiken.rarity === 'Lendário');
});

test('Treinamento do Hagoromo: a horda continua animada com o relógio da missão parado (25/11)', async () => {
  const canvas = (await import('node:fs')).readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  assert.ok(canvas.includes('if(!sealing&&!hagoromoEvent){elapsed+=dt;'), 'o relógio da missão para no treinamento');
  assert.ok(canvas.includes('      animClock+=dt;\n') || canvas.includes('      animClock+=dt;\r\n'), 'relógio de animação sempre anda');
  assert.ok(canvas.includes(':movingEnemy?Math.floor(animClock*10+sprite.id%4)%4:1;'), 'caminhada da horda usa o relógio de animação');
  assert.ok(!/Math\.floor\(elapsed\*\d+[^)]*\)%4/.test(canvas), 'nenhum quadro de animação preso ao elapsed');
});
