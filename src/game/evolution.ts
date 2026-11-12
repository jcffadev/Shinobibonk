import { directionalArt } from './directionalArt.ts';
import { HERO_BY_ID, HEROES, NARUTO_FORMS, familyOf } from './heroes.ts';
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
/**
 * Forma exibida. Desde as versões separadas (06/11/2026) cada shinobi jogável fica SEMPRE na forma da própria versão
 * (`Hero.form`): o nível da run não troca mais a forma. Ids fora do elenco (NPCs) seguem a tabela por nível.
 */
export function formAt(id:string,level=1){const hero=HERO_BY_ID[id],family=familyOf(id),list=FORMS[family]??[{level:1,name:'Shinobi'}];if(hero)return list.find(f=>f.level===(hero.form??1))??list[0];return [...list].reverse().find(f=>level>=f.level)??list[0];}
export function spriteFile(id:string,level=1){const family=familyOf(id),form=formAt(id,level);if(family==='naruto')return `/assets/shinobis/${NARUTO_FORMS.find(f=>f.name===form.name)!.file}.svg`;if(HERO_BY_ID[family]?.atlas!==undefined&&form.level===1)return null;return `/assets/shinobis/${family}-${form.level}.svg`;}
/** Nível de liberação da técnica `index` do kit (fonte única: `unlockLevel` em heroes.ts, ajustado por fase da obra). */
export function requiredLevel(heroId:string,index:number){return HERO_BY_ID[heroId]?.techniques[index]?.unlockLevel??[1,5,12,20][index];}
const evolvedCells=Object.entries(FORMS).flatMap(([id,forms])=>id==='naruto'?[]:forms.filter(f=>f.level>1).map(f=>id+'-'+f.level));
import { BIJUU } from './bijuu.ts';
const leafPortraits = ['ebisu', 'iruka', 'kushina'];
export const ASUMA_ATLAS = '/assets/asuma-motion-v1.png';
export function portraitRegion(versionId:string,level=1){
 // Versões usam o retrato da forma da família (ex.: `naruto-shippuden` → célula Shippuden do Naruto).
 const id=familyOf(versionId);level=HERO_BY_ID[versionId]?formAt(versionId).level:level;
 if(id==='sapos-sabios')return {path:'/assets/shinobis/sapos-sabios-v1.png',cols:1,rows:1,index:0};
 if(id==='teuchi')return {path:'/assets/shinobis/teuchi-v1.png',cols:1,rows:1,index:0};
 if(id==='asuma')return {path:ASUMA_ATLAS,cols:4,rows:4,index:0};
 // Kuri (rodada 41): marionete do Kankuro — retrato na célula (0,0) da própria folha de caminhada.
 if(id==='kuri')return {path:'/assets/shinobi-motion/kuri-1-walk-v1.png',cols:4,rows:2,index:0};
 const leafIndex = leafPortraits.indexOf(id);
 if(leafIndex >= 0) return {path:'/assets/shinobi-folha-v3.png',cols:3,rows:1,index:leafIndex};
 if(id==='sakura'){
  if(level<15)return {path:'/assets/sakura-genin-v1.png',cols:1,rows:1,index:0};
  return {path:level>=30?'/assets/sakura-byakugou-motion-v1.png':'/assets/sakura-shippuden-motion-v1.png',cols:4,rows:2,index:0};
 }
 if(id==='gaara')return {path:directionalArt(id,level<15?1:level<30?15:30)!.path,cols:4,rows:6,index:8};
 if(id==='chomei'||id==='gyuki')return {path:`/assets/bijuu/${id}-v2.png`,cols:1,rows:1,index:0};
 const beast=BIJUU.findIndex(entry=>entry.id===id);
 if(beast>=0)return {path:'/assets/bijuu-atlas-v1.png',cols:3,rows:3,index:beast};
 const form=HERO_BY_ID[versionId]?formAt(versionId):formAt(id,level);
 if(id==='naruto')return {path:'/assets/shinobi-roster-v2.png',cols:5,rows:5,index:level<10?0:level<25?22:level<50?23:24};
 if(form.level>1)return {path:'/assets/shinobi-evolutions-v2.png',cols:6,rows:5,index:Math.max(0,evolvedCells.indexOf(id+'-'+form.level))};
 return {path:'/assets/shinobi-roster-v2.png',cols:5,rows:5,index:Math.max(0,HEROES.findIndex(h=>h.id===id))};
}
