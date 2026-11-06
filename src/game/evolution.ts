import { HERO_BY_ID, HEROES, NARUTO_FORMS } from './heroes.ts';
import { NPC_PORTRAITS } from './npcs.ts';
export type Form={level:number;name:string;outfit?:string;detail?:string};
// Níveis são design do jogo. Personagens sem outra fase apropriada mantêm a aparência.
export const FORMS:Record<string,Form[]>={
 naruto:NARUTO_FORMS,
 gaara:[{level:1,name:'Genin'},{level:15,name:'Kazekage',outfit:'#a34943'},{level:30,name:'Aliança Shinobi',outfit:'#9b5d4d'}],
 madara:[{level:1,name:'Armadura Uchiha'},{level:15,name:'Rinnegan',detail:'rinnegan'},{level:30,name:'Seis Caminhos',outfit:'#e5e0ce',detail:'sage'}],
 hashirama:[{level:1,name:'Primeiro Hokage'},{level:20,name:'Modo Sábio',detail:'sage'}],
 sasuke:[{level:1,name:'Clássico',outfit:'#3f568d'},{level:15,name:'Shippuden',outfit:'#c4bfd0'},{level:30,name:'Rinnegan',outfit:'#333344',detail:'rinnegan'}],
 sakura:[{level:1,name:'Clássico'},{level:15,name:'Shippuden',outfit:'#bf3c62'},{level:30,name:'Byakugou',detail:'diamond'}],
 kakashi:[{level:1,name:'Jonin'},{level:25,name:'Sexto Hokage',outfit:'#e6e2d1'}],
 itachi:[{level:1,name:'ANBU',outfit:'#7b8291',detail:'vest'},{level:15,name:'Akatsuki',outfit:'#252236',detail:'cloud'}],
 minato:[{level:1,name:'Jonin',outfit:'#668666',detail:'vest'},{level:15,name:'Quarto Hokage',outfit:'#f1e5cb',detail:'cloak'}],
 tsunade:[{level:1,name:'Sannin'},{level:15,name:'Quinta Hokage',outfit:'#45976b'},{level:30,name:'Byakugou',detail:'diamond'}],
 jiraiya:[{level:1,name:'Sannin'},{level:20,name:'Modo Sábio',detail:'sage'}],
 orochimaru:[{level:1,name:'Sannin'},{level:15,name:'Vila do Som',outfit:'#dbd2bb'}],
 lee:[{level:1,name:'Genin'},{level:15,name:'Shippuden',outfit:'#378357',detail:'vest'},{level:30,name:'Portões Internos',outfit:'#5fa35a'}],
 neji:[{level:1,name:'Genin',outfit:'#dbd5ba'},{level:15,name:'Jonin',outfit:'#ece8dc'}],
 hinata:[{level:1,name:'Clássico',outfit:'#e0d6be'},{level:15,name:'Shippuden',outfit:'#b4a5d6'},{level:30,name:'Leões Gêmeos',outfit:'#af9cd0'}],
 shikamaru:[{level:1,name:'Genin'},{level:15,name:'Estrategista',outfit:'#647e55'},{level:30,name:'Conselheiro',outfit:'#3c4850'}],
 temari:[{level:1,name:'Clássico'},{level:15,name:'Shippuden',outfit:'#54475a'}],
 tenten:[{level:1,name:'Clássico'},{level:15,name:'Shippuden',outfit:'#eee0c5'}],
 pain:[{level:1,name:'Caminho Deva'}],tobirama:[{level:1,name:'Segundo Hokage'}],
 kankuro:[{level:1,name:'Genin'},{level:15,name:'Shippuden',outfit:'#493a4b'},{level:30,name:'Aliança Shinobi',outfit:'#6a735c'}],
 guy:[{level:1,name:'Jonin'},{level:15,name:'Sexto Portão',outfit:'#519965'},{level:30,name:'Sétimo Portão',outfit:'#62b4bb'}],
};
export function formAt(id:string,level:number){const list=FORMS[id]??[{level:1,name:'Shinobi'}];return [...list].reverse().find(f=>level>=f.level)??list[0];}
export function spriteFile(id:string,level=1){if(id==='naruto')return `/assets/shinobis/${NARUTO_FORMS.find(f=>f.name===formAt(id,level).name)!.file}.svg`;if(HERO_BY_ID[id]?.atlas!==undefined&&formAt(id,level).level===1)return null;return `/assets/shinobis/${id}-${formAt(id,level).level}.svg`;}
export function requiredLevel(heroId:string,index:number){return heroId==='naruto'?[1,10,5,15][index]:[1,5,12,20][index];}
const evolvedCells=Object.entries(FORMS).flatMap(([id,forms])=>id==='naruto'?[]:forms.filter(f=>f.level>1).map(f=>id+'-'+f.level));
export function portraitRegion(id:string,level=1){
 // NPCs não jogáveis (Ebisu, Iruka): sprite próprio em public/assets/shinobis/<id>-1.svg (enquadramento de célula do atlas), imagem inteira.
 if(NPC_PORTRAITS[id])return {path:NPC_PORTRAITS[id],cols:1,rows:1,index:0};
 const form=formAt(id,level);
 if(id==='naruto')return {path:'/assets/shinobi-roster-v2.png',cols:5,rows:5,index:level<10?0:level<25?22:level<50?23:24};
 if(form.level>1)return {path:'/assets/shinobi-evolutions-v2.png',cols:6,rows:5,index:Math.max(0,evolvedCells.indexOf(id+'-'+form.level))};
 return {path:'/assets/shinobi-roster-v2.png',cols:5,rows:5,index:Math.max(0,HEROES.findIndex(h=>h.id===id))};
}
