/**
 * Passivas Shinobi (árvore permanente comprada com Lamens). O `name` é a chave salva em `sb_permanent_levels`;
 * não renomeie nós existentes sem migrar o salvamento. Valores e preços provisórios.
 * Seções no estilo da referência: "Treinamento" (atributos) e "Equipe da partida" (espaços, opções e ferramentas).
 */
import { runInflation } from './itemTrade.ts';
export type PassiveSection='Treinamento'|'Equipe da partida';
export type PassiveDef={name:string;buff:string;base:number;max:number;icon:string;section:PassiveSection};
export const PASSIVE_SECTIONS:{id:PassiveSection;subtitle:string}[]=[
  {id:'Treinamento',subtitle:'Melhorias permanentes de atributos'},
  {id:'Equipe da partida',subtitle:'Melhorias permanentes: espaços, opções e ferramentas'},
];
export const PASSIVES:PassiveDef[] = [
  {name:'Treinamento',buff:'+4% dano por nível',base:80,max:10,icon:'damage',section:'Treinamento'},
  {name:'Resistência',buff:'+8 HP máximo por nível',base:85,max:10,icon:'life',section:'Treinamento'},
  {name:'Agilidade',buff:'+2,5% movimento por nível',base:90,max:10,icon:'sandals',section:'Treinamento'},
  {name:'Estudo',buff:'+5% XP por nível',base:75,max:10,icon:'experience',section:'Treinamento'},
  {name:'Comércio',buff:'+5% Ryu de drops por nível',base:110,max:10,icon:'coins',section:'Treinamento'},
  {name:'Fortuna',buff:'+2 Sorte por nível',base:130,max:10,icon:'luck',section:'Treinamento'},
  {name:'Magnetismo',buff:'+0,6 m de coleta por nível',base:75,max:10,icon:'pickup',section:'Treinamento'},
  {name:'Chakra Curativo',buff:'+0,2 HP/s de regeneração por nível',base:90,max:5,icon:'balm',section:'Treinamento'},
  {name:'Couraça',buff:'+2 armadura por nível',base:100,max:10,icon:'bandana',section:'Treinamento'},
  {name:'Precisão',buff:'+1 ponto percentual de crítico por nível',base:140,max:10,icon:'critical',section:'Treinamento'},
  {name:'Celeridade',buff:'+2% velocidade de ataque por nível',base:120,max:10,icon:'speed',section:'Treinamento'},
  {name:'Expansão',buff:'+3% de área por nível',base:110,max:5,icon:'area-seal',section:'Treinamento'},
  {name:'Quarta técnica',buff:'Desbloqueia o quarto espaço de habilidade',base:400,max:1,icon:'clone',section:'Equipe da partida'},
  {name:'Farmacologia Ninja',buff:'+1 nível máximo em cada pílula por nível',base:300,max:2,icon:'pill-gourd',section:'Equipe da partida'},
  {name:'Atualizar',buff:'+1 atualização por run (3 iniciais; até 10)',base:150,max:7,icon:'cooldown',section:'Equipe da partida'},
  {name:'Pular',buff:'+1 pulo por run (3 iniciais; até 10)',base:100,max:7,icon:'sandals',section:'Equipe da partida'},
  {name:'Banir',buff:'+1 banimento por run (3 iniciais; até 10)',base:180,max:7,icon:'tenten',section:'Equipe da partida'},
  {name:'Quarta opção',buff:'Oferece 4 cartas em vez de 3 nas recompensas',base:500,max:1,icon:'clone',section:'Equipe da partida'},
  {name:'Selo de Ressurreição',buff:'Começa cada run com 1 ressurreição (volta com 35% do HP)',base:500,max:1,icon:'revive',section:'Equipe da partida'},
  {name:'Suporte adicional',buff:'+1 aliado permanente; máximo 5 com o item',base:600,max:1,icon:'recruit',section:'Equipe da partida'},
  {name:'Baú do Clã',buff:'+5 vagas "Em casa" na Bolsa da Missão por nível; cada 2 itens desbloqueados dão +1 vaga. Itens em casa não aparecem nas recompensas da run',base:60,max:6,icon:'gama-chan',section:'Equipe da partida'},
  {name:'Meditação de Chakra',buff:'A Ultimate carrega 4% mais rápido por nível',base:120,max:5,icon:'chakra-goggles',section:'Equipe da partida'},
  {name:'Bolsa Grande',buff:'Marque 3 itens como Prioridade na Bolsa da Missão (em vez de 2)',base:250,max:1,icon:'coins',section:'Equipe da partida'},
  {name:'Pesquisa',buff:'+25% de progresso de pesquisa por nível: técnicas de outros shinobis precisam de 100% de pesquisa para entrar no Plano de build',base:140,max:4,icon:'experience',section:'Equipe da partida'},
  {name:'Treinamento com Jiraiya',buff:'Melhora os espaços das suas técnicas favoritas (★): quanto maior a raridade do espaço, mais elas aparecem no level-up',base:200,max:8,icon:'el-sage',section:'Equipe da partida'},
];
export const passiveCost=(def:PassiveDef,level:number)=>def.base+level*25;
export function choiceCount(levels: Record<string,number>, luck = 0, rng = Math.random) {
  if (levels['Quarta opção']) return 4;
  return luck > 0 && rng() < Math.min(.6, luck / 150) ? 4 : 3;
}
export function choiceUses(levels:Record<string,number>){return {reroll:3+Math.min(7,levels.Atualizar||0),skip:3+Math.min(7,levels.Pular||0),ban:3+Math.min(7,levels.Banir||0)};}

