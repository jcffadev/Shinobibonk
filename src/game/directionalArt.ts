import { ROSTER_EXPANSION, chibiMotionArt, expansionSheet } from './rosterExpansion.ts';
type DirectionalSheet = { path: string; rows: number; firstRow?: number; cast?: boolean };
const fullActionForms: Record<string, readonly number[]> = {
  sakura: [1, 15, 30],
  sasuke: [30],
  itachi: [15],
  madara: [1, 15, 30],
};
const revisedActionForms:Record<string,readonly number[]>={
  sasuke:[1,15],neji:[1,15],hashirama:[1,20],kakashi:[1,25],itachi:[1],
  minato:[1,15],tsunade:[1,15,30],jiraiya:[1,20],orochimaru:[1,15],
  hinata:[1,15,30],pain:[1],shikamaru:[1,15,30],tobirama:[1],
  temari:[1,15],tenten:[1,15],
  kankuro:[1,15,30],kushina:[1],
  kuri:[1],
};
// Versões clássicas com quatro fases de pulo e dash, nas duas vistas.
const fullAcrobatics = new Set([
  'naruto-1', 'naruto-50', 'kuri-1',
  'gaara-1', 'gaara-15', 'gaara-30', 'guy-1', 'guy-15', 'guy-30', 'hashirama-1',
  'hashirama-20', 'hinata-1', 'hinata-15', 'hinata-30', 'itachi-1', 'itachi-15', 'jiraiya-1',
  'jiraiya-20', 'kakashi-1', 'kakashi-25', 'kankuro-1', 'kankuro-15', 'kankuro-30', 'kushina-1',
  'lee-1', 'lee-15', 'lee-30', 'madara-1', 'madara-15', 'madara-30', 'minato-1',
  'minato-15', 'naruto-10', 'naruto-25', 'neji-1', 'neji-15', 'orochimaru-1', 'orochimaru-15',
  'pain-1', 'sakura-1', 'sakura-15', 'sakura-30', 'sasuke-1', 'sasuke-15', 'sasuke-30',
  'shikamaru-1', 'shikamaru-15', 'shikamaru-30', 'temari-1', 'temari-15', 'tenten-1', 'tenten-15',
  'tobirama-1', 'tsunade-1', 'tsunade-15', 'tsunade-30',
]);
// Versões da expansão e companheiros com quadros traseiros próprios.
const expansionDirectionalIds = new Set([
  'akamaru', 'ao', 'chiriku', 'choji', 'choji-guerra', 'deidara', 'dosu', 'iruka', 'raikage-quarto', 'tayuya', 'gengetsu', 'haku', 'hanabi',
  'hanabi-adulta', 'hanzo', 'hiashi', 'hidan', 'hiruzen', 'ino', 'ino-guerra',
  'jirobo', 'jugo', 'juzo', 'kabuto', 'kabuto-sabio', 'kakuzu', 'karin',
  'kiba', 'kiba-shippuden', 'kidomaru', 'killer-b', 'kimimaro', 'kin', 'kisame',
  'konan', 'kurenai', 'mangetsu', 'mei', 'nagato', 'naruto-hokage', 'obito',
  'obito-guerra', 'onoki', 'orochimaru-akatsuki', 'raikage-terceiro', 'rasa', 'sai', 'sakon-ukon',
  'sakumo', 'sasori', 'shino', 'shino-shippuden', 'shisui', 'suigetsu', 'tobi-akatsuki',
  'yamato', 'zabuza', 'zaku', 'zetsu',
]);
const expandedIdsByForm = new Map(ROSTER_EXPANSION.map(entry => [`${entry.family}-${entry.form}`, entry.id]));
const revisedDirectionalId = (family: string, form: number) => expandedIdsByForm.get(`${family}-${form}`) ?? family;
const revisedDirectionalPath = (family: string) => `/assets/shinobi-motion/${family}-directional-v2.png`;

