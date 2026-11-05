import type { Item, Rarity } from './catalog';
import type { Technique } from './heroes';
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
export function affectedTechniques(item:Item,techniques:Technique[]):string[]{
 const b=item.bonuses;
 return techniques.filter(t=>b.sage||b.damage||b.crit||b.critDamage||b.attackSpeed||b.area||b.projectiles&&['Projétil','Em V'].includes(t.shape)||b.normal&&t.school==='Taijutsu'||b.element&&t.school==='Ninjutsu'||b.status&&t.status||b.duration&&(t.status||t.burn)||b.dot).map(t=>t.name);
}
export function itemSchools(item:Item){const b=item.bonuses;if(b.normal)return ['Taijutsu'];if(b.element)return ['Ninjutsu'];if(b.status)return ['Genjutsu'];return ['Taijutsu','Ninjutsu','Genjutsu'];}
export function itemElement(item:Item){return item.bonuses.sage?'Sábio':item.id==='poison'?'Veneno':'Universal';}
export function itemAttribute(item:Item){const b=item.bonuses;if(b.crit)return 'Chance crítica';if(b.critDamage)return 'Dano crítico';if(b.damage||b.normal||b.element||b.dot)return 'Dano';if(b.health||b.defense||b.dodge||b.regen)return 'Defesa';if(b.status||b.duration)return 'Status';return 'Utilidade';}