/** Bolsa da Missão: vagas "Em casa" = 5 base + 5/nível do Baú do Clã + 1 a cada 2 itens desbloqueados com Lamens. */
export const HOME_RULES={base:5,perLevel:5,perUnlocked:2};
export function homeCapacity(levels:Record<string,number>,unlockedCount:number){
  const lv=Math.max(0,Math.min(6,levels['Baú do Clã']||0));
  return {total:HOME_RULES.base+lv*HOME_RULES.perLevel+Math.floor(Math.max(0,unlockedCount)/HOME_RULES.perUnlocked),fromChest:HOME_RULES.base+lv*HOME_RULES.perLevel,fromUnlocks:Math.floor(Math.max(0,unlockedCount)/HOME_RULES.perUnlocked)};
}
/** Itens marcados como Prioridade na Bolsa: 2 base, 3 com Bolsa Grande. Peso ×PRIORITY_WEIGHT no sorteio de recompensas (não garante). */
export const PRIORITY_WEIGHT=3;
export function prioritySlots(levels:Record<string,number>){return 2+Math.min(1,levels['Bolsa Grande']||0);}

/**
 * Treinamento com Jiraiya: até 4 espaços. Níveis 1–4 abrem os espaços como Raros (8%); níveis 5–8 promovem
 * cada espaço a Lendário (15%). A cada oferta de level-up cada espaço rola sua chance; cada sucesso coloca
 * uma técnica favorita (★ planejada) elegível entre as cartas, se ainda não estiver lá.
 */
export type JiraiyaSlot={rarity:'Raro'|'Lendário';chance:number};
export const JIRAIYA_RULES={rare:.08,legendary:.15,slots:4};
export function jiraiyaSlots(levels:Record<string,number>):JiraiyaSlot[]{
  const lv=Math.max(0,Math.min(8,levels['Treinamento com Jiraiya']||0));
  return Array.from({length:Math.min(JIRAIYA_RULES.slots,lv)},(_,i)=>lv>=JIRAIYA_RULES.slots+1+i?{rarity:'Lendário',chance:JIRAIYA_RULES.legendary}:{rarity:'Raro',chance:JIRAIYA_RULES.rare});
}
export function jiraiyaRolls(levels:Record<string,number>,rng=Math.random){return jiraiyaSlots(levels).filter(s=>rng()<s.chance).length;}

/** Kunai/shuriken do chão: 20 × WEAPON_PRICE_GROWTH^(aberturas pagas) × inflação por minuto de run (itemTrade.ts). 20, 30, 45, 68... */
export const WEAPON_PRICE={base:20,growth:1.5};
export function weaponPrice(opened:number,runSeconds=0){return Math.round(WEAPON_PRICE.base*Math.pow(WEAPON_PRICE.growth,Math.max(0,opened))*runInflation(runSeconds));}
export type AdminWallet={balance:number;spent:number};
export const NEW_ADMIN:AdminWallet={balance:999999,spent:0};
export function purchase(wallet:AdminWallet,cost:number):AdminWallet|null{return cost>=0&&wallet.balance>=cost?{balance:wallet.balance-cost,spent:wallet.spent+cost}:null;}
export function refund(wallet:AdminWallet):AdminWallet{return {balance:wallet.balance+wallet.spent,spent:0};}
// Pílulas: fonte única em ./pills.ts; reexportado aqui por compatibilidade.
export { PILL_NAMES } from './pills.ts';
import { PILL_NAMES as ALL_PILLS, pillDescription } from './pills.ts';
export const PILL_DESCRIPTION:Record<string,string>=Object.fromEntries(ALL_PILLS.map(name=>[name,pillDescription(name)]));
