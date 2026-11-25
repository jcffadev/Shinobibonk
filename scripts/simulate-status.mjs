// Pacote de status (Rodada 103) no simulador, sem navegador. Fila do Claude Code em docs/13 (25/11/2026): "calibrar o
// pacote de status".
//
// O simulador de partida (simulate-run.mjs) trata a horda como um disco e não modela status. Aqui, a build do bot num
// segundo da partida (sonda do simulate-run) enfrenta uma horda de inimigos INDIVIDUAIS por alguns segundos, com as
// MESMAS regras do jogo: src/game/statusRules.ts (Resfriado, congelar, reações, sono, veneno em acúmulos, Quebra-Gelo,
// explosões na morte, resistência) e a ordem do `hit` do GameCanvas (procs da técnica, da natureza e dos itens).
//
// Mede, contra a mesma horda sem nenhum status:
//   - abates por segundo (com nascimentos até o teto da zona, como no jogo);
//   - pressão = golpes recebidos relativos, com a curva do simulate-run sobre os inimigos que podem atacar
//     (atordoado, paralisado, adormecido e congelado não atacam);
//   - de onde vem o dano (golpe direto, bônus de status, queimadura/veneno, eletrocutar, explosões).
// E compara cada item de status (1 cópia) com +10% e +30% de dano total na mesma build.
// Limites: sem desvio, posição real, ultimate, aliados, elites e chefes (só comuns). Serve para forma e comparação.
// Uso: node scripts/simulate-status.mjs [rótulo] [missão=Kage] [heróis=todos|n] [semente=17]
import { writeFileSync, mkdirSync } from 'node:fs';
import { HEROES, heroAffinity } from '../src/game/heroes.ts';
import { ITEM_BY_NAME } from '../src/game/catalog.ts';
import { calculateStats } from '../src/game/progression.ts';
import { attackCooldown, techniqueProc, BURN_CHANCE, POISON_CHANCE, NO_GROWTH } from '../src/game/combat.ts';
import { expectedHit } from '../src/game/bossScaling.ts';
import { STATUS_RULES, addChill, freezeTarget, isFrozen, chillSlow, tickStatus, damageStatusCount, statusDamageMultiplier, addPoisonStack, poisonMultiplier, reactionsFor, deathBurstKind, controlResist } from '../src/game/statusRules.ts';
import { ZONE_SECONDS } from '../src/game/worldScale.ts';
import { ENEMY_TIERS, eliteSpawnChance, eliteHpRamp } from '../src/game/enemyTiers.ts';
import { simulateRun, targetsPerCast, rng32, CROWD, SKILL } from './simulate-run.mjs';

/** Momentos medidos (s de zona 1; o bot não invoca o Guardião): começo, meio e Final Swarm +1, +5 e +10 min. */
export const STATUS_MARKS = [['3:00', 180], ['8:00', 480], ['FS +1', ZONE_SECONDS + 60], ['FS +5', ZONE_SECONDS + 300], ['FS +10', ZONE_SECONDS + 600]];
/** Itens de status medidos (1 cópia) e as referências de dano puro. */
export const STATUS_ITEMS = ['Fio de Aço Ninja', 'Incenso do Sono', 'Correntes de Contenção', 'Esfera Katon', 'Pergaminho Hyoton', 'Anel do Veneno', 'Erva Venenosa', 'Selo dos Cinco Elementos', 'Quebra-Gelo', 'Espelho de Gelo de Haku'];
export const STATUS_COMBOS = { 'Hyoton ×5 + Quebra-Gelo': { 'Pergaminho Hyoton': 5, 'Quebra-Gelo': 1 }, 'Anel do Veneno ×5 + Erva ×2': { 'Anel do Veneno': 5, 'Erva Venenosa': 2 } };
export const DAMAGE_REFS = [.1, .3];
/** Hordas de teste com a build dos 8:00: teto da zona cheio e vida do comum ajustada ao melhor golpe (1 golpe, 3 golpes). */
export const STRESS = [['8:00 · 1 golpe', 1], ['8:00 · 3 golpes', 1 / 3]];
const DT = .1, SECONDS = 30, ENEMY_LIMIT = 900;

/**
 * Luta de `SECONDS` s contra a horda. `build` = sonda do simulate-run; `items`/`runBuffs` mudam a ficha; `status:false`
 * desliga todos os status (referência).
 */
