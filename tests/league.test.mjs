import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  TOP_LIMIT, emptyLeague, ensureLeagueMember, addLeagueMission, leagueSeason, leagueStandings,
  clanStandings, createClan, joinClan, leaveClan, resetLeagueMember, readLeague, writeLeague,
} from '../src/game/league.ts';
import { load, memoryStorage } from './helpers/load.mjs';

const date = Date.UTC(2026, 10, 14, 12);
const season = leagueSeason(date).number;
const profile = (id, name = 'Shinobi' + id) => ({ id, name });
const build = { skills: { 'Rasengan': 2 }, items: { 'Colete Jonin': 1 }, pills: { 'Pílula da Fortuna': 3 }, allies: ['sasuke'] };
const run = (kills, change = {}) => ({
  heroId: 'naruto', map: 'folha', difficulty: 'Genin', finishedAt: date,
  kills, victory: false, zone: 2, elapsed: 180, level: 12, totalDamage: 80, ...change,
});

test('ranking soma a melhor missão por região e usa os filtros antes da soma', () => {
  let board = emptyLeague();
  for (const mission of [run(40), run(70), run(60, { map: 'areia', difficulty: 'Kage' }), run(80, { heroId: 'sasuke' })]) {
    board = addLeagueMission(board, profile(1), mission);
  }
  board = addLeagueMission(board, profile(2), run(141));
  assert.deepEqual(leagueStandings(board, { season }).map(row => row.score), [141, 140]);
  assert.deepEqual(leagueStandings(board, { season, map: 'areia' }).map(row => row.score), [60]);
  assert.deepEqual(leagueStandings(board, { season, difficulty: 'Genin', heroId: 'naruto' }).map(row => row.score), [141, 70]);
  assert.equal(leagueStandings(board, { season: season + 1 }).length, 0);
  assert.equal(leagueSeason(leagueSeason(date).endsAt).number, season + 1);
});

test('migra o histórico antigo uma vez, preserva identidade ao criar conta e exibe as builds reais', () => {
  let board = ensureLeagueMember(emptyLeague(), profile(1, 'Guest001'), [run(14), run(14)], date);
  board = ensureLeagueMember(board, profile(1, 'Kunoichi'), [run(14)], date);
  board = addLeagueMission(board, profile(1, 'Kunoichi'), run(16, { build, victory: true }));
  const storage = memoryStorage();
  writeLeague(board, storage);
  const member = readLeague(storage).members[1];
  assert.equal(member.name, 'Kunoichi');
  assert.equal(member.missions, 2);
  assert.equal(member.wins, 1);
  assert.equal(member.kills, 30);
  assert.deepEqual(member.builds.naruto.build, build);
  assert.equal(member.history[1].build, undefined);
});

test('clãs só têm um vínculo por perfil, somam os membros atuais e transferem liderança ao sair', () => {
  let board = addLeagueMission(emptyLeague(), profile(1), run(70));
  board = addLeagueMission(board, profile(2), run(45));
  board = createClan(board, 1, 'Guardiões da Folha', 'folha');
  assert.throws(() => createClan(board, 2, 'Outro clã', 'FOLHA'), /sigla/);
  board = joinClan(board, 2, 'FOLHA');
  assert.throws(() => joinClan(board, 2, 'FOLHA'), /Saia/);
  assert.equal(clanStandings(board, leagueStandings(board, { season }))[0].score, 115);
  board = leaveClan(board, 1);
  assert.equal(board.clans.FOLHA.owner, 2);
  assert.equal(clanStandings(board, leagueStandings(board, { season }))[0].score, 45);
  board = resetLeagueMember(board, 2);
  assert.equal(board.clans.FOLHA, undefined);
  assert.equal(board.members[2], undefined);
  assert.equal(board.members[1].kills, 70);
});

test('top 100 não corta a colocação pessoal e a ficha exibe build e missões', async () => {
  const { LeagueScreen, LeagueHome } = await load('/src/ui/League.tsx');
  let board = emptyLeague();
  const now = Date.now();
  for (let i = 1; i <= 101; i++) board = addLeagueMission(board, profile(i), run(102 - i, { build, finishedAt: now }));
  const props = { board, profileId: 101, onBack() {}, act() {} };
  const ranking = renderToStaticMarkup(createElement(LeagueScreen, { ...props, start: { tab: 'ranking' } }));
  assert.equal((ranking.match(/class="league-row rank-/g) ?? []).length, TOP_LIMIT);
  assert.match(ranking, /#101/);
  const member = renderToStaticMarkup(createElement(LeagueScreen, { ...props, start: { tab: 'ranking', memberId: 1 } }));
  assert.match(member, /Rasengan/);
  assert.match(member, /Pílula da Fortuna/);
  assert.match(member, /Missões recentes/);
  const home = renderToStaticMarkup(createElement(LeagueHome, { board, profileId: 101, open() {} }));
  assert.match(home, /Ver Top 100/);
  assert.equal((home.match(/class="league-row rank-/g) ?? []).length, 5);
});
