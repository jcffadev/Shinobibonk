// 27/11/2026 — elenco da temporada, captura com 3 tentativas, evento "Uma nova Organização surge!", lista por time e mapas
// pelo progresso. Pedidos do usuário registrados em src/game/season.ts e em CHANGELOG.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  SEASON_ROSTER, SEASON_STARTERS, SEASON_TEAMS, CAPTURE_CHANCE, SEAL_ATTEMPTS, ORGANIZATION_EVENT, afterFailedSeal, captureChance,
  captureOdds, hasSeasonMission, inSeason, organizationReady, organizationStatus, sealSucceeds, seasonTeam, seasonVersion, teamOrder,
} from '../src/game/season.ts';
import { HEROES, HERO_BY_ID } from '../src/game/heroes.ts';
import { UNLOCK_MISSIONS, activeMission } from '../src/game/unlockMissions.ts';
import { STARTER_HEROES, TEST_UNLOCK_ALL, isHeroPlayable, isMapUnlocked, isDifficultyUnlocked, comingSoon } from '../src/game/account.ts';
import { CHUNIN_EXAM, eventUnlocks } from '../src/game/events.ts';

const ids = Object.keys(SEASON_ROSTER), byRank = r => ids.filter(id => SEASON_ROSTER[id] === r).sort();

test('elenco: só o Naruto Academia inicial, épicos, lendários e Akatsuki pedidos', () => {
  for (const id of ids) assert.ok(HERO_BY_ID[id], id + ' existe');
  assert.deepEqual([...SEASON_STARTERS], ['naruto']); assert.deepEqual([...STARTER_HEROES], ['naruto']);
  assert.deepEqual(byRank('epico'), ['jiraiya', 'orochimaru', 'tsunade']);
  assert.deepEqual(byRank('lendario'), ['gengetsu', 'hashirama', 'hiruzen', 'mei', 'onoki', 'raikage-quarto', 'raikage-terceiro', 'rasa', 'tobirama']);
  assert.deepEqual(byRank('akatsuki'), ['itachi-akatsuki', 'kisame']);
  assert.deepEqual(byRank('chunin'), ['iruka'], 'Iruka é Chūnin na obra');
  for (const id of ['kakashi', 'kurenai', 'guy', 'asuma', 'minato', 'yamato', 'hiashi', 'zabuza']) assert.equal(SEASON_ROSTER[id], 'jonin', id);
  for (const id of ['dosu', 'zaku', 'kin', 'hanabi', 'haku', 'sasuke', 'sakura']) assert.equal(SEASON_ROSTER[id], 'genin', id);
  for (const id of ['naruto-shippuden', 'tsunade-hokage', 'kakashi-hokage', 'gaara-kazekage', 'minato-hokage', 'naruto-hokage', 'itachi', 'madara', 'kidomaru', 'sai'])
    assert.ok(!inSeason(id) && comingSoon(id), id + ' fica "Em breve"');
});

test('jogável: fora da temporada nunca, nem com TEST_UNLOCK_ALL', () => {
  assert.equal(TEST_UNLOCK_ALL, true, 'liberação de teste continua ligada para o elenco da temporada');
  assert.equal(isHeroPlayable('naruto'), true); assert.equal(isHeroPlayable('sasuke'), true);
  for (const id of ['naruto-shippuden', 'madara', 'pain']) assert.equal(isHeroPlayable(id), false, id);
  assert.equal(HEROES.filter(h => !inSeason(h.id)).length, HEROES.length - ids.length);
});

test('missões: genin, jōnin, épicos e lendários por missão; Iruka e Akatsuki só por evento', () => {
  for (const id of ids) {
    const m = activeMission(id);
    if (!hasSeasonMission(id)) { assert.equal(m, undefined, id + ' sem missão comum'); continue; }
    assert.ok(m, id + ' tem missão');
    for (const r of m.requires ?? []) assert.ok(inSeason(r), `${id} pede ${r}, que precisa estar na temporada`);
    if (m.playWith) assert.ok(inSeason(m.playWith), id + ' joga com versão da temporada');
  }
  for (const id of ['iruka', 'itachi-akatsuki', 'kisame', 'naruto']) assert.equal(activeMission(id), undefined, id);
  for (const id of byRank('epico')) assert.ok(['Jonin', 'Kage'].includes(activeMission(id).difficulty), id + ' épico pede Jōnin ou mais');
  for (const id of byRank('lendario')) { const m = activeMission(id); assert.equal(m.difficulty, 'Kage', id); assert.equal(m.legendary, true, id); }
  assert.ok(UNLOCK_MISSIONS.sasuke && UNLOCK_MISSIONS.sakura && UNLOCK_MISSIONS.asuma, 'ex-iniciais ganharam missão');
  assert.equal(activeMission('madara'), undefined, 'fora da temporada não tem missão aberta');
});

test('captura: chance por rank, 3 tentativas e fuga', () => {
  assert.equal(SEAL_ATTEMPTS, 3);
  assert.ok(CAPTURE_CHANCE.genin > CAPTURE_CHANCE.jonin && CAPTURE_CHANCE.jonin > CAPTURE_CHANCE.epico && CAPTURE_CHANCE.epico > CAPTURE_CHANCE.lendario && CAPTURE_CHANCE.lendario > CAPTURE_CHANCE.akatsuki);
  assert.ok(CAPTURE_CHANCE.akatsuki <= .2, 'Akatsuki com captura baixa');
  assert.equal(captureChance('kisame'), CAPTURE_CHANCE.akatsuki); assert.equal(captureChance('madara'), CAPTURE_CHANCE.genin);
  assert.equal(sealSucceeds('kisame', .14), true); assert.equal(sealSucceeds('kisame', .15), false);
  assert.ok(Math.abs(captureOdds(.5) - .875) < 1e-12); assert.equal(captureOdds(1), 1); assert.equal(captureOdds(0), 0);
  assert.equal(afterFailedSeal(1), 'retry'); assert.equal(afterFailedSeal(2), 'retry'); assert.equal(afterFailedSeal(3), 'escape');
});

