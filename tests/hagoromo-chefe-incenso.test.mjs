// 27/11/2026 — pedidos do usuário: "Todos os itens do Hagoromo devem dar buffs" · "Abaixar mais o aviso, do aviso em vermelho
// para ficar bonito em tela, o HP do BOSS dentro da sala do Hagoromo não esta mostrando a barrinha de HP" · "Na barrinha de HP
// em cima mostrar quando está em RAGE, também mostrando o carregamento da skill dos bosses" · Incenso Repelente: "Esse item
// deveria dar + Ryu +EXP · E quando cair 30% do hp afastar os monstros · Além é claro do que esta ai como buffs".
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { load } from './helpers/load.mjs';

test('todas as 34 ferramentas do Hagoromo mudam a ficha', async () => {
  const { SAGE_TOOLS } = await load('/src/game/hagoromoTraining.ts');
  const { calculateStats } = await load('/src/game/progression.ts');
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  const base = calculateStats('naruto', 20, {}, {}, 0, {}, {});
  for (const tool of SAGE_TOOLS) for (const [key, value] of Object.entries(tool.bonus)) {
    const s = calculateStats('naruto', 20, {}, {}, 0, {}, { [key]: value });
    const changed = Object.keys(s).filter(k => k !== 'extra' && JSON.stringify(s[k]) !== JSON.stringify(base[k]));
    assert.ok(changed.length || canvas.includes(`ex('${key}')`), `${tool.name}: ${key} precisa mudar um atributo ou ser usado em combate`);
  }
  assert.ok(canvas.includes('Object.entries(toolBonuses(hagoromo.tools))'), 'as ferramentas somam na ficha');
});

test('carga da próxima técnica do chefe', async () => {
  const { bossCharge } = await import('../src/game/bossCharge.ts');
  assert.deepEqual(bossCharge(undefined), { charge: 0, casting: false, skill: '' });
  assert.deepEqual(bossCharge({ cooldown: 1, cooldownTotal: 4 }), { charge: .75, casting: false, skill: '' });
  assert.deepEqual(bossCharge({ cooldown: 0, cooldownTotal: 4 }), { charge: 1, casting: false, skill: '' });
  assert.deepEqual(bossCharge({ cooldown: 3, cooldownTotal: 4, cast: { windup: .5, total: 1, technique: { name: 'Rasengan' } } }), { charge: .5, casting: true, skill: 'Rasengan' });
  const combat = fs.readFileSync('src/scene/bossCombat.ts', 'utf8');
  assert.ok(combat.includes('cooldownTotal: cooldown, next:') && combat.includes('state.cooldownTotal = state.cooldown; }'), 'guarda a duração da espera');
});

test('barras: chefe do Hagoromo aparece, fúria em destaque, carga e aviso abaixo da faixa', () => {
  const main = fs.readFileSync('src/main.tsx', 'utf8'), canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  const ui = fs.readFileSync('src/ui/BossBars.tsx', 'utf8'), css = fs.readFileSync('src/boss-bars.css', 'utf8'), dock = fs.readFileSync('src/hud-dock.css', 'utf8');
  assert.ok(main.includes('{world.hagoromo?.stage&&<HagoromoStatus stage={world.hagoromo.stage} boss={world.boss}/>}<BossBars bars={world.bossBars??[]}/>'), 'faixa do treino E barras juntas');
  assert.ok(!main.includes('<HagoromoStatus stage={world.hagoromo.stage} boss={world.boss}/>:<BossBars'), 'não troca mais uma pela outra');
  assert.ok(canvas.includes('enemyList.filter(e=>(e.guardian||e.megaElite)&&!e.totem&&!e.clone&&(e.maxHp??0)>0)'), 'o Mega do Hagoromo entra nas barras');
  assert.ok(canvas.includes('...bossCharge(e.boss)}));};'), 'carga no snapshot');
  assert.match(ui, /className=\{`boss-bar-cast\$\{bar\.casting \? ' is-casting' : ''\}`\}/);
  assert.ok(ui.includes("'⚠ ' + bar.skill") && ui.includes('🔥 Fúria'));
  assert.ok(css.includes('.boss-bar.is-rage .boss-bar-track{border-color:#ff4b2b;box-shadow:') && css.includes('@keyframes boss-rage-pulse'));
  for (const size of css.match(/font-size:(\d+)px/g)) assert.ok(Number(size.match(/\d+/)[0]) >= 10, size);
  assert.ok(main.includes("className={`game-shell ${world.hagoromo?.stage?'in-hagoromo ':''}"));
  assert.ok(dock.includes('.game-shell.in-hagoromo .world-toast{top:186px}'), 'aviso abaixo da faixa do treino');
});

test('Incenso Repelente: mantém os buffs, soma Ryu e XP e afasta os monstros com 30% de HP', async () => {
  const { REPEL_INCENSE, repelDue, repelRadius, repelPoint } = await import('../src/game/repelIncense.ts');
  const { ITEM_BY_NAME } = await import('../src/game/catalog.ts');
  assert.deepEqual({ ...ITEM_BY_NAME['Incenso Repelente'].bonuses }, { enemyCount: -.08, move: .06, gold: .08, exp: .08, repelLowHp: 1 });
  assert.equal(REPEL_INCENSE.hpShare, .3); assert.equal(REPEL_INCENSE.cooldown, 20);
  assert.equal(repelDue(30, 100, 1, 0), true); assert.equal(repelDue(31, 100, 1, 0), false);
  assert.equal(repelDue(10, 100, 0, 0), false, 'sem o item'); assert.equal(repelDue(10, 100, 1, 5), false, 'recarregando'); assert.equal(repelDue(0, 100, 1, 0), false, 'morto');
  assert.deepEqual([1, 2, 3].map(repelRadius), [7, 8, 9]);
  assert.deepEqual(repelPoint(3, 4, 0, 0), { x: 3 + 3.6, z: 4 + 4.8 });
  assert.deepEqual(repelPoint(0, 0, 0, 0), { x: 6, z: 0 });
  const canvas = fs.readFileSync('src/scene/GameCanvas.tsx', 'utf8');
  assert.ok(canvas.includes("if(!defeated&&repelDue(hp,stats.maxHp,ex('repelLowHp'),repelCd)){repelCd=REPEL_INCENSE.cooldown;"));
  assert.ok(canvas.includes('for(const e of enemyList){if(immovableBoss(e))continue;const ep=e.sprite.position;'), 'Guardião, Bijū e totem ficam');
  assert.ok(canvas.includes('repelCd=Math.max(0,repelCd-dt);'));
});
