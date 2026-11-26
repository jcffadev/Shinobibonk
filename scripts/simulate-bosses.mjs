// Lutas contra Guardiões e Bijū no simulador (sem navegador). Fila do Claude Code em docs/13 (25/11/2026):
// "Calibrar Guardiões e Bijū com invocações normais e aos +1, +7, +15 minutos e além do Final Swarm" e
// "Simular Genin, Chunin, Jonin e Kage com zero a três planos do Shikamaru".
//
// Cenário A (Guardião da zona 1): o bot nunca invoca o Guardião e fica na zona 1. Em cada marco, mede o HP e a defesa
//   que o Guardião teria se fosse invocado ali (mesmas fórmulas do GameCanvas) e o tempo para derrotá-lo com o dano de
//   alvo único da build naquele segundo.
// Cenário B (Bijū): o bot invoca cedo e vence a zona 3; com a build final, mede a Bijū chegando com 0, +1, +7 e +15 min
//   de Final Swarm. Só os planos da zona 3 pesam na Bijū (decisão de 25/11).
// Limites do modelo: os do simulador (sem desvio real, ultimate, aliados, procs e fusões). Serve para forma e comparação.
// Uso: node scripts/simulate-bosses.mjs [rótulo] [sementes=1] [heróis=todos|n]
import { writeFileSync, mkdirSync } from 'node:fs';
import { HEROES } from '../src/game/heroes.ts';
import { zoneThreat, zoneCurse, ZONE_DIFFICULTY } from '../src/game/progression.ts';
import { guardianVitality, guardianDefense } from '../src/game/missions.ts';
import { bijuuVitality, bijuuDefense, bijuuPlans } from '../src/game/bijuu.ts';
import { bossHpWithFloor, BOSS_POWER } from '../src/game/bossScaling.ts';
import { ZONE_SECONDS } from '../src/game/worldScale.ts';
import { simulateRun } from './simulate-run.mjs';

export const MISSIONS = ['Genin', 'Chunin', 'Jonin', 'Kage'];
/** Marcos (s de zona) para invocar o Guardião: normal (160 s), fim do relógio e Final Swarm +1, +7, +15, +30, +50 min. */
export const GUARDIAN_MARKS = [['normal', 160], ['10:00', ZONE_SECONDS], ['+1', ZONE_SECONDS + 60], ['+7', ZONE_SECONDS + 420], ['+15', ZONE_SECONDS + 900], ['+30', ZONE_SECONDS + 1800], ['+50', ZONE_SECONDS + 3000]];
export const ARMOR_OPTIONS = [1.35, 3, 5, 10, 20]; // 3× escolhido em 25/11
export const BIJUU_MARKS = [['chegada', 0], ['+1', 60], ['+7', 420], ['+15', 900]];

const ttk = (hp, dps) => dps > 0 ? hp / dps : Infinity;

/** Cenário A: Guardião da zona 1 em cada marco. */
export function guardianProbe({ heroId, mission, plans, seed }) {
  const marks = new Map(GUARDIAN_MARKS.map(([, at]) => [at, null]));
  simulateRun({ heroId, mission, plans, seed, minutes: (GUARDIAN_MARKS.at(-1)[1] + 5) / 60, policy: { guardianAt: Infinity, bossFightLimit: 120, endless: true }, record: 3600,
    probe: p => {
      if (!marks.has(p.zoneT) || p.zone !== 1 || p.dead) return;
      const def = guardianDefense(p.t, false, p.overtime, 1, plans), dps = p.singleDps(def) * (1 + p.eliteDamage);
      const hp = bossHpWithFloor(guardianVitality(p.threat.hp, p.t, p.zoneT, p.overtime, 1), dps, BOSS_POWER.guardianSeconds, plans);
      marks.set(p.zoneT, { hp, def, dps, ttk: ttk(hp, dps), level: p.level, hitShare: dps / hp });
    } });
  return Object.fromEntries(GUARDIAN_MARKS.map(([name, at]) => [name, marks.get(at)]));
}

/** Cenário B: Bijū com a build de quem venceu a zona 3. */
export function bijuuProbe({ heroId, mission, plans, seed, account }) {
  let end = null;
  simulateRun({ heroId, mission, plans, seed, account, minutes: 45, policy: { guardianAt: 160, bossFightLimit: 120, endless: false }, record: 3600,
    probe: p => { if (p.victory) end = p; } });
  if (!end) return null;
  // Decisão de 25/11: só os planos da última zona pesam na Bijū (bijuuPlans).
  const used = bijuuPlans(plans), out = {};
  for (const [name, overtime] of BIJUU_MARKS) {
    const t = end.t + overtime;
    const threat = zoneThreat(mission, ZONE_SECONDS + overtime, zoneCurse(ZONE_DIFFICULTY[3], used, end.threatBonus), overtime, 0);
    const def = bijuuDefense(t, overtime, used), dps = end.singleDps(def) * (1 + end.eliteDamage);
    const hp = bossHpWithFloor(bijuuVitality(threat.hp, t, overtime), dps, BOSS_POWER.bijuuSeconds, used);
    // Opções de armadura (× a armadura bruta do Guardião equivalente) para a calibração pedida em docs/13 (alvo inicial 20×).
    const options = Object.fromEntries(ARMOR_OPTIONS.map(m => [m, ttk(hp, end.singleDps(bijuuDefense(t, overtime, used, m)) * (1 + end.eliteDamage))]));
    out[name] = { hp, def, dps, ttk: ttk(hp, dps), level: end.level, hitShare: dps / hp, guardianDef: guardianDefense(t, false, overtime, 3, used), options };
  }
  return out;
}

