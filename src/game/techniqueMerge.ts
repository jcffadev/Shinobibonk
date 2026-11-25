import type { Element, Technique } from './heroes';

type KekkeiRecipe = Pick<Technique,'shape'|'color'|'status'|'statusChance'|'burn'|'poison'> & {
  natures: readonly [Element,Element]; name: string; summary: string; icon: number;
  /** Elemento próprio da Kekkei Genkai (Hyōton → Gelo, 25/11/2026); sem ele, a fusão usa as duas naturezas. */
  element?: Element;
};
/**
 * Kekkei Genkai de duas naturezas (Narutopedia: https://naruto.fandom.com/wiki/Kekkei_Genkai). Valem para QUALQUER
 * personagem que aprenda dois Ninjutsus das naturezas do par — o pool dá o Ninjutsu básico de cada natureza do kit.
 * Rodada 71: + Jiton (Vento + Terra) e Bakuton (Terra + Raio).
 */
export const KEKKEI_RECIPES: readonly KekkeiRecipe[] = [
  {natures:['Água','Vento'],element:'Gelo',name:'Hyōton: Domo de Gelo',shape:'Área',color:'#90eafb',status:'Congelar',statusChance:.55,summary:'Ergue um domo de gelo no ponto atingido. Pode congelar os alvos dentro dele.',icon:17},
  {natures:['Terra','Água'],name:'Mokuton: Nascimento da Floresta',shape:'Área',color:'#8bd464',status:'Paralisar',statusChance:.45,summary:'Árvores brotam do chão e os galhos podem prender os inimigos na área.',icon:8},
  {natures:['Fogo','Terra'],name:'Yōton: Torrente de Lava',shape:'Onda',color:'#ee783b',burn:true,status:'Lentidão',statusChance:.24,summary:'Espalha uma torrente corrosiva na direção do alvo, com chance de queimar e desacelerar.',icon:23},
  {natures:['Água','Fogo'],name:'Futton: Névoa Corrosiva',shape:'Área',color:'#dcc0d8',statusChance:0,poison:true,summary:'Libera uma nuvem corrosiva que pode continuar causando dano após o impacto.',icon:22},
  {natures:['Raio','Água'],name:'Ranton: Circo Laser',shape:'Em V',color:'#b9dcff',status:'Paralisar',statusChance:.40,summary:'Feixes elétricos atravessam a zona de disparo e podem paralisar os alvos.',icon:0},
  {natures:['Fogo','Vento'],name:'Shakuton: Morte por Evaporação',shape:'Órbita',color:'#ffab48',burn:true,statusChance:0,summary:'Esferas incandescentes cercam o usuário e podem queimar os inimigos próximos.',icon:2},
  {natures:['Vento','Terra'],name:'Jiton: Areia Magnética',shape:'Onda',color:'#9c8a78',status:'Lentidão',statusChance:.40,summary:'O chakra magnético arrasta areia e ferro numa onda que prende e desacelera os inimigos.',icon:7},
  {natures:['Terra','Raio'],name:'Bakuton: Argila Explosiva',shape:'Área',color:'#f0d27a',burn:true,status:'Atordoar',statusChance:.30,summary:'Argila carregada de chakra explode no ponto atingido e pode atordoar os alvos.',icon:9},
];

/**
 * Kekkei Genkai que o shinobi tem na obra (Narutopedia, campo "Kekkei Genkai"), por família. Rodada 71: fundir o par
 * da própria linhagem dá o bônus de clã (+15%), além da receita que qualquer um com as naturezas já faz.
 */
