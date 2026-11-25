// Rodada 76 — SIMULADOR DE PARTIDAS (sem navegador). Pedido do usuário: "Faça a ferramenta que precisa e faça várias
// simulações… vamos tentar aproximar, para conseguir balancear nosso jogo" (comparando com runs longas de ranking).
//
// O que é: um MODELO passo a passo (1 s) de uma partida inteira usando as MESMAS fórmulas do jogo:
//   ameaça (zoneThreat/zoneCurse/Final Swarm), vida/armadura dos monstros, XP (xpDropValue, xpToLevelUp), Ryu, cartas de
//   level-up (técnicas com afixos rollGrowth, pílulas, treinamento), kunais (weaponPrice + rollItems), Mega Elites
//   (rollMegaSchedule/megaEliteHp), Guardião (guardianVitality/guardianDefense), atributos (calculateStats) e recarga
//   (attackCooldown). Bot com política fixa e semente (resultado reproduzível).
// O que NÃO é: o motor 3D. Posição, desvio, obstáculos, ultimate, aliados, procs de item (raios, feixe, queimadura),
//   eventos de mapa (altar, roleta, NPCs) ficam fora. A horda é aproximada por um disco em volta do jogador
//   (densidade CROWD.density) e cada forma de técnica acerta a fração do disco que a área dela cobre.
// Uso: node scripts/simulate-run.mjs [heroi] [Genin|Chunin|Jonin|Kage] [minutos] [semente] [novo|maximo]
import { HEROES, HERO_BY_ID, heroAffinity } from '../src/game/heroes.ts';
import { calculateStats, zoneThreat, zoneCurse, ZONE_DIFFICULTY, MISSION_TIER, xpToLevelUp, effectiveLootLuck, incomingDamage, normalHpFactor, AMBUSH_RULES } from '../src/game/progression.ts';
import { ENEMY_TIERS, BASE_LOOT, xpDropValue, xpLoot, lootScale, megaEliteHp, rollMegaSchedule, eliteSpawnChance, eliteHpRamp } from '../src/game/enemyTiers.ts';
import { attackCooldown, techniqueCritical, techniqueHitDamage, techniquePassiveMultiplier, rollGrowth, ELEMENT_KEY, NO_GROWTH } from '../src/game/combat.ts';
import { techniqueLevelCap } from '../src/game/techniqueMerge.ts';
import { ITEMS, rollItems } from '../src/game/catalog.ts';
import { PILLS, canGrantPill, grantPill } from '../src/game/pills.ts';
import { PASSIVES, weaponPrice, choiceCount } from '../src/game/preparation.ts';
import { guardianVitality, guardianDefense, GUARDIAN_RULES } from '../src/game/missions.ts';
import { ATTACK_SCALE } from '../src/game/worldScale.ts';
import { POWERLEVEL_RATE, POWERLEVEL_ATTRIBUTES } from '../src/game/powerlevel.ts';
import { ZONE_SECONDS } from '../src/game/worldScale.ts';

/**
 * Geometria da horda: inimigos por m² colados no jogador. Pressão: golpes recebidos por segundo =
 * maxHitsPerSecond × (vivos / (vivos + pressureK))² × ritmo de ataque — com poucos monstros o jogador desvia quase tudo
 * (20 vivos ≈ 1 golpe por minuto); com a horda cheia chega a ~3 golpes/s (teto 4: invulnerabilidade de 0,25 s).
 */
export const CROWD = { density: 1.1, pressureK: 300, maxHitsPerSecond: 4, ramenPickup: .5, kunaisPerZone: 12 };
/** Nível de desvio do jogador (pressureK): quanto maior, mais monstros ele aguenta em volta sem apanhar. */
export const SKILL = { casual: 150, medio: 400, bom: 1200 };
/** Política do bot: quando invocar o Guardião (s de zona) e até quanto tempo aceita lutar com chefes. */
export const POLICY = { guardianAt: 540, bossFightLimit: 120, endless: true };