/** Invocação voluntária do Guardião: cedo (2:40 da zona) ou às 9:00 (política padrão do simulador). */
export const SUMMON_POLICIES = [['cedo', 160], ['9:00', 540]];
/**
 * Cenário C (missão completa até a arena): o bot invoca o Guardião no tempo da política em cada zona, recebe 1 + planos
 * pergaminhos por Guardião (até 4 com 3 planos) e, se vencer a zona 3, mede a Bijū na chegada com a build final.
 */
export function missionProbe({ heroId, mission, plans, seed, summonAt }) {
  let end = null;
  const run = simulateRun({ heroId, mission, plans, seed, minutes: 60, policy: { guardianAt: summonAt, bossFightLimit: 120, endless: false }, record: 3600,
    probe: p => { if (p.victory) end = p; } });
  let bijuu = null;
  if (end) {
    const used = bijuuPlans(plans), overtime = end.overtime, t = end.t;
    const threat = zoneThreat(mission, ZONE_SECONDS + overtime, zoneCurse(ZONE_DIFFICULTY[3], used, end.threatBonus), overtime, 0);
    const def = bijuuDefense(t, overtime, used), dps = end.singleDps(def) * (1 + end.eliteDamage), hp = bossHpWithFloor(bijuuVitality(threat.hp, t, overtime), dps, BOSS_POWER.bijuuSeconds, used);
    bijuu = { hp, def, ttk: ttk(hp, dps), arrival: t / 60, level: end.level };
  }
  return { dead: run.dead, victory: run.victory, endedAt: run.endedAt, bosses: run.bosses.map(b => ({ ...b, ttk: b.killedAt - b.summonedAt })), scrolls: run.bosses.reduce((n, b) => n + b.scrolls, 0), bijuu };
}

export function summarizeMission(rows) {
  const out = [], keyOf = r => r.mission + '|' + r.plans + '|' + r.policy;
  for (const key of [...new Set(rows.map(keyOf))]) {
    const [mission, plansText, policy] = key.split('|'), group = rows.filter(r => keyOf(r) === key), n = group.length;
    const zone = z => { const fights = group.map(r => r.result.bosses.find(b => b.zone === z)).filter(Boolean); return { reached: fights.length, hp: pct(fights.map(b => b.hp), .5), def: pct(fights.map(b => b.def), .5), ttk: pct(fights.map(b => b.ttk), .5), ttk90: pct(fights.map(b => b.ttk), .9), at: pct(fights.map(b => b.killedAt / 60), .5) }; };
    const wins = group.filter(r => r.result.bijuu);
    out.push({ mission, plans: Number(plansText), policy, n, zones: [zone(1), zone(2), zone(3)], arena: wins.length, arenaAt: pct(wins.map(r => r.result.bijuu.arrival), .5),
      bijuuHp: pct(wins.map(r => r.result.bijuu.hp), .5), bijuuDef: pct(wins.map(r => r.result.bijuu.def), .5), bijuuTtk: pct(wins.map(r => r.result.bijuu.ttk), .5), bijuuTtk90: pct(wins.map(r => r.result.bijuu.ttk), .9),
      scrolls: pct(group.map(r => r.result.scrolls), .5) });
  }
  return out;
}

const pct = (list, q) => { const s = list.filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(q * s.length))] : NaN; };
export function summarize(rows) {
  const out = {};
  for (const r of rows) for (const [mark, v] of Object.entries(r.marks ?? {})) {
    const key = `${r.mission}|${r.plans}|${mark}`;
    (out[key] ??= { mission: r.mission, plans: r.plans, mark, n: 0, alive: 0, hp: [], def: [], ttk: [], unwinnable: 0 }).n++;
    if (!v) continue;
    const o = out[key]; o.alive++; o.hp.push(v.hp); o.def.push(v.def); o.ttk.push(v.ttk); if (!Number.isFinite(v.ttk) || v.ttk > 600) o.unwinnable++;
  }
  return Object.values(out).map(o => ({ mission: o.mission, plans: o.plans, mark: o.mark, alive: o.alive, n: o.n, hp: pct(o.hp, .5), def: pct(o.def, .5), ttk10: pct(o.ttk, .1), ttk50: pct(o.ttk, .5), ttk90: pct(o.ttk, .9), over10min: o.unwinnable }));
}