export const HERO_KEKKEI: Readonly<Record<string,readonly string[]>> = {
  haku:['Hyōton'], hashirama:['Mokuton'], yamato:['Mokuton'], madara:['Mokuton'], obito:['Mokuton'],
  mei:['Yōton','Futton'], rasa:['Jiton'], deidara:['Bakuton'],
  // Gaara fica fora: o jogo já converte o Jiton dele em Areia, e a regra de elemento base impede que ele aprenda Vento.
};
/** Naturezas das Kekkei Genkai da linhagem (`family`): o pool garante o Ninjutsu básico de cada uma. */
export function lineageNatures(family:string):Set<Element>{
  const kgs=HERO_KEKKEI[family]??[];
  return new Set(KEKKEI_RECIPES.filter(r=>kgs.some(kg=>r.name.startsWith(kg+':'))).flatMap(r=>r.natures));
}
/** Rodada 71 (pedido do usuário, 11/11): +15% de dano na fusão de mesma natureza ou da Kekkei Genkai do próprio shinobi. */
export const FUSION_KEKKEI_BONUS = .15;

/** Resultado de fusão ou combinação: não entra em outra fusão (Rodada 71 — "Não deve ser possível unir 2 fusões, ou fusão + skill"). */
export const isMergedName = (name:string) => name.startsWith('Fusão · ') || name.includes(' + ');

export function kekkeiRecipe(a:Technique,b:Technique){
  if(a.school!=='Ninjutsu'||b.school!=='Ninjutsu'||a.setup||b.setup||a.element===b.element||isMergedName(a.name)||isMergedName(b.name))return undefined;
  return KEKKEI_RECIPES.find(({natures})=>natures.includes(a.element)&&natures.includes(b.element));
}

export const kekkeiFusion = (name:string) => KEKKEI_RECIPES.find(recipe=>name==='Fusão · '+recipe.name);

/** Bônus de dano da fusão: mesma natureza (não Neutro) ou a Kekkei Genkai da linhagem do shinobi (`family`). */
export function fusionBonus(a:Technique,b:Technique,family?:string){
  if(a.element===b.element&&a.element!=='Neutro')return FUSION_KEKKEI_BONUS;
  const recipe=kekkeiRecipe(a,b);
  return recipe&&family&&HERO_KEKKEI[family]?.some(kg=>recipe.name.startsWith(kg+':'))?FUSION_KEKKEI_BONUS:0;
}

export type CombineBonus = { stat:'power'|'range'|'cooldown'|'status'; value:number; label:string };
/**
 * Rodada 71 (pedido do usuário, 11/11: "Combinar: 1,5× + atributo aleatório relacionado às técnicas"). O atributo é
 * sorteado pelo par (sempre o mesmo para as mesmas duas técnicas, para o planejador mostrar o que a Oficina dá).
 * Chance de status só entra no sorteio quando uma das técnicas aplica status.
 */
export function combineBonus(a:Technique,b:Technique):CombineBonus{
  const options:CombineBonus[]=[
    {stat:'power',value:.1,label:'+10% de dano'},
    {stat:'range',value:.15,label:'+15% de alcance'},
    {stat:'cooldown',value:.1,label:'−10% de recarga'},
  ];
  if(a.status||b.status)options.push({stat:'status',value:.05,label:'+5 pontos de chance de status'});
  const key=[a.name,b.name].sort().join('|');
  let hash=0;for(let i=0;i<key.length;i++)hash=(hash*31+key.charCodeAt(i))>>>0;
  return options[hash%options.length];
}
/** Uma das técnicas da combinação ao disparar: ×1,5 e o atributo sorteado do par. */
export function combinedPart(source:Technique,bonus:CombineBonus):Technique{
  return {
    ...source,
    power:source.power*1.5*(bonus.stat==='power'?1+bonus.value:1),
    range:source.range*(bonus.stat==='range'?1+bonus.value:1),
    statusChance:source.statusChance+(bonus.stat==='status'&&source.status?bonus.value:0),
  };
}

export type FusionEntry = { name:string; pair:[string,string]; kekkei:boolean; result:Technique };
/**
 * Rodada 77 (pedido do usuário: "nas fusões, é pra aparecer já as fusões que o ninja pode aprender… quando for liberando
 * ninja na conta, vai aparecer mais habilidades… e mais fusões também"): catálogo de TODAS as fusões possíveis com as
 * técnicas do pool do shinobi (sem buff, sem bloqueio, sem resultado de outra fusão). Kekkei Genkai primeiro, depois as
 * demais em ordem alfabética; cada resultado aparece uma vez (o 1º par que o forma).
 */