test('evento "Uma nova Organização surge!": rotação, metas e chances baixas', () => {
  assert.equal(ORGANIZATION_EVENT.title, 'Uma nova Organização surge!');
  assert.deepEqual(ORGANIZATION_EVENT.targets.map(t => t.heroId), ['kisame', 'itachi-akatsuki']);
  for (const t of ORGANIZATION_EVENT.targets) { assert.ok(t.appearChance <= .25 && t.kills >= 2500 && t.minute >= 10, t.heroId + ' difícil'); for (const r of t.requires) assert.ok(inSeason(r)); }
  const open = organizationStatus(Date.UTC(2026, 10, 27, 12));
  assert.equal(open.active, true); assert.equal(open.changesAt, Date.UTC(2026, 10, 30, 3));
  const closed = organizationStatus(Date.UTC(2026, 11, 1, 12));
  assert.equal(closed.active, false); assert.equal(closed.changesAt, Date.UTC(2026, 11, 7, 3));
  const kisame = ORGANIZATION_EVENT.targets[0], run = { map: 'nevoa', difficulty: 'Jonin', elapsed: 600, kills: 2500 };
  assert.equal(organizationReady(kisame, run, new Set(['zabuza', 'guy'])), true);
  assert.equal(organizationReady(kisame, run, new Set(['zabuza'])), false, 'pede os selamentos');
  assert.equal(organizationReady(kisame, { ...run, kills: 2499 }, new Set(['zabuza', 'guy'])), false);
});

test('Mega Elites e encontros só com versões da temporada; Exame Chūnin completo libera o Iruka', () => {
  assert.equal(seasonVersion('naruto-shippuden', ['naruto', 'naruto-genin', 'naruto-shippuden']), 'naruto');
  assert.equal(seasonVersion('naruto-genin', ['naruto', 'naruto-genin']), 'naruto-genin');
  assert.equal(seasonVersion('itachi-akatsuki', ['itachi', 'itachi-akatsuki']), undefined, 'Akatsuki não vira Mega comum');
  assert.deepEqual([...CHUNIN_EXAM.unlocks], ['iruka']);
  const all = Object.fromEntries(CHUNIN_EXAM.duels.map(d => [d.id, 'naruto']));
  assert.deepEqual(eventUnlocks(all), ['iruka']); assert.deepEqual(eventUnlocks({}), []);
});

test('lista por time: Time 7 primeiro (Naruto, Sasuke, Sakura, Kakashi) e "Em breve" no fim', () => {
  const members = SEASON_TEAMS.flatMap(t => t.members);
  assert.equal(new Set(members).size, members.length, 'cada um em um time só');
  assert.deepEqual([...members].sort(), [...ids].sort(), 'todo o elenco da temporada tem time');
  assert.equal(SEASON_TEAMS[0].name, 'Time 7');
  const order = ['naruto', 'sasuke', 'sakura', 'kakashi'].map(teamOrder);
  assert.deepEqual(order, [...order].sort((a, b) => a - b));
  assert.ok(teamOrder('madara') > teamOrder('kisame')); assert.equal(seasonTeam('madara'), 'Em breve');
});

test('mapas e dificuldades pelo progresso, mesmo com TEST_UNLOCK_ALL', () => {
  assert.equal(isMapUnlocked('folha'), true); assert.equal(isMapUnlocked('areia'), false, 'Areia só depois do Genin da Folha');
  assert.equal(isDifficultyUnlocked('folha', 'Genin'), true); assert.equal(isDifficultyUnlocked('folha', 'Chunin'), false);
});

test('ligações na interface e na partida', () => {
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8'), main = fs.readFileSync('src/main.tsx', 'utf8');
  const select = fs.readFileSync('src/ui/CharacterSelect.tsx', 'utf8'), events = fs.readFileSync('src/ui/EventsPage.tsx', 'utf8');
  assert.ok(canvas.includes('if(!sealAttemptFailed(sealing)){if(sealing.account){'), 'cada tentativa sorteia a captura');
  assert.ok(canvas.includes("if(afterFailedSeal(used)==='escape'){sealEscape(p.target);"), '3ª falha: escapa');
  assert.ok(canvas.includes('for(let n=0;n<SEAL_ATTEMPTS&&!ok;n++)ok=sealSucceeds(p.heroId,Math.random());if(!ok){sealEscape(p.target);'), 'selar direto também');
  assert.ok(canvas.includes('sealEscape:escapeBanner&&performance.now()<escapeBanner.until?escapeBanner.name:null'));
  assert.ok(main.includes('className="seal-escape-banner" role="alert"') && main.includes('className="seal-odds"'), 'aviso de fuga e chance no card');
  assert.ok(canvas.includes('const org=organizationCandidate();') && canvas.includes('const m=activeMission(h.id);'));
  assert.ok(canvas.includes('!!seasonVersion(h.id,familyVersions(h.id).map(v=>v.id))'), 'Mega Elite só da temporada');
  assert.ok(main.includes('for(const id of eventUnlocks(done))if(!unlockedHeroes().has(id))sealForAccount(id);'));
  assert.ok(select.includes("'🔒 Em breve · próxima temporada'") && select.includes('teamOrder(a.id) - teamOrder(b.id)') && select.includes('className="cs-team-heading"'));
  assert.ok(events.includes('<OrganizationEvent />'));
});
