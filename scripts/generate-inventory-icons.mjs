import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { ITEMS } from '../src/game/catalog.ts';
import { PILLS } from '../src/game/pills.ts';

// Each item has its own silhouette, materials and/or motif. Coordinates are on a 32 px grid.
// Format: stable ID, silhouette, body color, emblem, emblem color.
const recipes = `
coins pouch #a76438 coin #ffcf62
herbal-tea cup #b65e39 leaf #88d37c
ryo-nugget nugget #e6a327 shine #fff3a8
el-fire scroll #cb583b flame #f48645
el-water scroll #477cb9 drop #65d9ff
el-wind scroll #468f7b gust #abf3dc
el-earth scroll #a36e47 mountain #ebbb75
el-lightning scroll #8263ba bolt #ffdc5a
el-wood scroll #6f873c tree #b0e46c
el-sand scroll #bf8849 dune #fff1ab
el-shadow scroll #493c6b moon #d7baff
el-neutral scroll #697a92 star #c5d9ee
el-sage scroll #cf9352 frog #8ad665
genjutsu-scroll scroll #a15497 eye #f7b1ff
smoke bomb #667180 cloud #dadfe8
exorcist tag #e0c795 ward #e15867
wire spool #9faabb coil #bedef2
pickup magnet #347eac bolt #93e8ff
bandana headband #446785 spiral #c7e2f6
tanzaku tag #c84958 coin #ffe56d
life rice #eee1bd leaf #71b085
balm tin #68966f cross #e1ffe0
sandals sandals #415169 gust #a1d9ef
critical scope #665949 eye #bcefff
area-seal seal #427a99 rings #8feaff
sniper-lens lens #425e7e target #ffae60
adrenaline tag #bf4139 bolt #ffde92
sleep-incense incense #5c538b moon #ceb7ff
vampire-root root #87403d fang #ff97ab
chains chain #b68b43 ward #ffe1a2
katon-orb orb #c8452c flame #ffcc66
gold-tooth tooth #d5a63f shine #fff4ae
akimichi-box box #b64c3e rice #fff0cb
green-tea cup #57916f steam #d6ffd3
duration seal #648d89 hourglass #ddffef
experience stone #6198c5 arrow #d2fcff
stone-stance stone #726a60 mountain #f3c999
rhythm drum #ab5845 rhythm #ffd191
taijutsu glove #a5533d fist #ffe0ad
poison-herb sprig #6f9b42 skull #d8baff
swift-kunai kunai #579aa9 gust #b1fff7
crit-damage blade #7f91ad shine #ffcd80
repel incense #b98348 rings #f5edb9
thorn-armor thorn #61824d thorn #d7e994
blood-shell shell #ae536a drop #ffd0db
emergency-fruit fruit #d44e57 cross #fff0b3
dense-smoke cloud #515470 coil #adb3cf
hyoton scroll #60b4d1 snow #eeffff
poison ring #7c5399 skull #a6eb80
taunt-flute flute #97724c rhythm #ffce96
tracker goggles #728765 eye #e0f791
ninjutsu seal #5464a5 ward #b7c5ff
river-pebble pebble #648c9e drop #c4f6ff
cooldown hourglass #b28045 hourglass #f4d28b
jonin-vest vest #5d7951 pocket #a2b58d
toxic-sludge jar #817b42 skull #d6ff71
gate-band band #a94445 gates #ffbc9a
wind-scarf scarf #559e8f gust #b5fff0
chakra-goggles goggles #517fba bolt #9debff
study-scroll book #9d6748 ward #fff0bc
five-elements seal #957548 pentacle #fff090
chakra-shield shield #4786b4 rings #94f2ff
kubikiribocho cleaver #879bb1 moon #d8edff
damage tag #6c3f76 fang #efb1ff
training-weights weights #627181 fist #d4c6b4
banner banner #b04c45 star #ffdf8b
executioner axe #774d73 fang #f3bdda
luck necklace #57a780 leaf #beffd2
gama-chan frog #6d9b51 coin #ffc957
herb-tea pot #9c6953 sprig #a2d67b
insignia medal #c99c48 star #fff3a5
crit-seal seal #aa4f55 target #ffc482
chidori-nagashi scroll #4b69d1 storm #bbd9ff
speed seal #449e8f gust #abfff5
pill-gourd gourd #b87945 capsule #f5bbf3
clone mask #8b7aba twin #eee4ff
samurai-armor armor #9c5148 ward #ffd09e
kyuubi-rage fox #de6640 flame #fff0a8
shinigami-cloak cloak #655f87 skull #e1d7ff
revive scroll #d4ad60 cross #fff9c6
recruit scroll #aa7958 twin #ffd1a2
wide-seal seal #925a9b expansion #f8c0ff
iron-club club #778591 thorn #e4e8ed
sage-infusion seal #97834f frog #caf496
haku-mirror mirror #69a5c7 snow #f5ffff
sage armor #b59151 sun #fff1a0
rinne-tensei orb #8667ad rings #e3caff
red-moon orb #a63d52 eye #ffd3d9
hokage-scroll scroll #ae7b4d leaf #ffd594
tenten shuriken #797db2 ward #e3d2ff
kurama-chakra aura #e79732 fox #fff1a4
amaterasu aura #443752 flame #df9aed
forbidden-scroll scroll #713e4c skull #ffb9a8
lee bottle #4d9a69 fist #ddffd0
`.trim().split('\n').map(line => line.split(' '));

