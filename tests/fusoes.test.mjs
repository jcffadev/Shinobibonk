// Fusões, combinações e Kekkei Genkai (Rodada 71 — pedidos do usuário: "Sim, implementar" as pendências de 11/11;
// "as fusões/kekkei genkais tem que funcionar para TODOS os personagens que conseguem pegar + de 1 elemento";
// "Não deve ser possível unir 2 fusões, ou fusão + skill"). Lógica pura, sem navegador.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { HEROES, ACADEMY, techniquePool, allowedElements, familyOf } from '../src/game/heroes.ts';
import {
  KEKKEI_RECIPES, HERO_KEKKEI, FUSION_KEKKEI_BONUS, kekkeiRecipe, mergedTechnique, fusionBonus, combineBonus, combinedPart, isMergedName,
  fusionCatalog, fusionRecipeText, sagesMergeCandidates,
} from '../src/game/techniqueMerge.ts';

test('Sapos exigem o teto atual das duas técnicas para fundir ou combinar', () => {
  const fire = ninja('Fogo'), earth = ninja('Terra');
  const setup = ninja('Neutro', 'Preparação', { setup: {} });
  const fused = ninja('Neutro', 'Fusão · Outra técnica');
  const combined = ninja('Neutro', 'Outra técnica + Técnica anterior');
  const basic = [fire, earth, setup, fused, combined];
  const levels = { [fire.name]: 9, [earth.name]: 8, [setup.name]: 11, [fused.name]: 7, [combined.name]: 11 };
  assert.deepEqual(sagesMergeCandidates(basic, {}), []);
  for (const kind of ['fuse', 'combine']) {
    const plan = { kind, names: [fire.name, earth.name] };
    const attempt = extraCap => mergedTechnique(plan, sagesMergeCandidates(basic, levels, extraCap));
    levels[fire.name] = 9;
    levels[earth.name] = 8;
    assert.equal(attempt(0), undefined);
    levels[earth.name] = 9;
    assert.ok(attempt(0));
    assert.equal(attempt(2), undefined, 'a oferta perde validade se o teto subir');
    levels[fire.name] = 11;
    levels[earth.name] = 10;
    assert.equal(attempt(2), undefined);
    levels[earth.name] = 11;
    assert.ok(attempt(2));
    assert.deepEqual(sagesMergeCandidates(basic, levels, 2), [fire, earth]);
  }
});

test('a oficina consulta os candidatos tanto ao montar a oferta quanto ao aplicar a união', () => {
  const game = read('src/scene/GameCanvas.tsx');
  assert.ok(game.includes("sagesMergeCandidates(techniques,skillLevels,ex('skillCap'))"));
  assert.match(game, /function openSages[\s\S]*?const candidates=sagesCandidates\(\);/);
  assert.match(game, /function applyMerge[\s\S]*?mergedTechnique\(merge,sagesCandidates\(\),familyOf\(heroId\)\)/);
  assert.match(game, /if\(!merged\|\|merges\.has\(merged\.name\)\)return;\s+sagesUsedZone=zone;/);
});

// Medido na Rodada 71: 21 versões com 2+ naturezas no pool e 7 receitas alcançáveis pelas naturezas do kit (a linhagem tem teste próprio).
const MULTI_FLOOR = 21, CHECKED_FLOOR = 7;
const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const ninja = (element, name = 'N-' + element, extra = {}) => ({ name, school: 'Ninjutsu', element, shape: 'Projétil', color: '#fff', power: 1, range: 4.5, cooldown: 1.5, statusChance: .12, unlockLevel: 1, ...extra });

test('oito Kekkei Genkai, com Jiton = Vento + Terra e Bakuton = Terra + Raio (Narutopedia), sem par repetido', () => {
  assert.equal(KEKKEI_RECIPES.length, 8);
  const pairs = KEKKEI_RECIPES.map(r => [...r.natures].sort().join('+'));
  assert.equal(new Set(pairs).size, 8, 'cada par de naturezas dá uma receita só');
  const by = prefix => KEKKEI_RECIPES.find(r => r.name.startsWith(prefix));
  assert.deepEqual([...by('Jiton').natures].sort(), ['Terra', 'Vento']);
  assert.deepEqual([...by('Bakuton').natures].sort(), ['Raio', 'Terra']);
});

