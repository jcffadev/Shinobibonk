import type { Element, Technique } from './heroes';

type KekkeiRecipe = Pick<Technique,'shape'|'color'|'status'|'statusChance'|'burn'|'poison'> & {
  natures: readonly [Element,Element]; name: string; summary: string; icon: number;
};
export const KEKKEI_RECIPES: readonly KekkeiRecipe[] = [
  {natures:['Água','Vento'],name:'Hyōton: Domo de Gelo',shape:'Área',color:'#90eafb',status:'Congelar',statusChance:.55,summary:'Ergue um domo de gelo no ponto atingido. Pode congelar os alvos dentro dele.',icon:17},
  {natures:['Terra','Água'],name:'Mokuton: Nascimento da Floresta',shape:'Área',color:'#8bd464',status:'Paralisar',statusChance:.45,summary:'Árvores brotam do chão e os galhos podem prender os inimigos na área.',icon:8},
  {natures:['Fogo','Terra'],name:'Yōton: Torrente de Lava',shape:'Onda',color:'#ee783b',burn:true,status:'Lentidão',statusChance:.24,summary:'Espalha uma torrente corrosiva na direção do alvo, com chance de queimar e desacelerar.',icon:23},
  {natures:['Água','Fogo'],name:'Futton: Névoa Corrosiva',shape:'Área',color:'#dcc0d8',statusChance:0,poison:true,summary:'Libera uma nuvem corrosiva que pode continuar causando dano após o impacto.',icon:22},
  {natures:['Raio','Água'],name:'Ranton: Circo Laser',shape:'Em V',color:'#b9dcff',status:'Paralisar',statusChance:.40,summary:'Feixes elétricos atravessam a zona de disparo e podem paralisar os alvos.',icon:0},
  {natures:['Fogo','Vento'],name:'Shakuton: Morte por Evaporação',shape:'Órbita',color:'#ffab48',burn:true,statusChance:0,summary:'Esferas incandescentes cercam o usuário e podem queimar os inimigos próximos.',icon:2},
];

export function kekkeiRecipe(a:Technique,b:Technique){
  if(a.school!=='Ninjutsu'||b.school!=='Ninjutsu'||a.setup||b.setup||a.element===b.element)return undefined;
  return KEKKEI_RECIPES.find(({natures})=>natures.includes(a.element)&&natures.includes(b.element));
}

export const kekkeiFusion = (name:string) => KEKKEI_RECIPES.find(recipe=>name==='Fusão · '+recipe.name);

export const FUSION_LEVEL_CAP = 7;
export const techniqueLevelCap = (t: {name:string}, extra = 0) => t.name.startsWith('Fusão · ') ? FUSION_LEVEL_CAP : 9 + extra;

export type TechniqueMerge = { kind:'fuse'|'combine'; names:[string,string] };

export function mergedTechnique(plan:TechniqueMerge, pool:readonly Technique[]):Technique|undefined {
  const [a,b]=plan.names.map(name=>pool.find(t=>t.name===name));
  if(!a||!b||a===b||a.setup||b.setup)return;
  const fused=plan.kind==='fuse';
  const recipe=fused?kekkeiRecipe(a,b):undefined;
  if(recipe)return {
    name:'Fusão · '+recipe.name,school:'Ninjutsu',element:recipe.natures[0],secondaryElement:recipe.natures[1],
    shape:recipe.shape,color:recipe.color,status:recipe.status,statusChance:recipe.statusChance,burn:recipe.burn,poison:recipe.poison,
    power:a.power+b.power,range:Math.max(a.range,b.range),cooldown:Math.max(a.cooldown,b.cooldown),unlockLevel:1,
  };
  return {
    ...a,
    name:fused?'Fusão · '+a.name+' / '+b.name:a.name+' + '+b.name,
    secondaryElement:b.element===a.element?undefined:b.element,
    shape:fused?'Área':a.shape,
    unlockLevel:1,
    power:fused?(a.power+b.power):1.5,
    range:Math.max(a.range,b.range),
    cooldown:Math.max(a.cooldown,b.cooldown),
    status:a.status??b.status,
    statusChance:a.status?a.statusChance:b.statusChance,
    secondaryStatus:a.status&&b.status!==a.status?b.status:undefined,
    secondaryStatusChance:b.statusChance,
    burn:a.burn||b.burn,
    poison:a.poison||b.poison,
    gravity:a.gravity??b.gravity,
  };
}
