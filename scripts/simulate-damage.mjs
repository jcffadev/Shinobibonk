// Partes do dano do jogador contra a vida da horda (sem navegador). Fila do Claude Code em docs/13 (25/11/2026):
// "Revisar a relação entre dano de nível alto, excesso de proteção e pressão do Final Swarm somente após isolar cada
// variável da curva do chefe."
//
// O bot fica na zona 1 sem invocar o Guardião (o Final Swarm começa aos 10:00). Em cada minuto marcado, o golpe da 1ª
// técnica é refeito com partes da build ligadas uma a uma (mesmas fórmulas do jogo: calculateStats e hitDamage):
//   base    = Nv. 1, sem itens, pílulas, treino nem afixos;
//   nível   = só o nível (heroDamageScale);
//   itens   = itens das kunais/Mega Elites sobre o nível;
//   pílulas = pílulas sobre o nível;
//   treino  = treinamento (atributos ao esgotar o pool) sobre o nível;
//   afixos  = afixos de dano da técnica (rollGrowth) sobre a build completa;
//   resto   = o que sobra por somas entre as partes.
// Também mede a proteção: HP máximo, redução da armadura e dano recebido por segundo em % do HP.
// Limites: os do simulador (sem ultimate, aliados, procs, fusões e desvio real). Serve para forma e comparação.
// Uso: node scripts/simulate-damage.mjs [rótulo] [dificuldades=Genin,Kage] [heróis=todos|n]
import { writeFileSync, mkdirSync } from 'node:fs';
import { HEROES } from '../src/game/heroes.ts';
import { calculateStats, HERO_DAMAGE_CURVE, FINAL_SWARM } from '../src/game/progression.ts';
import { NO_GROWTH, GROWTH_ROLLS } from '../src/game/combat.ts';
import { simulateRun, hitDamage } from './simulate-run.mjs';

export const DAMAGE_MARKS = [1, 3, 5, 8, 10, 11, 12, 13, 15];

/** Partes do golpe da 1ª técnica num segundo da partida (p = sonda do simulate-run). */
export function damageParts(p) {
  const t = p.techs.find(x => !x.setup && x.power > 0);
  if (!t) return null;
  const lv = p.skills[t.name], share = p.hp / p.stats.maxHp;
  const at = (stats, g = NO_GROWTH) => hitDamage(p.heroId, t, g, stats, lv, share);
  const stats = (level, items = {}, pills = {}, powerlevel = {}) => calculateStats(p.heroId, level, items, pills, 0, p.permanent, {}, powerlevel);
  const base = at(stats(1)), levelOnly = at(stats(p.level));
  const full = at(p.stats, p.growth[t.name] ?? NO_GROWTH), noAffix = at(p.stats);
  const parts = {
    level: levelOnly / base,
    items: at(stats(p.level, p.items)) / levelOnly,
    pills: at(stats(p.level, {}, p.pills)) / levelOnly,
    training: at(stats(p.level, {}, {}, p.powerlevel)) / levelOnly,
    affixes: full / noAffix,
  };
  const product = Object.values(parts).reduce((a, b) => a * b, 1);
  return { technique: t.name, base, full, ratio: full / p.normalHp, normalHp: p.normalHp, level: p.level, parts: { ...parts, rest: full / (base * product) },
    maxHp: p.stats.maxHp, armorCut: 1 - 100 / (100 + Math.max(0, p.stats.armor)), evasion: p.stats.evasion, incomingPct: p.incoming / p.stats.maxHp, alive: p.alive };
}

export function damageProbe({ heroId, mission, seed = 17, marks = DAMAGE_MARKS }) {
  const want = new Set(marks.map(m => m * 60)), out = {};
  simulateRun({ heroId, mission, seed, minutes: Math.max(...marks) + .1, policy: { guardianAt: Infinity, bossFightLimit: 120, endless: true }, record: 3600,
    probe: p => { if (p.zone === 1 && want.has(p.zoneT) && !p.dead) out[p.zoneT / 60] = damageParts(p); } });
  return out;
}

/**
 * Opções de curva medidas em memória (o jogo não muda): cada uma altera HERO_DAMAGE_CURVE e/ou GROWTH_ROLLS.damage só
 * durante a simulação e devolve os valores originais no fim.
 */
