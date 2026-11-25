// Começo de partida de TODOS os personagens (25/11/2026 — pedido do usuário: "Reveja o scale de todos os personagens e veja
// o early game de todos os persoagens"). Sem navegador: usa simulateRun (mesmas fórmulas do jogo) e lê a linha do tempo.
// Uso: node scripts/simulate-early.mjs [dificuldades=Genin,Chunin,Jonin,Kage] [sementes=3] [conta=novo] [desvio=medio]
//   → console + artifacts/simulate-early.json (não versionado)
import fs from 'node:fs';
import { HEROES } from '../src/game/heroes.ts';
import { simulateRun, targetsPerCast, hitDamage } from './simulate-run.mjs';
import { attackCooldown, NO_GROWTH } from '../src/game/combat.ts';

export const EARLY_MARKS = [1, 2, 3, 5];

/** Primeiros minutos de uma versão: nível, abates, golpe da 1ª técnica ÷ vida do comum e menor vida (%) até cada marco. */
export function earlyRun(heroId, mission, seed = 1, account = 'novo', skill = 'medio') {
  // Capacidade: abates por segundo com a horda no teto ÷ nascimentos por segundo (abaixo de 1 a horda cresce sem parar).
  const capacity = {};
  const r = simulateRun({ heroId, mission, minutes: EARLY_MARKS.at(-1) + .05, seed, account, skill, record: 15, probe: p => {
    if (!EARLY_MARKS.includes(p.t / 60)) return;
    let kps = 0; for (const t of p.techs) { if (t.setup || !(t.power > 0)) continue; const lv = p.skills[t.name], g = p.growth[t.name] ?? NO_GROWTH; kps += targetsPerCast(t, p.stats, p.threat.cap) * Math.min(1, hitDamage(heroId, t, g, p.stats, lv, 1) / p.normalHp) / attackCooldown(t, lv, g, p.stats.attackSpeed); }
    capacity[p.t / 60] = kps / Math.max(1e-9, p.threat.spawnPerSecond);
  } });
  const at = min => r.timeline.filter(p => p.min <= min + 1e-9).at(-1);
  const lowestHp = min => Math.min(1, ...r.timeline.filter(p => p.min <= min + 1e-9).map(p => p.playerHp / p.maxHp));
  return Object.fromEntries(EARLY_MARKS.map(min => {
    const p = at(min);
    return [min, p ? { capacity: capacity[min] ?? 0, level: p.level, kills: p.kills, hitOverHp: p.normalHp > 0 ? p.firstSkillHit / p.normalHp : 0, lowHp: lowestHp(min), dead: r.dead && r.endedAt <= min } : null];
  }));
}

const median = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const quant = (a, q) => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : NaN; };

/** Todas as versões numa dificuldade: mediana por versão (entre sementes) e o resumo do elenco. */
export function earlyRoster(mission, seeds = 3, account = 'novo', skill = 'medio', heroes = HEROES) {
  const rows = heroes.map(h => {
    const runs = Array.from({ length: seeds }, (_, i) => earlyRun(h.id, mission, i + 1, account, skill));
    return { heroId: h.id, marks: Object.fromEntries(EARLY_MARKS.map(m => [m, {
      capacity: median(runs.map(r => r[m]?.capacity)), level: median(runs.map(r => r[m]?.level)), kills: median(runs.map(r => r[m]?.kills)), hitOverHp: median(runs.map(r => r[m]?.hitOverHp)),
      lowHp: median(runs.map(r => r[m]?.lowHp)), deaths: runs.filter(r => r[m]?.dead).length,
    }])) };
  });
  const summary = Object.fromEntries(EARLY_MARKS.map(m => {
    const list = rows.map(r => r.marks[m]);
    return [m, { capacity: [quant(list.map(x => x.capacity), .1), median(list.map(x => x.capacity)), quant(list.map(x => x.capacity), .9)], kills: [quant(list.map(x => x.kills), .1), median(list.map(x => x.kills)), quant(list.map(x => x.kills), .9)], level: median(list.map(x => x.level)),
      hitOverHp: [quant(list.map(x => x.hitOverHp), .1), median(list.map(x => x.hitOverHp)), quant(list.map(x => x.hitOverHp), .9)], lowHp: median(list.map(x => x.lowHp)), deaths: list.reduce((a, x) => a + x.deaths, 0) }];
  }));
  return { mission, rows, summary };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [diffArg = 'Genin,Chunin,Jonin,Kage', seedArg = '3', account = 'novo', skill = 'medio'] = process.argv.slice(2);
  const out = {}, started = Date.now();
  for (const mission of diffArg.split(',')) {
    const res = earlyRoster(mission, +seedArg, account, skill); out[mission] = res;
    console.log(`\n${mission} · ${res.rows.length} versões · conta ${account} · desvio ${skill}`);
    for (const m of EARLY_MARKS) { const s = res.summary[m]; console.log(`  ${m} min: capacidade p10/med/p90 ${s.capacity.map(x => x.toFixed(1)).join('/')} · Nv ${s.level} · abates p10/med/p90 ${s.kills.join('/')} · golpe÷vida ${s.hitOverHp.map(x => x.toFixed(1)).join('/')} · menor vida ${Math.round(s.lowHp * 100)}% · mortes ${s.deaths}`); }
    const med3 = res.summary[3].kills[1];
    const low = res.rows.filter(r => r.marks[3].kills < med3 * .6).sort((a, b) => a.marks[3].kills - b.marks[3].kills);
    const high = res.rows.filter(r => r.marks[3].kills > med3 * 1.6).sort((a, b) => b.marks[3].kills - a.marks[3].kills);
    const weak = res.rows.filter(r => r.marks[1].hitOverHp < 1).sort((a, b) => a.marks[1].hitOverHp - b.marks[1].hitOverHp);
    const slow = res.rows.filter(r => r.marks[3].capacity < 1.2).sort((a, b) => a.marks[3].capacity - b.marks[3].capacity);
    console.log(`  capacidade abaixo de 1,2 aos 3 min (${slow.length}): ${slow.map(r => r.heroId + ' ' + r.marks[3].capacity.toFixed(2)).join(', ')}`);
    const hurt = res.rows.filter(r => r.marks[5].lowHp < .35 || r.marks[5].deaths).sort((a, b) => a.marks[5].lowHp - b.marks[5].lowHp);
    console.log(`  abaixo de 60% da mediana de abates aos 3 min (${low.length}): ${low.map(r => r.heroId + ' ' + r.marks[3].kills).join(', ')}`);
    console.log(`  acima de 160% (${high.length}): ${high.map(r => r.heroId + ' ' + r.marks[3].kills).join(', ')}`);
    console.log(`  1ª técnica não mata o comum num golpe no 1º min (${weak.length}): ${weak.map(r => r.heroId + ' ' + r.marks[1].hitOverHp.toFixed(2)).join(', ')}`);
    console.log(`  vida abaixo de 35% ou morte até 5 min (${hurt.length}): ${hurt.map(r => r.heroId + ' ' + Math.round(r.marks[5].lowHp * 100) + '%' + (r.marks[5].deaths ? ' ✝' + r.marks[5].deaths : '')).join(', ')}`);
  }
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync(`artifacts/simulate-early-${account}.json`, JSON.stringify(out, null, 1));
  console.log(`\n${((Date.now() - started) / 1000).toFixed(0)} s`);
}