export function statusFight(build, { items = build.items, runBuffs = {}, status = true, seed = 1, skill = 'medio', hitRatio, chain = true } = {}) {
  const rnd = rng32(seed), stats = calculateStats(build.heroId, build.level, items, build.pills, 0, build.permanent, runBuffs, build.powerlevel);
  const ex = k => stats.extra[k] || 0, aff = heroAffinity(build.heroId), pressureK = SKILL[skill];
  const techs = build.techs.filter(t => !t.setup && t.power > 0);
  const base = new Map(techs.map(t => [t, expectedHit(build.heroId, t, build.growth[t.name] ?? NO_GROWTH, stats, build.skills[t.name], { affinity: aff, sageInfused: stats.sage > 0 })]));
  const cds = techs.map(t => attackCooldown(t, build.skills[t.name], build.growth[t.name] ?? NO_GROWTH, stats.attackSpeed));
  const timers = techs.map((_, i) => rnd() * cds[i]);
  // Comuns e elites na proporção do jogo (mesmas contas do simulate-run).
  // `hitRatio` (horda de teste): a vida do comum vira melhor golpe ÷ hitRatio, a horda começa cheia e as elites mantêm a proporção.
  const def = Math.min(.85, build.threat.armor), cap = Math.min(ENEMY_LIMIT, build.threat.cap);
  const hp0 = hitRatio ? Math.max(...techs.map(t => base.get(t))) * (1 - def) / hitRatio : build.normalHp, hpScale = hp0 / build.normalHp;
  const eliteShare = eliteSpawnChance(1, ex('eliteSpawn')), eliteHp = ENEMY_TIERS.elite.hp * eliteHpRamp('elite', build.zoneT) * build.threat.hp * hpScale, eliteDef = Math.min(.85, ENEMY_TIERS.elite.defense + build.threat.armor);
  const enemies = [];
  const radius = () => Math.sqrt(Math.max(30, enemies.length) / (CROWD.density * Math.PI));
  const spawn = () => { const r = radius() * Math.sqrt(rnd()), a = rnd() * Math.PI * 2; const elite = rnd() < eliteShare; enemies.push({ x: r * Math.cos(a), z: r * Math.sin(a), hp: elite ? eliteHp : hp0, def: elite ? eliteDef : def, elite }); };
  for (let i = 0; i < (hitRatio ? cap : Math.min(cap, Math.max(20, Math.round(build.alive)))); i++) spawn();
  const near = (at, r, skip) => enemies.filter(e => e !== skip && Math.hypot(e.x - at.x, e.z - at.z) < r);
  const out = { kills: 0, scratch: 0, bonus: 0, dot: 0, electro: 0, burst: 0, stunned: 0, frozen: 0, slowed: 0, pressure: 0, ticks: 0 };
  const bursts = [];
  const take = (e, dmg, kind) => {
    if (e.hp <= 0) return;
    const d = dmg * (1 - e.def), dealt = Math.min(e.hp, d);
    out[kind] += dealt; e.hp -= d;
    if (e.hp <= 0) { out.kills++; if (status) { const k = deathBurstKind(chain || !e.burstBurn ? e : { ...e, burn: 0 }, ex('fireBurst'), ex('iceBurst'), rnd()); if (k) bursts.push({ x: e.x, z: e.z, k }); } }
  };
  const chill = (e, n) => addChill(e, n);
  const hit = (e, t) => {
    if (e.hp <= 0) return;
    const lv = build.skills[t.name], g = build.growth[t.name] ?? NO_GROWTH, raw = base.get(t);
    let bonus = e.elite ? 1 + ex('eliteDamage') : 1;
    const plain = raw * bonus;
    if (status) {
      if ((e.controlTime || 0) > 0 || (e.slow || 0) > 0) bonus *= 1 + ex('controlledDamage');
      bonus *= 1 + Math.min(.3, damageStatusCount(e) * ex('statusStack'));
      bonus *= statusDamageMultiplier(e, ex('shatter'));
    }
    const damage = raw * bonus, frozenBefore = isFrozen(e), poisonBefore = e.poison;
    if (status) {
      if (e.control === 'Dormir') e.controlTime = 0;
      const st = t.status ?? (stats.status > 0 ? 'Lentidão' : undefined);
      if (st && rnd() < techniqueProc(t.status ? t.statusChance : 0, lv, stats.status)) {
        const duration = (st === 'Lentidão' ? 1.8 : .65) * stats.duration * (1 + g.duration);
        if (st === 'Congelar') chill(e, STATUS_RULES.chill.techniqueStacks);
        else if (st !== 'Empurrar') { e.control = st; e.controlTime = duration * (st === 'Lentidão' ? 1 : controlResist(e)); if (st === 'Lentidão') e.slow = duration; }
      }
      if (t.secondaryStatus && rnd() < techniqueProc(t.secondaryStatusChance ?? 0, lv, stats.status)) {
        if (t.secondaryStatus === 'Lentidão') e.slow = Math.max(e.slow ?? 0, 1.8 * stats.duration * (1 + g.duration));
        else if (t.secondaryStatus === 'Congelar') chill(e, 1);
        else if (t.secondaryStatus !== 'Empurrar' && !e.controlTime) { e.control = t.secondaryStatus; e.controlTime = .65 * stats.duration * (1 + g.duration) * controlResist(e); }
      }
      if (stats.poison > 0) e.poison = { remaining: 3 * stats.duration * (1 + g.duration), dps: damage * stats.poison * (1 + ex('statusDamage')) / 3 };
      if (t.burn && rnd() < techniqueProc(BURN_CHANCE, lv, stats.status)) { e.burn = Math.max(e.burn ?? 0, 2 * stats.duration * (1 + g.duration)); e.burstBurn = false; }
      if (t.poison && rnd() < techniqueProc(POISON_CHANCE, lv, stats.status)) { const duration = 3 * stats.duration * (1 + g.duration); e.poison = { remaining: duration, dps: Math.max(e.poison?.dps ?? 0, damage * .45 * (1 + ex('statusDamage')) / duration) }; }
      if (rnd() < ex('burnChance')) { e.burn = 2 * stats.duration; e.burstBurn = false; }
      if (rnd() < ex('poisonChance')) e.poison = { remaining: 3 * stats.duration, dps: damage * .35 * (1 + ex('statusDamage')) / 3 };
      if (rnd() < ex('sleepChance')) { e.control = 'Dormir'; e.controlTime = 2 * stats.duration * controlResist(e); }
      if (rnd() < ex('rootChance')) { e.control = 'Paralisar'; e.controlTime = 1.2 * stats.duration * controlResist(e); }
      if (rnd() < ex('chillChance')) chill(e, 1);
      if (e.poison && e.poison !== poisonBefore) addPoisonStack(e);
      if (frozenBefore && ex('shatter') > 0) { e.control = undefined; e.controlTime = 0; for (const n of near(e, STATUS_RULES.shatter.radius, e)) chill(n, 1); }
      for (const r of reactionsFor(e, [t.element, t.secondaryElement])) {
        if (r === 'wet') e.wet = STATUS_RULES.wet.seconds;
        else if (r === 'electro') { e.wet = 0; const { targets, radius: rr, share } = STATUS_RULES.electro; for (const n of near(e, rr, e).slice(0, targets)) take(n, damage * share, 'electro'); }
        else if (r === 'scorch') for (const n of near(e, STATUS_RULES.scorch.radius, e).slice(0, STATUS_RULES.scorch.targets)) n.burn = Math.max(n.burn ?? 0, e.burn ?? 0);
      }
    }
    take(e, plain, 'scratch'); if (damage > plain) take(e, damage - plain, 'bonus');
  };
  let spawnDebt = 0, haku = 0;
  for (let step = 0; step < SECONDS / DT; step++) {
    // Nascimentos até o teto da zona, como no jogo.
    spawnDebt += build.threat.spawnPerSecond * DT;
    while (spawnDebt >= 1 && enemies.length < cap) { spawn(); spawnDebt--; }
    // Técnicas: cada uso acerta os alvos mais próximos de um ponto da horda (área) — mesma contagem do simulate-run.
    techs.forEach((t, i) => {
      timers[i] -= DT;
      while (timers[i] <= 0 && enemies.length) {
        timers[i] += cds[i];
        const n = Math.round(targetsPerCast(t, stats, enemies.length)), anchor = enemies[Math.floor(rnd() * enemies.length)];
        const targets = n >= enemies.length ? [...enemies] : [...enemies].sort((a, b) => Math.hypot(a.x - anchor.x, a.z - anchor.z) - Math.hypot(b.x - anchor.x, b.z - anchor.z)).slice(0, n);
        for (const e of targets) hit(e, t);
      }
    });
    // Espelho de Gelo de Haku: o jogador apanha o tempo todo na horda → congela quem está a 5 m a cada 20 s.
    if (status && ex('freezeOnHit') > 0 && (haku -= DT) <= 0) { haku = 20; for (const e of near({ x: 0, z: 0 }, 5)) freezeTarget(e, 3); }
    // Explosões na morte (até 12 por quadro, como no jogo).
    for (const b of bursts.splice(0, STATUS_RULES.deathBurst.perFrame)) {
      const D = STATUS_RULES.deathBurst, fire = b.k === 'fire';
      for (const e of near(b, fire ? D.fireRadius : D.iceRadius)) { take(e, stats.damage * (fire ? D.fireDamage * (1 + ex('statusDamage')) : D.iceDamage), 'burst'); if (e.hp > 0) { if (fire) { if (!(e.burn > 0)) e.burstBurn = true; e.burn = Math.max(e.burn ?? 0, 2 * stats.duration); } else chill(e, 1); } }
    }
    // Queimadura, veneno e tempos de controle.
    for (const e of enemies) {
      if (e.hp <= 0) continue;
      if ((e.burn ?? 0) > 0) { e.burn = Math.max(0, e.burn - DT); take(e, stats.damage * .15 * DT * (1 + ex('statusDamage')), 'dot'); }
      if (e.poison && e.hp > 0) { const d = Math.min(DT, e.poison.remaining); e.poison.remaining -= d; take(e, e.poison.dps * d * poisonMultiplier(e.poisonStacks), 'dot'); if (e.poison.remaining <= 0) { e.poison = undefined; e.poisonStacks = 0; } }
      e.controlTime = Math.max(0, (e.controlTime || 0) - DT); e.slow = Math.max(0, (e.slow || 0) - DT); tickStatus(e, DT);
    }
    for (let i = enemies.length - 1; i >= 0; i--) if (enemies[i].hp <= 0) enemies.splice(i, 1);
    // Pressão: só quem pode atacar conta (curva do simulate-run).
    const stunned = enemies.filter(e => e.controlTime > 0 && e.control !== 'Lentidão').length;
    const attackers = enemies.length - stunned;
    out.stunned += enemies.length ? stunned / enemies.length : 0;
    out.frozen += enemies.length ? enemies.filter(isFrozen).length / enemies.length : 0;
    out.slowed += enemies.length ? enemies.filter(e => (e.slow ?? 0) > 0 || chillSlow(e) < 1).length / enemies.length : 0;
    out.pressure += (attackers / (attackers + pressureK)) ** 2;
    out.ticks++;
  }
  const total = out.scratch + out.bonus + out.dot + out.electro + out.burst || 1;
  return {
    kps: out.kills / SECONDS, pressure: out.pressure / out.ticks, stunned: out.stunned / out.ticks, frozen: out.frozen / out.ticks, slowed: out.slowed / out.ticks,
    share: { direct: out.scratch / total, bonus: out.bonus / total, dot: out.dot / total, electro: out.electro / total, burst: out.burst / total },
    hitOverHp: Math.max(...techs.map(t => base.get(t))) * (1 - def) / hp0, alive: enemies.length,
  };
}

