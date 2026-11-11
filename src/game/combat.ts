import { luckRarityWeights, type Bonuses, type Item, type Rarity, type StatKey } from './catalog.ts';
import { bonusText } from './allies.ts';
import type { Technique, Element } from './heroes';
export type SkillGrowth={damage:number;area:number;haste:number;duration:number};
export const NO_GROWTH:SkillGrowth={damage:0,area:0,haste:0,duration:0};
export const RARITY_ORDER:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
/** Sorteia o índice de raridade (0 Comum … 4 Lendário) pelos pesos de Sorte de luckRarityWeights (mesma curva de itens/técnicas/pílulas). */
export function rollRarityTier(luck:number,rng=Math.random):number{
 const weights=luckRarityWeights(luck);let value=rng()*weights.reduce((a,b)=>a+b,0);
 for(let i=0;i<5;i++){value-=weights[i];if(value<0)return i;}
 return 4;
}
/**
 * Afixos por nível de técnica (%), por raridade [Comum, Incomum, Raro, Épico, Lendário]: base + aleatório(0..spread).
 * DANO das técnicas de ataque é a principal fonte de escala do jogador (na referência, a técnica Nv. 10 tinha +300%/nível):
 * sempre vem no level-up de técnica de ataque e cresce muito com a raridade. Área/recarga/duração e buffs (setups) usam a tabela menor.
 */
export const GROWTH_ROLLS={damage:{base:[30,55,90,150,250],spread:[15,20,30,50,80]},other:{base:[10,18,25,30,40],spread:[8,10,10,15,15]}};
export function rollGrowth(luck:number,technique:Technique,rng=Math.random):{rarity:Rarity;growth:SkillGrowth}{
 const tier=rollRarityTier(luck,rng);
 const keys:(keyof SkillGrowth)[]=technique.setup?['damage','haste','duration']:['area','haste'];if(!technique.setup&&(technique.status||technique.burn))keys.push('duration');
 const growth={...NO_GROWTH},count=tier>=3?3:2;
 const roll=(table:{base:number[];spread:number[]})=>Math.round(table.base[tier]+rng()*table.spread[tier])/100;
 // Técnica de ataque: dano garantido (tabela grande) + 1–2 afixos secundários.
 if(!technique.setup)growth.damage=roll(GROWTH_ROLLS.damage);
 for(let n=technique.setup?0:1;n<count&&keys.length;n++){const key=keys.splice(Math.floor(rng()*keys.length),1)[0];growth[key]=roll(GROWTH_ROLLS.other);}
 return {rarity:RARITY_ORDER[tier],growth};
}
export function growthText(g:SkillGrowth,technique?:Technique){const labels=technique?.setup?{damage:'força do buff',area:'área',haste:'recarga do buff',duration:'duração do buff'}:{damage:'dano',area:'raio de área',haste:'velocidade de ataque',duration:'duração'};return (Object.entries(g) as [keyof SkillGrowth,number][]).filter(([,n])=>n>0).map(([key,n])=>`+${Math.round(n*100)}% ${labels[key]}`).join(' · ');}

/** Chave de bônus por elemento de técnica (itens "Pergaminho Katon" etc.). */
export const ELEMENT_KEY:Record<Element,StatKey>={Fogo:'elFogo',Água:'elAgua',Vento:'elVento',Terra:'elTerra',Raio:'elRaio',Madeira:'elMadeira',Areia:'elAreia',Sombra:'elSombra',Neutro:'elNeutro',Sábio:'elSabio'};
const ELEMENT_BY_KEY=Object.fromEntries(Object.entries(ELEMENT_KEY).map(([e,k])=>[k,e])) as Record<string,Element>;
const has=(item:Item,...keys:StatKey[])=>keys.some(k=>(item.bonuses[k]||0)!==0);
/** Bônus que melhoram qualquer técnica do jogador. */
const UNIVERSAL:StatKey[]=['sage','damage','crit','critDamage','attackSpeed','area','dot','eliteDamage','controlledDamage','statusStack','lowHpDamage','noHitDamage','killDamage','bigCrit','execute','burnChance','poisonChance','sleepChance','rootChance','chillChance','statusDamage','skillCap'];

