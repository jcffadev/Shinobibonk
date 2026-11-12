// Layout fixo do atlas, separado da ordem de exibição do catálogo.
const itemPages = [
  ["coins","herbal-tea","ryo-nugget","el-fire","el-water","el-wind","el-earth","el-lightning","el-wood","el-sand","el-shadow","el-neutral","el-sage","genjutsu-scroll","smoke","exorcist","wire","pickup","bandana","tanzaku","life","balm","sandals","critical","area-seal"],
  ["sniper-lens","adrenaline","sleep-incense","vampire-root","chains","katon-orb","gold-tooth","akimichi-box","green-tea","duration","experience","stone-stance","rhythm","taijutsu","poison-herb","swift-kunai","crit-damage","repel","thorn-armor","blood-shell","emergency-fruit","dense-smoke","hyoton","poison","taunt-flute"],
  ["tracker","ninjutsu","river-pebble","cooldown","jonin-vest","toxic-sludge","gate-band","wind-scarf","chakra-goggles","study-scroll","five-elements","chakra-shield","kubikiribocho","damage","training-weights","banner","executioner","luck","gama-chan","herb-tea","insignia","crit-seal","chidori-nagashi","speed","pill-gourd"],
  ["clone","samurai-armor","kyuubi-rage","shinigami-cloak","revive","recruit","wide-seal","iron-club","sage-infusion","haku-mirror","sage","rinne-tensei","red-moon","hokage-scroll","tenten","kurama-chakra","amaterasu","forbidden-scroll","lee"],
];
const pills = ["soldado","elemental","ferro","vento","akimichi","clone","relampago","arremesso","falcao","nevoa","genjutsu","expansao","persistencia","cura","mercador","pergaminho","fortuna","ima","hiden"];

// Divisórias medidas em pixels nas regiões transparentes de cada imagem.
const boundaries = [
  { x:[0,253,495,752,1000,1263], y:[0,249,498,749,997,1246] },
  { x:[0,253,499,748,1002,1263], y:[0,256,497,730,978,1246] },
  { x:[0,256,498,748,998,1263], y:[0,249,498,737,987,1246] },
  { x:[0,253,502,754,1004,1263], y:[0,250,502,748,997,1246] },
  { x:[0,253,505,758,1010,1263], y:[0,269,527,785,1048] },
];

function atlasCell(path: string, index: number, sheet: number) {
  const {x, y} = boundaries[sheet];
  const column = index % 5, row = Math.floor(index / 5);
  const width = x[column + 1] - x[column], height = y[row + 1] - y[row];
  return {
    backgroundImage: `url(${path})`,
    backgroundSize: `${126300 / width}% ${124600 / height}%`,
    backgroundPosition: `${100 * x[column] / (1263 - width)}% ${100 * y[row] / (1246 - height)}%`,
  };
}

const itemCells = Object.fromEntries(itemPages.flatMap((ids, page) =>
  ids.map((id, index) => [id, atlasCell(`/assets/inventory-v3-${page + 1}.png`, index, page)])));
/** Itens novos sem célula no atlas usam um SVG avulso em /assets/inventory/ até ganharem arte no atlas.
 *  Rodada 47: a Isca Shinobi (`shinobi-bait`) migrou para PÍLULA (pills.ts) — lista fica vazia; a cápsula
 *  colorida com glifo (PillIcon) cobre o ícone sem arte nova, como as demais pílulas. */
const looseItems: Record<string, ReturnType<typeof atlasCell>> = Object.fromEntries([]);
export const itemArt = (id: string) => itemCells[id] ?? looseItems[id];
export const pillArt = Object.fromEntries(pills.map((id, index) => [id, atlasCell('/assets/pills-v3.png', index, 4)]));