export function rng32(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const maxAccount = () => Object.fromEntries(PASSIVES.map(p => [p.name, p.max]));

/** Área (m²) que cada forma cobre por uso, com o multiplicador de área do jogador (mesmas medidas do GameCanvas). */
function shapeArea(t, area) {
  const a = Math.sqrt(area), range = t.range ?? 4.5;
  switch (t.shape) {
    case 'Corpo a corpo': return Math.PI * range * range;
    case 'Área': return Math.PI * (ATTACK_SCALE * 1.2 * a) ** 2;
    case 'Órbita': return Math.PI * (ATTACK_SCALE * 1.7 * a) ** 2;
    case 'Cone': return Math.acos(.65) * range * range;
    case 'Linha': return range * 2 * ATTACK_SCALE * .65 * a;
    case 'Onda': return range * 2 * (ATTACK_SCALE * .85 * a + .4);
    case 'Em V': return range * 2 * (ATTACK_SCALE * .4 * a + .4);
    default: return 0; // Projétil: 1 alvo por tiro
  }
}
/** Alvos atingidos por uso numa horda de n inimigos. */
export function targetsPerCast(t, stats, n) {
  if (n <= 0) return 0;
  const shots = ['Projétil', 'Em V', 'Onda'].includes(t.shape) ? (t.shape === 'Em V' ? 2 : 1) + Math.max(0, Math.floor(stats.projectiles) - 1) : 1;
  if (t.shape === 'Projétil') return Math.min(n, shots * (1 + stats.bounce));
  const crowdArea = n / CROWD.density;
  return Math.min(n, Math.max(1, CROWD.density * Math.min(shapeArea(t, stats.area), crowdArea)) * shots);
}

/** Dano médio por acerto antes da defesa, usando os multiplicadores da partida. */
export function hitDamage(heroId, t, g, stats, level, healthShare = 1) {
  const c = techniqueCritical(t, level);
  const chance = Math.max(0, stats.crit + c.chance), mult = stats.critDamage + c.damage;
  const critical = chance < 1 ? 1 + chance * (mult - 1) : mult + .5 * Math.min(1, chance - 1);
  const sageInfused = stats.sage > 0;
  return techniqueHitDamage(t, g, stats, { affinity: heroAffinity(heroId), sageInfused })
    * techniquePassiveMultiplier(heroId, t, healthShare, sageInfused) * critical;
}

/** Nota que o bot dá a um bônus (item ou pílula): ofensivo primeiro, depois sobrevivência. */
function bonusScore(b, techs) {
  const els = new Set(techs.flatMap(t => [ELEMENT_KEY[t.element], t.secondaryElement && ELEMENT_KEY[t.secondaryElement]]));
  let s = 0;
  for (const [k, v] of Object.entries(b)) {
    if (k === 'damage') s += v * 400; else if (k === 'attackSpeed') s += v * 300; else if (els.has(k)) s += v * 220;
    else if (k === 'critDamage') s += v * 90; else if (k === 'crit') s += v * 250; else if (k === 'area') s += v * 120;
    else if (k === 'projectiles') s += v * 120; else if (k === 'normal' || k === 'element') s += v * 200; else if (k === 'genjutsu') s += v * 120;
    else if (k === 'health') s += v * .6; else if (k === 'defense') s += v * 2; else if (k === 'regen') s += v * 10; else if (k === 'dodge') s += v * 150;
    else if (k === 'revive35' || k === 'revive60') s += 60; else if (k === 'lifesteal') s += v * 400; else if (k === 'exp') s += v * 60; else if (k === 'luck') s += v * .8;
    else if (k === 'gold') s += v * 30; else if (k === 'enemyCount' || k === 'threat') s -= v * 40; else s += 3;
  }
  return s;
}

export function simulateRun({ heroId = 'naruto', mission = 'Genin', minutes = 30, seed = 1, account = 'novo', allItems = true, policy = POLICY, record = 60, skill = 'medio', xpScale = 1, plans = 0, probe } = {}) {
  const pressureK = SKILL[skill] ?? CROWD.pressureK;
  const rnd = rng32(seed), hero = HERO_BY_ID[heroId], permanent = account === 'maximo' ? maxAccount() : {};
  const pool = allItems ? ITEMS : ITEMS.filter(i => i.rarity === 'Comum');
  const maxSkills = permanent['Quarta técnica'] ? 4 : 3;
  const s = { t: 0, zone: 1, zoneT: 0, level: 1, xp: 0, kills: 0, ryu: 0, paid: 0, kunaisLeft: CROWD.kunaisPerZone, alive: 0, damage: 0,
    items: {}, pills: {}, powerlevel: {}, skills: {}, growth: {}, revives: 0, hp: 0, dead: false, victory: false, megaKills: 0, guardians: 0, ambushAt: AMBUSH_RULES.first, bosses: [] };
  let stats, megaPlan = rollMegaSchedule(rnd), openingMega = true, guardian = null, dirty = true;
  const techs = () => hero.techniques.filter(t => s.skills[t.name]);
  const refresh = () => { stats = calculateStats(heroId, s.level, s.items, s.pills, 0, permanent, {}, s.powerlevel); dirty = false; };
  refresh(); s.hp = stats.maxHp; s.revives = (stats.extra.revive35 || 0) + (stats.extra.revive60 || 0);
  const luckNow = () => effectiveLootLuck(stats.luck, s.t);
  const ex = k => stats.extra[k] || 0;
  const pickItem = () => {
    const offer = rollItems(pool, s.items, luckNow(), choiceCount(permanent, luckNow(), rnd), rnd);
    if (!offer.length) return;
    const best = offer.map(i => [i, bonusScore(i.bonuses, techs())]).sort((a, b) => b[1] - a[1])[0][0];
    s.items[best.name] = (s.items[best.name] || 0) + 1; dirty = true;
    if (best.bonuses.revive35 || best.bonuses.revive60) s.revives++;
  };
  const levelUp = () => { s.level++; offer(); };
  /** Cartas de nível (mesma regra de rollLevelOffers): até 2 técnicas, o resto pílulas; sem nada, treina atributo. */
  const offer = () => {
    const learned = Object.keys(s.skills).length, cap = t => techniqueLevelCap(t, ex('skillCap'));
    const skills = hero.techniques.filter(t => t.unlockLevel <= s.level && (s.skills[t.name] || 0) < cap(t) && ((s.skills[t.name] || 0) > 0 || learned < maxSkills));
    const pills = PILLS.map(p => p.name).filter(n => canGrantPill(s.pills, n, ex('pillCap')));
    const total = choiceCount(permanent, luckNow(), rnd), cards = [];
    const take = list => list.splice(Math.floor(rnd() * list.length), 1)[0];
    const skillTarget = Math.max(Math.min(2, skills.length), total - pills.length);
    while (cards.length < skillTarget && skills.length) cards.push({ kind: 'skill', t: take(skills) });
    while (cards.length < total && pills.length) cards.push({ kind: 'pill', name: take(pills) });
    while (cards.length < total && skills.length) cards.push({ kind: 'skill', t: take(skills) });
    if (!cards.length) { const keys = Object.keys(POWERLEVEL_ATTRIBUTES); const k = keys[Math.floor(rnd() * keys.length)]; s.powerlevel[k] = (s.powerlevel[k] || 0) + 1; dirty = true; return; }
    const score = c => c.kind === 'skill' ? (c.t.setup ? 120 : (s.skills[c.t.name] ? 500 : 900)) : bonusScore(PILLS.find(p => p.name === c.name).perLevel, techs());
    const best = cards.sort((a, b) => score(b) - score(a))[0];
    if (best.kind === 'skill') {
      const roll = rollGrowth(luckNow(), best.t, rnd), g = { ...(s.growth[best.t.name] ?? NO_GROWTH) };
      for (const k of Object.keys(g)) g[k] += roll.growth[k] || 0;
      s.growth[best.t.name] = g; s.skills[best.t.name] = (s.skills[best.t.name] || 0) + 1;
    } else grantPill(s.pills, best.name, ex('pillCap'));
    dirty = true;
  };
  /** Dano por segundo contra 1 alvo com `defense` (chefes). */
  const singleDps = defense => techs().filter(t => !t.setup && t.power > 0).reduce((sum, t) => sum + hitDamage(heroId, t, s.growth[t.name] ?? NO_GROWTH, stats, s.skills[t.name], s.hp/stats.maxHp) * (1 - defense) / attackCooldown(t, s.skills[t.name], s.growth[t.name] ?? NO_GROWTH, stats.attackSpeed), 0);
  // A partida começa com a escolha de nível 1 (choiceLevel=1 no GameCanvas): a 1ª técnica sai daqui.
  offer(); refresh();
  const timeline = [];
  const snapshot = (threat, normalHp, killsPerSecond) => {
    const first = techs().find(t => !t.setup && t.power > 0);
    timeline.push({ min: +(s.t / 60).toFixed(2), zone: s.zone, level: s.level, kills: Math.round(s.kills), alive: Math.round(s.alive), killsPerSecond: +killsPerSecond.toFixed(1),
      normalHp: Math.round(normalHp), playerHp: Math.round(s.hp), maxHp: stats.maxHp, damagePct: Math.round(stats.damage / calculateStats(heroId, 1).damage * 100), attackSpeedPct: Math.round(stats.attackSpeed * 100),
      areaPct: Math.round(stats.area * 100), projectiles: +stats.projectiles.toFixed(1), critPct: Math.round(stats.crit * 100), critDamagePct: Math.round(stats.critDamage * 100), armor: Math.round(stats.armor),
      items: Object.values(s.items).reduce((a, b) => a + b, 0), skills: { ...s.skills },
      firstSkillHit: first ? Math.round(hitDamage(heroId, first, s.growth[first.name] ?? NO_GROWTH, stats, s.skills[first.name], s.hp/stats.maxHp)) : 0, totalDamage: s.damage, swarm: +threat.swarm.toFixed(2) });
  };
  const end = minutes * 60;
  let lastKps = 0;
  while (s.t < end && !s.dead && !s.victory) {
    if (dirty) refresh();
    const overtime = Math.max(0, s.zoneT - ZONE_SECONDS);
    // `plans`: Planos do Shikamaru usados em cada zona (0–3), como no jogo (zoneCurse e guardianDefense).
    const curse = zoneCurse(ZONE_DIFFICULTY[s.zone], plans, ex('threat'));
    const threat = zoneThreat(mission, s.zoneT, curse, overtime, ex('enemyCount'));
    // Horda: nascimentos até o teto + emboscadas (8 + 2 × zona, AMBUSH_RULES).
    s.alive = Math.min(threat.cap, s.alive + threat.spawnPerSecond);
    if (s.zoneT >= s.ambushAt) { s.alive = Math.min(threat.cap, s.alive + 8 + 2 * s.zone); s.ambushAt = s.zoneT + AMBUSH_RULES.min + rnd() * AMBUSH_RULES.spread; }
    // Monstro "médio" da horda (comum + elites na proporção do jogo).
    const e = eliteSpawnChance(1, ex('eliteSpawn')), normalHp = ENEMY_TIERS.normal.hp * threat.hp * normalHpFactor(mission), eliteHp = ENEMY_TIERS.elite.hp * eliteHpRamp('elite', s.zoneT) * threat.hp;
    const def = Math.min(.85, threat.armor), eliteDef = Math.min(.85, ENEMY_TIERS.elite.defense + threat.armor);
    const avgEhp = (1 - e) * normalHp / (1 - def) + e * eliteHp / (1 - eliteDef) * (1 / (1 + ex('eliteDamage')));
    // Mortes: cada técnica de dano acerta alvos(forma, horda) por uso; mata min(1, golpe/vida efetiva) de cada alvo.
    let kps = 0, dealt = 0;
    for (const t of techs()) {
      if (t.setup || !(t.power > 0)) continue;
      const lv = s.skills[t.name], g = s.growth[t.name] ?? NO_GROWTH, cd = attackCooldown(t, lv, g, stats.attackSpeed);
      const hit = hitDamage(heroId, t, g, stats, lv, s.hp/stats.maxHp), tg = targetsPerCast(t, stats, s.alive);
      kps += tg * Math.min(1, hit / avgEhp) / cd; dealt += tg * Math.min(hit, avgEhp) / cd;
    }
    const kills = Math.min(s.alive, kps);
    s.alive -= kills; s.kills += kills; s.damage += dealt; lastKps = kps;
    const loot = lootScale('normal', 0, 0, MISSION_TIER[mission]) * (1 + e * (ENEMY_TIERS.elite.loot - 1));
    s.xp += kills * xpDropValue(xpLoot(loot, MISSION_TIER[mission]), 1, s.t) * stats.xpGain;
    s.ryu += kills * BASE_LOOT.ryuChance * BASE_LOOT.ryu * loot * stats.moneyGain;
    // Kunais: compra sempre que der (o mapa tem CROWD.kunaisPerZone por zona).
    let price = weaponPrice(s.paid, s.t) * (1 - Math.min(.4, ex('kunaiDiscount')));
    while (s.kunaisLeft > 0 && s.ryu >= price) { s.ryu -= price; s.paid++; s.kunaisLeft--; pickItem(); price = weaponPrice(s.paid, s.t) * (1 - Math.min(.4, ex('kunaiDiscount'))); }
    const xpMult = l => typeof xpScale === 'function' ? xpScale(l) : xpScale;
    let need = xpToLevelUp(s.level) * xpMult(s.level), guard = 0;
    while (s.xp >= need && guard++ < 400) { s.xp -= need; levelUp(); need = xpToLevelUp(s.level) * xpMult(s.level); }
    if (dirty) refresh();
    // Mega Elites: se a técnica de 1 alvo derruba dentro do limite, ganha 1 item grátis.
    if (megaPlan.length && s.zoneT >= megaPlan[0]) {
      megaPlan.shift();
      const hp = megaEliteHp(s.zoneT, MISSION_TIER[mission] * ZONE_DIFFICULTY[s.zone] * Math.max(.2, 1 + ex('threat')), rnd, openingMega);
      openingMega = false;
      const megaDef = Math.min(.85, ENEMY_TIERS.mega.defense * (.6 + .4 * Math.min(1, s.zoneT / 480)) + threat.armor);
      if (hp / Math.max(1e-9, singleDps(megaDef) * (1 + ex('eliteDamage'))) <= policy.bossFightLimit) { s.megaKills++; pickItem(); s.xp += xpDropValue(xpLoot(lootScale('mega', 0, 0, MISSION_TIER[mission]), MISSION_TIER[mission]), 1, s.t) * stats.xpGain; }
    }
    // Guardião: invocado em policy.guardianAt; derrotado → item grátis e próxima zona. Na zona 3 em modo sem fim, fica no Final Swarm.
    const endlessHere = policy.endless && s.zone === 3;
    if (!endlessHere && !guardian && s.zoneT >= policy.guardianAt) { const hp = guardianVitality(threat.hp, s.t, s.zoneT, overtime, s.zone); guardian = { hp, maxHp: hp, def: guardianDefense(s.t, false, overtime, s.zone, plans), at: s.t, zone: s.zone, level: s.level }; }
    if (guardian) {
      guardian.hp -= singleDps(guardian.def) * (1 + ex('eliteDamage'));
      if (guardian.hp <= 0) {
        // Como no jogo: o Guardião solta 1 pergaminho grátis + 1 por plano do Shikamaru (até 3 → 4 pergaminhos).
        const scrolls = 1 + Math.min(GUARDIAN_RULES.shikamaruMaxPlans, plans);
        s.bosses.push({ zone: guardian.zone, summonedAt: guardian.at, killedAt: s.t + 1, hp: guardian.maxHp, def: guardian.def, level: guardian.level, scrolls });
        s.guardians++; for (let n = 0; n < scrolls; n++) pickItem(); guardian = null;
        if (s.zone === 3) { s.victory = true; } else { s.zone++; s.zoneT = 0; s.alive = 0; s.kunaisLeft = CROWD.kunaisPerZone; megaPlan = rollMegaSchedule(rnd); s.ambushAt = AMBUSH_RULES.first; }
      }
    }
    // Dano recebido: curva de pressão da horda (CROWD.pressureK), até 4 golpes/s (invulnerabilidade 0,25 s).
    const hits = Math.min(CROWD.maxHitsPerSecond, CROWD.maxHitsPerSecond * (s.alive / (s.alive + pressureK)) ** 2 * threat.attackRate) * (1 - stats.evasion);
    const incoming = hits * incomingDamage(10 * threat.damage * (1 + e * .6), stats.armor);
    const heal = stats.regen + dealt * ex('lifesteal') + kills * ex('killHeal') * stats.maxHp * .02 + kills * .025 * CROWD.ramenPickup * .35 * stats.maxHp;
    s.hp = Math.min(stats.maxHp, s.hp - incoming + heal);
    if (s.hp <= 0) { if (s.revives > 0) { s.revives--; s.hp = stats.maxHp * .35; } else s.dead = true; }
    s.t++; s.zoneT++;
    // Sonda opcional (scripts/simulate-bosses.mjs): estado do segundo para medir lutas contra chefes.
    if (probe) probe({ t: s.t, zone: s.zone, zoneT: s.zoneT, overtime, threat, level: s.level, hp: s.hp, dead: s.dead, victory: s.victory, singleDps, stats, mission, plans, threatBonus: ex('threat'), eliteDamage: ex('eliteDamage'),
      // Para isolar as partes do dano (scripts/simulate-damage.mjs): build completa do segundo.
      heroId, items: s.items, pills: s.pills, powerlevel: s.powerlevel, growth: s.growth, skills: s.skills, permanent, techs: techs(), normalHp, alive: s.alive, hitsTaken: hits, incoming });
    if (s.t % record === 0 || s.dead || s.victory) snapshot(threat, normalHp, lastKps);
  }
  return { heroId, mission, seed, account, endedAt: +(s.t / 60).toFixed(1), dead: s.dead, victory: s.victory, zone: s.zone, level: s.level, kills: Math.round(s.kills), megaKills: s.megaKills, guardians: s.guardians, bosses: s.bosses, totalDamage: s.damage, items: s.items, pills: s.pills, timeline };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const [heroId = 'naruto', mission = 'Kage', minutes = '120', seed = '1', account = 'maximo', skill = 'medio'] = process.argv.slice(2);
  const r = simulateRun({ heroId, mission, minutes: +minutes, seed: +seed, account, skill });
  const f = n => n >= 1e3 ? n.toExponential(2) : String(n);
  console.log(`${HERO_BY_ID[heroId].name} · ${mission} · conta ${account} · semente ${seed}: ${r.dead ? 'morreu' : r.victory ? 'vitória' : 'viva'} aos ${r.endedAt} min · zona ${r.zone} · Nv ${r.level} · ${r.kills} abates · megas ${r.megaKills} · guardiões ${r.guardians}`);
  for (const p of r.timeline.filter((_, i, a) => i % 5 === 4 || i === a.length - 1)) console.log(`${String(p.min).padStart(6)} min z${p.zone} Nv ${String(p.level).padStart(5)} · abates ${String(p.kills).padStart(8)} · vivos ${String(p.alive).padStart(4)} · ${String(p.killsPerSecond).padStart(6)}/s · HP comum ${f(p.normalHp).padStart(9)} · golpe 1ª ${f(p.firstSkillHit).padStart(9)} · dano ${p.damagePct}% · vel ${p.attackSpeedPct}% · área ${p.areaPct}% · proj ${p.projectiles} · HP ${p.playerHp}/${p.maxHp} · itens ${p.items}`);
  process.exit(0);
}
