// Gera docs/28-STATUS-PERSONAGENS-E-MONSTROS.md direto do código (25/11/2026 — pedido do usuário: "Crie um .md referente ao
// status de todos os personagens e monstros para termos um track das alterações e suas respectivas datas/builds").
// Sem navegador. Uso: node scripts/gen-status-doc.mjs   (rode de novo a cada mudança de balanceamento e faça commit do .md)
// O histórico de alterações fica em docs/28-…-HISTORICO.md (escrito à mão), e este gerador só refaz as tabelas.
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { HEROES, familyOf } from '../src/game/heroes.ts';
import { calculateStats, difficultyAt, normalHpFactor, MISSION_TIER, BASE_REGEN, SWARM_STEP, FINAL_SWARM } from '../src/game/progression.ts';
import { ENEMY_TIERS, eliteHpRamp, PLAYER_HIT_RULES, ELITE_OPENING } from '../src/game/enemyTiers.ts';
import { attackCooldown } from '../src/game/combat.ts';
import { guardianVitality, guardianDefense } from '../src/game/missions.ts';
import { compactNumber } from '../src/game/format.ts';

const n1 = v => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
const pct = v => Math.round(v * 100) + '%';
let build = 'local';
try { build = execSync('git log -1 --format=%h', { encoding: 'utf8' }).trim(); } catch { /* sem git */ }
const today = new Date().toLocaleDateString('sv-SE'); // data local (AAAA-MM-DD)
const out = [];
out.push('# 28 · Status de personagens e monstros', '');
out.push(`> **Gerado pelo código** com \`node scripts/gen-status-doc.mjs\` em ${today}, build \`${build}\`. Não edite as tabelas à mão: rode o gerador depois de cada mudança de balanceamento e faça commit junto. O histórico de alterações, com datas e builds, está em [28-HISTORICO-STATUS.md](28-HISTORICO-STATUS.md).`, '');

out.push('## Regras gerais em vigor', '');
out.push(`- Regeneração base de todo shinobi: **${n1(BASE_REGEN)} HP/s** (passivas de cura somam).`);
out.push(`- Dano recebido da horda (comuns e elites): **×${n1(PLAYER_HIT_RULES.hordeDamage)}**; teto por golpe de horda e Mega Elite: **${pct(PLAYER_HIT_RULES.capShare)} da vida máxima** (Guardião e Bijū sem teto).`);
out.push(`- Elites no começo: chance começa em **${pct(ELITE_OPENING.start)}** do valor e chega ao cheio aos **${ELITE_OPENING.seconds} s**.`);
out.push(`- Final Swarm: entra com **×${FINAL_SWARM.multiplier}** e ganha um degrau a cada **${SWARM_STEP.seconds / 60} min**; o degrau k dá vida ×(1 + ${n1(SWARM_STEP.hp)}·k), dano ×(1 + ${n1(SWARM_STEP.damage)}·k) e +${Math.round(SWARM_STEP.armor * 100)}·k pontos de defesa (até ${pct(SWARM_STEP.armorCap)}), acumulando.`);
out.push(`- Multiplicador por dificuldade: ${Object.entries(MISSION_TIER).map(([k, v]) => `${k} ×${n1(v)}`).join(' · ')}.`, '');

out.push('## Monstros', '');
out.push('### Tipos', '', '| Tipo | Vida base | Dano base | Defesa base | Velocidade | Saque |', '|---|---|---|---|---|---|');
for (const [k, t] of Object.entries(ENEMY_TIERS)) out.push(`| ${k} | ${n1(t.hp)} | ${n1(t.damage)} | ${pct(t.defense)} | ${n1(t.speed)} | ${n1(t.loot)} |`);
out.push('');
out.push('### Por dificuldade e tempo (zona 1, sem planos do Shikamaru)', '', 'Golpe = dano bruto antes da sua armadura, já com o nerf da horda (Mega Elite sem nerf, só com o teto).', '');
out.push('| Dificuldade | Tempo | Comum: vida · defesa · golpe | Elite: vida · defesa · golpe | Mega Elite: golpe | Guardião: vida · defesa |', '|---|---|---|---|---|---|');
for (const mission of Object.keys(MISSION_TIER)) for (const [label, secs, ot] of [['1 min', 60, 0], ['5 min', 300, 0], ['10 min', 600, 0], ['Final Swarm +5', 900, 300], ['Final Swarm +10', 1200, 600]]) {
  const th = difficultyAt(mission, secs, 1, ot);
  const nHp = ENEMY_TIERS.normal.hp * th.hp * normalHpFactor(mission), eHp = ENEMY_TIERS.elite.hp * eliteHpRamp('elite', secs) * th.hp;
  const nDef = Math.min(.95, th.armor), eDef = Math.min(.95, ENEMY_TIERS.elite.defense + th.armor);
  const g = guardianVitality(th.hp, secs, secs, ot, 1), gDef = guardianDefense(secs, false, ot, 1, 0);
  out.push(`| ${mission} | ${label} | ${compactNumber(nHp)} · ${pct(nDef)} · ${Math.round(10 * ENEMY_TIERS.normal.damage * th.damage * PLAYER_HIT_RULES.hordeDamage)} | ${compactNumber(eHp)} · ${pct(eDef)} · ${Math.round(10 * ENEMY_TIERS.elite.damage * th.damage * PLAYER_HIT_RULES.hordeDamage)} | ${Math.round(10 * ENEMY_TIERS.mega.damage * th.damage)} | ${compactNumber(g)} · ${pct(gDef)} |`);
}
out.push('', 'A vida do Guardião acima é a da fórmula da zona; na partida ela também tem um piso pelo poder do jogador (30 s do seu dano).', '');

out.push('## Personagens (Nv. 1, sem itens)', '');
out.push('| Versão | Família | Vida | Dano | Armadura | Velocidade | Crítico | Regeneração | Passiva | Técnicas (forma · poder · recarga Nv 1 · nível) | Ultimate |', '|---|---|---|---|---|---|---|---|---|---|---|');
for (const h of HEROES) {
  const s = calculateStats(h.id, 1);
  const kit = h.techniques.map(t => t.setup ? `${t.name} (preparo, Nv ${t.unlockLevel})` : `${t.name} (${t.shape} · ${n1(t.power)} · ${n1(attackCooldown(t, 1))} s · Nv ${t.unlockLevel})`).join('<br>');
  out.push(`| ${h.name} (\`${h.id}\`) | ${familyOf(h.id)} | ${Math.round(s.maxHp)} | ${n1(s.damage)} | ${Math.round(s.armor)} | ${n1(s.moveSpeed)} | ${pct(s.crit)} | ${n1(s.regen)} | ${h.passive.replace(/\|/g, '/')} | ${kit} | ${h.ultimate} |`);
}
out.push('');
fs.writeFileSync('docs/28-STATUS-PERSONAGENS-E-MONSTROS.md', out.join('\n'));
console.log('docs/28-STATUS-PERSONAGENS-E-MONSTROS.md ·', HEROES.length, 'versões · build', build);
