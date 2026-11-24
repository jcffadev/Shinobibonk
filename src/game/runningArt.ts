import { chibiMotionArt } from './rosterExpansion.ts';

const RUNNERS_PER_ATLAS = 2;
const VIEWS_PER_RUNNER = 5;
// Cada par ocupa dez fileiras: frente, costas, perfil e as duas diagonais de cada versão.
const runners = [
  ["naruto","naruto-genin"],
  ["zabuza","haku"],
  ["gaara","gaara-kazekage"],
  ["choji","sakumo"],
  ["naruto-shippuden","naruto-kyuubi"],
  ["sasuke","sakura"],
  ["hanzo","kakashi"],
  ["ao","asuma"],
  ["chiriku","choji-guerra"],
  ["deidara","dosu"],
  ["gaara-alianca","gengetsu"],
  ["guy","guy-sexto-portao"],
  ["guy-setimo-portao","hanabi"],
  ["hanabi-adulta","hashirama"],
  ["hashirama-sabio","hiashi"],
  ["hidan","hinata"],
  ["hinata-shippuden","hinata-leoes"],
  ["hiruzen","ino"],
  ["ino-guerra","iruka"],
  ["itachi","itachi-akatsuki"],
  ["jiraiya","jiraiya-sabio"],
  ["jirobo","jugo"],
  ["juzo","kabuto"],
  ["kabuto-sabio","kakashi-hokage"],
  ["kakuzu","kankuro"],
  ["kankuro-shippuden","kankuro-alianca"],
  ["karin","kiba"],
  ["kiba-shippuden","kidomaru"],
  ["killer-b","kimimaro"],
  ["kin","kisame"],
  ["konan","kurenai"],
  ["kushina","lee"],
  ["lee-shippuden","lee-portoes"],
  ["madara","madara-rinnegan"],
  ["madara-seis-caminhos","mangetsu"],
  ["mei","minato"],
  ["minato-hokage","nagato"],
  ["naruto-hokage","neji"],
  ["neji-jonin","obito"],
  ["tobi-akatsuki","obito-guerra"],
  ["onoki","orochimaru"],
  ["orochimaru-som","orochimaru-akatsuki"],
  ["pain","raikage-quarto"],
  ["raikage-terceiro","rasa"],
  ["sai","sakon-ukon"],
  ["sakura-shippuden","sakura-byakugou"],
  ["sasori","sasuke-shippuden"],
  ["sasuke-rinnegan","shikamaru"],
  ["shikamaru-estrategista","shikamaru-conselheiro"],
  ["shino","shino-shippuden"],
  ["shisui","suigetsu"],
  ["tayuya","temari"],
  ["temari-shippuden","tenten"],
  ["tenten-shippuden","tobirama"],
  ["tsunade","tsunade-hokage"],
  ["tsunade-byakugou","yamato"],
  ["zaku","zetsu"],
] as const;

const sheets = new Map<string, { path: string; rows: number; firstRow: number }>();
runners.forEach((pair, page) => {
  const path = `/assets/shinobi-motion/corrida-${String(page + 1).padStart(2, '0')}.png`;
  pair.forEach((id, slot) => sheets.set(id, {
    path,
    rows: RUNNERS_PER_ATLAS * VIEWS_PER_RUNNER,
    firstRow: slot * VIEWS_PER_RUNNER,
  }));
});

export function runningArt(heroId: string) {
  const chibi=chibiMotionArt(heroId);
  return chibi ? {path:chibi.run,rows:VIEWS_PER_RUNNER,firstRow:0} : sheets.get(heroId);
}

export function runningRow(back: boolean, diagonal: boolean, lateral: boolean) {
  if (lateral) return 2;
  return (diagonal ? 3 : 0) + Number(back);
}
