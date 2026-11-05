import fs from 'node:fs';
let s=fs.readFileSync('src/game/heroes.ts','utf8').replace("t('Corte de Kusanagi','Taijutsu','Neutro','Cone')","t('Shuriken Uchiha','Taijutsu','Neutro','Em V')").replace("t('Rasengan do Sábio','Ninjutsu','Vento'","t('Rasengan do Sábio','Ninjutsu','Sábio'");
s+="\nHERO_BY_ID.hinata.techniques[1].unlockLevel=15;\nHERO_BY_ID.guy.techniques[2].unlockLevel=15;\nHERO_BY_ID.guy.techniques[3].unlockLevel=30;\n";
fs.writeFileSync('src/game/heroes.ts',s);
s=fs.readFileSync('src/scene/GameCanvas.tsx','utf8').replace("import { formAt,","import { ZONES } from '../game/missions';\nimport { formAt,");
s=s.replace("id=forcedId??candidates[Math.floor(Math.random()*candidates.length)]?.id??heroId", "id=forcedId??(guardian?ZONES[zone-1].guardians[Math.floor(Math.random()*ZONES[zone-1].guardians.length)]:candidates[Math.floor(Math.random()*candidates.length)]?.id)??heroId");
fs.writeFileSync('src/scene/GameCanvas.tsx',s);
s=fs.readFileSync('src/main.tsx','utf8').replace("import { formAt }","import { ZONES } from './game/missions';\nimport { formAt }");
s=s.replace('<div className="mission-list">','<div className="mission-zones">{ZONES.map((zone,index)=><article key={zone.name}><small>ZONA {index+1} · {index===0?\'10:00–6:40\':index===1?\'6:40–3:20\':\'3:20–0:00\'}</small><h3>{zone.name}</h3><p>{zone.description}</p><div className="zone-guardians">{zone.guardians.map(id=><span key={id}><HeroPortrait id={id}/><small>{HERO_BY_ID[id].name}</small></span>)}</div><small>Guardião: um dos shinobis acima, sorteado durante a missão.</small></article>)}</div><div className="mission-list">');
fs.writeFileSync('src/main.tsx',s);