const big = v => !Number.isFinite(v) ? '∞' : v >= 1e15 ? (v / 1e15).toFixed(1) + 'Q' : v >= 1e12 ? (v / 1e12).toFixed(1) + 'T' : v >= 1e9 ? (v / 1e9).toFixed(1) + 'B' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : v.toFixed(1);
export function printSummary(title, list) {
  console.log(`\n${title}\n dificuldade planos marco   vivos   HP mediano  defesa  luta p10/mediana/p90 (s)  >10 min`);
  for (const r of list) console.log(` ${r.mission.padEnd(7)} ${String(r.plans).padStart(3)}   ${r.mark.padEnd(7)} ${String(r.alive).padStart(3)}/${r.n}  ${big(r.hp).padStart(9)}  ${(r.def * 100).toFixed(1).padStart(5)}%  ${big(r.ttk10).padStart(7)} / ${big(r.ttk50).padStart(7)} / ${big(r.ttk90).padStart(7)}   ${r.over10min}`);
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/').replace(/^\/?/, '/')}` || process.argv[1]?.endsWith('simulate-bosses.mjs')) {
  const [label = 'chefes', seedsArg = '1', heroesArg = 'todos'] = process.argv.slice(2);
  const seeds = [17, 101, 252].slice(0, Number(seedsArg) || 1);
  const heroes = heroesArg === 'todos' ? HEROES : HEROES.slice(0, Number(heroesArg) || HEROES.length);
  const guardianRows = [], bijuuRows = [];
  for (const mission of MISSIONS) for (let plans = 0; plans <= 3; plans++) for (const hero of heroes) for (const seed of seeds) {
    guardianRows.push({ heroId: hero.id, mission, plans, seed, marks: guardianProbe({ heroId: hero.id, mission, plans, seed }) });
    bijuuRows.push({ heroId: hero.id, mission, plans, seed, marks: bijuuProbe({ heroId: hero.id, mission, plans, seed }) });
  }
  const missionRows = [];
  for (const mission of MISSIONS) for (let plans = 0; plans <= 3; plans++) for (const [policy, summonAt] of SUMMON_POLICIES) for (const hero of heroes) for (const seed of seeds)
    missionRows.push({ heroId: hero.id, mission, plans, policy, seed, result: missionProbe({ heroId: hero.id, mission, plans, seed, summonAt }) });
  const arena = summarizeMission(missionRows);
  console.log('\nMISSÃO ATÉ A ARENA · invocação cedo (2:40) ou às 9:00 · medianas · Guardião: chegaram · HP · defesa · luta (s) · minuto da vitória');
  for (const r of arena) {
    const z = r.zones.map((x, i) => 'z' + (i + 1) + ' ' + x.reached + '/' + r.n + ' ' + big(x.hp) + ' ' + (x.def * 100).toFixed(0) + '% ' + big(x.ttk) + 's @' + big(x.at)).join(' | ');
    console.log(' ' + r.mission.padEnd(7) + ' ' + r.plans + ' ' + r.policy.padEnd(5) + ' ' + z + ' | arena ' + r.arena + '/' + r.n + ' @' + big(r.arenaAt) + ' min · Bijū ' + big(r.bijuuHp) + ' ' + (r.bijuuDef * 100).toFixed(1) + '% ' + big(r.bijuuTtk) + 's (p90 ' + big(r.bijuuTtk90) + ') · pergaminhos ' + r.scrolls);
  }
  const g = summarize(guardianRows), b = summarize(bijuuRows);
  printSummary('GUARDIÃO DA ZONA 1 (invocado no marco)', g);
  printSummary('BIJŪ (build de quem venceu a zona 3)', b);
  // Luta com a Bijū na chegada para cada opção de armadura: mediana (p90) em segundos.
  const armor = [];
  console.log(`\nBIJŪ NA CHEGADA · opções de armadura (× Guardião equivalente) · mediana (p90) em s\n dificuldade planos  ${ARMOR_OPTIONS.map(m => (m + '×').padStart(16)).join('')}`);
  for (const mission of MISSIONS) for (let plans = 0; plans <= 3; plans++) {
    const rows = bijuuRows.filter(r => r.mission === mission && r.plans === plans && r.marks).map(r => r.marks['chegada'].options);
    const cells = ARMOR_OPTIONS.map(m => { const list = rows.map(o => o[m]); return { m, ttk50: pct(list, .5), ttk90: pct(list, .9) }; });
    armor.push({ mission, plans, cells });
    console.log(` ${mission.padEnd(7)} ${String(plans).padStart(3)}    ${cells.map(c => `${big(c.ttk50)} (${big(c.ttk90)})`.padStart(16)).join('')}`);
  }
  mkdirSync('artifacts', { recursive: true });
  writeFileSync(`artifacts/simulate-${label}.json`, JSON.stringify({ guardian: g, bijuu: b, armor, arena }, null, 1));
  console.log(`\nArquivo: artifacts/simulate-${label}.json (não versionado)`);
}
