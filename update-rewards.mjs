import fs from 'node:fs';let s=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
function r(a,b){if(!s.includes(a))throw Error('Missing '+a.slice(0,100));s=s.replace(a,b);}
function range(a,b,next){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error(a);s=s.slice(0,start)+next+s.slice(end);}
r("import { ITEM_BY_NAME", "import { choiceCount, choiceUses, weaponPrice } from '../game/preparation';\nimport { ITEM_BY_NAME");
r('effects: number };', 'effects: number; choices:{reroll:number;skip:number;ban:number;banning:boolean}; weaponCost:number; permanent:Record<string,number> };');
r('ping:null, effects: 0 }', 'ping:null, effects: 0,choices:{reroll:3,skip:3,ban:3,banning:false},weaponCost:20,permanent:{} }');
r('heroId, mission, itemPool, enabled', 'heroId, mission, itemPool, preparation, enabled');
r('itemPool:Item[]; enabled:', 'itemPool:Item[]; preparation:{permanent:Record<string,number>;archivedSkills:string[];archivedPills:string[]}; enabled:');
r('const itemPoolRef=useRef(itemPool);', 'const preparationRef=useRef(preparation);preparationRef.current=preparation;\n  const itemPoolRef=useRef(itemPool);');
r('const container = host.current; if (!container) return;', 'const container = host.current; if (!container) return;\n    const config=preparationRef.current,permanent={...config.permanent},uses=choiceUses(permanent),banned=new Set<string>();let banning=false,paidWeapons=0;');
r('let stats=calculateStats(heroId,1),allyTimer=0;', 'let stats=calculateStats(heroId,1,{},{},0,permanent),allyTimer=0;');
r('calculateStats(heroId,level,knownItems,knownPills,bonusHp)', 'calculateStats(heroId,level,knownItems,knownPills,bonusHp,permanent)');
r("const pillNames=['Pílula Rubra','Pílula Verde','Pílula Azul'];", "const pillNames=['Pílula Rubra','Pílula Verde','Pílula Azul'].filter(name=>!config.archivedPills.includes(name));");
r('    const toOffer=', '    skillLevels[skillNames[heroId][0]]=1;\n    const toOffer=');
r('rollItems(itemPoolRef.current,knownItems,stats.luck,3)', 'rollItems(itemPoolRef.current.filter(i=>!banned.has(i.name)),knownItems,stats.luck,choiceCount(permanent))');
range('    const rollLevelOffers=', '    function chooseLevelOffer', `    const rollLevelOffers=():LevelOffer[]=>{
      const learned=Object.keys(skillLevels).length,maxSkills=permanent['Quarta técnica']?4:3;
      const skills=(skillNames[heroId]??skillNames.naruto).filter(name=>!config.archivedSkills.includes(name)&&!banned.has(name)&&(skillLevels[name]||0)<9&&((skillLevels[name]||0)>0||learned<maxSkills));
      const skill=skills[Math.floor(Math.random()*skills.length)],pills=pillNames.filter(name=>!banned.has(name)),pill=pills[Math.floor(Math.random()*pills.length)];
      const cards:LevelOffer[]=[];
      if(skill)cards.push({id:'skill-'+skill,kind:'skill',name:skill,rarity:'Incomum',icon:'⚔️',description:skillLevels[skill]?'Nível '+skillLevels[skill]+' → '+(skillLevels[skill]+1)+': +12% dano e +8% área desta técnica.':'Nova técnica automática. Ocupa um espaço de habilidade.'});
      if(pill)cards.push({id:'pill-'+pill,kind:'pill',name:pill,rarity:'Comum',icon:'💊',description:pill==='Pílula Rubra'?'+8% dano total.':pill==='Pílula Verde'?'+12 HP máximo.':'+8% velocidade de recarga da Ultimate.'});
      cards.push(...rollItems(itemPoolRef.current.filter(i=>!banned.has(i.name)),knownItems,stats.luck,choiceCount(permanent)-cards.length).map(toOffer));
      if(cards.length<choiceCount(permanent))cards.push({id:'hp',kind:'stat',name:'Vitalidade',rarity:'Comum',icon:'❤️',description:'+18 HP máximo e cura do valor acrescentado. Pool elegível reduzido.'});
      return cards.slice(0,choiceCount(permanent));
    };
    function rewardAction(action:'reroll'|'skip'|'ban'){
      if(!choiceData||defeated||sealing||uses[action]<=0)return;
      if(action==='ban'){banning=!banning;return;}
      uses[action]--;banning=false;
      if(action==='skip'){choiceData=null;keys.clear();eventToast='Recompensa pulada; usos restantes: '+uses.skip;}
      else choiceData=choiceLevel===0?rollMegaLoot():rollLevelOffers();
    }
`);
r("if(!offer)return;if(offer.kind==='skill')skillLevels[offer.name]=Math.min(9,(skillLevels[offer.name]||1)+1);", "if(!offer)return;if(banning){if(offer.kind==='stat'){eventToast='Vitalidade é a opção de reserva e não pode ser banida.';return;}banned.add(offer.name);uses.ban--;banning=false;eventToast=offer.name+' banido das próximas ofertas desta run';choiceData=choiceLevel===0?rollMegaLoot():rollLevelOffers();return;}if(offer.kind==='skill')skillLevels[offer.name]=Math.min(9,(skillLevels[offer.name]||0)+1);");
r("if(choiceData){if(['1','2','3','4'].includes(key))", "if(choiceData){if(e.repeat)return;if(key==='f'){rewardAction('reroll');return;}if(key==='x'){rewardAction('skip');return;}if(key==='z'){rewardAction('ban');return;}if(['1','2','3','4'].includes(key))");
r('if(bestPickup){bestPickup.active=false;', "if(bestPickup){if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){const cost=weaponPrice(paidWeapons);if(runMoney<cost){eventToast='São necessários '+cost+' Ryu para abrir esta recompensa.';return;}runMoney-=cost;paidWeapons++;}bestPickup.active=false;");
r("if(bestPickup.kind==='kunai')kunai++;else if(bestPickup.kind==='shuriken')shuriken++;", "if(bestPickup.kind==='kunai'||bestPickup.kind==='shuriken'){if(bestPickup.kind==='kunai')kunai++;else shuriken++;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}");
r("if(Math.random()<.10)addDrop", "if(pillNames.length&&Math.random()<.10)addDrop");
r("else if(roll<.86){const pill=", "else if(roll<.86&&pillNames.length){const pill=");
r('const techniqueIndex=basicAttackIndex++%4,', 'const learnedIndices=skillNames[heroId].map((name,i)=>skillLevels[name]>0?i:-1).filter(i=>i>=0),techniqueIndex=learnedIndices[basicAttackIndex++%learnedIndices.length],');
r('description:"Aperte E para coletar"', "description:p.kind==='kunai'||p.kind==='shuriken'?'E · '+weaponPrice(paidWeapons)+' Ryu · escolher 1 de '+choiceCount(permanent)+' itens':'E · coletar recompensa grátis'");
r('effects:effects.length});', 'effects:effects.length,choices:{...uses,banning},weaponCost:weaponPrice(paidWeapons),permanent});');
r('hp:stats.maxHp,maxHp:stats.maxHp,stats});','hp:stats.maxHp,maxHp:stats.maxHp,stats,permanent,skillLevels:{...skillLevels},choices:{...uses,banning:false}});');
fs.writeFileSync('src/scene/GameCanvas.tsx',s);
