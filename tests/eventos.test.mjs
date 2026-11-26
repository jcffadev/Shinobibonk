// Eventos do anime · Prova Chūnin (25/11/2026 — "A parte da aba de eventos e tudo mais, você pode fazer"; "a primeira season
// só vai ter personagens da academia e genins"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const store = new Map();
globalThis.localStorage = { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) };
const { EVENTS, CHUNIN_EXAM, SEASON_ONE_ROSTER, EVENT_DUEL_BY_ID, duelOpponent, duelSide, duelAvailable, duelReady, eventProgress } = await import('../src/game/events.ts');
const { HERO_BY_ID, familyOf } = await import('../src/game/heroes.ts');
const { STARTER_HEROES, completeEventDuel, eventDuelsDone } = await import('../src/game/account.ts');

test('Prova Chūnin: 15 duelos da obra em 3 fases, só com Academia e Genin', () => {
  assert.equal(EVENTS[0], CHUNIN_EXAM);
  assert.equal(CHUNIN_EXAM.duels.length, 15);
  assert.deepEqual([...new Set(CHUNIN_EXAM.duels.map(d => d.phase))], ['Floresta da Morte', 'Preliminares', 'Final']);
  assert.equal(Object.keys(EVENT_DUEL_BY_ID).length, 15, 'ids únicos');
  for (const d of CHUNIN_EXAM.duels) for (const side of d.sides) {
    assert.ok(HERO_BY_ID[side], side);
    assert.ok(SEASON_ONE_ROSTER.includes(side), side + ' fora da temporada 1');
  }
  for (const d of CHUNIN_EXAM.duels) assert.ok(d.phase === 'Final' ? d.difficulty === 'Chunin' : d.difficulty === 'Genin');
});

test('a corrente libera todo o elenco do evento a partir dos iniciais', () => {
  const playable = new Set(STARTER_HEROES);
  let grew = true;
  while (grew) { grew = false; for (const d of CHUNIN_EXAM.duels) if (duelAvailable(d, id => playable.has(id))) for (const s of d.sides) if (!playable.has(s)) { playable.add(s); grew = true; } }
  for (const d of CHUNIN_EXAM.duels) for (const s of d.sides) assert.ok(playable.has(s), s + ' nunca fica disponível');
});

test('lado, oponente, condição e progresso', () => {
  const d = EVENT_DUEL_BY_ID['naruto-kiba'];
  assert.equal(duelSide(d, 'naruto-genin', familyOf), 0, 'outra versão da família conta');
  assert.equal(duelOpponent(d, 'naruto', familyOf), 'kiba');
  assert.equal(duelOpponent(d, 'kiba', familyOf), 'naruto');
  assert.equal(duelOpponent(d, 'sasuke', familyOf), undefined);
  assert.equal(duelReady(d, 3 * 60 - 1, 999), false);
  assert.equal(duelReady(d, 3 * 60, 249), false);
  assert.equal(duelReady(d, 3 * 60, 250), true);
  assert.equal(duelAvailable(d, id => id === 'kiba'), true);
  assert.equal(duelAvailable(d, () => false), false);
  assert.deepEqual(eventProgress(CHUNIN_EXAM, {}), { finished: 0, total: 15, complete: false });
  const all = Object.fromEntries(CHUNIN_EXAM.duels.map(x => [x.id, 'naruto']));
  assert.equal(eventProgress(CHUNIN_EXAM, all).complete, true);
});

test('o duelo vencido fica salvo na conta uma vez', () => {
  assert.equal(completeEventDuel('naruto-kiba', 'naruto-genin'), true);
  assert.equal(completeEventDuel('naruto-kiba', 'naruto'), false, 'o primeiro vencedor fica');
  assert.deepEqual(eventDuelsDone(), { 'naruto-kiba': 'naruto-genin' });
});

