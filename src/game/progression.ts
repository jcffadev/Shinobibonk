import { ITEM_BY_NAME, type Bonuses } from './catalog.ts';
import { HEROES, HERO_BY_ID, familyOf } from './heroes.ts';
import { FORMS, formAt } from './evolution.ts';
import { applyPowerlevel, type Powerlevel } from './powerlevel.ts';
import { pillBonuses } from './pills.ts';
export type Difficulty='Genin'|'Chunin'|'Jonin'|'Kage';
export type Stats={sage:number;maxHp:number;damage:number;armor:number;moveSpeed:number;attackSpeed:number;
  /** Velocidade de projétil: ×viagem dos projéteis e ÷tempo de preparo (golpe/lançamento) das técnicas sem projétil. */
  projectileSpeed:number;bounce:number;crit:number;critDamage:number;evasion:number;regen:number;luck:number;pickup:number;xpGain:number;moneyGain:number;ultimateRate:number;area:number;projectiles:number;
  /** Chance por disparo de +1 projétil (fração de projétil de sinergias/afinidade; a parte ≥1 vira projétil garantido). */
  projectileChance:number;duration:number;poison:number;status:number;physical:number;ninjutsu:number;genjutsu:number;supportSlots:number;allyDamage:number;allySpeed:number;allyBuff:number;
  /** Soma bruta de todos os bônus (itens, pílulas, buffs da run); a simulação lê daqui as mecânicas de item (elementos, procs, roubo de vida...). */
  extra:Bonuses};