test('TODOS os personagens com 2+ naturezas alcançam cada Kekkei Genkai das suas naturezas', () => {
  let checked = 0, multi = 0;
  for (const hero of HEROES) {
    const pool = techniquePool(hero.id), allowed = allowedElements(hero.id);
    const natures = [...allowed].filter(e => e !== 'Neutro');
    if (natures.length >= 2) multi++;
    for (const recipe of KEKKEI_RECIPES) {
      if (!recipe.natures.every(e => allowed.has(e))) continue;
      const [a, b] = recipe.natures.map(e => pool.find(t => t.school === 'Ninjutsu' && !t.setup && t.element === e));
      assert.ok(a && b, `${hero.id}: falta Ninjutsu de ${recipe.natures.join(' + ')} no pool`);
      assert.equal(mergedTechnique({ kind: 'fuse', names: [a.name, b.name] }, pool, familyOf(hero.id))?.name, 'Fusão · ' + recipe.name, hero.id);
      checked++;
    }
  }
  assert.ok(multi >= MULTI_FLOOR && checked >= CHECKED_FLOOR, `${multi} personagens com 2+ naturezas, ${checked} receitas conferidas`);
});

test('quem tem Kekkei Genkai na obra consegue fundi-la, com +15%, em todas as versões', () => {
  let versions = 0;
  for (const hero of HEROES) {
    const family = familyOf(hero.id), kgs = HERO_KEKKEI[family];
    if (!kgs) continue;
    const pool = techniquePool(hero.id);
    for (const kg of kgs) {
      const recipe = KEKKEI_RECIPES.find(r => r.name.startsWith(kg + ':'));
      const [x, y] = recipe.natures.map(e => pool.find(t => t.school === 'Ninjutsu' && !t.setup && t.element === e));
      assert.ok(x && y, `${hero.id} não alcança ${kg}`);
      const plain = x.power + y.power, fused = mergedTechnique({ kind: 'fuse', names: [x.name, y.name] }, pool, family);
      assert.equal(fused.name, 'Fusão · ' + recipe.name);
      assert.ok(Math.abs(fused.power - plain * 1.15) < 1e-9, `${hero.id}: ${kg} sem o bônus`);
    }
    versions++;
  }
  assert.ok(versions >= 8, `${versions} versões com linhagem`);
});

test('fusão ou combinação não entra em outra fusão (nem fusão + técnica)', () => {
  const a = ninja('Água'), b = ninja('Vento'), c = ninja('Fogo');
  const fused = mergedTechnique({ kind: 'fuse', names: [a.name, b.name] }, [a, b]);
  const combo = mergedTechnique({ kind: 'combine', names: [a.name, c.name] }, [a, c]);
  const pool = [a, b, c, fused, combo];
  for (const merged of [fused, combo]) for (const other of [c, a, fused, combo]) for (const kind of ['fuse', 'combine']) {
    if (other === merged) continue;
    assert.equal(mergedTechnique({ kind, names: [merged.name, other.name] }, pool), undefined, `${kind}: ${merged.name} + ${other.name}`);
    assert.equal(mergedTechnique({ kind, names: [other.name, merged.name] }, pool), undefined);
  }
  assert.equal(kekkeiRecipe({ ...fused, element: 'Fogo' }, ninja('Terra')), undefined);
});

test('nenhuma técnica base tem nome que pareça fusão (a regra do nome não bloqueia técnica comum)', () => {
  for (const hero of HEROES) for (const t of techniquePool(hero.id)) assert.equal(isMergedName(t.name), false, `${hero.id}: ${t.name}`);
  for (const t of ACADEMY) assert.equal(isMergedName(t.name), false, t.name);
});

