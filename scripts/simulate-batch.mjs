// Rodada 76 — rodada em massa do simulador (scripts/simulate-run.mjs): todos os heróis × dificuldades × sementes × contas.
// Uso: node scripts/simulate-batch.mjs <rótulo> [minutos=120] [sementes=3] [habilidade=medio]
// Saída: console (resumo) + artifacts/simulate-<rótulo>.json (não versionado).
import fs from 'node:fs';
import { HEROES } from '../src/game/heroes.ts';
import { simulateRun } from './simulate-run.mjs';

export const MISSIONS = ['Genin', 'Chunin', 'Jonin', 'Kage'];
const avg = l => l.reduce((a, b) => a + b, 0) / Math.max(1, l.length);
const pct = (l, p) => { const s = [...l].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? 0; };
/** Ponto da linha do tempo mais próximo de `min` (ou o último, se a run acabou antes). */
export const at = (r, min) => r.timeline.filter(p => p.min <= min + 1e-9).at(-1) ?? r.timeline[0];

export function runBatch({ label = 'base', minutes = 120, seeds = 3, skill = 'medio', accounts = ['novo', 'maximo'], heroes = HEROES.map(h => h.id) } = {}) {
  const rows = [];
  for (const account of accounts) for (const mission of MISSIONS) for (const heroId of heroes) for (let seed = 1; seed <= seeds; seed++) {
    const r = simulateRun({ heroId, mission, minutes, seed, account, skill });
    const p1 = at(r, 1), p10 = at(r, 10), p30 = at(r, 30), last = r.timeline.at(-1);
    rows.push({ heroId, mission, account, seed, endedAt: r.endedAt, dead: r.dead, zone: r.zone, level: r.level, kills: r.kills, guardians: r.guardians, megaKills: r.megaKills,
      alive1: p1.alive, kills1: p1.kills, level10: p10.level, kills10: p10.kills, level30: p30.level, kills30: p30.kills,
      damagePct: last.damagePct, attackSpeedPct: last.attackSpeedPct, areaPct: last.areaPct, projectiles: last.projectiles, critPct: last.critPct, critDamagePct: last.critDamagePct, maxHp: last.maxHp, armor: last.armor, items: last.items, killsPerSecond: last.killsPerSecond });
  }
  const summary = [];
  for (const account of accounts) for (const mission of MISSIONS) {
    const l = rows.filter(r => r.account === account && r.mission === mission);
    summary.push({ account, mission, runs: l.length, deathMin: +avg(l.map(r => r.endedAt)).toFixed(1), deathP10: pct(l.map(r => r.endedAt), .1), deathP90: pct(l.map(r => r.endedAt), .9),
      kills: Math.round(avg(l.map(r => r.kills))), level: Math.round(avg(l.map(r => r.level))), alive1: +avg(l.map(r => r.alive1)).toFixed(1), kills1: +avg(l.map(r => r.kills1)).toFixed(1),
      zone3: l.filter(r => r.zone === 3).length, damagePct: Math.round(avg(l.map(r => r.damagePct))), attackSpeedPct: Math.round(avg(l.map(r => r.attackSpeedPct))), areaPct: Math.round(avg(l.map(r => r.areaPct))),
      items: Math.round(avg(l.map(r => r.items))), maxHp: Math.round(avg(l.map(r => r.maxHp))) });
  }
  // Personagens fora da média: minuto médio da morte por herói (conta máxima, Kage) contra a mediana.
  const byHero = HEROES.map(h => { const l = rows.filter(r => r.heroId === h.id && r.account === accounts.at(-1) && r.mission === 'Kage'); return { heroId: h.id, name: h.name, deathMin: +avg(l.map(r => r.endedAt)).toFixed(1), kills: Math.round(avg(l.map(r => r.kills))) }; }).filter(h => !Number.isNaN(h.deathMin));
  const median = pct(byHero.map(h => h.deathMin), .5);
  const outliers = byHero.filter(h => h.deathMin < median * .5 || h.deathMin > median * 1.5).sort((a, b) => a.deathMin - b.deathMin);
  return { label, minutes, seeds, skill, summary, median, outliers, byHero, rows };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [label = 'base', minutes = '120', seeds = '3', skill = 'medio'] = process.argv.slice(2);
  const started = Date.now();
  const out = runBatch({ label, minutes: +minutes, seeds: +seeds, skill });
  console.log(`Rodada "${label}" · ${out.rows.length} partidas · ${minutes} min máx. · desvio ${skill} · ${((Date.now() - started) / 1000).toFixed(0)} s`);
  for (const s of out.summary) console.log(`${s.account.padEnd(6)} ${s.mission.padEnd(6)} morte ${String(s.deathMin).padStart(5)} min (p10 ${s.deathP10} · p90 ${s.deathP90}) · abates ${String(s.kills).padStart(9)} · Nv ${String(s.level).padStart(5)} · 1º min: ${s.alive1} vivos, ${s.kills1} abates · zona 3: ${s.zone3}/${s.runs} · dano ${s.damagePct}% · vel ${s.attackSpeedPct}% · área ${s.areaPct}% · itens ${s.items} · HP ${s.maxHp}`);
  console.log(`Mediana Kage (conta ${'maximo'}): ${out.median} min · fora da média (<50% ou >150%): ${out.outliers.length}`);
  for (const h of out.outliers.slice(0, 12)) console.log(`  ${h.name.padEnd(28)} ${h.deathMin} min · ${h.kills} abates`);
  if (out.outliers.length > 12) console.log('  …');
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync(`artifacts/simulate-${label}.json`, JSON.stringify(out, null, 1) + '\n');
  console.log(`Detalhe: artifacts/simulate-${label}.json`);
  process.exit(0);
}
