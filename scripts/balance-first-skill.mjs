// Rodada 75 — tempo para matar UM monstro comum só com a PRIMEIRA técnica, em todos os personagens e dificuldades.
// Pedido do usuário: "faça um teste, em todos os personagens, quanto em média em todas as dificuldades os personagens
// demoram para matar um monstro usando a primeira skill? Estamos buscando balanceamento de CD."
// Sem navegador: usa as MESMAS fórmulas do jogo (calculateStats, difficultyAt, attackCooldown, techniqueCritical).
// Uso: node scripts/balance-first-skill.mjs   → console + artifacts/first-skill-ttk.json
import fs from 'node:fs';
import { HEROES, familyOf } from '../src/game/heroes.ts';
import { calculateStats, difficultyAt, MISSION_TIER } from '../src/game/progression.ts';
import { ENEMY_TIERS } from '../src/game/enemyTiers.ts';
import { TECHNIQUE_SCALE, attackCooldown, techniqueCritical } from '../src/game/combat.ts';

/** Cenários (zona 1, sem itens, pílulas, bônus permanentes nem ajudantes; técnica no Nv 1; debug padrão ×1). */
export const SCENARIOS = [
  { id: 'inicio', label: 'Início (min 0, Nv 1)', seconds: 0, level: 1 },
  { id: 'meio', label: 'Meio (min 5, Nv 10)', seconds: 300, level: 10 },
  { id: 'fim', label: 'Fim da zona (min 10, Nv 20)', seconds: 600, level: 20 },
];
export const DIFFICULTIES = Object.keys(MISSION_TIER);

/** Monstro comum: HP = round(22 × ameaça.hp) e defesa = ameaça.armor (como spawnEnemy no GameCanvas). */
export function normalEnemy(mission, seconds) {
  const threat = difficultyAt(mission, seconds, 1, 0);
  return { hp: Math.round(ENEMY_TIERS.normal.hp * threat.hp), defense: Math.min(.85, ENEMY_TIERS.normal.defense + (threat.armor ?? 0)) };
}

/** Dano médio de um acerto da técnica (crítico pela média), como hit() no GameCanvas, com vida cheia. */
export function expectedHit(heroId, t, stats) {
  const crit = techniqueCritical(t, 1);
  const chance = Math.min(1, stats.crit + crit.chance), critMult = stats.critDamage + crit.damage;
  const school = t.ultimate ? stats.physical * stats.ninjutsu : t.school === 'Taijutsu' ? stats.physical : t.school === 'Ninjutsu' ? stats.ninjutsu : 1;
  const family = familyOf(heroId);
  const passive = family === 'tenten' && (t.element === 'Neutro' || t.shape === 'Projétil' || t.shape === 'Em V') ? 1.5 : 1;
  return stats.damage * t.power * TECHNIQUE_SCALE * school * passive * (1 + chance * (critMult - 1));
}

/** Tempo para matar: n acertos → (n − 1) recargas (o 1º acerto sai no instante 0). 1 acerto por inimigo por uso. */
export function timeToKill(heroId, mission, scenario) {
  const hero = HEROES.find(h => h.id === heroId), t = hero.techniques[0];
  if (!t || t.setup || !(t.power > 0)) return { technique: t?.name ?? '—', buff: true };
  const stats = calculateStats(heroId, scenario.level);
  const enemy = normalEnemy(mission, scenario.seconds);
  const hit = expectedHit(heroId, t, stats) * (1 - enemy.defense);
  const hits = Math.max(1, Math.ceil(enemy.hp / hit));
  const cooldown = attackCooldown(t, 1, undefined, stats.attackSpeed);
  return { technique: t.name, school: t.school, shape: t.shape, power: t.power, cooldown, hit, enemyHp: enemy.hp, hits, seconds: (hits - 1) * cooldown, dps: hit / cooldown };
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop());
if (isMain) {
  const rows = [];
  for (const hero of HEROES) for (const sc of SCENARIOS) for (const mission of DIFFICULTIES) rows.push({ hero: hero.id, name: hero.name, scenario: sc.id, mission, ...timeToKill(hero.id, mission, sc) });
  const fighting = rows.filter(r => !r.buff);
  const avg = list => list.reduce((s, x) => s + x, 0) / Math.max(1, list.length);
  const f = n => n.toFixed(2).replace('.', ',');
  console.log(`Personagens: ${HEROES.length} · primeira técnica é buff (sem dano): ${new Set(rows.filter(r => r.buff).map(r => r.hero)).size}`);
  for (const sc of SCENARIOS) {
    console.log(`\n== ${sc.label} ==`);
    for (const mission of DIFFICULTIES) {
      const list = fighting.filter(r => r.scenario === sc.id && r.mission === mission);
      const secs = list.map(r => r.seconds).sort((a, b) => a - b);
      console.log(`${mission.padEnd(7)} HP ${String(list[0].enemyHp).padStart(5)} · média ${f(avg(secs))} s · mediana ${f(secs[Math.floor(secs.length / 2)])} s · mín ${f(secs[0])} · máx ${f(secs.at(-1))} · golpes médios ${f(avg(list.map(r => r.hits)))} · 1 golpe mata: ${list.filter(r => r.hits === 1).length}/${list.length}`);
    }
  }
  // Ranking por média de todos os cenários e dificuldades.
  const byHero = new Map();
  for (const r of fighting) { const e = byHero.get(r.hero) ?? { hero: r.hero, name: r.name, technique: r.technique, cooldown: r.cooldown, school: r.school, shape: r.shape, power: r.power, secs: [], dps: [] }; e.secs.push(r.seconds); e.dps.push(r.dps); byHero.set(r.hero, e); }
  const ranking = [...byHero.values()].map(e => ({ ...e, avg: avg(e.secs), avgDps: avg(e.dps) })).sort((a, b) => b.avg - a.avg);
  const overall = avg(ranking.map(r => r.avg));
  console.log(`\nMédia geral (todos os personagens, cenários e dificuldades): ${f(overall)} s`);
  const show = r => `${r.name.padEnd(28)} ${r.technique.padEnd(30)} ${r.school.padEnd(9)} ${r.shape.padEnd(14)} poder ${String(r.power).padEnd(4)} CD ${f(r.cooldown)} s · média ${f(r.avg)} s`;
  console.log('\nMais LENTOS:'); ranking.slice(0, 15).forEach(r => console.log(show(r)));
  console.log('\nMais RÁPIDOS:'); ranking.slice(-15).reverse().forEach(r => console.log(show(r)));
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/first-skill-ttk.json', JSON.stringify({ date: new Date().toISOString(), assumptions: 'Zona 1, monstro comum, sem itens/pílulas/permanentes/ajudantes, técnica Nv 1, vida cheia, crítico pela média, 1 acerto por inimigo por uso, 1º acerto no instante 0.', scenarios: SCENARIOS, overall, ranking: ranking.map(({ secs, dps, ...r }) => r), rows }, null, 2) + '\n');
  console.log('\nDetalhe: artifacts/first-skill-ttk.json');
}
