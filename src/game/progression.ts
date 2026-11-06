import { ITEM_BY_NAME, type Bonuses } from './catalog.ts';
import { HEROES, HERO_BY_ID } from './heroes.ts';
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
  const forms=FORMS[heroId]??[],evolutions=forms.filter(f=>f.level>1&&f.level<=formAt(heroId,level).level).length;
  const baseHp=Math.round(base.hp*(forms.length>1?.65:1.1));
  const armorByLevel=base.armor*(1+n*.01)+n*.25;
  return applyPowerlevel({
    sage:add('sage'),maxHp:Math.round((baseHp*(1+n*.03+evolutions*.25)+add('health')+bonusHp+p('Resistência')*8)*Math.max(.1,1+add('healthPct'))),
    damage:base.damage*heroDamageScale(level)*(1+add('damage')+p('Treinamento')*.04)*(heroId==='gaara'?1+(armorByLevel+add('defense')+p('Couraça')*2)*.01:1),
    armor:armorByLevel+add('defense')+p('Couraça')*2,
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
 */
export const ENEMY_SCALING={hpLinear:.3,hpPerMinute:1.17,damageLinear:.2,damagePerMinute:1.06,maxEnemies:1600,capBase:60,capLinear:90,capQuad:6.4,spawnBase:2,spawnPerMinute:6,maxSpawnPerSecond:90,armorPerMinute:.015,maxArmor:.6};
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
 */
export const FINAL_SWARM={multiplier:3,growthPerMinute:.25,maxArmor:.85,maxEnemies:8000,refillSeconds:4,spawnRing:[14,28] as const};
/** Multiplicador do FINAL SWARM para `overtimeSeconds` sobrevividos após o relógio zerar (1 = fora do swarm). */
export function finalSwarmFactor(overtimeSeconds:number){return overtimeSeconds>0?FINAL_SWARM.multiplier*(1+FINAL_SWARM.growthPerMinute*overtimeSeconds/60):1;}
export function difficultyAt(rank:Difficulty,seconds:number,curse=1,overtimeSeconds=0){
  const tier=MISSION_TIER[rank], minutes=Math.max(0,seconds)/60, S=ENEMY_SCALING, swarm=finalSwarmFactor(overtimeSeconds);
  const earlyGenin=rank==='Genin'?.66+.34*Math.min(1,minutes/2.5):1;
  const baseCap=Math.min(S.maxEnemies,Math.floor((S.capBase+S.capLinear*minutes+S.capQuad*minutes*minutes)*(.85+tier*.15)*earlyGenin));
  const cap=swarm>1?Math.min(FINAL_SWARM.maxEnemies,Math.floor(baseCap*swarm)):baseCap;
  const baseSpawn=earlyGenin*Math.min(S.maxSpawnPerSecond,(S.spawnBase+S.spawnPerMinute*minutes)*Math.sqrt(tier))*swarm;
  const spawnPerSecond=swarm>1?Math.max(baseSpawn,cap/FINAL_SWARM.refillSeconds):baseSpawn;
  return {hp:tier*(1+minutes*S.hpLinear)*Math.pow(S.hpPerMinute,minutes)*curse*swarm,damage:tier*(1+minutes*S.damageLinear)*Math.pow(S.damagePerMinute,minutes)*curse*swarm,
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
