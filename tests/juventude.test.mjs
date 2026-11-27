// Rodada 98: Treinamento da Juventude — Might Guy, dificuldade, todos os atributos, 5 desafios e ligação na partida.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';
import {
  YOUTH_CHALLENGES, YOUTH_DIFFICULTIES, YOUTH_GOALS, YOUTH_POWER, YOUTH_STATS, YOUTH_TEXT, rollYouthChallenge, tickYouth,
  youthBonuses, youthBonusText, youthChallengeText, youthSpots,
} from '../src/game/youthTraining.ts';

test('texto, 3 dificuldades e todos os atributos escalando com a dificuldade', () => {
  assert.equal(YOUTH_TEXT, 'DEIXE A JUVENTUDE EXPLODIR EM SEU CORAÇÃO');
  assert.deepEqual(YOUTH_DIFFICULTIES, ['Fácil', 'Normal', 'Difícil']);
  assert.ok(YOUTH_STATS.length >= 18, 'todos os atributos da ficha');
  assert.equal(new Set(YOUTH_STATS.map(s => s.key)).size, YOUTH_STATS.length);
  // 26/11/2026: só o atributo escolhido sobe; força ×4 (Fácil 4 · Normal 8 · Difícil 16).
  for (const s of YOUTH_STATS) {
    const easy = youthBonuses('Fácil', s.key), normal = youthBonuses('Normal', s.key), hard = youthBonuses('Difícil', s.key);
    assert.deepEqual(Object.keys(hard), [s.key], s.label + ' só ele');
    assert.ok(easy[s.key] > 0 && normal[s.key] > easy[s.key] && hard[s.key] > normal[s.key], s.label + ' escala');
  }
  assert.deepEqual(YOUTH_POWER, { Fácil: 4, Normal: 8, Difícil: 16 });
  assert.ok(YOUTH_POWER['Difícil'] > YOUTH_POWER.Normal && YOUTH_POWER.Normal > YOUTH_POWER['Fácil']);
  assert.equal(youthBonusText(YOUTH_STATS.find(s => s.key === 'damage'), 'Difícil'), '+48%');
});

test('os 5 desafios pedidos, com metas por dificuldade', () => {
  assert.deepEqual([...YOUTH_CHALLENGES].sort(), ['guy', 'kills', 'lee', 'nohit', 'spots']);
  assert.deepEqual(['Fácil', 'Normal', 'Difícil'].map(d => YOUTH_GOALS.kills[d].goal), [100, 200, 400]);
  assert.equal(YOUTH_GOALS.spots.Difícil.goal, 10); assert.equal(YOUTH_GOALS.spots.Difícil.seconds, 60);
  for (const c of YOUTH_CHALLENGES) for (const d of YOUTH_DIFFICULTIES) assert.ok(youthChallengeText(c, d).length > 10);
  const seen = new Set(); let x = 1; const rng = () => (x = x * 48271 % 2147483647) / 2147483647;
  for (let i = 0; i < 200; i++) seen.add(rollYouthChallenge(rng));
  assert.equal(seen.size, 5, 'todos podem ser sorteados');
  const spots = youthSpots(0, 0, 10, rng);
  assert.equal(spots.length, 10);
  for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) assert.ok(Math.hypot(spots[i].x - spots[j].x, spots[i].z - spots[j].z) >= 4, 'locais separados');
});

test('vencer, perder e "não ser acertado" (vence quando o tempo acaba)', () => {
  const kills = { challenge: 'kills', difficulty: 'Fácil', timeLeft: 120, progress: 0, goal: 100 };
  assert.equal(tickYouth(kills, 1), null); kills.progress = 100; assert.equal(tickYouth(kills, 1), 'win');
  const late = { challenge: 'spots', difficulty: 'Fácil', timeLeft: .5, progress: 3, goal: 10 };
  assert.equal(tickYouth(late, 1), 'lose');
  const nohit = { challenge: 'nohit', difficulty: 'Normal', timeLeft: 45, progress: 0, goal: 45 };
  assert.equal(tickYouth(nohit, 44), null); assert.equal(tickYouth(nohit, 2), 'win');
});

test('a partida liga o Might Guy: NPC, painel, desafio, falha ao ser acertado e buff ao vencer', async () => {
  const { missionNpcForEvent } = await load('/src/scene/missionNpcs.ts');
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  for (const wired of [
    "{id:'youth',name:'Treinamento da Juventude · Might Guy'",
    'npcId=missionNpcForEvent(def.id),actor=npcId?missionNpcs.create(npcId):undefined',
    "if(event.id==='youth'){openYouth(event);return;}",
    'choiceLevel=-13;choiceData=[];',
    "window.addEventListener('shinobi-youth',onYouth);",
    'const youthHit=()=>{if(hp<hpBefore)failYouthNoHit();};queueMicrotask(youthHit);',
    'const stat=youthStat(run.stat),bonus=youthBonuses(run.difficulty,stat);',
    'if(enemy.megaElite&&!enemy.guardian&&!enemy.hagoromo&&!enemy.youth&&!enemy.weatherElite){',
    'tickHagoromo(dt);tickYouthRun(dt);',
  ]) assert.ok(canvas.includes(wired), wired);
  assert.equal(missionNpcForEvent('youth'),'guy');
  assert.ok(main.includes('<YouthPanel challenge={world.youth.challenge}/>') && main.includes('<YouthBanner run={world.youth.run}/>'));
});

test('painel do Guy: escolhe 1 atributo em cartões e manda só ele para o desafio (26/11/2026)', () => {
  const panel = fs.readFileSync('src/ui/YouthPanel.tsx', 'utf8'), canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.match(panel, /role="radiogroup" aria-label="Atributo do treino"/);
  assert.match(panel, /new CustomEvent\('shinobi-youth', \{ detail: \{ difficulty, stat \} \}\)/);
  assert.match(canvas, /if\(typeof detail==='string'\)startYouth\(detail\);else startYouth\(detail\.difficulty,detail\.stat\);/);
  assert.match(canvas, /stat:youthStat\(chosen\)/);
});