test('+15% na fusão de mesma natureza ou da Kekkei Genkai da própria linhagem', () => {
  assert.equal(FUSION_KEKKEI_BONUS, .15);
  assert.equal(fusionBonus(ninja('Fogo', 'F1'), ninja('Fogo', 'F2')), .15, 'mesma natureza');
  assert.equal(fusionBonus(ninja('Neutro', 'N1'), ninja('Neutro', 'N2')), 0, 'Neutro não conta');
  const water = ninja('Água'), wind = ninja('Vento');
  assert.equal(fusionBonus(water, wind, 'haku'), .15, 'Haku com Hyōton');
  assert.equal(fusionBonus(water, wind, 'naruto'), 0, 'Naruto faz o Hyōton sem bônus');
  assert.equal(fusionBonus(ninja('Fogo'), ninja('Terra'), 'haku'), 0, 'Haku não tem Yōton');
  assert.ok(Math.abs(mergedTechnique({ kind: 'fuse', names: [water.name, wind.name] }, [water, wind], 'haku').power - 2.3) < 1e-9);
  assert.equal(mergedTechnique({ kind: 'fuse', names: [water.name, wind.name] }, [water, wind], 'naruto').power, 2);
  const f1 = ninja('Fogo', 'F1', { power: 2 }), f2 = ninja('Fogo', 'F2', { power: 1 });
  assert.ok(Math.abs(mergedTechnique({ kind: 'fuse', names: ['F1', 'F2'] }, [f1, f2]).power - 3.45) < 1e-9);
  const families = new Set(HEROES.map(h => familyOf(h.id)));
  for (const [family, list] of Object.entries(HERO_KEKKEI)) {
    assert.ok(families.has(family), family);
    for (const kg of list) assert.ok(KEKKEI_RECIPES.some(r => r.name.startsWith(kg + ':')), `${family}: ${kg}`);
  }
});

test('Combinar: ×1,5 e um atributo do par, sempre o mesmo para as mesmas técnicas', () => {
  const a = ninja('Raio', 'R', { status: 'Paralisar' }), b = ninja('Fogo', 'F');
  const bonus = combineBonus(a, b);
  assert.deepEqual(combineBonus(b, a), bonus, 'a ordem não muda o sorteio');
  assert.ok(['power', 'range', 'cooldown', 'status'].includes(bonus.stat));
  const plain = [ninja('Fogo', 'X'), ninja('Água', 'Y')], stats = new Set();
  for (let i = 0; i < 60; i++) {
    const p = ninja('Fogo', 'X' + i), q = ninja('Água', 'Y' + i), s = combineBonus(p, q).stat;
    assert.notEqual(s, 'status', 'sem status nas técnicas, não sorteia chance de status'); stats.add(s);
  }
  assert.equal(stats.size, 3, 'o sorteio varia entre os pares');
  assert.ok(plain.length);
  const part = combinedPart(a, { stat: 'power', value: .1, label: '' });
  assert.ok(Math.abs(part.power - 1.65) < 1e-9);
  assert.ok(Math.abs(combinedPart(a, { stat: 'range', value: .15, label: '' }).range - 4.5 * 1.15) < 1e-9);
  assert.ok(Math.abs(combinedPart(a, { stat: 'status', value: .05, label: '' }).statusChance - .17) < 1e-9);
  assert.equal(combinedPart(b, { stat: 'status', value: .05, label: '' }).statusChance, .12, 'só soma status em quem aplica status');
  for (let i = 0; i < 60; i++) {
    const p = ninja('Fogo', 'C' + i), q = ninja('Água', 'D' + i), extra = combineBonus(p, q);
    const combo = mergedTechnique({ kind: 'combine', names: [p.name, q.name] }, [p, q]);
    if (extra.stat === 'cooldown') { assert.ok(Math.abs(combo.cooldown - 1.35) < 1e-9); return; }
  }
  assert.fail('nenhum par sorteou recarga');
});

