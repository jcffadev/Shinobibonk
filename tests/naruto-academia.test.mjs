// 27/11/2026 — usuário: "Naruto academia a ultimate dele tem que ser o vários clones das sombras... a skill inicial tem que ser o
// jutsu sexy lembra?"
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HERO_BY_ID, isProjectileUltimate, ultimateBase } from '../src/game/heroes.ts';

test('Naruto Academia: Jutsu Sexy inicial e ultimate Tajū Kage Bunshin (vários clones)', () => {
  const naruto = HERO_BY_ID.naruto;
  assert.equal(naruto.techniques[0].name, 'Jutsu Sexy', 'técnica inicial');
  assert.equal(naruto.techniques[0].shape, 'Área');
  assert.equal(naruto.ultimate, 'Tajū Kage Bunshin');
  assert.equal(ultimateBase(naruto).name, 'Rendan Uzumaki', 'a base de dano é o combo de clones');
  assert.equal(isProjectileUltimate('naruto'), true, 'vários clones disparados');
  assert.deepEqual(naruto.techniques.map(t => t.name), ['Jutsu Sexy', 'Shuriken', 'Kunai Tática', 'Rendan Uzumaki'], 'Kage Bunshin saiu do kit e virou a ultimate');
  assert.equal(naruto.techniques[0].status, 'Atordoar', 'atordoa (statusProfiles.ts)');
  // "Habilidade inicial do Naruto inicial do naruto academia precisa de buff": poder 1,9 e 60% de atordoar (simulate-early: deixa de
  // ser o único inicial que não mata o comum de um golpe no 1º minuto).
  assert.equal(naruto.techniques[0].statusChance, .6);
  assert.ok(naruto.techniques[0].power > naruto.techniques[1].power, 'mais forte que a Shuriken');
});

test('Kage Bunshin é a ultimate: 10 clones em anel em volta do Naruto Academia (27/11/2026)', () => {
  // Usuário: "kage bunshin de naruto academia deve ser sua ultimate e ele lançar 10 clones ao redor dele".
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(canvas.includes("if(heroId==='naruto'){castShadowClones(t);return;}"), 'a ultimate do Naruto Academia chama os clones');
  assert.ok(canvas.includes('const SHADOW_CLONES={count:10,'), '10 clones');
  assert.ok(canvas.includes("shadowClones.push({sprite,motion:createPlayerMotion(scene,sprite,'naruto',false),target,life:SHADOW_CLONES.life,technique:t,"), 'os clones animados da Kage Bunshin');
  assert.ok(canvas.includes('const a=i/SHADOW_CLONES.count*Math.PI*2'), 'em anel, ao redor dele');
  assert.ok(canvas.includes('target=(free.length?free:pool).sort((p,q)=>distance(p)-distance(q))[0]'), 'cada clone vai atrás de um inimigo diferente, o mais perto dele');
});

test('todo o elenco começa com pelo menos 8 técnicas no pool, sem selar ninguém (27/11/2026)', async () => {
  // Usuário: "Consegue que TODOS os personagens de todo o elenco... consiga ter inicialmente pelo menos 8 habilidades?"
  const { HEROES, ACADEMY, MIN_STARTING_POOL, techniquePool } = await import('../src/game/heroes.ts');
  assert.equal(MIN_STARTING_POOL, 8);
  assert.ok(ACADEMY.some(t => t.name === 'Bunshin no Jutsu') && ACADEMY.some(t => t.name === 'Armadilha de Fios'));
  const short = HEROES.filter(h => techniquePool(h.id).length < MIN_STARTING_POOL).map(h => h.id);
  assert.deepEqual(short, [], 'versões com menos de 8');
});