const outlines = {
  pouch:'M12 5H21V9L19 12L25 16V25L22 28H9L6 25V17L12 12L10 8Z',
  cup:'M6 11H24V13H29V21H24L21 26H10L7 22Z', nugget:'M7 10H13L17 5H23L28 12V21L22 27H10L5 23V15Z',
  scroll:'M7 5H25V10H23V23H27V28H7V24H9V10H7Z', bomb:'M14 4H23V7H20V11L26 16V24L22 28H10L5 23V16L10 11H14Z',
  tag:'M10 4H23V9L26 12L22 28H8L5 24Z', spool:'M6 8H26V12H23V21H27V26H5V21H9V12H6Z',
  magnet:'M5 6H12V20H20V6H27V22L22 28H10L5 22Z', headband:'M3 10H25L29 7V12L26 16L30 20L26 22L22 19H3Z',
  rice:'M11 8H21L26 15L29 23L25 27H7L3 23L6 15Z', tin:'M7 8H25V11H28V22L24 26H8L4 22V12Z',
  sandals:'M8 5H14L17 9L14 23L11 27H5L3 22L5 10Z M22 8H27L30 12L27 27H20L17 23Z',
  scope:'M4 18L19 7H26L29 11V16L12 27H5L3 23Z', seal:'M10 5H22L27 10V22L22 27H10L5 22V10Z',
  lens:'M11 4H22L28 10V21L22 27H10L4 21V10Z M21 24L26 22L30 27L27 30Z',
  incense:'M7 7H11V20H15V4H19V20H23V12H26V24L22 28H9L5 24V20H7Z',
  root:'M12 4H20L21 10L18 14L23 18L28 24L25 28L20 23L15 19L12 26L6 29L4 25L9 19L10 12Z',
  chain:'M7 7H17L21 11V16L25 16L29 20V26L25 29H17L13 25V21L8 21L4 17V11Z',
  orb:'M11 4H21L28 11V21L21 28H11L4 21V11Z', tooth:'M7 7H14L16 9L20 6H25L28 11L25 19L22 27H17L15 21L12 28H8L5 17V11Z',
  box:'M4 10L10 5H25L29 10V24L25 28H5L3 23Z', stone:'M9 10L17 4L26 8L29 18L24 26H7L3 20Z',
  drum:'M6 8L11 4H23L28 8V24L23 28H10L4 24V11Z', glove:'M7 14V7H11V5H15V7H18V6H22V9H26V19L21 23V28H9V22L4 17V12Z',
  sprig:'M14 28V20L5 17L3 10H9L14 14V8L20 3L24 5V12L20 16L27 11L30 14L27 21L18 24V28Z',
  kunai:'M26 3L29 13L21 21L17 19L12 24L13 27L10 30H5L2 27V23L6 20H10L16 16L15 12Z',
  blade:'M27 3L30 9L20 21L17 20L10 28H5L3 25L13 16L13 13Z',
  thorn:'M5 6L10 9L13 5H20L23 10L28 6L27 16L24 19V28H8V20L4 16Z',
  shell:'M5 19L4 13L10 6L15 4L21 6L28 12V19L22 24L17 28L11 25Z',
  fruit:'M16 8L18 3H24L22 7L18 9L23 8L28 13V21L23 28H10L4 22V14L9 9Z',
  cloud:'M7 14L8 8L14 5L20 8L24 8L27 13L29 16V22L24 26H9L3 21V17Z',
  ring:'M11 4H21L26 9V16L28 20L25 27H7L4 21L7 16V9Z',
  flute:'M4 23L25 5H29V10L9 28H5Z', goggles:'M3 9H13L16 12L19 9H29V20L25 24H19L16 21L13 24H7L3 21Z',
  pebble:'M5 15L12 10H23L28 15V22L24 25H8L4 21Z', hourglass:'M6 4H26V8H23V12L19 16L23 20V24H26V28H6V24H9V20L13 16L9 12V8H6Z',
  vest:'M9 5H13L16 9L19 5H23L26 12V27H6V12Z',
  jar:'M9 4H23V9L26 13V24L22 28H10L6 24V13L9 9Z',
  band:'M3 10L13 6L27 7L30 13L26 20L17 21L13 27L10 24L12 20L4 21Z',
  scarf:'M6 6H24L28 10V15L23 18L26 26L19 29L16 20H10L4 16V10Z',
  book:'M5 6H24L28 10V26H8L4 23V8Z', shield:'M5 7L16 3L27 7V20L16 29L5 20Z',
  cleaver:'M25 3H29V15L21 21H14L8 28H4L2 25L9 17V11L15 5Z',
  weights:'M5 8H12V11H20V8H27V12H30V22H27V25H20V22H12V25H5V22H2V12H5Z',
  banner:'M7 4H27V20L20 26L16 22L8 26V8H5V29H3V4Z',
  axe:'M17 5L26 3L30 8V16L23 22L16 20L8 28H4L3 24L15 14V8Z',
  necklace:'M6 6H10L11 12L16 17L21 12L22 6H26V13L21 20V24L16 29L11 24V20L6 13Z',
  frog:'M5 11V7H12L16 10L20 7H27V13L29 18V24L24 28H8L3 24V17Z',
  pot:'M8 7H23V11H26V15H30V21H26L22 27H10L5 22V17H2V13H8Z',
  medal:'M9 3H23L21 12L26 18V24L21 29H11L6 24V18L11 12Z',
  gourd:'M12 4H20V7L23 10V14L21 16L27 20V25L23 29H9L5 25V20L11 16L9 14V10Z',
  mask:'M5 5L16 8L27 5V19L23 25L16 29L9 25L5 19Z',
  armor:'M4 8L11 5L16 8L21 5L28 8V16L24 19V28H8V19L4 16Z',
  fox:'M5 3L13 9H19L27 3V15L29 20L21 23L16 29L11 23L3 20L5 15Z',
  cloak:'M12 5H20L24 9L23 13L29 27L21 25L16 29L10 25L3 27L9 13L8 9Z',
  club:'M20 3H27L30 6V13L23 20H17L9 28H5L3 25L12 15V11Z',
  mirror:'M12 3H21L29 11V21L21 29H11L3 21V11Z',
  shuriken:'M16 2L20 11L30 16L21 20L16 30L12 21L2 16L11 12Z',
  aura:'M6 21L4 15L9 17L7 8L13 12L16 3L21 9L22 15L27 10L28 22L22 28H10Z',
  bottle:'M11 4H21V10L26 14V25L23 28H9L6 25V14L11 10Z',
};
const marks = {
  coin:'M11 8H21V11H24V21H21V24H11V21H8V11H11Z M14 12V20H18V12Z',
  leaf:'M8 22V15L14 9L24 8L23 17L17 23H11L7 26L5 24Z',
  shine:'M14 5H18V13H25V17H18V25H14V17H7V13H14Z',
  flame:'M11 23L8 19V14L12 16L11 10L17 5L17 12L21 15L24 12V20L20 25H13Z',
  drop:'M16 6L24 17V22L20 25H12L8 22V17Z',
  gust:'M6 12H18L21 8H25V12L21 16H6Z M10 18H25V21H20L17 24H10Z',
  mountain:'M5 23L12 10L16 16L21 8L28 23Z', bolt:'M16 6H24L19 14H24L12 26L14 18H8Z',
  tree:'M16 5L23 14H20L26 21H19V26H13V21H6L12 14H9Z',
  dune:'M5 22L10 15L16 19L21 12L27 22Z M21 6H25V10H21Z',
  moon:'M20 7H13L8 11V21L13 25H22L26 20H17L13 16V12Z',
  star:'M16 6L19 12L26 13L21 18L23 25L16 22L9 25L11 18L6 13L13 12Z',
  frog:'M7 11H11V8H15V11H18V8H22V11H26V22H22V25H10V22H6Z M10 16V19H22V16Z',
  eye:'M5 16L11 11H21L27 16L21 21H11Z M14 13V19H18V13Z',
  cloud:'M7 19V15H11V11H17V14H23V17H26V22H7Z',
  ward:'M9 8H23V11H18V15H23V18H18V24H14V18H9V15H14V11H9Z',
  coil:'M8 10H24V22H12V14H20V17H15V19H21V13H8Z',
  spiral:'M8 11H23V23H12V15H19V18H15V20H20V14H8Z',
  cross:'M13 7H19V13H25V19H19V25H13V19H7V13H13Z',
  rings:'M10 8H22V10H24V22H22V24H10V22H8V10H10Z M12 12V20H20V12Z',
  target:'M13 6H19V12H25V19H19V25H13V19H7V12H13Z M14 14V17H18V14Z',
  fang:'M7 9H25L21 15L17 24H12L14 15L9 14Z',
  rice:'M12 11H20L26 23H6Z M14 19V24H18V19Z', steam:'M11 9H14V14H11V18H8V13H11Z M20 8H23V13H20V17H17V12H20Z',
  hourglass:'M9 7H23V10L18 16L23 22V25H9V22L14 16L9 10Z',
  arrow:'M16 6L25 15H20V24H12V15H7Z', rhythm:'M6 16H11V9H14V21H17V12H20V16H26V19H20V24H11V19H6Z',
  fist:'M9 10H22V14H25V20L20 24H12L7 19V14H9Z',
  skull:'M10 9H22L25 12V20L21 22V25H11V22L7 20V12Z M10 15V18H14V15Z M18 15V18H22V15Z',
  thorn:'M7 23L13 9L16 18L24 6L25 15L21 25Z',
  snow:'M14 6H18V12L23 9L25 13L20 16L25 20L23 23L18 20V26H14V20L9 23L7 20L12 16L7 13L9 9L14 12Z',
  pocket:'M8 10H24V14H21V23H11V14H8Z', gates:'M7 8H25V12H21V24H18V12H14V24H11V12H7Z',
  pentacle:'M16 5L25 12V21L16 26L7 21V12Z M16 10L12 14V19L16 21L20 19V14Z',
  sprig:'M14 25V19L7 16V11L14 14V9L22 6V13L18 16V21L25 17V22L18 25Z',
  storm:'M14 6H21L17 12H23L18 17H24L12 26L14 19H8L13 14H8Z',
  capsule:'M9 17L17 9H23V15L15 23H9Z', twin:'M6 10H14V18H6Z M18 10H26V18H18Z M8 20H12V24H8Z M20 20H24V24H20Z',
  expansion:'M5 5H13V8H8V13H5Z M19 5H27V13H24V8H19Z M5 19H8V24H13V27H5Z M24 19H27V27H19V24H24Z M13 13H19V19H13Z',
  sun:'M13 6H19V10H23V14H27V18H23V22H19V26H13V22H9V18H5V14H9V10H13Z',
  fox:'M7 7L13 12H19L25 7V18L16 25L7 18Z', sword:'M23 6H26V12L15 23H10L7 26L5 23L9 19V16L13 18Z',
  book:'M7 8H15L17 10L20 8H26V22H20L17 24L14 22H7Z',
};
const pillMarks = {
 soldado:'fist', elemental:'pentacle', ferro:'shield', vento:'gust', akimichi:'rice', clone:'twin',
 relampago:'bolt', arremesso:'sword', falcao:'eye', nevoa:'cloud', genjutsu:'spiral',
 expansao:'expansion', persistencia:'hourglass', cura:'cross', mercador:'coin', pergaminho:'book',
 fortuna:'leaf', ima:'rings', hiden:'ward',
};
// Keep the capsule silhouette recognizable at HUD scale.
marks.shield = outlines.shield;
const outline = '#1a2031';
const tint = (hex, multiplier) => '#' + hex.slice(1).match(/../g).map(n =>
  Math.min(255, Math.round(parseInt(n, 16) * multiplier)).toString(16).padStart(2, '0')
).join('');
const path = (d, fill, stroke = '', extra = '') =>
  `<path d="${d}" fill="${fill}" fill-rule="evenodd"${stroke ? ` stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"` : ''} ${extra}/>`;
