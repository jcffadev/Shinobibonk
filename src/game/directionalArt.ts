type DirectionalSheet = { path: string; rows: number; firstRow?: number; cast?: boolean };
const fullActionForms: Record<string, readonly number[]> = {
  sakura: [1, 15, 30],
  sasuke: [30],
  itachi: [15],
  madara: [1, 15, 30],
};
const revisedActionForms:Record<string,readonly number[]>={
  sasuke:[15],hashirama:[1,20],kakashi:[1,25],itachi:[1],
  minato:[1,15],tsunade:[1,15,30],jiraiya:[1,20],orochimaru:[1,15],
  hinata:[1,15,30],pain:[1],shikamaru:[1,15,30],tobirama:[1],
  temari:[1,15],tenten:[1,15],
};
export function acrobaticsArt(family:string,form:number){
  if((family==='naruto'&&form>1)||family==='lee'||family==='guy')
    return {path:`/assets/shinobi-motion/${family}-${form}-acrobatics-v2.png`,kind:'acrobatics' as const,directional:true,rows:2,firstRow:0};
}

const gaaraSheet = (level: number) => `/assets/shinobi-motion/gaara-${level}-motion-v2.png`;
export const NARUTO_HAND_SEALS = '/assets/shinobi-motion/naruto-hand-seal-v1.png';
const narutoSealForms = [1, 10, 25, 50];
export function handSealArt(family: string, level: number) {
  const row = family === 'naruto' ? narutoSealForms.indexOf(level) : -1;
  return row < 0 ? undefined : { path: NARUTO_HAND_SEALS, row };
}

export function actionArt(hero: string, formLevel: number) {
  if(revisedActionForms[hero]?.includes(formLevel))return {path:`/assets/shinobi-motion/${hero}-${formLevel}-action-v3.png`,kind:'full' as const,rows:4};
  if (hero === 'gaara') return { path: gaaraSheet(formLevel), kind: 'full' as const, rows: 6, firstRow: 2 };
  if (fullActionForms[hero]?.includes(formLevel)) {
    return { path: `/assets/shinobi-motion/${hero}-${formLevel}-action-v2.png`, kind: 'full' as const, rows: 4 };
  }
  if (hero === 'neji') return { path:'/assets/shinobi-motion/neji-action-v1.png', kind:'acrobatics' as const, rows:4, firstRow:formLevel>=15?2:0 };
  if (hero === 'naruto' && formLevel === 1) return { path: '/assets/naruto-academia-acrobatics-v1.png', kind: 'acrobatics' as const, directional: true };
  if (hero === 'naruto' && formLevel === 10) return { path: '/assets/naruto-classico-action-v1.png', kind: 'cast' as const };
  if (hero === 'sasuke' && formLevel === 1) return { path: '/assets/sasuke-classico-action-v1.png', kind: 'acrobatics' as const };
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
  if (hero === 'gaara') return { path: gaaraSheet(formLevel), rows: 6 };
  const custom = sheets[`${hero}-${formLevel}`];
  if (custom) return custom;
  const levels = rosterForms[hero];
  if (!levels) return;
  const form = levels.indexOf(formLevel);
  if (form < 0) return;
  return { path: `/assets/shinobi-motion/${hero}-walk-v1.png`, rows: levels.length * 2, firstRow: form * 2 };
}