export function acrobaticsArt(family:string,form:number){
  const formId = `${family}-${form}`;
  const chibi=chibiMotionArt(revisedDirectionalId(family,form));
  if(chibi)return {path:chibi.acrobatics,kind:'directional-acrobatics' as const,rows:4,firstRow:0};
  if (fullAcrobatics.has(formId))
    return {path:`/assets/shinobi-motion/${formId}-acrobatics-v3.png`,kind:'directional-acrobatics' as const,rows:4,firstRow:0};
  const id = revisedDirectionalId(family, form);
  if (expansionDirectionalIds.has(id))
    return {path:revisedDirectionalPath(id),kind:'rear-acrobatics' as const,rows:4,firstRow:2};
  if(family==='asuma')return {path:'/assets/shinobi-motion/asuma-1-acrobatics-v3.png',kind:'directional-acrobatics' as const,rows:4,firstRow:0};
  if(expansionSheet(family,form))return;
  if((family==='naruto'&&form>1)||family==='lee'||family==='guy')
    return {path:`/assets/shinobi-motion/${family}-${form}-acrobatics-v2.png`,kind:'acrobatics' as const,directional:true,rows:2,firstRow:0};
}

const gaaraSheet = (level: number) => `/assets/shinobi-motion/gaara-${level}-motion-v3.png`;
export const NARUTO_HAND_SEALS = '/assets/shinobi-motion/naruto-hand-seal-v1.png';
const narutoSealForms = [1, 10, 25, 50];
/**
 * Folhas de SELOS de outros shinobis (Rodada 63 — Zabuza fazendo os selos da Névoa Oculta). Mesmo layout da folha do
 * Naruto: 4 colunas (preparação de frente, selo de frente, preparação de costas, selo de costas) × 4 fileiras; usa a
 * fileira 0. Outros shinobis podem reutilizar o mesmo layout.
 */
const EXTRA_SEAL_SHEETS: Record<string, string> = {zabuza:'/assets/shinobi-motion/zabuza-seal-v1.png'};
export function handSealArt(family: string, level: number) {
  const row = family === 'naruto' ? narutoSealForms.indexOf(level) : -1;
  if (row >= 0) return { path: NARUTO_HAND_SEALS, row };
  const extra = EXTRA_SEAL_SHEETS[family];
  return extra ? { path: extra, row: 0 } : undefined;
}

export function actionArt(hero: string, formLevel: number) {
  const expansion=expansionSheet(hero,formLevel);
  if(expansion)return {path:expansion,kind:'full' as const,rows:6,firstRow:2,separateAcrobatics:true};
  if(revisedActionForms[hero]?.includes(formLevel))return {path:`/assets/shinobi-motion/${hero}-${formLevel}-action-v3.png`,kind:'full' as const,rows:4};
  if (hero === 'gaara') return { path: gaaraSheet(formLevel), kind: 'full' as const, rows: 6, firstRow: 2 };
  if (fullActionForms[hero]?.includes(formLevel)) {
    return { path: `/assets/shinobi-motion/${hero}-${formLevel}-action-v2.png`, kind: 'full' as const, rows: 4 };
  }
  if (hero === 'naruto' && formLevel === 1) return { path: '/assets/naruto-academia-acrobatics-v1.png', kind: 'acrobatics' as const, directional: true };
  if (hero === 'naruto' && formLevel === 10) return { path: '/assets/naruto-classico-action-v1.png', kind: 'cast' as const };
  if (hero === 'lee' || hero === 'guy') return { path: `/assets/shinobi-motion/${hero}-${formLevel}-action-v1.png`, kind: 'taijutsu' as const };
}
const sheets: Record<string, DirectionalSheet> = {
  'naruto-10': { path: '/assets/naruto-classico-motion-v1.png', rows: 2 },
  'naruto-25': { path: '/assets/naruto-shippuden-motion-v1.png', rows: 3, cast: true },
  'naruto-50': { path: '/assets/naruto-kyuubi-motion-v1.png', rows: 3, cast: true },
  'sasuke-1': { path: '/assets/sasuke-classico-motion-v1.png', rows: 2 },
  'sasuke-15': { path: '/assets/sasuke-shippuden-motion-v1.png', rows: 2 },
  'sasuke-30': { path: '/assets/sasuke-rinnegan-motion-v1.png', rows: 2 },
  'sakura-1': { path: '/assets/sakura-classico-motion-v1.png', rows: 2 },
  'sakura-15': { path: '/assets/sakura-shippuden-motion-v1.png', rows: 2 },
  'sakura-30': { path: '/assets/sakura-byakugou-motion-v1.png', rows: 2 },
  'madara-15': { path: '/assets/shinobi-motion/madara-15-walk-v1.png', rows: 2 },
  'madara-30': { path: '/assets/shinobi-motion/madara-walk-v1.png', rows: 6, firstRow: 2 },
  'hashirama-20': { path: '/assets/shinobi-motion/hashirama-20-walk-v1.png', rows: 2 },
  'orochimaru-15': { path: '/assets/shinobi-motion/orochimaru-15-walk-v1.png', rows: 2 },
  'shikamaru-15': { path: '/assets/shinobi-motion/shikamaru-15-walk-v1.png', rows: 2 },
  'shikamaru-30': { path: '/assets/shinobi-motion/shikamaru-walk-v1.png', rows: 6, firstRow: 2 },
  'temari-15': { path: '/assets/shinobi-motion/temari-15-walk-v1.png', rows: 2 },
  'kankuro-1': { path: '/assets/shinobi-motion/kankuro-1-walk-v1.png', rows: 2 },
  'kankuro-15': { path: '/assets/shinobi-motion/kankuro-15-walk-v1.png', rows: 2 },
  'kankuro-30': { path: '/assets/shinobi-motion/kankuro-30-walk-v1.png', rows: 2 },
  'kuri-1': { path: '/assets/shinobi-motion/kuri-1-walk-v1.png', rows: 2 },
};