export const CURVE_OPTIONS = [
  ['atual', {}],
  ['nível ÷110', { cubicDivisor: 110 }],
  ['nível ÷150', { cubicDivisor: 150 }],
  ['afixos ½', { affix: .5 }],
  ['nível ÷110 + afixos ½', { cubicDivisor: 110, affix: .5 }],
  ['nível ÷150 + afixos ½', { cubicDivisor: 150, affix: .5 }],
  ['swarm ×2', { swarm: 2 }],
  ['afixos ½ + swarm ×2', { affix: .5, swarm: 2 }],
  ['nível ÷110 + swarm ×2', { cubicDivisor: 110, swarm: 2 }],
  ['÷110 + afixos ½ + swarm ×2', { cubicDivisor: 110, affix: .5, swarm: 2 }],
];
export function withCurve(option, run) {
  const curve = { ...HERO_DAMAGE_CURVE }, swarm = FINAL_SWARM.multiplier, base = [...GROWTH_ROLLS.damage.base], spread = [...GROWTH_ROLLS.damage.spread];
  try {
    if (option.cubicDivisor) HERO_DAMAGE_CURVE.cubicDivisor = option.cubicDivisor;
    if (option.swarm) FINAL_SWARM.multiplier = option.swarm;
    if (option.affix) { GROWTH_ROLLS.damage.base = base.map(v => v * option.affix); GROWTH_ROLLS.damage.spread = spread.map(v => v * option.affix); }
    return run();
  } finally { Object.assign(HERO_DAMAGE_CURVE, curve); FINAL_SWARM.multiplier = swarm; GROWTH_ROLLS.damage.base = base; GROWTH_ROLLS.damage.spread = spread; }
}

const median = list => { const s = list.filter(Number.isFinite).sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
export function summarizeDamage(rows, marks = DAMAGE_MARKS) {
  return marks.map(m => {
    const at = rows.map(r => r.marks[m]).filter(Boolean);
    const part = k => median(at.map(x => x.parts[k]));
    return { minute: m, alive: at.length, n: rows.length, level: median(at.map(x => x.level)), normalHp: median(at.map(x => x.normalHp)), hit: median(at.map(x => x.full)), ratio: median(at.map(x => x.ratio)),
      parts: { level: part('level'), items: part('items'), pills: part('pills'), training: part('training'), affixes: part('affixes'), rest: part('rest') },
      maxHp: median(at.map(x => x.maxHp)), armorCut: median(at.map(x => x.armorCut)), incomingPct: median(at.map(x => x.incomingPct)), horde: median(at.map(x => x.alive)) };
  });
}

const n = v => !Number.isFinite(v) ? '-' : v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'k' : v >= 10 ? v.toFixed(0) : v.toFixed(2);
if (process.argv[1]?.endsWith('simulate-damage.mjs')) {
  const [label = 'dano', missionsArg = 'Genin,Kage', heroesArg = 'todos'] = process.argv.slice(2);
  const heroes = heroesArg === 'todos' ? HEROES : HEROES.slice(0, Number(heroesArg) || HEROES.length), result = {};
  for (const mission of missionsArg.split(',')) {
    const rows = heroes.map(h => ({ heroId: h.id, marks: damageProbe({ heroId: h.id, mission }) }));
    const sum = result[mission] = summarizeDamage(rows);
    console.log('\n' + mission + ' · zona 1 sem Guardião · medianas · golpe = 1ª técnica com crítico esperado, antes da defesa');
    console.log(' min vivos  Nv   HP comum   golpe   golpe/HP | ×nível ×itens ×pílulas ×treino ×afixos ×resto | HP jog. armadura dano receb./s');
    for (const r of sum) console.log(' ' + String(r.minute).padStart(3) + ' ' + String(r.alive).padStart(3) + '/' + r.n + ' ' + n(r.level).padStart(4) + ' ' + n(r.normalHp).padStart(9) + ' ' + n(r.hit).padStart(7) + ' ' + n(r.ratio).padStart(8) + ' | ' +
      ['level', 'items', 'pills', 'training', 'affixes', 'rest'].map(k => n(r.parts[k]).padStart(6)).join(' ') + ' | ' + n(r.maxHp).padStart(6) + ' ' + (r.armorCut * 100).toFixed(0).padStart(3) + '% ' + (r.incomingPct * 100).toFixed(1).padStart(6) + '% (horda ' + n(r.horde) + ')');
  }
  // Opções de curva: golpe/HP do comum e quantos seguem vivos (zona 1 sem Guardião).
  const options = {};
  console.log('\nOPÇÕES DE CURVA · golpe/HP do comum (medianas) e vivos em 115 · minutos 1 · 5 · 10 · 11 · 13');
  for (const mission of missionsArg.split(',')) for (const [name, option] of CURVE_OPTIONS) {
    const sum = withCurve(option, () => summarizeDamage(heroes.map(h => ({ heroId: h.id, marks: damageProbe({ heroId: h.id, mission, marks: [1, 5, 10, 11, 13] }) })), [1, 5, 10, 11, 13]));
    (options[mission] ??= {})[name] = sum;
    console.log(' ' + mission.padEnd(7) + name.padEnd(24) + sum.map(r => n(r.ratio).padStart(6) + ' (' + String(r.alive).padStart(3) + ')').join(' · '));
  }
  mkdirSync('artifacts', { recursive: true });
  writeFileSync('artifacts/simulate-' + label + '.json', JSON.stringify({ parts: result, options }, null, 1));
  console.log('\nArquivo: artifacts/simulate-' + label + '.json (não versionado)');
}