export function affectedTechniques(item:Item,techniques:Technique[]):string[]{
 const b=item.bonuses;
 // Pergaminhos de elemento (Katon, Suiton…): listam só as técnicas do MESMO elemento. O pequeno +dano total que
 // eles também dão vale para tudo, mas não é listado por técnica (confundia: "Katon melhora técnica de Água").
 const elements=(Object.keys(b) as StatKey[]).filter(k=>ELEMENT_BY_KEY[k]&&(b[k]||0)>0).map(k=>ELEMENT_BY_KEY[k]);
 if(elements.length)return techniques.filter(t=>!t.setup&&elements.includes(t.element)).map(t=>t.name);
 // Setups (buff puro) não são melhorados por itens de ataque.
 return techniques.filter(t=>!t.setup).filter(t=>has(item,...UNIVERSAL)
   ||b.projectileSpeed
   ||((b.projectiles||b.bounce)&&['Projétil','Em V'].includes(t.shape))
   ||(b.normal||b.armorPhysical)&&t.school==='Taijutsu'
   ||b.element&&t.school==='Ninjutsu'
   ||b.genjutsu&&t.school==='Genjutsu'
   ||(b[ELEMENT_KEY[t.element]]||0)>0
   ||b.status&&t.status
   ||b.duration&&(t.status||t.burn)).map(t=>t.name);
}
/** Linha "Melhora: …" das cartas e da ficha. Pergaminho de elemento sem técnica daquele elemento avisa isso em vez de listar outras. */
export function affectedTechniquesText(item:Item,techniques:Technique[]):string{
 const names=affectedTechniques(item,techniques);
 if(names.length)return 'Melhora: '+names.join(' / ');
 const elements=(Object.keys(item.bonuses) as StatKey[]).filter(k=>ELEMENT_BY_KEY[k]&&(item.bonuses[k]||0)>0).map(k=>ELEMENT_BY_KEY[k]);
 return elements.length?`Nenhuma técnica de ${elements.join('/')} aprendida ainda.`:'Melhora atributos de suporte ou sobrevivência.';
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
 if(has(item,'damage','normal','element','genjutsu','dot','eliteDamage','controlledDamage','statusStack','lowHpDamage','noHitDamage','killDamage','armorPhysical','execute','statusDamage','beam','bolts','spendDamage')||itemElement(item)!=='Universal'&&(Object.keys(item.bonuses) as StatKey[]).some(k=>ELEMENT_BY_KEY[k]))return 'Dano';
 if(has(item,'health','healthPct','defense','dodge','regen','lifesteal','thorns','killHeal','revive35','revive60','shield','smoke','emergencyHeal','periodicHeal','freezeOnHit'))return 'Defesa';
 if(has(item,'status','duration','burnChance','poisonChance','sleepChance','rootChance','chillChance'))return 'Status';
 if(has(item,'support','allyDamage','allySpeed','allyBuff'))return 'Ajudantes';
 if(has(item,'attackSpeed','projectileSpeed','bounce','move'))return 'Velocidade';
 return 'Utilidade';
}

/**
 * Linha Senjutsu (modo sábio) das técnicas de Ninjutsu: a cada acerto, `chance` de causar um golpe adicional
 * de `multiplier` × o dano normal daquele acerto (mesmo crítico/bônus). Valores provisórios.
 */
export const SENJUTSU={chance:.25,multiplier:1.5,label:'Senjutsu (modo sábio)',color:'#f5da86'};
/** Uma técnica tem a linha Senjutsu quando é Ninjutsu e está infundida com o elemento Sábio (próprio, item Selo de Senjutsu ou Modo Sábio ativo). */
export function hasSenjutsu(t:Technique,sageInfused:boolean){return !t.setup&&t.school==='Ninjutsu'&&(t.element==='Sábio'||sageInfused);}
export function senjutsuText(){return `${SENJUTSU.label}: ${Math.round(SENJUTSU.chance*100)}% de chance por acerto de causar dano adicional de ${String(SENJUTSU.multiplier).replace('.',',')}× o dano normal.`;}

/** Valores efetivos de um setup com os afixos de level-up (força, recarga, duração). */
export function setupNumbers(t:Technique,g:SkillGrowth=NO_GROWTH){
 const s=t.setup!;const cooldown=s.cooldown/(1+g.haste),duration=s.duration*(1+g.duration);
 const bonuses:Bonuses={};for(const [k,v] of Object.entries(s.bonuses))bonuses[k as StatKey]=(v as number)*(1+g.damage);
 // Sem acúmulo, reativar só renova: tempo ativo = duração/recarga (limitado a 100%).
 return {cooldown,duration,bonuses,stack:s.stack,sage:!!s.sage,uptime:Math.min(1,duration/cooldown)};
}
const n1=(v:number)=>v.toLocaleString('pt-BR',{maximumFractionDigits:1});
/** Linhas do card de setup: Recarga · Duração · cada bônus · Ativo X% do tempo · Acumulável. */
export function setupLines(t:Technique,g:SkillGrowth=NO_GROWTH):string[]{
 const s=setupNumbers(t,g);
 return [`Recarga ${n1(s.cooldown)} s`,`Duração ${n1(s.duration)} s`,...bonusText(s.bonuses).split(' · ').filter(Boolean),...(s.sage?['Elemento Sábio + Senjutsu no Ninjutsu','Taijutsu corpo a corpo acerta em área ao redor']:[]),`Ativo ${Math.round(s.uptime*100)}% do tempo`,`Acumulável: ${s.stack?'Sim':'Não'}`];
}
/** Texto curto de uma técnica para tooltips/cartas (setup ou ataque com linha Senjutsu). */
export function techniqueDetail(t:Technique,g:SkillGrowth=NO_GROWTH,sageInfused=false,sageModeKnown=false):string{
 if(t.setup)return `Setup (buff, sem dano) · ${t.setup.summary} ${setupLines(t,g).join(' · ')}.`;
 const parts=[`${t.school} · ${t.element} · ${t.shape}`];
 if(hasSenjutsu(t,sageInfused))parts.push(senjutsuText());
 else if(t.school==='Ninjutsu'&&sageModeKnown)parts.push(`${SENJUTSU.label} durante o Modo Sábio.`);
 return parts.join(' · ');
}