// Cada par é frente/costas para uma forma. A ordem é a mesma das fileiras no PNG.
const rosterForms: Record<string, readonly number[]> = {
  madara: [1, 15, 30],
  hashirama: [1, 20],
  kakashi: [1, 25],
  itachi: [1, 15],
  minato: [1, 15],
  tsunade: [1, 15, 30],
  jiraiya: [1, 20],
  orochimaru: [1, 15],
  lee: [1, 15, 30],
  neji: [1, 15],
  hinata: [1, 15, 30],
  shikamaru: [1, 15, 30],
  temari: [1, 15],
  tenten: [1, 15],
  pain: [1],
  tobirama: [1],
  guy: [1, 15, 30],
  kushina: [1],
};

export function directionalArt(hero: string, formLevel: number): DirectionalSheet | undefined {
  const id = revisedDirectionalId(hero, formLevel);
  const chibi=chibiMotionArt(id);
  if(chibi)return {path:chibi.motion,rows:6};
  if (expansionDirectionalIds.has(id)) return {path:revisedDirectionalPath(id),rows:4};
  const expansion=expansionSheet(hero,formLevel);
  if(expansion)return {path:expansion,rows:6};
  if (hero === 'gaara') return { path: gaaraSheet(formLevel), rows: 6 };
  const custom = sheets[`${hero}-${formLevel}`];
  if (custom) return custom;
  const levels = rosterForms[hero];
  if (!levels) return;
  const form = levels.indexOf(formLevel);
  if (form < 0) return;
  return { path: `/assets/shinobi-motion/${hero}-walk-v1.png`, rows: levels.length * 2, firstRow: form * 2 };
}

const cardinalPairs = [
  ["lee-1","neji-1","hinata-1","kankuro-1","tenten-1"],
  ["kakashi-1","kakashi-25","itachi-1","itachi-15","asuma-1"],
  ["naruto-10","naruto-25","naruto-50","sakura-15","sakura-30"],
  ["gaara-15","gaara-30","sasuke-15","sasuke-30","shikamaru-1"],
  ["madara-1","madara-15","madara-30","hashirama-1","hashirama-20"],
  ["minato-1","minato-15","tsunade-1","tsunade-15","tsunade-30"],
  ["jiraiya-1","jiraiya-20","orochimaru-1","orochimaru-15","tobirama-1"],
  ["lee-15","lee-30","guy-1","guy-15","guy-30"],
  ["neji-15","hinata-15","hinata-30","temari-1","temari-15"],
  ["tenten-15","kankuro-15","kankuro-30","shikamaru-15","shikamaru-30"],
  ["kushina-1","pain-1"]
] as const;
const cardinalByForm=new Map<string,{path:string;rows:number;front:number;back:number}>();
cardinalPairs.forEach((ids,page)=>ids.forEach((key,index)=>{
  cardinalByForm.set(key,{path:`/assets/shinobi-motion/walk-cardinal-${page+2}.png`,rows:ids.length*2,front:index*2,back:index*2+1});
}));

