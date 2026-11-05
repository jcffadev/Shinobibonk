export const PASSIVES = [
  {name:'Treinamento',buff:'+4% dano por nível',base:80,max:10,icon:'damage'},
  {name:'Resistência',buff:'+8 HP máximo por nível',base:85,max:10,icon:'life'},
  {name:'Agilidade',buff:'+2,5% movimento por nível',base:90,max:10,icon:'sandals'},
  {name:'Estudo',buff:'+5% XP por nível',base:75,max:10,icon:'experience'},
  {name:'Comércio',buff:'+5% Ryu de drops por nível',base:110,max:10,icon:'coins'},
  {name:'Fortuna',buff:'+2 Sorte por nível',base:130,max:10,icon:'luck'},
  {name:'Magnetismo',buff:'+0,6 m de coleta por nível',base:75,max:10,icon:'pickup'},
  {name:'Couraça',buff:'+2 armadura por nível',base:100,max:10,icon:'bandana'},
  {name:'Precisão',buff:'+1 ponto percentual de crítico por nível',base:140,max:10,icon:'critical'},
  {name:'Celeridade',buff:'+2% cadência por nível',base:120,max:10,icon:'speed'},
  {name:'Quarta opção',buff:'Oferece 4 cartas em vez de 3 nas recompensas',base:500,max:1,icon:'clone'},
  {name:'Atualizar',buff:'+1 atualização por run (3 iniciais; até 10)',base:150,max:7,icon:'cooldown'},
  {name:'Pular',buff:'+1 pulo por run (3 iniciais; até 10)',base:100,max:7,icon:'sandals'},
  {name:'Banir',buff:'+1 banimento por run (3 iniciais; até 10)',base:180,max:7,icon:'tenten'},
  {name:'Suporte adicional',buff:'+1 aliado permanente; máximo 5 com o item',base:600,max:1,icon:'recruit'},
  {name:'Quarta técnica',buff:'Desbloqueia o quarto espaço de habilidade',base:400,max:1,icon:'clone'},
];
export function choiceCount(levels:Record<string,number>){return levels['Quarta opção']?4:3;}
export function choiceUses(levels:Record<string,number>){return {reroll:3+Math.min(7,levels.Atualizar||0),skip:3+Math.min(7,levels.Pular||0),ban:3+Math.min(7,levels.Banir||0)};}
export function weaponPrice(opened:number){return 20+Math.max(0,opened)*10;}
export type AdminWallet={balance:number;spent:number};
export const NEW_ADMIN:AdminWallet={balance:999999,spent:0};
export function purchase(wallet:AdminWallet,cost:number):AdminWallet|null{return cost>=0&&wallet.balance>=cost?{balance:wallet.balance-cost,spent:wallet.spent+cost}:null;}
export function refund(wallet:AdminWallet):AdminWallet{return {balance:wallet.balance+wallet.spent,spent:0};}
// Pílulas: fonte única em ./pills.ts; reexportado aqui por compatibilidade.
export { PILL_NAMES } from './pills.ts';
import { PILL_NAMES as ALL_PILLS, pillDescription } from './pills.ts';
export const PILL_DESCRIPTION:Record<string,string>=Object.fromEntries(ALL_PILLS.map(name=>[name,pillDescription(name)]));