/** Builds do bot nos marcos da zona 1 (o bot fica na zona 1 até o Final Swarm). */
export function statusBuilds({ heroId, mission, seed, plans = 0 }) {
  const marks = new Map(STATUS_MARKS.map(([, at]) => [at, null]));
  simulateRun({ heroId, mission, plans, seed, minutes: (STATUS_MARKS.at(-1)[1] + 5) / 60, policy: { guardianAt: Infinity, bossFightLimit: 120, endless: true }, record: 3600,
    probe: p => { if (marks.has(p.zoneT) && p.zone === 1 && !p.dead) marks.set(p.zoneT, { ...p, items: { ...p.items }, pills: { ...p.pills }, powerlevel: { ...p.powerlevel }, growth: structuredClone(p.growth), skills: { ...p.skills } }); } });
  return Object.fromEntries(STATUS_MARKS.map(([name, at]) => [name, marks.get(at)]));
}

const gain = (v, b) => b.kps > 0 ? v.kps / b.kps - 1 : 0;
const relief = (v, b) => b.pressure > 0 ? 1 - v.pressure / b.pressure : 0;

/** Uma build: sem status, com o pacote, cada item e as referências de dano. */
export function measureBuild(build, seed = 1, fight = {}) {
  const off = statusFight(build, { ...fight, status: false, seed }), on = statusFight(build, { ...fight, seed });
  const row = { level: build.level, hitOverHp: on.hitOverHp, off: { kps: off.kps, pressure: off.pressure }, base: { kps: on.kps, pressure: on.pressure, stunned: on.stunned, alive: on.alive, share: on.share }, packageKills: gain(on, off), packageRelief: relief(on, off), items: {} };
  const add = (name, extra, runBuffs, opts = {}) => {
    const items = { ...build.items }; for (const [k, v] of Object.entries(extra)) items[k] = (items[k] || 0) + v;
    const v = statusFight(build, { ...fight, ...opts, items, runBuffs, seed });
    row.items[name] = { kps: v.kps, pressure: v.pressure, kills: gain(v, on), relief: relief(v, on), stunned: v.stunned, frozen: v.frozen, share: v.share };
  };
  for (const d of DAMAGE_REFS) add(`+${Math.round(d * 100)}% dano`, {}, { damage: d });
  for (const name of STATUS_ITEMS) add(name, { [name]: 1 });
  for (const [name, extra] of Object.entries(STATUS_COMBOS)) add(name, extra);
  // Proposta: a queimadura que vem da explosão não explode de novo (sem reação em cadeia).
  add('Esfera Katon sem cadeia', { 'Esfera Katon': 1 }, {}, { chain: false });
  return row;
}