type WalkRows = { path: string; rows: number; front: number; back?: number; side?: number; dashSide?: number };
/** Vistas independentes de caminhada. A ausência de vista específica mantém o recorte direcional existente. */
export function cardinalWalkArt(family: string, form: number): WalkRows | undefined {
  const exact=cardinalByForm.get(`${family}-${form}`);
  if(exact)return exact;
  if(family==='naruto'&&form===1)
    return {path:'/assets/shinobi-motion/naruto-academia-cardinal-v2.png',rows:4,front:0,back:1,side:2,dashSide:3};
  const chibi=chibiMotionArt(revisedDirectionalId(family,form));
  if(chibi)return {path:chibi.motion,rows:6,front:0,back:1};
  const row=['gaara','sasuke','sakura','zabuza'].indexOf(family)*2;
  if(form===1&&row>=0)return {path:'/assets/shinobi-motion/walk-cardinal-1.png',rows:8,front:row,back:row+1};
  const id=revisedDirectionalId(family,form);
  if(!expansionDirectionalIds.has(id))return;
  const path=expansionSheet(family,form);
  return path?{path,rows:6,front:0,back:1}:undefined;
}

// Uma fileira de quatro passos por versão, com perfil voltado à direita.
const sideWalkRows=[
  ["gaara-1","gaara-15","gaara-30","sasuke-1","sasuke-15","sasuke-30","sakura-1","sakura-15"],
  ["sakura-30","kakashi-1","kakashi-25","itachi-1","itachi-15","zabuza-1"],
  ["choji-15","naruto-70","lee-1","lee-15","guy-1","neji-1"],
  ["madara-1","madara-15","madara-30","hashirama-1","hashirama-20","kushina-1"],
  ["minato-1","minato-15","tsunade-1","tsunade-15","tsunade-30","jiraiya-1","jiraiya-20","tobirama-1"],
  ["deidara-1","hidan-1","kakuzu-1","konan-1","zetsu-1","sasori-1","kisame-1","juzo-1"],
  ["hinata-1","hinata-15","hinata-30","neji-15","tenten-1","tenten-15","temari-1","temari-15"],
  ["asuma-1","iruka-1","shikamaru-1","shikamaru-15","shikamaru-30","kankuro-1","kankuro-15","kankuro-30"],
  ["orochimaru-1","orochimaru-15","orochimaru-30","kabuto-1","kabuto-30","kimimaro-1","jugo-1","suigetsu-1"],
  ["pain-1","nagato-1","obito-1","obito-15","obito-30","shisui-1","sai-1","yamato-1"],
  ["raikage-terceiro-1","raikage-quarto-1","killer-b-1","onoki-1","rasa-1","mei-1","gengetsu-1","ao-1"],
  ["kiba-1","kiba-15","shino-1","shino-15","ino-1","ino-15","kurenai-1","karin-1"],
  ["hiruzen-1","hiashi-1","hanabi-1","hanabi-15","chiriku-1","mangetsu-1","jirobo-1","kidomaru-1"],
  ["tayuya-1","sakon-ukon-1","dosu-1","zaku-1","kin-1","lee-30","guy-15","guy-30"]
] as const;
const sideWalkById=new Map<string,{path:string;rows:number;row:number}>();
sideWalkRows.forEach((ids,page)=>ids.forEach((id,row)=>{
  sideWalkById.set(id,{path:`/assets/shinobi-motion/walk-side-${page+1}.png`,rows:ids.length,row});
}));

export function lateralWalkArt(family: string, form: number) {
  const profile=sideWalkById.get(`${family}-${form}`);
  if(profile)return profile;
  const chibi=chibiMotionArt(revisedDirectionalId(family,form));
  if(chibi)return {path:chibi.run,rows:5,row:2};
  if(family==='naruto'&&[10,25,50].includes(form))
    return {path:'/assets/shinobi-motion/naruto-classic-cardinal-v2.png',rows:6,row:[10,25,50].indexOf(form)*2+1};
  if(family==='sakumo'||(family==='choji'&&form===1))
    return {path:'/assets/shinobi-motion/sakumo-choji-lateral-v1.png',rows:2,row:Number(family==='choji')};
  const sheet=cardinalWalkArt(family,form);
  return sheet?.side!==undefined?{path:sheet.path,rows:sheet.rows,row:sheet.side}:undefined;
}
