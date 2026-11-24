import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/ranking.mjs';

test('a função do ranking autentica uma conta e encaminha suas partidas e o placar', async (t) => {
  const site = 'https://shinobi.example.test';
  const player = { id: 'shinobi-test', user_metadata: { alias: 'ShinobiTeste' } };
  const ticket = '00000000-0000-4000-8000-000000000001';
  const tokens = { access_token: 'sessao-ficticia', refresh_token: 'renovacao-ficticia', expires_in: 3600 };
  t.mock.property(process, 'env', {
    ...process.env,
    RANK_SUPABASE_URL: 'https://banco.example.test',
    RANK_SUPABASE_KEY: 'chave-ficticia',
    RANK_PUBLIC_ORIGIN: site,
    RANK_SESSION_SECRET: 'a5'.repeat(32),
  });

  const received = [];
  const responses = new Map([
    ['/auth/v1/signup', { user: player }],
    ['/auth/v1/verify', { ...tokens, user: player }],
    ['/auth/v1/user', player],
    ['/rest/v1/rpc/sb_rank_start', ticket],
    ['/rest/v1/rpc/sb_rank_finish', 'accepted'],
    ['/rest/v1/rpc/sb_rank_board', { season: 1, total: 500001, top: [], mine: { place: 500001, points: 320 }, projected: null }],
  ]);
  const upstream = t.mock.method(globalThis, 'fetch', async (url, options) => {
    const path = url.pathname;
    received.push({ path, auth: options.headers.Authorization, data: options.body && JSON.parse(options.body) });
    if (!responses.has(path)) return Response.json({}, { status: 404 });
    return Response.json(responses.get(path));
  });

  const url = site + '/.netlify/functions/ranking';
  const send = (input, cookie, origin = site) => handler(new Request(url, {
    method: 'POST', headers: { origin, ...(cookie && { cookie }) }, body: JSON.stringify(input),
  }));
  const rpc = (method, args, cookie) => send({ action: 'rpc', method, args }, cookie);

  assert.equal((await rpc('sb_rank_start')).status, 401);
  assert.equal((await send({ action: 'session' }, undefined, 'https://outra.example.test')).status, 403);
  assert.equal(upstream.mock.callCount(), 0);
  const signup = await send({ action: 'signup', email: 'teste@example.test', password: 'senha-ficticia', alias: 'ShinobiTeste' });
  assert.deepEqual(await signup.json(), { confirmEmail: true });
  const confirm = await handler(new Request(url + '?confirm=ExemploToken001'));
  assert.equal(confirm.status, 303);
  assert.equal(confirm.headers.get('location'), site);
  const setCookie = confirm.headers.get('set-cookie');
  assert.match(setCookie, /^__Host-sb_rank=.+; Path=\/; Max-Age=\d+; HttpOnly; Secure; SameSite=Lax$/);
  assert.ok(!setCookie.includes(tokens.access_token));
  const cookie = setCookie.split(';')[0];

  const session = await send({ action: 'session' }, cookie);
  assert.deepEqual(await session.json(), { id: player.id, alias: 'ShinobiTeste' });
  const start = await rpc('sb_rank_start', { p_map: 'konoha', p_difficulty: 'Genin', p_hero: 'juzo' }, cookie);
  assert.equal(await start.json(), ticket);
  const finish = { p_ticket: ticket, p_kills: 320, p_elapsed: 120, p_zone: 1, p_level: 6, p_victory: false,
    p_damage: 5000, p_build: { skills: {}, items: {}, pills: {}, allies: [] } };
  const finished = await rpc('sb_rank_finish', finish, cookie);
  assert.equal(await finished.json(), 'accepted');
  const board = await rpc('sb_rank_board', { p_difficulty: 'Genin' }, cookie);
  assert.equal((await board.json()).mine.place, 500001);

  assert.deepEqual(received.slice(-3).map(({ path, auth }) => [path, auth]), [
    ['/rest/v1/rpc/sb_rank_start', 'Bearer ' + tokens.access_token],
    ['/rest/v1/rpc/sb_rank_finish', 'Bearer ' + tokens.access_token],
    ['/rest/v1/rpc/sb_rank_board', 'Bearer ' + tokens.access_token],
  ]);
  assert.deepEqual(received.at(-2).data, finish);
});