const sum = (list, f) => list.reduce((a, r) => a + f(r), 0);
const median = a => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
const quart = (a, q) => { const s = a.filter(Number.isFinite).sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(s.length * q))] : NaN; };

/** Resumo por marco: mediana (e quartis) do ganho de abates e do alívio de pressão de cada variante. */
export function summarizeStatus(rows) {
  const out = {};
  for (const mark of Object.keys(rows[0]?.marks ?? {})) {
    const list = rows.map(r => r.marks[mark]).filter(Boolean);
    if (!list.length) continue;
    const names = Object.keys(list[0].items);
    out[mark] = {
      heroes: list.length, pressure: median(list.map(r => r.base.pressure)), hitOverHp: median(list.map(r => r.hitOverHp)),
      // Ganho de abates e alívio de golpes recebidos pela SOMA das versões (quem está apertado pesa mais); Q3 por versão.
      package: { kills: sum(list, r => r.base.kps) / sum(list, r => r.off.kps) - 1, relief: 1 - sum(list, r => r.base.pressure) / Math.max(1e-12, sum(list, r => r.off.pressure)), stunned: median(list.map(r => r.base.stunned)), dotShare: median(list.map(r => r.base.share.dot)) },
      items: Object.fromEntries(names.map(n => [n, { kills: sum(list, r => r.items[n].kps) / sum(list, r => r.base.kps) - 1, killsQ3: quart(list.map(r => r.items[n].kills), .75), relief: 1 - sum(list, r => r.items[n].pressure) / Math.max(1e-12, sum(list, r => r.base.pressure)), reliefQ3: quart(list.map(r => r.items[n].relief), .75) }])),
    };
  }
  return out;
}

