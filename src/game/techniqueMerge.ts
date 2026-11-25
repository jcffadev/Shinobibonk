import type { Element, School, Technique } from './heroes';

type RecipeLook = Pick<Technique,'shape'|'color'|'status'|'statusChance'|'burn'|'poison'> & { name: string; summary: string; icon: number };
type KekkeiRecipe = RecipeLook & {
  natures: readonly [Element,Element];
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

/** Ingrediente de uma receita: natureza, escola e/ou nomes de técnica (todos os campos dados precisam bater). */
export type FusionIngredient = { element?: Element; school?: School; names?: readonly string[] };
export type FusionKind = 'kekkei'|'natureza'|'escola'|'assinatura';
export type FusionRecipe = RecipeLook & {
  kind: FusionKind; ingredients: readonly [FusionIngredient,FusionIngredient];
  /** Elemento do resultado. Sem ele: Kekkei usa as duas naturezas; as de escola usam os elementos dos ingredientes. */
  element?: Element; secondaryElement?: Element; school?: School; natures?: readonly [Element,Element];
};
const nin = (element: Element): FusionIngredient => ({ element, school: 'Ninjutsu' });
const named = (...names: string[]): FusionIngredient => ({ names });
/**
 * Receitas de fusão (25/11/2026 — aprovadas pelo usuário: "Aprovar e incluir Gelo" e "Incluir as duas"). Só funde quem tem
 * receita; o par sem receita só pode ser Combinado. Ordem de prioridade: assinatura (técnicas pelo nome) → Kekkei Genkai
 * → mesma natureza → mesma escola. Nomes pela Narutopedia.
 */
export const FUSION_RECIPES: readonly FusionRecipe[] = [
  // Assinatura: as que pedem duas técnicas pelo nome vêm antes das que aceitam "qualquer Ninjutsu da natureza".
  {kind:'assinatura',ingredients:[named('Kage Bunshin'),named('Rasengan')],name:'Ōdama Rasengan',element:'Vento',shape:'Área',color:'#8fd8ff',statusChance:0,summary:'Os clones condensam um Rasengan gigante que esmaga tudo no ponto de impacto.',icon:16},
  {kind:'assinatura',ingredients:[named('Kage Bunshin'),named('Shuriken')],name:'Shuriken Kage Bunshin',element:'Neutro',school:'Taijutsu',shape:'Em V',color:'#c8d2dc',statusChance:0,summary:'Uma shuriken vira dezenas no ar e cobre um leque inteiro à frente.',icon:18},
  {kind:'assinatura',ingredients:[named('Amaterasu','Chamas de Amaterasu'),named('Susanoo','Susanoo Perfeito')],name:'Enton: Espada de Kagutsuchi',element:'Fogo',shape:'Linha',color:'#5a2b6e',burn:true,statusChance:0,summary:'O Susanoo molda as chamas negras numa lâmina que corta em linha e deixa os alvos queimando.',icon:10},
  {kind:'assinatura',ingredients:[named('Bijūdama'),named('Rasenshuriken')],name:'Bijūdama Rasenshuriken',element:'Vento',secondaryElement:'Neutro',shape:'Área',color:'#a8c8ff',statusChance:0,summary:'Uma Bijūdama girando como Rasenshuriken explode numa área enorme.',icon:4},
  {kind:'assinatura',ingredients:[named('Chidori'),named('Chuva de Senbon')],name:'Chidori Senbon',element:'Raio',shape:'Cone',color:'#9fd0ff',status:'Paralisar',statusChance:.25,summary:'Agulhas de chakra elétrico saem em leque e podem paralisar quem acertam.',icon:0},
  {kind:'assinatura',ingredients:[named('Rasengan'),nin('Vento')],name:'Fūton: Rasenshuriken',element:'Vento',shape:'Projétil',color:'#bfefff',statusChance:0,summary:'O Rasengan ganha lâminas de vento e explode em milhares de cortes no alvo.',icon:16},
  {kind:'assinatura',ingredients:[named('Óleo Flamejante'),nin('Fogo')],name:'Katon: Gamayu Endan',element:'Fogo',shape:'Onda',color:'#ff8a3a',burn:true,statusChance:0,summary:'Óleo de sapo inflamado vira uma torrente de fogo que deixa os alvos queimando.',icon:23},
  ...KEKKEI_RECIPES.map(r=>({...r,kind:'kekkei' as const,ingredients:[nin(r.natures[0]),nin(r.natures[1])] as const})),
  // Mesma natureza: dois Ninjutsu do mesmo elemento.
  {kind:'natureza',ingredients:[nin('Fogo'),nin('Fogo')],name:'Katon: Gōka Mekkyaku',element:'Fogo',shape:'Onda',color:'#ff7a2e',burn:true,statusChance:0,summary:'Um mar de chamas avança e cobre uma faixa larga, deixando os alvos queimando.',icon:2},
  {kind:'natureza',ingredients:[nin('Água'),nin('Água')],name:'Suiton: Daibakufu',element:'Água',shape:'Área',color:'#4fb0ff',status:'Lentidão',statusChance:.3,summary:'Uma cachoeira desaba sobre a área, arrasta os inimigos e os deixa lentos.',icon:4},
  {kind:'natureza',ingredients:[nin('Vento'),nin('Vento')],name:'Fūton: Shinkū Taigyoku',element:'Vento',shape:'Cone',color:'#c9f2e6',statusChance:0,summary:'Rajadas de vácuo saem em leque e cortam tudo à frente.',icon:6},
  {kind:'natureza',ingredients:[nin('Terra'),nin('Terra')],name:'Doton: Doryū Taiga',element:'Terra',shape:'Onda',color:'#b48a5a',status:'Lentidão',statusChance:.35,summary:'O chão vira um rio de lama que arrasta e prende os inimigos.',icon:9},
  {kind:'natureza',ingredients:[nin('Raio'),nin('Raio')],name:'Raiton: Kirin',element:'Raio',shape:'Área',color:'#a9d8ff',status:'Atordoar',statusChance:.3,summary:'Um raio em forma de dragão cai do céu sobre o alvo e pode atordoar.',icon:0},
  {kind:'natureza',ingredients:[nin('Areia'),nin('Areia')],name:'Ryūsa Bakuryū',element:'Areia',shape:'Área',color:'#d8b878',status:'Lentidão',statusChance:.35,summary:'Uma avalanche de areia soterra a área e prende quem fica nela.',icon:20},
  {kind:'natureza',ingredients:[nin('Gelo'),nin('Gelo')],name:'Hyōton: Sensatsu Suishō',element:'Gelo',shape:'Área',color:'#bdf3ff',status:'Congelar',statusChance:.35,summary:'Mil agulhas de gelo cercam o alvo e caem de todos os lados.',icon:17},
  // Mesma escola (Taijutsu e Genjutsu), para quem não tem Ninjutsu de natureza.
  {kind:'escola',ingredients:[{school:'Taijutsu'},{school:'Taijutsu'}],name:'Kage Buyō',school:'Taijutsu',shape:'Área',color:'#e8d6a8',status:'Atordoar',statusChance:.2,summary:'Segue o alvo como sombra e encadeia os dois golpes numa sequência só.',icon:9},
  {kind:'escola',ingredients:[{school:'Genjutsu'},{school:'Genjutsu'}],name:'Magen: Narakumi',school:'Genjutsu',shape:'Área',color:'#b88ad8',status:'Lentidão',statusChance:.3,summary:'A ilusão mostra o pior pesadelo de cada inimigo na área e os deixa sem reação.',icon:10},
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

const fits = (i:FusionIngredient, t:Technique) => (!i.element||t.element===i.element) && (!i.school||t.school===i.school) && (!i.names||i.names.includes(t.name));
const fusable = (t:Technique) => !t.setup && !isMergedName(t.name);

/** Receita que funde o par (a primeira da lista, na ordem de prioridade), ou nenhuma: aí o par só pode ser Combinado. */
export function fusionRecipe(a:Technique,b:Technique):FusionRecipe|undefined{
  if(a===b||a.name===b.name||!fusable(a)||!fusable(b))return undefined;
  return FUSION_RECIPES.find(({ingredients:[x,y]})=>fits(x,a)&&fits(y,b)||fits(x,b)&&fits(y,a));
}
/** Só a Kekkei Genkai do par (dois Ninjutsu de naturezas diferentes). */
export function kekkeiRecipe(a:Technique,b:Technique){
  const recipe=fusionRecipe(a,b);
  return recipe?.kind==='kekkei'?KEKKEI_RECIPES.find(r=>r.name===recipe.name):undefined;
}

/** Receita de uma técnica fundida, pelo nome do resultado ("Fusão · Nome"). */
export const fusionByName = (name:string) => FUSION_RECIPES.find(recipe=>name==='Fusão · '+recipe.name);
/** Mantido pelo nome antigo: qualquer receita (não só Kekkei Genkai) pelo nome do resultado. */
export const kekkeiFusion = fusionByName;
export const FUSION_KIND_LABEL: Record<FusionKind,string> = { kekkei:'Kekkei Genkai', natureza:'Fusão de natureza', escola:'Fusão de escola', assinatura:'Fusão assinatura' };

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

export type FusionEntry = { name:string; pair:[string,string]; kekkei:boolean; kind:FusionKind; result:Technique };
/**
 * Rodada 77 (pedido do usuário: "nas fusões, é pra aparecer já as fusões que o ninja pode aprender… quando for liberando
 * ninja na conta, vai aparecer mais habilidades… e mais fusões também"): catálogo de TODAS as fusões possíveis com as
 * técnicas do pool do shinobi (sem buff, sem bloqueio, sem resultado de outra fusão). Desde 25/11/2026 só entram pares
 * com receita. Kekkei Genkai primeiro, depois as demais em ordem alfabética; cada resultado aparece uma vez (o 1º par).
 */
export function fusionCatalog(pool:readonly Technique[], family?:string):FusionEntry[] {
  const options=pool.filter(t=>!t.setup&&!(t as {locked?:boolean}).locked&&!isMergedName(t.name));
  const out=new Map<string,FusionEntry>();
  for(let i=0;i<options.length;i++)for(let j=i+1;j<options.length;j++){
    const pair:[string,string]=[options[i].name,options[j].name];
    const result=mergedTechnique({kind:'fuse',names:pair},options,family);
    if(!result||out.has(result.name))continue;
    const kind=fusionByName(result.name)!.kind;
    out.set(result.name,{name:fusionDisplayName(result.name),pair,kekkei:kind==='kekkei',kind,result});
  }
  return [...out.values()].sort((a,b)=>Number(b.kekkei)-Number(a.kekkei)||a.name.localeCompare(b.name,'pt-BR'));
}
/** Nome mostrado: o nome da receita (sem o prefixo "Fusão · "). */
export const fusionDisplayName = (name:string) => fusionByName(name)?.name ?? name;
/** Texto da receita para a aba Habilidades: "A + B = Nome da fusão". */
export const fusionRecipeText = (pair:readonly [string,string], name:string) => `${pair[0]} + ${pair[1]} = ${name}`;

export const FUSION_LEVEL_CAP = 7;
export const techniqueLevelCap = (t: {name:string}, extra = 0) => t.name.startsWith('Fusão · ') ? FUSION_LEVEL_CAP : 9 + extra;

export function sagesMergeCandidates(pool: readonly Technique[], levels: Readonly<Record<string,number>>, extraCap = 0) {
  return pool.filter(t => !t.setup && !isMergedName(t.name) && (levels[t.name] ?? 0) >= techniqueLevelCap(t, extraCap));
}

export type TechniqueMerge = { kind:'fuse'|'combine'; names:[string,string] };

/** Teto da chance de status somada na fusão. */
export const FUSION_STATUS_CAP = .95;
/**
 * Fusão pela receita (25/11/2026 — pedido do usuário: "os buffs que as antes da fusão tem, se somam e criam uma habilidade
 * forte com aquele adicional de bônus"). A receita dá nome, forma, cor e o status próprio; as duas técnicas somam o resto:
 * dano (A + B) × bônus de natureza ou linhagem, chance do mesmo status somada à da receita (teto 95%), o outro status como
 * secundário, queimadura, veneno, lentidão e gravidade. Alcance e recarga ficam com o maior. Os afixos de nível (dano,
 * área, recarga e duração) são somados na Oficina (`applyMerge`).
 */
function fusedTechnique(recipe:FusionRecipe,a:Technique,b:Technique,bonus:number):Technique{
  const status=recipe.status??a.status??b.status;
  const chanceFor=(t:Technique,s:Technique['status'])=>(t.status===s?t.statusChance:0)+(t.secondaryStatus===s?t.secondaryStatusChance??0:0);
  const others=[a.status,b.status,a.secondaryStatus,b.secondaryStatus].filter(s=>s&&s!==status);
  const secondary=others[0];
  const kekkei=recipe.natures&&!recipe.element;
  return {
    name:'Fusão · '+recipe.name,school:recipe.school??'Ninjutsu',
    element:recipe.element??(recipe.natures?recipe.natures[0]:a.element),
    secondaryElement:recipe.secondaryElement??(kekkei?recipe.natures![1]:recipe.kind==='escola'&&b.element!==a.element?b.element:undefined),
    shape:recipe.shape,color:recipe.color,
    status,statusChance:Math.min(FUSION_STATUS_CAP,(recipe.status?recipe.statusChance:0)+chanceFor(a,status)+chanceFor(b,status)),
    secondaryStatus:secondary,secondaryStatusChance:secondary?Math.min(FUSION_STATUS_CAP,chanceFor(a,secondary)+chanceFor(b,secondary)):undefined,
    burn:recipe.burn||a.burn||b.burn,poison:recipe.poison||a.poison||b.poison,slow:a.slow||b.slow,gravity:a.gravity??b.gravity,
    power:(a.power+b.power)*bonus,range:Math.max(a.range,b.range),cooldown:Math.max(a.cooldown,b.cooldown),unlockLevel:1,
  };
}

/** `family`: família do shinobi que funde (familyOf), para o bônus da própria Kekkei Genkai. Fundir sem receita: undefined. */
export function mergedTechnique(plan:TechniqueMerge, pool:readonly Technique[], family?:string):Technique|undefined {
  const [a,b]=plan.names.map(name=>pool.find(t=>t.name===name));
  if(!a||!b||a===b||a.setup||b.setup||isMergedName(a.name)||isMergedName(b.name))return;
  if(plan.kind==='fuse'){
    const recipe=fusionRecipe(a,b);
    return recipe?fusedTechnique(recipe,a,b,1+fusionBonus(a,b,family)):undefined;
  }
  const extra=combineBonus(a,b);
  return {
    ...a,
    name:a.name+' + '+b.name,
    secondaryElement:b.element===a.element?undefined:b.element,
    unlockLevel:1,
    power:1.5,
    range:Math.max(a.range,b.range)*(extra.stat==='range'?1+extra.value:1),
    cooldown:Math.max(a.cooldown,b.cooldown)*(extra.stat==='cooldown'?1-extra.value:1),
    status:a.status??b.status,
    statusChance:a.status?a.statusChance:b.statusChance,
    secondaryStatus:a.status&&b.status!==a.status?b.status:undefined,
    secondaryStatusChance:b.statusChance,
    burn:a.burn||b.burn,
    poison:a.poison||b.poison,
    gravity:a.gravity??b.gravity,
  };
}

/**
 * Só para partidas salvas antes de 25/11/2026: a fusão genérica "Fusão · A / B" (par sem receita) deixou de existir,
 * mas uma run salva com ela continua com a técnica.
 */
export function legacyFusion(plan:TechniqueMerge, pool:readonly Technique[], family?:string):Technique|undefined {
  const [a,b]=plan.names.map(name=>pool.find(t=>t.name===name));
  if(plan.kind!=='fuse'||!a||!b||a===b||a.setup||b.setup)return;
  return {
    ...a,name:'Fusão · '+a.name+' / '+b.name,secondaryElement:b.element===a.element?undefined:b.element,shape:'Área',unlockLevel:1,
    power:(a.power+b.power)*(1+fusionBonus(a,b,family)),range:Math.max(a.range,b.range),cooldown:Math.max(a.cooldown,b.cooldown),
    status:a.status??b.status,statusChance:a.status?a.statusChance:b.statusChance,
    secondaryStatus:a.status&&b.status!==a.status?b.status:undefined,secondaryStatusChance:b.statusChance,
    burn:a.burn||b.burn,poison:a.poison||b.poison,gravity:a.gravity??b.gravity,
  };
}
