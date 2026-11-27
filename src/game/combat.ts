import { luckRarityWeights, type Bonuses, type Item, type Rarity, type StatKey } from './catalog.ts';
import { bonusText } from './allies.ts';
import { DETERMINATION, NATURE_BONUS, familyOf, type Technique, type Element } from './heroes.ts';
import type { Stats } from './progression.ts';
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
 * Revisão 11/11/2026 (pedido do usuário: "aumente o scale de dano e % de todas as habilidades do jogo"): base ×1,5 e spread maior em todas as raridades.
 */
/**
 * Afixos das técnicas por raridade (Comum → Lendário), em %: valor = base + sorteio × spread.
 * 25/11/2026 — decisão do usuário ("Sim, aplicar", após scripts/simulate-damage.mjs): o dano caiu pela metade
 * (antes base 45/80/135/225/375 · spread 22/30/45/70/110), junto com o Final Swarm entrando em ×2.
 */
export const GROWTH_ROLLS={damage:{base:[22.5,40,67.5,112.5,187.5],spread:[11,15,22.5,35,55]},other:{base:[15,27,38,45,60],spread:[11,14,14,21,21]}};
/**
 * Escala global de dano das técnicas do jogador e dos ajudantes (revisão 11/11/2026 — pedido do usuário: "aumente o scale de dano e % de todas as
t * habilidades do jogo"). Aplicada no cálculo do golpe (GameCanvas, hit()); os kits dos chefes já escalam por fase em bossCombat.ts e não usam este fator.
 */
export const TECHNIQUE_SCALE=1.2;
/**
 * Espinhos (25/11/2026, decisão do usuário: "Armadura × dano do personagem"): o contragolpe é `thorns` × armadura × dano do
 * personagem (que já inclui nível e dano%). Armadura de Espinhos 100% por cópia, Armadura Samurai 150%.
 */
export const thornsDamage=(thorns:number,armor:number,damage:number)=>Math.max(0,thorns)*Math.max(0,armor)*Math.max(0,damage);
/**
 * Ataque base por nível e raridade da carta (27/11/2026 — usuário: "as habilidades ao passar o mouse não estão mostrando o level e o scale delas por nível... todas tem que ter um ataque base por nível, ai a qualidade das cartas atuam em cima dessa base para buffar, sendo as cartas comuns o status base da carta, ai a incomum já atua calculando em cima dessa base, isso para todas as habilidades").
 * Toda técnica de ataque sobe de dano a cada nível. A carta Comum dá a BASE (+22,5% de dano por nível, mais o sorteio da faixa);
 * as outras raridades multiplicam essa base: Incomum ×1,78 · Raro ×3 · Épico ×5 · Lendário ×8,33. Os números vêm de GROWTH_ROLLS
 * (o equilíbrio não mudou: a tabela já era base × raridade, só não era mostrada).
 */
export const LEVEL_GROWTH={damageBase:GROWTH_ROLLS.damage.base[0]};
/** Multiplicador da raridade sobre a base por nível (Comum = 1). */
export const rarityGrowthMultiplier=(rarity:Rarity)=>GROWTH_ROLLS.damage.base[Math.max(0,RARITY_ORDER.indexOf(rarity))]/GROWTH_ROLLS.damage.base[0];
const pctText=(n:number)=>(Math.round(n*10)/10).toLocaleString('pt-BR');
/** "Nv. 3 · base +22,5% de dano por nível (Comum); Incomum ×1,78 · … · acumulado +68% de dano". Técnicas de buff não têm dano por nível. */
export function levelScaleText(technique:Technique,level:number,growth:SkillGrowth){
  if(technique.setup)return 'Nv. '+level+' · buff: a carta melhora força, recarga ou duração.';
  const tiers=RARITY_ORDER.slice(1).map(r=>r+' ×'+pctText(rarityGrowthMultiplier(r))).join(' · ');
  return 'Nv. '+level+' · base +'+pctText(LEVEL_GROWTH.damageBase)+'% de dano por nível (carta Comum); '+tiers+' · acumulado +'+Math.round(growth.damage*100)+'% de dano';
}
/** Na carta: quanto a raridade multiplica a base por nível. */
export const rarityScaleText=(rarity:Rarity)=>'×'+pctText(rarityGrowthMultiplier(rarity))+' da base de +'+pctText(LEVEL_GROWTH.damageBase)+'%/nível';
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
export const ELEMENT_KEY:Record<Element,StatKey>={Fogo:'elFogo',Água:'elAgua',Vento:'elVento',Terra:'elTerra',Raio:'elRaio',Madeira:'elMadeira',Areia:'elAreia',Sombra:'elSombra',Neutro:'elNeutro',Sábio:'elSabio',Gelo:'elGelo'};
const DAMAGE_ELEMENTS=Object.keys(ELEMENT_KEY) as Element[];
/** Bônus da linha de um elemento (25/11/2026: queimadura, explosão da Katon e ajudantes também usam o bônus do elemento). */
export const elementMultiplier=(extra:Partial<Record<string,number>>,element:Element)=>1+(extra[ELEMENT_KEY[element]]??0);
const ELEMENT_BY_KEY=Object.fromEntries(Object.entries(ELEMENT_KEY).map(([e,k])=>[k,e])) as Record<string,Element>;
const has=(item:Item,...keys:StatKey[])=>keys.some(k=>(item.bonuses[k]||0)!==0);
/** Bônus que melhoram qualquer técnica do jogador. */
const UNIVERSAL:StatKey[]=['sage','damage','crit','critDamage','attackSpeed','area','dot','eliteDamage','controlledDamage','statusStack','lowHpDamage','noHitDamage','killDamage','bigCrit','execute','burnChance','poisonChance','sleepChance','rootChance','chillChance','statusDamage','skillCap'];

