import fs from 'node:fs';
import { calculateStats,heroDamageScale,difficultyAt,xpToLevelUp } from '../src/game/progression.ts';
import { megaEliteHp,ENEMY_TIERS } from '../src/game/enemyTiers.ts';
import { guardianVitality,guardianDefense } from '../src/game/missions.ts';

const levels=[1,10,25,50,100,250,1000].map(level=>{
 const s=calculateStats('naruto',level);
 return {level,damage:s.damage,baseMultiplier:heroDamageScale(level),hp:s.maxHp,attackSpeed:s.attackSpeed,crit:s.crit,xpNext:xpToLevelUp(level)};
});
const enemies=[0,2,5,10,18,30].map(minutes=>{
 const seconds=minutes*60,overtime=Math.max(0,seconds-600);
 const d=difficultyAt('Genin',seconds,1,overtime);
 const megaHp=megaEliteHp(seconds,1);
 const megaDefense=Math.min(.85,ENEMY_TIERS.mega.defense*(.60+.40*Math.min(1,seconds/480))+d.armor);
 const guardianHp=guardianVitality(d.hp,seconds,seconds,overtime,1);
 const defense=guardianDefense(seconds);
 return {minutes,normalHp:Math.round(22*d.hp),megaHp,megaDefense,megaEffectiveHp:megaHp/(1-megaDefense),guardianHp,guardianDefense:defense,guardianEffectiveHp:guardianHp/(1-defense),spawnPerSecond:d.spawnPerSecond,cap:d.cap};
});
const report={date:new Date().toISOString(),kind:'formula-snapshot',
 assumptions:{hero:'naruto (Academia)',mission:'Genin',zone:1,curse:1,items:[],pills:[],permanent:[],powerlevel:[],debug:'padrão',timing:'Permanece na zona 1; Final Swarm após 600 s',scope:'Fórmulas atuais, não uma run medida. Dano base não é DPS nem dano final de uma técnica.'},
 levels,enemies};
fs.mkdirSync('artifacts',{recursive:true});
fs.writeFileSync('artifacts/balance-baseline.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