test('aba Eventos e duelo ligados no jogo', () => {
  const canvas = fs.readFileSync(new URL('../src/scene/GameCanvas.tsx', import.meta.url), 'utf8');
  const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  for (const wired of ['const duelId=resume?.eventDuel??eventDuel', 'duelReady(duel,elapsed,kills)&&!enemyList.some(e=>e.account&&e.heroId===duelFoe)', 'spawnEnemy(false,false,false,duelFoe,true)',
    'completeEventDuel(duel.id,heroId)', 'const duelNote=accountSeal(p.heroId)', 'const duelNote=accountSeal(sealing.heroId)', 'function serializeRun():SavedRun{return {eventDuel:duelId,',
    "else if(!arena&&!hagoromoEvent&&!testRun&&!sealing&&accountEncounters<2"]) assert.ok(canvas.includes(wired), wired);
  for (const wired of ["{page === 'events' && <EventsPage", 'eventDuel={page===\'game\'?eventDuel:undefined}', 'onRetry={retryRun}', "onClick={()=>changePage('events')}>Eventos</button>"]) assert.ok(main.includes(wired), wired);
});

const { eventPrizes, eventPhases, earnedTitle, frameLock } = await import('../src/game/events.ts');
const { claimEventPrize, eventPrizesClaimed } = await import('../src/game/account.ts');

test('prêmios: Lamens por fase fechada, 2.000 ao completar, título Chūnin e moldura Jade (25/11)', () => {
  assert.deepEqual(CHUNIN_EXAM.prizes, { phase: { 'Floresta da Morte': 300, 'Preliminares': 600, 'Final': 600 }, complete: 2000, title: 'Chūnin', frame: 'jade' });
  const forest = Object.fromEntries(CHUNIN_EXAM.duels.filter(d => d.phase === 'Floresta da Morte').map(d => [d.id, 'sasuke']));
  assert.deepEqual(eventPrizes(CHUNIN_EXAM, forest), [{ id: 'prova-chunin:Floresta da Morte', label: 'Prova Chūnin · Floresta da Morte', lamens: 300 }]);
  assert.deepEqual(eventPhases(CHUNIN_EXAM, forest).map(p => p.finished + '/' + p.total), ['3/3', '0/8', '0/4']);
  const all = Object.fromEntries(CHUNIN_EXAM.duels.map(d => [d.id, 'naruto']));
  assert.equal(eventPrizes(CHUNIN_EXAM, all).reduce((a, p) => a + p.lamens, 0), 3500);
  assert.equal(earnedTitle(forest), undefined); assert.equal(earnedTitle(all), 'Chūnin');
  assert.ok(frameLock('jade', forest)); assert.equal(frameLock('jade', all), undefined); assert.equal(frameLock('gold', {}), undefined, 'outras molduras seguem livres');
});

test('cada prêmio é creditado uma vez e ligado na tela', () => {
  assert.equal(claimEventPrize('prova-chunin:Final'), true);
  assert.equal(claimEventPrize('prova-chunin:Final'), false);
  assert.ok(eventPrizesClaimed().includes('prova-chunin:Final'));
  const main = fs.readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
  const picker = fs.readFileSync(new URL('../src/ui/ProfilePortraitPicker.tsx', import.meta.url), 'utf8');
  assert.ok(main.includes('for(const prize of eventPrizes(event,done))if(claimEventPrize(prize.id))gain+=prize.lamens;'));
  assert.ok(main.includes('{accountTitle&&<small className="account-title"'));
  assert.ok(picker.includes('frameLock(id,eventDuelsDone())'));
});

test('eventos ficam na home, não no planejar missão (26/11/2026)', () => {
  // "Os eventos devem aparecer na home do jogo e não lá no planejar missão".
  const main = fs.readFileSync('src/main.tsx', 'utf8'), mapSelect = fs.readFileSync('src/ui/MapSelect.tsx', 'utf8');
  assert.match(main, /className="home-event-card"[\s\S]{0,400}onClick=\{\(\) => changePage\('events'\)\}>Abrir evento →/);
  assert.match(main, /<EventsPage heroId=\{hero\.id\} onPlay=\{beginEventDuel\} onBack=\{\(\) => changePage\('home'\)\}\/>/);
  assert.doesNotMatch(mapSelect, /onEvents|Eventos · Prova/);
});
