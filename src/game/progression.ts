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
export function calculateStats(heroId:string,level:number,items:Record<string,number>={},pills:Record<string,number>={},bonusHp=0,permanent:Record<string,number>={},runBuffs:Bonuses={},powerlevel:Powerlevel={}):Stats {
  const base=HERO_BASE[heroId]??HERO_BASE.naruto,n=Math.max(0,level-1),b:Bonuses={...HERO_BY_ID[heroId]?.bonuses};
  for(const [key,value] of Object.entries(runBuffs)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  for(const [name,count] of Object.entries(items)){const item=ITEM_BY_NAME[name];if(!item)continue;for(const [key,value] of Object.entries(item.bonuses)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value*Math.min(item.max,Math.max(0,count));}}
  // Pílulas: bônus por nível vindos de src/game/pills.ts, recalculados sempre a partir de knownPills.
  for(const [key,value] of Object.entries(pillBonuses(pills, (b.pillCap ?? 0)+Math.min(2,Math.max(0,permanent['Farmacologia Ninja']||0))))){const k=key as keyof Bonuses;b[k]=(b[k]||0)+(value||0);}
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
    damage:base.damage*(1+n*.03)*(1+add('damage')+p('Treinamento')*.04)*(heroId==='gaara'?1+(armorByLevel+add('defense')+p('Couraça')*2)*.01:1),
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
/** Crescimento por nível do shinobi é LINEAR (+3% dano/HP por nível): o nível passa de 1000 (referência PokéBonk); o dano massivo vem de técnicas, projéteis, críticos e itens. */
/** Escala dos inimigos com o tempo da run. Valores provisórios; o debug multiplica por cima. */
export const ENEMY_SCALING={hpPerMinute:1.1,damagePerMinute:1.05,maxEnemies:1400,minSpawnInterval:.03,armorPerMinute:.015,maxArmor:.6};
export function difficultyAt(rank:Difficulty,seconds:number,curse=1){
  const tier=MISSION_TIER[rank], minutes=Math.max(0,seconds)/60;
  // Escala exponencial (pedido do usuário, 06/11/2026): HP e dano dos inimigos crescem a cada minuto, a horda chega a ~1400
  // e os inimigos ganham resistência (armor = fração do dano bloqueada) até forçar o jogador a avançar de zona.
  const S=ENEMY_SCALING;
  return {hp:tier*(1+minutes*.22)*Math.pow(S.hpPerMinute,minutes)*curse,damage:tier*(1+minutes*.15)*Math.pow(S.damagePerMinute,minutes)*curse,speed:Math.min(2.5,1+(tier-1)*.18+minutes*.025),attackRate:(1+(tier-1)*.2+minutes*.08)*curse,spawnInterval:Math.max(S.minSpawnInterval,.7/(tier*(1+minutes*.3))),cap:Math.min(S.maxEnemies,Math.floor((70+minutes*14+minutes*minutes*1.1)*(.85+tier*.15))),armor:Math.min(S.maxArmor,minutes*S.armorPerMinute)};
}
export function incomingDamage(raw:number,armor:number){return Math.max(1,raw*100/(100+Math.max(0,armor)));}
export function rollCritical(chance:number,criticalMultiplier=2.5,rng=Math.random):{tier:0|1|2;multiplier:number}{
  if(chance>=1)return rng()<Math.min(1,chance-1)?{tier:2,multiplier:criticalMultiplier+.5}:{tier:1,multiplier:criticalMultiplier};
  return rng()<Math.max(0,chance)?{tier:1,multiplier:criticalMultiplier}:{tier:0,multiplier:1};
}
