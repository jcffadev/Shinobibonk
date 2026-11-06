import { ITEM_BY_NAME, type Bonuses } from './catalog.ts';
import { HEROES, HERO_BY_ID } from './heroes.ts';
import { FORMS, formAt } from './evolution.ts';
import { pillBonuses } from './pills.ts';
export type Difficulty='Genin'|'Chunin'|'Jonin'|'Kage';
export type Stats={sage:number;maxHp:number;damage:number;armor:number;moveSpeed:number;attackSpeed:number;crit:number;critDamage:number;evasion:number;regen:number;luck:number;pickup:number;xpGain:number;moneyGain:number;ultimateRate:number;area:number;projectiles:number;duration:number;poison:number;status:number;physical:number;ninjutsu:number;genjutsu:number;supportSlots:number;allyDamage:number;allySpeed:number;allyBuff:number;
  /** Soma bruta de todos os bônus (itens, pílulas, buffs da run); a simulação lê daqui as mecânicas de item (elementos, procs, roubo de vida...). */
  extra:Bonuses};
export const HERO_BASE=Object.fromEntries(HEROES.map(h=>[h.id,h.base]));
export function calculateStats(heroId:string,level:number,items:Record<string,number>={},pills:Record<string,number>={},bonusHp=0,permanent:Record<string,number>={},runBuffs:Bonuses={}):Stats {
  const base=HERO_BASE[heroId]??HERO_BASE.naruto,n=Math.max(0,level-1),b:Bonuses={...HERO_BY_ID[heroId]?.bonuses};
  for(const [key,value] of Object.entries(runBuffs)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value;}
  for(const [name,count] of Object.entries(items)){const item=ITEM_BY_NAME[name];if(!item)continue;for(const [key,value] of Object.entries(item.bonuses)){const k=key as keyof Bonuses;b[k]=(b[k]||0)+value*Math.min(item.max,Math.max(0,count));}}
  // Pílulas: bônus por nível vindos de src/game/pills.ts, recalculados sempre a partir de knownPills.
  for(const [key,value] of Object.entries(pillBonuses(pills))){const k=key as keyof Bonuses;b[k]=(b[k]||0)+(value||0);}
  const add=(key:keyof Bonuses)=>b[key]||0;
  const p=(name:string)=>Math.max(0,Math.min(10,permanent[name]||0));
  const forms=FORMS[heroId]??[],evolutions=forms.filter(f=>f.level>1&&f.level<=formAt(heroId,level).level).length;
  const baseHp=Math.round(base.hp*(forms.length>1?.65:1.1));
  return {
    sage:add('sage'),maxHp:Math.round((baseHp*(1+n*.01+evolutions*.25)+add('health')+bonusHp+p('Resistência')*8)*Math.max(.1,1+add('healthPct'))),
    damage:base.damage*(1+n*.01)*(1+add('damage')+p('Treinamento')*.04)*(heroId==='gaara'?1+(base.armor*(1+n*.005)+add('defense')+p('Couraça')*2)*.01:1),
    armor:base.armor*(1+n*.005)+add('defense')+p('Couraça')*2,
    crit:Math.max(0,base.crit+n*.0005+add('crit')+p('Precisão')*.01),critDamage:2.5+add('critDamage'),
    evasion:Math.min(.6,add('dodge')),regen:(base.regen+n*.02+add('regen'))*Math.max(0,1+add('regenMult')),luck:Math.floor(n/5)+add('luck')+p('Fortuna')*2,
    pickup:2.5*(1+add('pickup'))+add('pickupFlat')+p('Magnetismo')*.6,xpGain:1+add('exp')+p('Estudo')*.05,moneyGain:1+add('gold')+p('Comércio')*.05,
    ultimateRate:1+add('cool'),area:1+add('area'),projectiles:1+add('projectiles'),
    duration:1+add('duration'),poison:add('dot'),status:Math.min(.9,add('status')),physical:1+add('normal'),ninjutsu:1+add('element'),genjutsu:1+add('genjutsu'),attackSpeed:Math.max(.2,1+n*.004+add('attackSpeed')+p('Celeridade')*.02),moveSpeed:base.speed*Math.max(.3,1+n*.001+add('move')+p('Agilidade')*.025),extra:{...b},
    supportSlots:3+Math.min(1,add('support'))+Math.min(1,p('Suporte adicional')),allyDamage:1+add('allyDamage'),allySpeed:1+add('allySpeed'),allyBuff:1+add('allyBuff'),
  };
}
export function difficultyAt(rank:Difficulty,seconds:number,curse=1){
  const tier=({Genin:1,Chunin:1.4,Jonin:1.9,Kage:2.6})[rank], minutes=Math.max(0,seconds)/60;
  return {hp:tier*(1+minutes*.22)*curse,damage:tier*(1+minutes*.15)*curse,speed:Math.min(2.5,1+(tier-1)*.18+minutes*.025),attackRate:(1+(tier-1)*.2+minutes*.08)*curse,spawnInterval:Math.max(.2,.7/(tier*(1+minutes*.12))),cap:Math.min(180,Math.floor(70+minutes*8+(tier-1)*20))};
}
export function incomingDamage(raw:number,armor:number){return Math.max(1,raw*100/(100+Math.max(0,armor)));}
export function rollCritical(chance:number,criticalMultiplier=2.5,rng=Math.random):{tier:0|1|2;multiplier:number}{
  if(chance>=1)return rng()<Math.min(1,chance-1)?{tier:2,multiplier:criticalMultiplier+.5}:{tier:1,multiplier:criticalMultiplier};
  return rng()<Math.max(0,chance)?{tier:1,multiplier:criticalMultiplier}:{tier:0,multiplier:1};
}
