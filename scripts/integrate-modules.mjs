import fs from 'node:fs';
function edit(file,fn){let s=fs.readFileSync(file,'utf8');const replace=(a,b)=>{if(!s.includes(a))throw Error(file+': missing '+a.slice(0,90));s=s.replace(a,b);};fn(replace);fs.writeFileSync(file,s);}
edit('src/game/progression.ts',r=>{
 r('maxHp:number;damage:number','sage:number;maxHp:number;damage:number');
 r('maxHp:Math.round','sage:add(\'sage\'),maxHp:Math.round');
 r("damage:base.damage*(1+n*.01)*(1+add('damage')+(pills['Pílula Rubra']||0)*.08+p('Treinamento')*.04)","damage:base.damage*(1+n*.01)*(1+add('damage')+(pills['Pílula Rubra']||0)*.08+p('Treinamento')*.04)*(heroId==='gaara'?1+(base.armor*(1+n*.005)+add('defense')+p('Couraça')*2)*.01:1)");
});
edit('src/game/combat.ts',r=>{
 r('[60,25,10,4,1]','[90,9.889,.1,.01,.001]');
 r('b.damage||b.crit','b.sage||b.damage||b.crit');
 r("item.id==='poison'?'Veneno':'Universal'","item.bonuses.sage?'Sábio':item.id==='poison'?'Veneno':'Universal'");
});
edit('src/ui/SkillIcon.tsx',r=>{
 r('// Ícones',"import { HEROES } from '../game/heroes';\n// Ícones");
 r("const color=heroId===", "const technique=HEROES.flatMap(h=>h.techniques).find(t=>t.name===name);\n  const color=technique?.color??(heroId===");
 r("'#64d8ff';","'#64d8ff');");
 r('const glyph=heroId===',"const glyph=name.includes('Rasengan')?'spiral':name.includes('Bunshin')?'clone':technique?({Madeira:'roots',Areia:technique.shape==='Área'?'coffin':'spikes',Fogo:'fire',Sombra:'armor',Sábio:'forest',Água:'wave',Vento:'wave',Raio:'spikes',Terra:'meteor',Neutro:technique.shape==='Corpo a corpo'?'wood':'star'}[technique.element]):heroId===");
});
edit('src/main.tsx',r=>{
 r("type Hero =", "type OldHero =");
 r('const heroes: Hero[] = [','const unusedHeroes: OldHero[] = [');
 r("import { PASSIVES", "import { HEROES as heroes, HERO_BY_ID, skillPool } from './game/heroes';\nimport { formAt } from './game/evolution';\nimport { affectedTechniques, itemSchools, itemElement, itemAttribute } from './game/combat';\nimport { PASSIVES");
});
// Remove obsolete duplicated catalogs; runtime now has a single source of truth.
let main=fs.readFileSync('src/main.tsx','utf8');
main=main.replace(/type OldHero =[\s\S]*?function readJson/, 'function readJson');
main=main.replace(/const attackList = useMemo\([\s\S]*?\n\n  const guestEntry/,"const attackList = useMemo(() => skillPool(hero.id).map(t=>({...t,source:hero.skills.includes(t.name)?'Kit do shinobi':'Compartilhada · '+hero.village,level:'Nível '+t.unlockLevel})), [hero]);\n\n  const guestEntry");
fs.writeFileSync('src/main.tsx',main);
