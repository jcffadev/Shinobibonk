// Progressão do jogador e dos monstros (rodada 55): curva de HP, escala de dano e ameaça por tempo da zona.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { load } from './helpers/load.mjs';

const P = await load('/src/game/progression.ts');

test('HP por nível desacelera e tem teto (pedido: Nv. 415 com 1.613 de HP era demais)', () => {
  assert.ok(P.heroHpScale(1) >= 1, 'nível 1 é a base');
  let previous = P.heroHpScale(1);
  for (const level of [10, 50, 100, 200, 415, 1000]) {
    const scale = P.heroHpScale(level);
    assert.ok(scale > previous, `HP cresce no nível ${level}`);
    previous = scale;
  }
  // Crescimento por nível cai: do 100 ao 200 sobe menos que do 1 ao 100.
  assert.ok(P.heroHpScale(200) - P.heroHpScale(100) < P.heroHpScale(100) - P.heroHpScale(1));
  // Teto assintótico abaixo de ×7.
  assert.ok(P.heroHpScale(100000) < 7.01);
});

test('Naruto no nível 415 sem itens fica muito abaixo de 1.613 de HP', () => {
  const s = P.calculateStats('naruto', 415);
  assert.ok(s.maxHp < 500, `HP no Nv. 415 = ${s.maxHp}`);
  assert.ok(s.maxHp > P.calculateStats('naruto', 1).maxHp * 3, 'ainda cresce bastante em relação ao Nv. 1');
});

test('HP nunca diminui ao subir de nível, para todo o elenco', async () => {
  const { HEROES } = await load('/src/game/heroes.ts');
  for (const hero of HEROES) {
    let previous = 0;
    for (const level of [1, 25, 100, 415]) {
      const hp = P.calculateStats(hero.id, level).maxHp;
      assert.ok(hp >= previous, `${hero.id} Nv. ${level}`);
      previous = hp;
    }
  }
});

test('ameaça recomeça do minuto 0: zona nova no tempo 0 = início da zona 1 × multiplicador da zona', () => {
  const start = P.difficultyAt('Genin', 0, 1);
  const late = P.difficultyAt('Genin', 540, 1);
  const zone2 = P.difficultyAt('Genin', 0, P.ZONE_DIFFICULTY[2]);
  assert.ok(late.hp > start.hp * 3, 'fim da zona é bem mais forte que o início');
  assert.ok(zone2.hp < late.hp / 3, 'zona 2 no minuto 0 é muito mais fraca que o fim da zona 1');
  assert.ok(zone2.hp >= start.hp, 'zona 2 nunca fica mais fraca que o começo da zona 1');
  assert.equal(P.ZONE_DIFFICULTY[2], 1.18);
  assert.equal(P.ZONE_DIFFICULTY[3], 1.38);
});

test('dificuldade da missão multiplica por cima (Kage > Genin no mesmo tempo)', () => {
  assert.ok(P.difficultyAt('Kage', 120).hp > P.difficultyAt('Genin', 120).hp);
});