const badge = (mark, color, transform) => path(marks[mark], color, outline, `transform="${transform}"`);
const svg = content => `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" shape-rendering="crispEdges">${content}</svg>\n`;
function itemArt(shape, color, mark, accent, id) {
 const body = outlines[shape];
 const narrow = ['scope','flute','kunai','blade','cleaver','axe','club','chain','sandals'].includes(shape);
 const decoration = narrow ? 'translate(13 4) scale(.44)' : 'translate(6 6) scale(.63)';
 const scroll = shape === 'scroll' ? '<path d="M10 10H22V23H10Z" fill="#f0d6a7"/><path d="M8 6H24V8H8ZM8 25H26V27H8Z" fill="#fff0c0" opacity=".42"/>' : '';
 return svg(`<defs><clipPath id="silhouette">${path(body,'white')}</clipPath></defs>
 ${path(body,color,outline)}
 <g clip-path="url(#silhouette)">
 ${path('M0 20H10V23H18V25H25V15H32V32H0Z',tint(color,.61))}
 ${path('M0 4H25V7H14V10H8V14H0Z',tint(color,1.35))}
 ${scroll}</g>
 ${badge(mark,accent,decoration)}
 ${id === 'forbidden-scroll' ? '<path d="M6 9H26V11H6ZM6 22H26V24H6Z" fill="#7b2633"/>' : ''}`);
}
function pillArt(pill) {
 const body = 'M7 26L4 23V18L17 5H23L28 10V16L15 29H10Z';
 return svg(`${path(body,pill.color,outline)}
 ${path('M5 20L11 14L19 22L13 28H9L5 24Z','#eee2cb')}
 ${path('M17 7H22L24 9L20 9L15 14L12 13Z',tint(pill.color,1.45))}
 ${badge(pillMarks[pill.id],'#fff2d7','translate(11 6) scale(.48)')}`);
}

const itemIds = new Set(ITEMS.map(item => item.id));
assert.equal(recipes.length, itemIds.size, 'Cada item precisa de uma receita');
assert.equal(new Set(recipes.map(([id]) => id)).size, recipes.length, 'IDs duplicados');
assert.deepEqual(new Set(Object.keys(pillMarks)), new Set(PILLS.map(pill => pill.id)));
const output = new URL('../public/assets/inventory/', import.meta.url);
mkdirSync(output, { recursive: true });
const art = new Set();
function save(file, content) {
 assert.ok(!art.has(content), `Ícone duplicado: ${file}`);
 art.add(content);
 writeFileSync(new URL(file, output), content);
}
for (const [id, shape, color, mark, accent] of recipes) {
 assert.ok(itemIds.has(id) && outlines[shape] && marks[mark], `Receita inválida: ${id}`);
 save(`item-${id}.svg`, itemArt(shape, color, mark, accent, id));
}
for (const pill of PILLS) save(`pill-${pill.id}.svg`, pillArt(pill));
console.log(`${ITEMS.length} itens e ${PILLS.length} pílulas com arte individual.`);