export const HERO_BASE=Object.fromEntries(HEROES.map(h=>[h.id,h.base]));
export function heroDamageScale(level:number) {
  const levels=Math.max(0,level-1);
  return (1+levels*.03)*(1+levels/75)**3;
}
export function effectiveLootLuck(luck:number, elapsed:number) {
  return luck*(.2+.8*Math.min(1,Math.max(0,elapsed)/150));
}
export function xpToLevelUp(level:number) {
  const levels=Math.max(0,level-1);
  return level<=1?30:18+6*levels+.08*levels**2/(1+levels/250);
}
export function calculateStats(heroId:string,level:number,items:Record<string,number>={},pills:Record<string,number>={},bonusHp=0,permanent:Record<string,number>={},runBuffs:Bonuses={},powerlevel:Powerlevel={},pillQuality:Record<string,number>={}):Stats {
  const base=HERO_BASE[heroId]??HERO_BASE.naruto,n=Math.max(0,level-1),b:Bonuses={...HERO_BY_ID[heroId]?.bonuses};
  for(const [key,value] of Object.entries(runBuffs)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  for(const [name,count] of Object.entries(items)){const item=ITEM_BY_NAME[name];if(!item)continue;for(const [key,value] of Object.entries(item.bonuses)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value*Math.min(item.max,Math.max(0,count));}}
  // Pílulas: bônus por nível vindos de src/game/pills.ts, recalculados sempre a partir de knownPills.
  for(const [key,value] of Object.entries(pillBonuses(pills, (b.pillCap ?? 0)+Math.min(2,Math.max(0,permanent['Farmacologia Ninja']||0)),pillQuality))){const k=key as keyof Bonuses;b[k]=(b[k]||0)+(value||0);}
  const p=(name:string)=>Math.max(0,Math.min(10,permanent[name]||0));
  // Passivas Shinobi que viram mecânicas da run (src/game/preparation.ts): entram em `extra` para a simulação ler (pillCap, revive35...).
  const perm:Bonuses={regen:p('Chakra Curativo')*.2,area:p('Expansão')*.03,cool:p('Meditação de Chakra')*.04,pillCap:Math.min(2,p('Farmacologia Ninja')),revive35:Math.min(1,p('Selo de Ressurreição'))};
  for(const [key,value] of Object.entries(perm)){if(!value)continue;const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  const add=(key:keyof Bonuses)=>b[key]||0;
  const forms=FORMS[familyOf(heroId)]??[],evolutions=forms.filter(f=>f.level>1&&f.level<=formAt(heroId,level).level).length;
  const baseHp=Math.round(base.hp*(forms.length>1?.65:1.1));
  const armorByLevel=base.armor*(1+n*.01)+n*.25;
  return applyPowerlevel({
    sage:add('sage'),maxHp:Math.round((baseHp*(1+n*.03+evolutions*.25)+add('health')+bonusHp+p('Resistência')*8)*Math.max(.1,1+add('healthPct'))),
    damage:base.damage*heroDamageScale(level)*(1+add('damage')+p('Treinamento')*.04)*(familyOf(heroId)==='gaara'?1+(armorByLevel+add('defense')+p('Colete Shinobi')*2)*.01:1),
    armor:armorByLevel+add('defense')+p('Colete Shinobi')*2,
    crit:Math.max(0,base.crit+n*.0015+add('crit')+p('Precisão')*.01),critDamage:2.5+add('critDamage'),
    evasion:Math.min(.6,add('dodge')),regen:(base.regen+n*.04+add('regen'))*Math.max(0,1+add('regenMult')),luck:Math.floor(n/3)+add('luck')+p('Fortuna')*2,
    pickup:2.5*(1+add('pickup'))+add('pickupFlat')+p('Magnetismo')*.6,xpGain:1+add('exp')+p('Estudo')*.05,moneyGain:1+add('gold')+p('Comércio')*.05,
    ultimateRate:1+add('cool'),area:1+add('area'),projectiles:1+add('projectiles'),projectileChance:Math.max(0,add('projectileChance')),
    duration:1+add('duration'),poison:add('dot'),status:Math.min(.9,add('status')),physical:1+add('normal'),ninjutsu:1+add('element'),genjutsu:1+add('genjutsu'),attackSpeed:Math.max(.2,1+n*.008+add('attackSpeed')+p('Celeridade')*.02),projectileSpeed:Math.max(.3,1+add('projectileSpeed')),bounce:Math.floor(add('bounce')),moveSpeed:base.speed*Math.max(.3,1+n*.002+add('move')+p('Agilidade')*.025),extra:{...b},
    supportSlots:3+Math.min(1,add('support'))+Math.min(1,p('Suporte adicional')),allyDamage:1+add('allyDamage'),allySpeed:1+add('allySpeed'),allyBuff:1+add('allyBuff'),
  },powerlevel);
}
/** Escala das missões sobre a base Genin (o que é salvo no debug vale como Genin e é multiplicado por isto). */
export const MISSION_TIER:Record<Difficulty,number>={Genin:1,Chunin:1.4,Jonin:1.9,Kage:2.6};
/**
 * Escala dos inimigos com o tempo TOTAL da run (não reseta por zona). Valores provisórios; o debug multiplica por cima.
 * Revisão 06/11/2026 (pedido do usuário: "8 min e só 60 bichos", "HP/dano baixíssimos"):
 * - HP  = tier × (1 + min × hpLinear) × hpPerMinute^min      → Genin: 2 min ×2,1 · 5 min ×5,0 · 8 min ×10,4 · 10 min ×16 · 15 min ×46 · 30 min ×660
 * - Dano= tier × (1 + min × damageLinear) × damagePerMinute^min → 10 min ×5,4 · 30 min ×40
 * - Teto da horda = (capBase + capLinear×min + capQuad×min²) × (0,85 + tier×0,15), até maxEnemies (1600 no Genin aos 10 min)
 * - Spawns por segundo = (spawnBase + spawnPerMinute×min) × √tier, até maxSpawnPerSecond (o jogo repõe em lote, sem 1-por-quadro)
 * Revisão 11/11/2026 (pedidos do usuário: "dificulte mais o early game de todos os modos de jogo" + "verifique o nível de dificuldade de scale de cada nível de dificuldade"):
 * - O Genin perdeu o desconto de 66% inicial: TODAS as dificuldades nascem na base cheia do tier, em suas devidas proporções (1 / 1,4 / 1,9 / 2,6).
 * - Base do minuto 0 subiu: HP × hpBase e dano × damageBase (1,45):
 * Rodada 47 (pedido do usuário: "aumentar cerca de 200% a dificuldade, diminuir dano inicial dos personagens,
 * aumentar hp/defesa dos mob's" — Genin; se fácil no Genin, fácil em todos, nas devidas proporções do tier):
 * - hpBase 1,6 → 3,2 (HP inicial dos inimigos ×2) e defesa inicial dobrada (armorPerMinute 0,015→0,03 · maxArmor 0,6→0,72);
 * - dano base dos heróis ×0,55 → ×0,41 (heroes.ts, −25%);
 * - dificuldade total ≈ ×2,8–3,1 no minuto 0 (valores PROPOSTOS pela sessão; o usuário testa a gameplay e ajustamos).
 *   HP   = tier × (hpBase + min×hpLinear) × hpPerMinute^min
 *   Dano = tier × (damageBase + min×damageLinear) × damagePerMinute^min
 *   O efeito extra é máximo no início e decai proporcionalmente (5 min: ×1,20 · 10 min: ×1,13 · 30 min: ×1,05) — o late game já é íngreme por si (1,17^min).
 * - Escala individual por zona (fase): ZONE_DIFFICULTY (zona 1 ×1 · zona 2 ×1,18 · zona 3 ×1,38), aplicada em GameCanvas (zoneDifficulty).
 * Rodada 50 (pedido do usuário: "114 monstros aos 1 min é bem expressivo · diminua um pouco a escada de monstros vivos no início,
 * mas progressivo tempo + %inimigos por itens/debuffs") — escada de monstros VIVOS reduzida ~40% no early game (PROPOSTO, o usuário testa e ajustamos):
 * - capBase 60→36 · capLinear 90→52 · capQuad 6,4→3,8 → 1 min = 91 vivos (era 156) · 5 min = 391 (era 670) · 8 min = 695 (era 1189) · 10 min = 936 (era 1.600) · teto 1600 atingido ~15 min (era ~10 min).
 * - O %inimigos de itens/pílulas/debuffs (enemyCount: Incenso Repelente −8% · Flauta Provocadora +12% · Pílula de Incenso +10% · Isca Shinobi +15%)
 *   JÁ multiplica o cap (densidade em GameCanvas.threatNow) e continua progressivo com o tempo — apenas a escada-base ficou mais suave.
 */
export const ENEMY_SCALING={hpBase:3.2,hpLinear:.3,hpPerMinute:1.17,damageBase:1.45,damageLinear:.2,damagePerMinute:1.06,maxEnemies:1600,capBase:36,capLinear:52,capQuad:3.8,spawnBase:2,spawnPerMinute:6,maxSpawnPerSecond:90,armorPerMinute:.03,maxArmor:.72};
/** Escala individual por zona (fase): cada fase nasce mais forte que a anterior (HP, dano, spawn e pressão de roleta). Pedido do usuário (11/11): "verifique o nível de dificuldade também individual para cada fase do jogo". */
export const ZONE_DIFFICULTY:Record<number,number>={1:1,2:1.18,3:1.38};
/**
 * FINAL SWARM: quando o relógio da zona zera, o jogo NÃO acaba; conta o tempo sobrevivido e a dificuldade triplica na hora
 * (HP, dano, defesa e quantidade/spawn) e cresce growthPerMinute a cada minuto sobrevivido (além da escala normal por tempo).
 * Quantidade (correção 06/11/2026 — "os monstros pararam de aumentar em 300 no Final Swarm"): antes o teto do swarm era
 * cortado em ENEMY_SCALING.maxEnemies (1600, já atingido aos 10 min), então a horda NÃO triplicava; e o spawn ×3 perdia
 * para o abate de builds fortes, que matavam tudo ao nascer (equilíbrio em ~300). Agora:
 * - teto do swarm = teto normal (até 1600) × fator do swarm (×3, +25%/min), limitado a FINAL_SWARM.maxEnemies (performance);
 * - reposição mínima: o spawn por segundo nunca fica abaixo de teto ÷ refillSeconds (a horda volta ao teto em ~refillSeconds);
 * - os inimigos do swarm nascem num anel mais largo (spawnRing, metros do jogador), fora do alcance imediato das técnicas.
 * O debug (F9, "Teto de inimigos vivos") multiplica por cima e também respeita FINAL_SWARM.maxEnemies.
 * Rodada 48 (pedido do usuário: "o final swarm sempre vai ter o máximo de 1600 monstros, porém não vai bater
 * final swarm e já chegar nesse número; até +7 min o aumento é progressivo; após +7 min = 1600 em tela"):
 * - teto do swarm = FINAL_SWARM.maxEnemies (1600, antes 8000);
 * - rampa: em swarm o multiplicador sobre o teto normal cresce com swarmRamp = min(1, overtime/60/rampMinutes),
 *   então a horda NÃO salta para o teto na hora — sobe progressivamente e só atinge 1600 a partir de ~+7 min;
 * - os monstros seguem evoluindo (HP/dano/defesa) com o tempo, forçando o fim da run.
 * Rodada 49 (pedido do usuário: "a progressão deve limitar no máximo 800 monstros até chegar no +4minutos em final
 * swarm, para ai sim ir aumentando até chegar a 1600 monstros TOTAIS e o máximo de cap de monstros invocando na tela!"): 
 * - o teto do swarm começa em min(teto normal, 800) e fica estável até +4 min (240 s) — nunca salta direto para 1600;
 * - de +4 a +7 min (420 s) sobe linearmente até FINAL_SWARM.maxEnemies (1600); após +7 min = 1600 fixo (teto absoluto);
 * - defesa em profundidade: hard cap 1600 por quadro em GameCanvas (remove excedentes comuns, nunca bosses)
 *   e cap na emboscada de campo (startFieldAmbush) — nada passa de 1600 por qualquer rota de spawn.
 */
export const FINAL_SWARM={multiplier:3,growthPerMinute:.25,maxArmor:.85,maxEnemies:1600,rampMinutes:7,ramp800Cap:800,ramp800Seconds:240,rampSeconds:420,refillSeconds:4,spawnRing:[14,28] as const};
/** Multiplicador do FINAL SWARM para `overtimeSeconds` sobrevividos após o relógio zerar (1 = fora do swarm). */
export function finalSwarmFactor(overtimeSeconds:number){return overtimeSeconds>0?FINAL_SWARM.multiplier*(1+FINAL_SWARM.growthPerMinute*overtimeSeconds/60):1;}
export function difficultyAt(rank:Difficulty,seconds:number,curse=1,overtimeSeconds=0){
  const tier=MISSION_TIER[rank], minutes=Math.max(0,seconds)/60, S=ENEMY_SCALING, swarm=finalSwarmFactor(overtimeSeconds);
  // Revisão 11/11/2026: sem desconto de early game em nenhum rank — cada dificuldade escala em sua devida proporção (tier).
  const baseCap=Math.min(S.maxEnemies,Math.floor((S.capBase+S.capLinear*minutes+S.capQuad*minutes*minutes)*(.85+tier*.15)));
  const swarmRamp=swarm>1?Math.min(1,overtimeSeconds/60/FINAL_SWARM.rampMinutes):1;
  // Rodada 49 — rampa do FINAL SWARM: teto em min(teto normal, 800) até +4 min (240 s), depois sobe linearmente
  // até 1600 (teto absoluto) a +7 min (420 s). Fora do swarm o teto normal (máx. 1600) se aplica.
  const cap=swarm>1?(()=>{const base=Math.min(baseCap,FINAL_SWARM.ramp800Cap);if(overtimeSeconds<=FINAL_SWARM.ramp800Seconds)return base;const t=Math.min(1,(overtimeSeconds-FINAL_SWARM.ramp800Seconds)/Math.max(1,FINAL_SWARM.rampSeconds-FINAL_SWARM.ramp800Seconds));return Math.min(FINAL_SWARM.maxEnemies,Math.floor(base+(FINAL_SWARM.maxEnemies-base)*t));})():baseCap;
  const baseSpawn=Math.min(S.maxSpawnPerSecond,(S.spawnBase+S.spawnPerMinute*minutes)*Math.sqrt(tier))*(swarm>1?1+(swarm-1)*swarmRamp:1);
  const spawnPerSecond=swarm>1?Math.max(baseSpawn,cap/FINAL_SWARM.refillSeconds):baseSpawn;
  return {hp:tier*(S.hpBase+minutes*S.hpLinear)*Math.pow(S.hpPerMinute,minutes)*curse*swarm,damage:tier*(S.damageBase+minutes*S.damageLinear)*Math.pow(S.damagePerMinute,minutes)*curse*swarm,
    speed:Math.min(2.5,1+(tier-1)*.18+minutes*.025),attackRate:(1+(tier-1)*.2+minutes*.08)*curse,
    spawnPerSecond,spawnInterval:1/spawnPerSecond,
    cap,
    armor:swarm>1?Math.min(FINAL_SWARM.maxArmor,minutes*S.armorPerMinute*swarm):Math.min(S.maxArmor,minutes*S.armorPerMinute),swarm};
}
export function incomingDamage(raw:number,armor:number){return Math.max(1,raw*100/(100+Math.max(0,armor)));}
export function rollCritical(chance:number,criticalMultiplier=2.5,rng=Math.random):{tier:0|1|2;multiplier:number}{
  if(chance>=1)return rng()<Math.min(1,chance-1)?{tier:2,multiplier:criticalMultiplier+.5}:{tier:1,multiplier:criticalMultiplier};
  return rng()<Math.max(0,chance)?{tier:1,multiplier:criticalMultiplier}:{tier:0,multiplier:1};
}