export function fusionCatalog(pool:readonly Technique[], family?:string):FusionEntry[] {
  const options=pool.filter(t=>!t.setup&&!(t as {locked?:boolean}).locked&&!isMergedName(t.name));
  const out=new Map<string,FusionEntry>();
  for(let i=0;i<options.length;i++)for(let j=i+1;j<options.length;j++){
    const pair:[string,string]=[options[i].name,options[j].name];
    const result=mergedTechnique({kind:'fuse',names:pair},options,family);
    if(!result||out.has(result.name))continue;
    out.set(result.name,{name:fusionDisplayName(result.name),pair,kekkei:!!kekkeiFusion(result.name),result});
  }
  return [...out.values()].sort((a,b)=>Number(b.kekkei)-Number(a.kekkei)||a.name.localeCompare(b.name,'pt-BR'));
}
/** Nome mostrado: a Kekkei Genkai pelo nome próprio; as demais como "Fusão · A / B". */
export const fusionDisplayName = (name:string) => kekkeiFusion(name)?.name ?? name;
/** Texto da receita para a aba Habilidades: "A + B = Nome da fusão". */
export const fusionRecipeText = (pair:readonly [string,string], name:string) => `${pair[0]} + ${pair[1]} = ${name}`;

export const FUSION_LEVEL_CAP = 7;
export const techniqueLevelCap = (t: {name:string}, extra = 0) => t.name.startsWith('Fusão · ') ? FUSION_LEVEL_CAP : 9 + extra;

export function sagesMergeCandidates(pool: readonly Technique[], levels: Readonly<Record<string,number>>, extraCap = 0) {
  return pool.filter(t => !t.setup && !isMergedName(t.name) && (levels[t.name] ?? 0) >= techniqueLevelCap(t, extraCap));
}

export type TechniqueMerge = { kind:'fuse'|'combine'; names:[string,string] };

/** `family`: família do shinobi que funde (familyOf), para o bônus da própria Kekkei Genkai. */
export function mergedTechnique(plan:TechniqueMerge, pool:readonly Technique[], family?:string):Technique|undefined {
  const [a,b]=plan.names.map(name=>pool.find(t=>t.name===name));
  if(!a||!b||a===b||a.setup||b.setup||isMergedName(a.name)||isMergedName(b.name))return;
  const fused=plan.kind==='fuse';
  const recipe=fused?kekkeiRecipe(a,b):undefined;
  const bonus=fused?1+fusionBonus(a,b,family):1;
  if(recipe)return {
    name:'Fusão · '+recipe.name,school:'Ninjutsu',element:recipe.element??recipe.natures[0],secondaryElement:recipe.element?undefined:recipe.natures[1],
    shape:recipe.shape,color:recipe.color,status:recipe.status,statusChance:recipe.statusChance,burn:recipe.burn,poison:recipe.poison,
    power:(a.power+b.power)*bonus,range:Math.max(a.range,b.range),cooldown:Math.max(a.cooldown,b.cooldown),unlockLevel:1,
  };
  const extra=fused?undefined:combineBonus(a,b);
  return {
    ...a,
    name:fused?'Fusão · '+a.name+' / '+b.name:a.name+' + '+b.name,
    secondaryElement:b.element===a.element?undefined:b.element,
    shape:fused?'Área':a.shape,
    unlockLevel:1,
    power:fused?(a.power+b.power)*bonus:1.5,
    range:Math.max(a.range,b.range)*(extra?.stat==='range'?1+extra.value:1),
    cooldown:Math.max(a.cooldown,b.cooldown)*(extra?.stat==='cooldown'?1-extra.value:1),
    status:a.status??b.status,
    statusChance:a.status?a.statusChance:b.statusChance,
    secondaryStatus:a.status&&b.status!==a.status?b.status:undefined,
    secondaryStatusChance:b.statusChance,
    burn:a.burn||b.burn,
    poison:a.poison||b.poison,
    gravity:a.gravity??b.gravity,
  };
}
