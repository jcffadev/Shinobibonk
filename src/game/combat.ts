import type { Item, Rarity, StatKey } from './catalog';
import type { Technique, Element } from './heroes';
export type SkillGrowth={damage:number;area:number;haste:number;duration:number};
export const NO_GROWTH:SkillGrowth={damage:0,area:0,haste:0,duration:0};
export function rollGrowth(luck:number,technique:Technique,rng=Math.random):{rarity:Rarity;growth:SkillGrowth}{
 const weights=[90,9.889,.1,.01,.001].map((w,i)=>w*Math.pow(1+Math.min(500,Math.max(0,luck))/100,i));let value=rng()*weights.reduce((a,b)=>a+b,0),tier=4;
 for(let i=0;i<5;i++){value-=weights[i];if(value<0){tier=i;break;}}
 const keys:(keyof SkillGrowth)[]=['damage','area','haste'];if(technique.status||technique.burn)keys.push('duration');
 const growth={...NO_GROWTH};for(let n=0;n<(tier>=3?3:2)&&keys.length;n++){const key=keys.splice(Math.floor(rng()*keys.length),1)[0];growth[key]=Math.round(([10,18,25,30,40][tier]+rng()*[8,10,10,15,15][tier]))/100;}
 return {rarity:(['Comum','Incomum','Raro','Épico','Lendário'] as Rarity[])[tier],growth};
}
export function growthText(g:SkillGrowth){return (Object.entries(g) as [keyof SkillGrowth,number][]).filter(([,n])=>n>0).map(([key,n])=>`+${Math.round(n*100)}% ${{damage:'dano',area:'raio de área',haste:'cadência',duration:'duração'}[key]}`).join(' · ');}

/** Chave de bônus por elemento de técnica (itens "Pergaminho Katon" etc.). */
export const ELEMENT_KEY:Record<Element,StatKey>={Fogo:'elFogo',Água:'elAgua',Vento:'elVento',Terra:'elTerra',Raio:'elRaio',Madeira:'elMadeira',Areia:'elAreia',Sombra:'elSombra',Neutro:'elNeutro',Sábio:'elSabio'};
const ELEMENT_BY_KEY=Object.fromEntries(Object.entries(ELEMENT_KEY).map(([e,k])=>[k,e])) as Record<string,Element>;
const has=(item:Item,...keys:StatKey[])=>keys.some(k=>(item.bonuses[k]||0)!==0);
/** Bônus que melhoram qualquer técnica do jogador. */
const UNIVERSAL:StatKey[]=['sage','damage','crit','critDamage','attackSpeed','area','dot','eliteDamage','controlledDamage','statusStack','lowHpDamage','noHitDamage','killDamage','bigCrit','execute','burnChance','poisonChance','sleepChance','rootChance','chillChance','statusDamage','skillCap'];

export function affectedTechniques(item:Item,techniques:Technique[]):string[]{
 const b=item.bonuses;
 return techniques.filter(t=>has(item,...UNIVERSAL)
   ||(b.projectiles&&['Projétil','Em V'].includes(t.shape))
   ||(b.normal||b.armorPhysical)&&t.school==='Taijutsu'
   ||b.element&&t.school==='Ninjutsu'
   ||b.genjutsu&&t.school==='Genjutsu'
   ||(b[ELEMENT_KEY[t.element]]||0)>0
   ||b.status&&t.status
   ||b.duration&&(t.status||t.burn)).map(t=>t.name);
}
export function itemSchools(item:Item){const b=item.bonuses;if(b.normal||b.armorPhysical)return ['Taijutsu'];if(b.element)return ['Ninjutsu'];if(b.genjutsu||b.status||b.sleepChance)return ['Genjutsu'];return ['Taijutsu','Ninjutsu','Genjutsu'];}
export function itemElement(item:Item){
 const key=(Object.keys(item.bonuses) as StatKey[]).find(k=>ELEMENT_BY_KEY[k]);
 if(key)return ELEMENT_BY_KEY[key];
 if(item.bonuses.sage)return 'Sábio';
 if(has(item,'poisonChance'))return 'Veneno';
 if(has(item,'burnChance','beam'))return 'Fogo';
 if(has(item,'bolts'))return 'Raio';
 if(has(item,'chillChance','freezeOnHit'))return 'Gelo';
 return 'Universal';
}
export function itemAttribute(item:Item){
 if(has(item,'crit','bigCrit'))return 'Chance crítica';
 if(has(item,'critDamage'))return 'Dano crítico';
 if(has(item,'damage','normal','element','genjutsu','dot','eliteDamage','controlledDamage','statusStack','lowHpDamage','noHitDamage','killDamage','armorPhysical','execute','statusDamage','beam','bolts')||itemElement(item)!=='Universal'&&(Object.keys(item.bonuses) as StatKey[]).some(k=>ELEMENT_BY_KEY[k]))return 'Dano';
 if(has(item,'health','healthPct','defense','dodge','regen','lifesteal','thorns','killHeal','revive35','revive60','shield','smoke','emergencyHeal','periodicHeal','freezeOnHit'))return 'Defesa';
 if(has(item,'status','duration','burnChance','poisonChance','sleepChance','rootChance','chillChance'))return 'Status';
 if(has(item,'support','allyDamage','allySpeed','allyBuff'))return 'Ajudantes';
 return 'Utilidade';
}