function matchesDamageElement(t:Technique, element:Element, sageInfused:boolean){
 return t.ultimate||t.element===element||t.secondaryElement===element||element==='Sábio'&&sageInfused;
}

export function affectedTechniques(item:Item,techniques:Technique[],sageInfused=false):string[]{
 const b=item.bonuses;
 // Pergaminhos de elemento (Katon, Suiton…): listam só as técnicas do MESMO elemento. O pequeno +dano total que
 // eles também dão vale para tudo, mas não é listado por técnica (confundia: "Katon melhora técnica de Água").
 const elements=(Object.keys(b) as StatKey[]).filter(k=>ELEMENT_BY_KEY[k]&&(b[k]||0)>0).map(k=>ELEMENT_BY_KEY[k]);
 if(elements.length)return techniques.filter(t=>!t.setup&&elements.some(element=>matchesDamageElement(t,element,sageInfused))).map(t=>t.name);
 // Setups (buff puro) não são melhorados por itens de ataque.
 return techniques.filter(t=>!t.setup).filter(t=>has(item,...UNIVERSAL)
   ||b.projectileSpeed
   ||((b.projectiles||b.bounce)&&['Projétil','Em V'].includes(t.shape))
   ||(b.normal||b.armorPhysical)&&(t.ultimate||t.school==='Taijutsu')
   ||b.element&&(t.ultimate||t.school==='Ninjutsu')
   ||b.genjutsu&&(t.ultimate||t.school==='Genjutsu')
   ||b.status&&t.status
   ||b.duration&&(t.status||t.burn)).map(t=>t.name);
}
/** Linha "Melhora: …" das cartas e da ficha. Pergaminho de elemento sem técnica daquele elemento avisa isso em vez de listar outras. */
export function affectedTechniquesText(item:Item,techniques:Technique[],sageInfused=false):string{
 const names=affectedTechniques(item,techniques,sageInfused);
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
export function hasSenjutsu(t:Technique,sageInfused:boolean){return !t.setup&&t.school==='Ninjutsu'&&(t.element==='Sábio'||t.secondaryElement==='Sábio'||sageInfused);}
type TechniqueDamageStats=Pick<Stats,'damage'|'physical'|'ninjutsu'|'genjutsu'|'armor'|'extra'>;

/** Dano por acerto antes de crítico, passivas situacionais e defesa do alvo. */
export function techniqueHitDamage(t:Technique, g:SkillGrowth, stats:TechniqueDamageStats,
 options:{ affinity?:Element; sageInfused?:boolean; trained?:boolean; ally?:boolean }={}){
 if(t.setup)return 0;
 const school=t.ultimate?stats.physical*stats.ninjutsu*stats.genjutsu
   :t.school==='Taijutsu'?stats.physical:t.school==='Ninjutsu'?stats.ninjutsu:stats.genjutsu;
 const hit=stats.damage*t.power*TECHNIQUE_SCALE*(1+g.damage)*school;
 const secondary=t.secondaryElement;
 const extra=stats.extra;
 let elemental=1;
 if(t.ultimate){
  for(const element of DAMAGE_ELEMENTS)elemental+=extra[ELEMENT_KEY[element]]??0;
 }else{
  elemental+=extra[ELEMENT_KEY[t.element]]??0;
  if(secondary&&secondary!==t.element)elemental+=extra[ELEMENT_KEY[secondary]]??0;
  if(options.sageInfused&&t.element!=='Sábio'&&secondary!=='Sábio')elemental*=1+(extra.elSabio??0);
 }
 // 25/11/2026: ajudantes também usam o bônus de escola (já no `hit`) e de elemento da técnica deles.
 if(options.ally)return hit*elemental;
 const affinity=t.element!=='Neutro'&&t.element===options.affinity?NATURE_BONUS:1;
 const armor=t.ultimate||t.school==='Taijutsu'?1+Math.min(.5,stats.armor*(extra.armorPhysical??0)):1;
 return hit*elemental*affinity*armor*(options.trained?1.15:1);
}

export function techniquePassiveMultiplier(heroId:string,t:Technique,healthShare:number,sageInfused:boolean){
 const determination=DETERMINATION[heroId];
 if(determination!==undefined)return 1+determination*(1-healthShare);
 const family=familyOf(heroId);
 if(family==='hashirama'&&(t.element==='Sábio'||sageInfused))return 1.2;
 return family==='tenten'&&(t.element==='Neutro'||t.shape==='Projétil'||t.shape==='Em V')?1.5:1;
}

export function senjutsuText(level=1){return `${SENJUTSU.label}: ${Math.round(techniqueProc(SENJUTSU.chance,level)*100)}% de chance por acerto de causar dano adicional de ${String(SENJUTSU.multiplier).replace('.',',')}× o dano normal.`;}

/**
 * Multiplicador de recarga da técnica aprendida. Rodada 76: o Nv. 1 deixou de ser punido (antes ×1,55); a recarga mostrada no
 * Nv. 1 é a base da forma (SHAPE_COOLDOWN) e cai ~4,4% por nível até −35% no Nv. 9.
 */
export const COOLDOWN_GROWTH={atMax:.35,levels:8};
export function techniqueCooldownScale(level:number){
 return 1-COOLDOWN_GROWTH.atMax*Math.min(1,Math.max(0,level-1)/COOLDOWN_GROWTH.levels);
}
/** Técnicas de buff (setup) mantêm a escala anterior à rodada 76: ×1,55 no Nv. 1 até ×0,9 no Nv. 9. */
export function setupCooldownScale(level:number){
 return 1.55-.65*Math.min(1,Math.max(0,level-1)/8);
}
export function attackCooldown(t:Technique,level:number,g:SkillGrowth=NO_GROWTH,speed=1){
 return t.cooldown*techniqueCooldownScale(level)/Math.max(.1,speed*(1+g.haste));
}
/** Valores efetivos de um setup com os afixos de level-up (força, recarga, duração). */
export function setupNumbers(t:Technique,g:SkillGrowth=NO_GROWTH,level=1){
 const s=t.setup!;const cooldown=s.cooldown*setupCooldownScale(level)/(1+g.haste),duration=s.duration*(1+g.duration);
 const bonuses:Bonuses={};for(const [k,v] of Object.entries(s.bonuses))bonuses[k as StatKey]=(v as number)*(1+g.damage);
 // Sem acúmulo, reativar só renova: tempo ativo = duração/recarga (limitado a 100%).
 return {cooldown,duration,bonuses,stack:s.stack,sage:!!s.sage,uptime:Math.min(1,duration/cooldown)};
}
const n1=(v:number)=>v.toLocaleString('pt-BR',{maximumFractionDigits:1});
/** Linhas do card de setup: Recarga · Duração · cada bônus · Ativo X% do tempo · Acumulável. */
export function setupLines(t:Technique,g:SkillGrowth=NO_GROWTH,level=1):string[]{
 const s=setupNumbers(t,g,level);
 return [`Recarga ${n1(s.cooldown)} s`,`Duração ${n1(s.duration)} s`,...bonusText(s.bonuses).split(' · ').filter(Boolean),...(s.sage?['Elemento Sábio + Senjutsu no Ninjutsu','Taijutsu corpo a corpo acerta em área ao redor']:[]),`Ativo ${Math.round(s.uptime*100)}% do tempo`,`Acumulável: ${s.stack?'Sim':'Não'}`];
}
const effectProgress = (level: number) => Math.max(0, Math.min(1, (level - 1) / 8));

/** Teto inicial por efeito. Bônus conquistados podem elevar a chance durante a missão. */
export function techniqueProc(base: number, level = 1, bonus = 0) {
  const initial = Math.min(base, .1);
  return Math.max(0, Math.min(.95, initial + (base - initial) * effectProgress(level) + bonus));
}

export function techniqueSchool(t: Technique) {
  return t.element === 'Sábio' || t.setup?.sage ? 'Senjutsu' : t.school;
}

/** Ataques sem efeito próprio podem ganhar crítico com os níveis da técnica. */
export function techniqueCritical(t: Technique, level = 1) {
  if (t.setup || t.status || t.secondaryStatus || t.burn || t.poison || t.gravity) return { chance: 0, damage: 0 };
  const progress = effectProgress(level);
  return { chance: .02 + .06 * progress, damage: .05 + .20 * progress };
}

export const BURN_CHANCE = .60;
export const POISON_CHANCE = .50;
const GRAVITY_TEXT = { pull: "Uma onda ao redor do usuário puxa inimigos para perto.", core: "Um núcleo gravitacional puxa inimigos para o centro do impacto.", push: "Uma onda ao redor do usuário repele inimigos." };
export function techniqueStatusText(t: Technique, level = 1, bonus = 0) {
  if (t.setup) return 'Preparação';
  const statuses = [
    t.gravity && GRAVITY_TEXT[t.gravity],
    t.status && t.statusChance > 0 && t.status + ' · ' + n1(techniqueProc(t.statusChance, level, bonus) * 100) + '%',
    t.secondaryStatus && t.secondaryStatusChance && t.secondaryStatus + ' · ' + n1(techniqueProc(t.secondaryStatusChance, level, bonus) * 100) + '%',
    t.burn && 'Queimadura · ' + n1(techniqueProc(BURN_CHANCE, level, bonus) * 100) + '%',
    t.poison && 'Dano contínuo · ' + n1(techniqueProc(POISON_CHANCE, level, bonus) * 100) + '%',
  ].filter(Boolean);
  if (statuses.length) return statuses.join(' / ');
  const crit = techniqueCritical(t, level);
  return "+" + n1(crit.chance * 100) + " p.p. crítico · +" + n1(crit.damage * 100) + "% dano crítico";
}
/** Texto curto de uma técnica para tooltips/cartas (setup ou ataque com linha Senjutsu). */
export function techniqueDetail(t:Technique,g:SkillGrowth=NO_GROWTH,sageInfused=false,sageModeKnown=false,level=1,bonus=0):string{
 if(t.setup)return `Setup (buff, sem dano) · ${t.setup.summary} ${setupLines(t,g,level).join(' · ')}.`;
 const parts=[`${techniqueSchool(t)} · ${t.element} · ${t.shape}`,techniqueStatusText(t,level,bonus)];
 if(hasSenjutsu(t,sageInfused))parts.push(senjutsuText(level));
 else if(t.school==='Ninjutsu'&&sageModeKnown)parts.push(`${SENJUTSU.label} durante o Modo Sábio.`);
 return parts.join(' · ');
}

/**
 * Rodada 78 — onde o golpe acerta. Área, Órbita e corpo a corpo acertam um círculo centrado NO ALVO (nunca no pé do jogador);
 * a gravidade de puxar (Bansho Tenin) continua no usuário e cone/linha partem dele na direção do alvo. Exceção: o Modo Sábio
 * faz o taijutsu corpo a corpo girar em volta do usuário (regra própria do buff).
 */
export function aimedCenter(t:{shape:string;gravity?:string},sageArea=false):'target'|'origin'{
 if(t.gravity==='pull'||sageArea)return 'origin';
 return t.shape==='Área'||t.shape==='Órbita'||t.shape==='Corpo a corpo'?'target':'origin';
}
/** Raio do círculo do corpo a corpo no alvo: 60% do alcance (mínimo 0,6 m), para acertar o alvo e quem está colado nele. */
export const MELEE_IMPACT={share:.6,min:.6};
/** Cone das técnicas: cosseno do meio-ângulo (o mesmo no desenho e no acerto; techniqueAreas.ts reexporta). */
export const CONE_COS=.65;
/**
 * Raio (× ATTACK_SCALE × √área) do círculo de Área e de Órbita. 25/11/2026 (decisão do usuário: "Sim, aplicar"): Área 1,2 → 1,8,
 * porque os kits de Área limpavam ~1,2 inimigo/s contra ~6,3 do Em V e caíam no pico dos 3–5 min (medição em docs/20).
 */
export const SHAPE_RADIUS={area:1.8,orbit:1.7};