/**
 * Variantes de regra para a proposta de calibração (só no simulador): `rules` muda STATUS_RULES, `items` muda bônus de
 * itens e `chain:false` tira a reação em cadeia da Esfera Katon. Tudo volta ao valor original depois da medição.
 */
export const STATUS_VARIANTS = [
  ['atual', {}],
  ['Katon sem cadeia', { chain: false }],
  ['congela com 2 acúmulos', { rules: { chill: { stacksToFreeze: 2 } } }],
  ['Resfriado dura 5 s', { rules: { chill: { decay: 5 } } }],
  ['chances de item ×2', { items: { 'Fio de Aço Ninja': { rootChance: .08 }, 'Incenso do Sono': { sleepChance: .05 }, 'Pergaminho Hyoton': { chillChance: .12 }, 'Anel do Veneno': { poisonChance: .12 } } }],
  ['proposta (Katon sem cadeia + congela com 2 + chances ×2)', { chain: false, rules: { chill: { stacksToFreeze: 2 } }, items: { 'Fio de Aço Ninja': { rootChance: .08 }, 'Incenso do Sono': { sleepChance: .05 }, 'Pergaminho Hyoton': { chillChance: .12 }, 'Anel do Veneno': { poisonChance: .12 } } }],
];
export function withVariant(v, fn) {
  const undo = [];
  for (const [group, values] of Object.entries(v.rules ?? {})) for (const [k, val] of Object.entries(values)) { undo.push([STATUS_RULES[group], k, STATUS_RULES[group][k]]); STATUS_RULES[group][k] = val; }
  for (const [name, values] of Object.entries(v.items ?? {})) for (const [k, val] of Object.entries(values)) { const b = ITEM_BY_NAME[name].bonuses; undo.push([b, k, b[k]]); b[k] = val; }
  try { return fn(); } finally { for (const [o, k, val] of undo.reverse()) o[k] = val; }
}
/** Cada variante nas hordas de teste (STRESS) com as builds dos 8:00. */
export function measureVariants(builds, seed, only) {
  const out = {};
  for (const [name, v] of STATUS_VARIANTS.filter(([n]) => !only || only.includes(n))) out[name] = withVariant(v, () => Object.fromEntries(STRESS.map(([mark, ratio]) => {
    const rows = builds.map(b => ({ heroId: b.heroId, marks: { [mark]: measureBuild(b, seed, { hitRatio: ratio, chain: v.chain ?? true }) } }));
    return [mark, summarizeStatus(rows)[mark]];
  })));
  return out;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [label = 'status', mission = 'Kage', heroesArg = 'todos', seedArg = '17'] = process.argv.slice(2);
  if (label === 'proposta') {
    // node scripts/simulate-status.mjs proposta [missão] [a cada n versões] [semente]
    const step = +heroesArg || 3, seed = +seedArg, started = Date.now();
    const builds = HEROES.filter((_, i) => i % step === 0).map(h => statusBuilds({ heroId: h.id, mission, seed })['8:00']).filter(Boolean);
    const result = measureVariants(builds, seed, process.env.VARIANTES?.split('|'));
    mkdirSync('artifacts', { recursive: true });
    writeFileSync('artifacts/simulate-status-proposta.json', JSON.stringify({ mission, seed, builds: builds.length, result }, null, 1));
    const pct = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
    console.log(`${mission} · ${builds.length} builds dos 8:00 · ${((Date.now() - started) / 1000).toFixed(0)} s`);
    for (const [name, marks] of Object.entries(result)) for (const [mark, sm] of Object.entries(marks)) {
      console.log(`
${name} · ${mark}: pacote ${pct(sm.package.kills)} abates, −${Math.round(sm.package.relief * 100)}% golpes`);
      for (const [n, it] of Object.entries(sm.items)) console.log(`  ${n.padEnd(30)} abates ${pct(it.kills).padStart(5)} · golpes −${Math.round(it.relief * 100)}%`);
    }
    process.exit(0);
  }
  const seed = +seedArg, heroes = heroesArg === 'todos' ? HEROES : HEROES.slice(0, +heroesArg);
  const rows = [], started = Date.now();
  for (const h of heroes) {
    const builds = statusBuilds({ heroId: h.id, mission, seed });
    const marks = Object.fromEntries(Object.entries(builds).map(([k, b]) => [k, b ? measureBuild(b, seed) : null]));
    for (const [name, ratio] of STRESS) marks[name] = builds['8:00'] ? measureBuild(builds['8:00'], seed, { hitRatio: ratio }) : null;
    rows.push({ heroId: h.id, marks });
  }
  const summary = summarizeStatus(rows);
  mkdirSync('artifacts', { recursive: true });
  writeFileSync(`artifacts/simulate-${label}.json`, JSON.stringify({ mission, seed, heroes: heroes.length, summary, rows }, null, 1));
  const pct = v => (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
  console.log(`${mission} · ${heroes.length} versões · semente ${seed} · ${((Date.now() - started) / 1000).toFixed(0)} s`);
  for (const [mark, s] of Object.entries(summary)) {
    console.log(`\n${mark} · ${s.heroes} vivas · golpe÷vida ${s.hitOverHp.toFixed(2)}× · pressão ${s.pressure.toFixed(3)}: pacote ${pct(s.package.kills)} abates, ${pct(s.package.relief)} menos golpes recebidos; controlados ${pct(s.package.stunned)}; DoT ${pct(s.package.dotShare)} do dano`);
    for (const [n, v] of Object.entries(s.items)) console.log(`  ${n.padEnd(30)} abates ${pct(v.kills).padStart(5)} (Q3 ${pct(v.killsQ3).padStart(5)}) · golpes recebidos −${Math.round(v.relief * 100)}% (Q3 −${Math.round(v.reliefQ3 * 100)}%)`);
  }
}
