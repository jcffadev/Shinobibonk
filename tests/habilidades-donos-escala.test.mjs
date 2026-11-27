// 27/11/2026 — usuário: "As habilidades compartillhdas, deve mostrar de quem é compartilhada, ou seja para o jogadore saber quem
// tem que desbloquear para ganhar a habilidade" · "as habilidades ao passar o mouse não estão mostrando o level e o scale delas por
// nível... todas tem que ter um ataque base por nível, ai a qualidade das cartas atuam em cima dessa base para buffar, sendo as
// cartas comuns o status base da carta, ai a incomum já atua calculando em cima dessa base, isso para todas as habilidades".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES, HERO_BY_ID, techniquePool, techniqueProviders, upcomingTechniques } from '../src/game/heroes.ts';
import { GROWTH_ROLLS, LEVEL_GROWTH, NO_GROWTH, levelScaleText, rarityGrowthMultiplier, rarityScaleText, rollGrowth } from '../src/game/combat.ts';

test('técnicas que faltam aparecem bloqueadas com quem precisa ser selado', () => {
  for (const id of ['naruto', 'sasuke', 'kakashi', 'gaara']) {
    const pool = new Set(techniquePool(id).map(t => t.name)), upcoming = upcomingTechniques(id);
    assert.ok(upcoming.length > 0, id + ' tem técnicas a ganhar');
    for (const t of upcoming) {
      assert.ok(!pool.has(t.name), t.name + ' ainda não está no pool');
      assert.equal(t.locked, true);
      assert.ok(t.providers.length > 0 && t.providers.every(p => HERO_BY_ID[p] && HERO_BY_ID[p].techniques.some(x => x.name === t.name)), t.name + ': quem ensina tem a técnica no kit');
    }
  }
  // Selar quem ensina coloca a técnica no pool.
  const [name, info] = [...techniqueProviders('naruto')].find(([, v]) => v.shared);
  assert.ok(techniquePool('naruto', new Set([info.providers[0]])).some(t => t.name === name), 'selar o dono traz a técnica');
  assert.ok(!upcomingTechniques('naruto', new Set([info.providers[0]])).some(t => t.name === name));
  const planner = fs.readFileSync('src/ui/BuildPlanner.tsx', 'utf8');
  assert.ok(planner.includes("[...techniques,...upcoming].filter(") && planner.includes("'Compartilhada · ensinada por '") && planner.includes("' (em breve)'"), 'o planejador mostra os donos');
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(canvas.includes("' · de '+(HERO_BY_ID[(t as PoolTechnique).origin]?.name??'')"), 'a carta de level-up diz de quem é');
});

test('ataque base por nível: Comum é a base e cada raridade multiplica (sem mudar o equilíbrio)', () => {
  assert.equal(LEVEL_GROWTH.damageBase, 22.5);
  assert.deepEqual(['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'].map(r => Math.round(rarityGrowthMultiplier(r) * 100) / 100), [1, 1.78, 3, 5, 8.33]);
  for (const [i, r] of ['Comum', 'Incomum', 'Raro', 'Épico', 'Lendário'].entries())
    assert.ok(Math.abs(LEVEL_GROWTH.damageBase * rarityGrowthMultiplier(r) - GROWTH_ROLLS.damage.base[i]) < 1e-9, r + ' = base × raridade');
  const tech = HERO_BY_ID.sasuke.techniques[0];
  for (let i = 0; i < 50; i++) { const { rarity, growth } = rollGrowth(50, tech); assert.ok(growth.damage * 100 >= LEVEL_GROWTH.damageBase * rarityGrowthMultiplier(rarity) - 1e-9, 'toda carta de ataque dá ao menos a base × raridade'); }
  assert.match(levelScaleText(tech, 3, { ...NO_GROWTH, damage: .68 }), /^Nv\. 3 · base \+22,5% de dano por nível \(carta Comum\); Incomum ×1,8 · Raro ×3 · Épico ×5 · Lendário ×8,3 · acumulado \+68% de dano$/);
  assert.equal(rarityScaleText('Raro'), '×3 da base de +22,5%/nível');
  const setup = HEROES.flatMap(h => h.techniques).find(t => t.setup);
  assert.match(levelScaleText(setup, 2, NO_GROWTH), /buff/);
  const main = fs.readFileSync('src/main.tsx', 'utf8'), sheet = fs.readFileSync('src/ui/RunSheet.tsx', 'utf8'), canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(main.includes("' — '+levelScaleText(tech,world.skillLevels[skill],world.skillGrowth[skill]??NO_GROWTH)+' — '"), 'mouse na barra de habilidades');
  assert.ok(sheet.includes('<p className="level-scale">{levelScaleText(t,n,g)}</p>'), 'ficha');
  assert.ok(canvas.includes("'Dano '+rarityScaleText(roll.rarity)+'. '"), 'carta de level-up');
});
