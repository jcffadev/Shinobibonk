import type { StatKey } from './catalog.ts';

/**
 * Bênção do altar protegido (Rodada 51 — pedido do usuário: "Os altares não são para dar itens, mas buffs aleatórios
 * de acordo com sua sorte/qualidade do altar"): três atributos oferecidos, dos quais o jogador escolhe um.
 * Magnitude = ALTAR_BUFF_BASE[tier] × escala do atributo × (1 + sorte além de 10, +2% por ponto, teto +120%).
 * Valores PROPOSTOS (sessão de 12/11) — o usuário testa a gameplay e ajustamos. Os buffs ficam em runBuffs (preservados
 * no SavedRun); refreshStats recalcula sempre das fontes.
 *
 * Projétil/golpe extra (Rodada 55, pedido do usuário): "Temos um buff +35% chance projétil extra/golpe extra, remova e
 * coloque +1 projétil... lendário será +3 projéteis/golpes. Epico será 2, abaixo disso é raro é 1. Incomum/comum não tem
 * projétil na lista de buffs." Índice = tier (0 Comum · 1 Incomum · 2 Raro · 3 Épico · 4 Lendário). Valor inteiro somado
 * a `projectiles` (sem escala de Sorte). Em técnicas de projétil = projéteis a mais; nas demais = golpes a mais.
 *
 * Lógica pura (sem Three.js nem DOM) para ser testada em `tests/` — o GameCanvas só chama `buildAltarOffers`.
 */
export const ALTAR_PROJECTILES=[0,0,1,2,3] as const;
export function altarProjectiles(tier:number):number{return ALTAR_PROJECTILES[Math.max(0,Math.min(4,Math.floor(tier)))]??0;}
export function projectileLabel(count:number):string{return count===1?'+1 projétil/golpe extra':`+${count} projéteis/golpes extras`;}

export const ALTAR_BUFF_BASE=[.05,.08,.12,.18,.25]; // Comum→Lendário
const pct=(text:string)=>(v:number)=>`+${Math.round(v*100)}% ${text}`;
export const ALTAR_BUFF_POOL:[StatKey,number,(v:number)=>string][]=[
  ['damage',1,pct('de dano')],
  ['crit',1,pct('de chance crítica')],
  ['critDamage',1,pct('de dano crítico')],
  ['attackSpeed',1,pct('de velocidade de ataque')],
  ['move',1,pct('de velocidade de movimento')],
  ['area',1,pct('de raio de área')],
  ['projectiles',1,v=>projectileLabel(v)],
  ['status',1,pct('de chance de status')],
  ['cool',1,pct('de recarga da Ultimate')],
  ['exp',1.2,pct('de experiência')],
  ['gold',1.2,pct('de Ryu')],
  ['dodge',1,pct('de esquiva')],
  ['defense',40,v=>`+${Math.max(1,Math.round(v))} de armadura`],
  ['regen',4,v=>`+${v.toFixed(1)} HP/s de regeneração`],
  ['health',200,v=>`+${Math.round(v)} de HP máximo`],
  ['luck',40,v=>`+${Math.max(1,Math.round(v))} de Sorte`],
];
/** Atributos ofensivos: a bênção sempre oferece pelo menos um ofensivo e um de utilidade/defesa. */
export const ALTAR_OFFENSE=new Set<StatKey>(['damage','crit','critDamage','attackSpeed','area','cool','projectiles']);
export const ALTAR_RARITIES=['Comum','Incomum','Raro','Épico','Lendário'] as const;
export type AltarOffer={id:string;kind:'stat';name:string;rarity:typeof ALTAR_RARITIES[number];icon:string;description:string;bonus:Partial<Record<StatKey,number>>};

/** Multiplicador da Sorte nas bênçãos: +2% por ponto acima de 10, teto +120%. */
export function altarLuckMultiplier(luck:number){return 1+Math.min(1.2,Math.max(0,luck-10)*.02);}

/**
 * Três ofertas sem repetição: 1 ofensiva, 1 de utilidade/defesa e a terceira de qualquer grupo. Comum/Incomum nunca
 * sorteiam projétil. `rng` injetável (testes determinísticos); o jogo usa Math.random.
 */
export function buildAltarOffers(tier:number,luck:number,rng:()=>number=Math.random):AltarOffer[]{
  const t=Math.max(0,Math.min(4,Math.floor(tier)));
  const base=ALTAR_BUFF_BASE[t],luckMult=altarLuckMultiplier(luck);
  const offense=ALTAR_BUFF_POOL.filter(([key])=>ALTAR_OFFENSE.has(key)&&(key!=='projectiles'||altarProjectiles(t)>0));
  const utility=ALTAR_BUFF_POOL.filter(([key])=>!ALTAR_OFFENSE.has(key));
  const take=(pool:typeof ALTAR_BUFF_POOL)=>pool.splice(Math.min(pool.length-1,Math.floor(rng()*pool.length)),1)[0];
  const picked=[take(offense),take(utility),take(rng()<.5?offense:utility)];
  return picked.map(([key,scale,label])=>{
    const value=key==='projectiles'?altarProjectiles(t):Math.round(base*scale*luckMult*100)/100;
    return {id:'altar-'+key,kind:'stat',name:label(value),rarity:ALTAR_RARITIES[t],icon:ALTAR_OFFENSE.has(key)?'⚔':'忍',
      description:key==='projectiles'?'Projétil a mais nas técnicas de projétil; golpe a mais nas de corpo a corpo/área. Ativo até o fim da missão.':'Bônus ativo até o fim da missão.',
      bonus:{[key]:value}};
  });
}

/**
 * Golpes extras numa técnica sem projétil (corpo a corpo, cone, linha, área): cada projétil além do 1º repete o acerto.
 * A parte fracionária (sinergia/afinidade antigas) vira chance de +1. Ultimate não repete. Teto de 11 extras.
 */
export function extraStrikes(projectiles:number,projectileChance:number,ultimate:boolean,rng:()=>number=Math.random){
  if(ultimate)return 0;
  const extra=Math.floor(projectiles)-1+Math.floor(projectileChance)+(rng()<projectileChance%1?1:0);
  return Math.max(0,Math.min(11,extra));
}