test('a partida e o planejador usam as regras (família, bloqueio e atributo da combinação)', () => {
  const canvas = read('src/scene/GameCanvas.tsx'), planner = read('src/ui/BuildPlanner.tsx');
  assert.match(canvas, /!merges\.has\(t\.name\)&&!consumedTechniques\.has\(t\.name\)\);/);
  assert.match(canvas, /mergedTechnique\(merge,candidates,familyOf\(heroId\)\)/);
  assert.match(canvas, /castTechnique\(combinedPart\(source,extra\),/);
  assert.match(planner, /!archivedSkills\.includes\(t\.name\)&&!isMergedName\(t\.name\)\);/);
  assert.match(planner, /mergedTechnique\(\{kind,names:pair\},pool,familyOf\(heroId\)\)/);
});

test('catálogo: a aba Fusões lista as fusões que o shinobi pode aprender e cresce ao selar (rodada 81)', () => {
  const own = techniquePool('naruto', new Set()), all = techniquePool('naruto', new Set(HEROES.map(h => h.id)));
  const few = fusionCatalog(own, familyOf('naruto')), many = fusionCatalog(all, familyOf('naruto'));
  assert.ok(few.length > 0, 'já começa com fusões');
  assert.ok(many.length > few.length, `selar libera mais: ${few.length} → ${many.length}`);
  for (const f of many) {
    const [a, b] = f.pair.map(n => all.find(t => t.name === n));
    assert.ok(a && b && !a.setup && !b.setup && !a.locked && !b.locked, 'só técnicas do pool, sem buff nem bloqueio');
    assert.ok(!isMergedName(a.name) && !isMergedName(b.name), 'nunca funde uma fusão');
  }
  assert.equal(new Set(many.map(f => f.result.name)).size, many.length, 'cada fusão aparece uma vez');
  const kakashi = fusionCatalog(techniquePool('kakashi', new Set()), familyOf('kakashi'));
  const firstPlain = kakashi.findIndex(f => !f.kekkei);
  assert.ok(kakashi.some(f => f.kekkei) && kakashi.slice(firstPlain).every(f => !f.kekkei), 'Kekkei Genkai no topo');
  assert.equal(fusionRecipeText(['Shuriken', 'Técnica de Vento'], 'Rasenshuriken'), 'Shuriken + Técnica de Vento = Rasenshuriken');
});

test('planejador: abre com o catálogo e a aba Habilidades mostra a receita da fusão planejada', () => {
  const planner = read('src/ui/BuildPlanner.tsx');
  for (const wired of [
    "const catalog=tab==='Fusões'?fusionCatalog(fusionOptions,familyOf(hero.id)):[];",
    'Fusões que você pode aprender · {catalog.length}',
    'onClick={()=>{setFusionA(f.pair[0]);setFusionB(f.pair[1]);if(done)removeFusionPair(planIndex);else addFusionPair(...f.pair);}}',
    'aria-pressed={done} disabled={!done&&fusionPlan.length>=4}',
    'fusionPlan.filter(pair=>pair.includes(name)).map(pair=>fusionRecipeText(pair,fusionName(pair)))',
    '{technique&&fusionRecipes(e.name).map(',
    '{fusionRecipes(focused.name).map(',
  ]) assert.ok(planner.includes(wired), wired);
});

test('modelo salvo de itens fica no planejamento, acima das Táticas salvas, e saiu da escolha do shinobi (rodada 82)', () => {
  const planner = read('src/ui/BuildPlanner.tsx'), main = read('src/main.tsx');
  const arsenal = planner.indexOf('<ArsenalControls {...arsenalControls}/>'), tactics = planner.indexOf('<details className="planner-tactics">');
  assert.ok(arsenal > 0 && arsenal < tactics, 'seletor acima de Táticas salvas');
  assert.ok(main.includes(' arsenalControls={arsenalControls} '), 'o planejamento recebe os controles');
  const characters = main.slice(main.indexOf("page === 'characters'"), main.indexOf("page === 'build'"));
  assert.ok(!characters.includes('<ArsenalControls'), 'não fica mais na escolha do shinobi');
  assert.ok(!planner.includes('Salvar arsenal da conta'), 'sem o segundo botão de salvar');
});
