import fs from 'node:fs';
const path='src/scene/GameCanvas.tsx';let s=fs.readFileSync(path,'utf8');
function replace(a,b){if(!s.includes(a))throw new Error('Missing '+a.slice(0,100));s=s.replace(a,b);}
function between(a,b,next){const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error(a);s=s.slice(0,start)+next+s.slice(end);}
replace("import { playSfx } from '../audio/sfx';",`import { playSfx } from '../audio/sfx';
import { ITEM_BY_NAME, rollItems, type Item, type Rarity } from '../game/catalog';
import { calculateStats, difficultyAt, incomingDamage, type Difficulty, type Stats } from '../game/progression';`);
replace("rarity: 'Comum'|'Incomum'|'Raro'",'rarity: Rarity');
replace('hp: number; level:', 'hp: number; maxHp:number; stats:Stats; defeated:boolean; allyDamage:number; difficultyScale:number; level:');
replace('hitTimer: number; challenge?', 'hitTimer: number; windup?:number; attackPoint?:THREE.Vector3; marker?:THREE.Mesh; poison?:{remaining:number;dps:number}; slow?:number; challenge?');
replace('splash:number };','splash:number; ally?:boolean; physical?:boolean };');
replace('const emptySnapshot:', 'export const emptySnapshot:');
replace('{ hp: 130, level:',"{ hp: 130, maxHp:130, stats:calculateStats('naruto',1), defeated:false, allyDamage:0, difficultyScale:1, level:");
replace('heroId, enabled, paused, onSnapshot, onPanel','heroId, mission, itemPool, enabled, paused, onSnapshot, onPanel');
replace('heroId: string; enabled:', 'heroId: string; mission:Difficulty; itemPool:Item[]; enabled:');
replace('  useEffect(() => {', '  const itemPoolRef=useRef(itemPool);itemPoolRef.current=itemPool;\n  useEffect(() => {');
replace("sealTimer=0,damageMultiplier=1,luck=0;",`sealTimer=0,damageMultiplier=1,luck=0;
    let bonusHp=0,defeated=false,invulnerability=0,allyDamage=0,pendingItemRewards=0;
    let stats=calculateStats(heroId,1),allyTimer=0;
    const allyActors:THREE.Sprite[]=[];
    const refreshStats=(healGrowth=false)=>{const oldMax=stats.maxHp;stats=calculateStats(heroId,level,knownItems,knownPills,bonusHp);luck=stats.luck;hp=Math.min(stats.maxHp,hp+(healGrowth?Math.max(0,stats.maxHp-oldMax):0));};
    const grantItem=(name:string)=>{const item=ITEM_BY_NAME[name];if(!item||(knownItems[name]||0)>=item.max)return;knownItems[name]=(knownItems[name]||0)+1;refreshStats(true);};
    const recruitAlly=()=>{if(allyActors.length>=stats.supportSlots)return;const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:orochimaruTexture.clone(),transparent:true,depthWrite:false}));sprite.material.map!.needsUpdate=true;sprite.scale.set(1.7,2.4,1);sprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(sprite);allyActors.push(sprite);allies.push('Orochimaru');addRing(sprite.position,'#61ffa8',1);};`);
replace("const pillNames=['Pílula Rubra','Pílula Verde','Pílula Azul'];const itemNames=['Pergaminho de Força','Bandana Reforçada','Selo de Velocidade'];","const pillNames=['Pílula Rubra','Pílula Verde','Pílula Azul'];");
between('    const rollLevelOffers=', '    let yaw=', `    const toOffer=(item:Item,index:number):LevelOffer=>({id:item.id+'-'+index,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:item.description+' Você tem '+(knownItems[item.name]||0)+'/'+item.max+'.'});
    const rollMegaLoot=():LevelOffer[]=>{const rolled=rollItems(itemPoolRef.current,knownItems,stats.luck,3);return rolled.length?rolled.map(toOffer):[{id:'empty-pool',kind:'stat',name:'Reserva de vitalidade',rarity:'Comum',icon:'❤️',description:'Pool esgotado ou arquivado: +18 HP máximo e cura.'}];};
    const rollLevelOffers=():LevelOffer[]=>{const skills=(skillNames[heroId]??skillNames.naruto).filter(name=>(skillLevels[name]||1)<9),skill=skills[Math.floor(Math.random()*skills.length)],pill=pillNames[Math.floor(Math.random()*pillNames.length)];return [skill?{id:'skill',kind:'skill' as const,name:skill,rarity:'Incomum' as const,icon:'⚔️',description:'Nível '+(skillLevels[skill]||1)+' → '+((skillLevels[skill]||1)+1)+': +12% dano e +8% área desta técnica.'}:{id:'growth',kind:'stat' as const,name:'Vitalidade',rarity:'Comum' as const,icon:'❤️',description:'+18 HP máximo.'},{id:'pill',kind:'pill',name:pill,rarity:'Comum',icon:'💊',description:pill==='Pílula Rubra'?'+8% dano total.':pill==='Pílula Verde'?'+12 HP máximo.':'+8% velocidade de recarga da Ultimate.'},...rollMegaLoot().slice(0,1),{id:'hp',kind:'stat',name:'Vitalidade',rarity:'Comum',icon:'❤️',description:'+18 HP máximo e cura do valor acrescentado.'}];};
    function chooseLevelOffer(index:number){const offer=choiceData?.[index];if(!offer)return;if(offer.kind==='skill')skillLevels[offer.name]=Math.min(9,(skillLevels[offer.name]||1)+1);if(offer.kind==='pill')knownPills[offer.name]=(knownPills[offer.name]||0)+1;if(offer.kind==='item')grantItem(offer.name);if(offer.kind==='stat')bonusHp+=18;refreshStats(true);choiceData=null;keys.clear();}
`);
replace('chakra=0,hp=130,level=1','chakra=0,hp=stats.maxHp,level=1');
replace('if(!enabledRef.current)return;', 'if(!enabledRef.current||defeated)return;');
replace("sealing.phase='sealing';sealTimer=0;", "if(allyActors.length>=stats.supportSlots){eventToast='Equipe cheia: G para receber um item.';return;}sealing.phase='sealing';sealTimer=knownItems['Shuriken Selo da Tenten']?2.7:0;");
replace("if(key==='g'){currentPing", "if(pausedRef.current){if(key==='escape')onPanelRef.current(null);return;}if(key==='g'){currentPing");
replace('ring.position.y=.18;', 'ring.position.y=terrainHeight(position.x,position.z)+.18;');
replace('enemy.hp=Math.round(enemy.hp*zoneDifficulty);enemy.speed*=zoneDifficulty;', 'enemy.hp=Math.round(enemy.hp*difficultyAt(mission,elapsed,zoneDifficulty).hp);');
replace("else if(blessing.includes('HP'))hp=Math.min(148,hp+24);", "else if(blessing.includes('HP')){bonusHp+=24;refreshStats(true);}");
replace("knownItems[`Bênção de Snorlax · ${blessing}`]=(knownItems[`Bênção de Snorlax · ${blessing}`]||0)+1;",'');
replace("knownPills[pill]=(knownPills[pill]||0)+1;}else{const item=itemNames[Math.floor(Math.random()*itemNames.length)];knownItems[item]=(knownItems[item]||0)+1;}","knownPills[pill]=(knownPills[pill]||0)+1;refreshStats(true);}else{pendingItemRewards++;}");
replace('orb.position.y=.45;', 'orb.position.y=terrainHeight(position.x,position.z)+.45;');
replace('scene.remove(enemy.sprite);enemyList.splice(i,1);','scene.remove(enemy.sprite);enemy.sprite.material.map?.dispose();enemy.sprite.material.dispose();if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();}enemyList.splice(i,1);');
replace("Math.round((enemy.megaElite?100:8)*xpMultiplier)", "Math.round((enemy.megaElite?100:8)*xpMultiplier)");
replace("addDrop(defeatedAt,'item',1,itemNames[Math.floor(Math.random()*itemNames.length)])", "addDrop(defeatedAt,'item',1)");
replace('if(chakra<100)return;', 'if(chakra<100||defeated||pausedRef.current||choiceData)return;');
replace("enemy.hp-=heroId==='hashirama'?210:180;", "enemy.hp-=(heroId==='hashirama'?210:180)*(stats.damage/(calculateStats(heroId,1).damage))*stats.ninjutsu;");
replace("const takeDamage=(enemy:Enemy,damage:number,color:string)=>{enemy.hp-=damage;", "const takeDamage=(enemy:Enemy,damage:number,color:string,fromAlly=false)=>{if(!enemyList.includes(enemy))return;if(fromAlly)allyDamage+=Math.min(enemy.hp,damage);enemy.hp-=damage;");
replace('if(enabledRef.current&&!pausedRef.current&&!choiceData){elapsed+=dt;',`if(enabledRef.current&&!pausedRef.current&&!choiceData&&!defeated){
      refreshStats();invulnerability=Math.max(0,invulnerability-dt);
      if(!sealing)elapsed+=dt;`);
replace("if(!allies.includes('Orochimaru'))allies.push('Orochimaru');",'recruitAlly();');
replace("}}megaTimer-=dt;", "}}if(!sealing){megaTimer-=dt;");
replace("const speed=weather==='Tempestade de areia'?5.1:7;", "const speed=stats.moveSpeed*(weather==='Tempestade de areia'?.73:1);");
replace('player.position.addScaledVector(dir,speed*dt);', 'player.position.addScaledVector(dir,speed*dt);player.position.x=THREE.MathUtils.clamp(player.position.x,-46,46);player.position.z=THREE.MathUtils.clamp(player.position.z,-46,46);');
between('      spawnTimer-=dt;', '      chakra=', `      const threat=difficultyAt(mission,elapsed,zoneDifficulty);
      spawnTimer-=dt;if(spawnTimer<=0&&enemyList.length<threat.cap){spawnEnemy();spawnTimer=threat.spawnInterval*(.8+Math.random()*.4);}
      hp=Math.min(stats.maxHp,hp+dt*(stats.regen+allyActors.length*.3*stats.allyBuff));
      for(const enemy of [...enemyList]){
        if(enemy.poison){const duration=Math.min(dt,enemy.poison.remaining);enemy.poison.remaining-=duration;takeDamage(enemy,enemy.poison.dps*duration,'#b67bff');if(!enemyList.includes(enemy))continue;if(enemy.poison.remaining<=0)enemy.poison=undefined;}
        enemy.slow=Math.max(0,(enemy.slow||0)-dt);
        dir.set(player.position.x-enemy.sprite.position.x,0,player.position.z-enemy.sprite.position.z);const distance=dir.length();
        if(enemy.windup!==undefined){enemy.windup-=dt;if(enemy.marker)(enemy.marker.material as THREE.MeshBasicMaterial).opacity=.3+(1-Math.max(0,enemy.windup)/.65)*.5;
          if(enemy.windup<=0){const radius=enemy.megaElite?3:1.8;if(enemy.attackPoint&&Math.hypot(player.position.x-enemy.attackPoint.x,player.position.z-enemy.attackPoint.z)<radius&&invulnerability<=0){
            if(Math.random()>=stats.evasion){hp=Math.max(0,hp-incomingDamage((enemy.megaElite?22:10)*threat.damage,stats.armor));invulnerability=.25;addRing(player.position,'#ff535a',.7);if(hp<=0){defeated=true;keys.clear();eventToast='Missão encerrada: seu shinobi caiu.';}}
          }if(enemy.marker){scene.remove(enemy.marker);enemy.marker.geometry.dispose();(enemy.marker.material as THREE.Material).dispose();enemy.marker=undefined;}enemy.windup=undefined;enemy.hitTimer=.8;}
        }else{enemy.hitTimer-=dt;if(distance>(enemy.megaElite?2.8:1.7)){dir.normalize();enemy.sprite.position.addScaledVector(dir,enemy.speed*threat.speed*(enemy.slow?.75:1)*dt);enemy.sprite.position.y=terrainHeight(enemy.sprite.position.x,enemy.sprite.position.z)+(enemy.megaElite?1.9:1);}
          else if(enemy.hitTimer<=0){enemy.windup=.65;enemy.attackPoint=player.position.clone();const marker=new THREE.Mesh(new THREE.RingGeometry(.1,enemy.megaElite?3:1.8,32),new THREE.MeshBasicMaterial({color:'#ff3b55',transparent:true,opacity:.3,side:THREE.DoubleSide,depthWrite:false}));marker.rotation.x=-Math.PI/2;marker.position.set(enemy.attackPoint.x,terrainHeight(enemy.attackPoint.x,enemy.attackPoint.z)+.2,enemy.attackPoint.z);scene.add(marker);enemy.marker=marker;}
        }
        if(defeated)break;
      }
      // Aliados seguem em formação, atacam automaticamente e fornecem regeneração de suporte.
      allyTimer-=dt;
      for(let i=0;i<allyActors.length;i++){const ally=allyActors[i],angle=i*Math.PI*.8+1,goal=new THREE.Vector3(player.position.x+Math.cos(angle)*2.6,0,player.position.z+Math.sin(angle)*2.6);dir.copy(goal).sub(ally.position);dir.y=0;if(dir.length()>12)ally.position.copy(goal);else if(dir.length()>.25)ally.position.addScaledVector(dir.normalize(),Math.min(speed+2,dir.length()/dt)*dt);ally.position.y=terrainHeight(ally.position.x,ally.position.z)+1.2;
        if(allyTimer<=0&&!defeated){const target=[...enemyList].sort((a,b)=>a.sprite.position.distanceToSquared(ally.position)-b.sprite.position.distanceToSquared(ally.position))[0];if(target&&target.sprite.position.distanceTo(ally.position)<17){const snake=new THREE.Mesh(new THREE.CapsuleGeometry(.16,.9,3,6),new THREE.MeshBasicMaterial({color:'#b78cff'}));snake.rotation.z=Math.PI/2;snake.position.copy(ally.position);scene.add(snake);shots.push({mesh:snake,target,damage:(10+level*1.3)*stats.allyDamage,life:2.5,color:'#b78cff',splash:1,ally:true});}}
      }if(allyTimer<=0)allyTimer=1.3/stats.allySpeed;
      if(!defeated){
`);
replace('chakra+100*dt/55','chakra+100*dt/55*stats.ultimateRate');
replace("const levelBoost=Object.values(skillLevels).reduce((sum,value)=>sum+Math.max(0,value-1),0),damage=(18+levelBoost*2)*damageMultiplier;", "const techniqueIndex=basicAttackIndex++%4,techniqueName=skillNames[heroId][techniqueIndex],levelBoost=(skillLevels[techniqueName]||1)-1,physical=techniqueIndex===0,damage=stats.damage*(1+levelBoost*.12)*damageMultiplier*(physical?stats.physical:stats.ninjutsu)*(heroId==='naruto'?1+.2*(1-hp/stats.maxHp):1)*(Math.random()<stats.crit?stats.critDamage:1);");
replace('const technique=basicAttackIndex++%4;', 'const technique=techniqueIndex;');
replace('scene.add(projectile);shots.push({mesh:projectile,target,damage,life:2.1,color,splash});', `splash*=stats.area*(1+levelBoost*.08);scene.add(projectile);shots.push({mesh:projectile,target,damage,life:2.1,color,splash,physical});for(let extra=1;extra<stats.projectiles;extra++){const copy=projectile.clone();copy.position.x+=(extra%2?1:-1)*.5;scene.add(copy);shots.push({mesh:copy,target:enemyList[(enemyList.indexOf(target)+extra)%enemyList.length],damage,life:2.1,color,splash,physical});}`);
replace("skillTimer=heroId==='naruto'?.7:heroId==='gaara'?1.05:heroId==='madara'?.9:1.2;", "skillTimer=(heroId==='naruto'?.7:heroId==='gaara'?1.05:heroId==='madara'?.9:1.2)/stats.attackSpeed;");
replace('takeDamage(victim,shot.damage,shot.color);', "{if(!shot.ally){if(stats.poison>0)victim.poison={remaining:3*stats.duration,dps:shot.damage*stats.poison/3};if(Math.random()<stats.status)victim.slow=2*stats.duration;}takeDamage(victim,shot.damage,shot.color,shot.ally);}");
between('      for(let i=drops.length-1;', '      for(let i=effects.length-1;', `      for(let i=drops.length-1;i>=0;i--){const drop=drops[i];drop.mesh.rotation.y+=dt*2;drop.mesh.position.y=terrainHeight(drop.mesh.position.x,drop.mesh.position.z)+.45+Math.sin(elapsed*3+i)*.1;
        if(Math.hypot(drop.mesh.position.x-player.position.x,drop.mesh.position.z-player.position.z)<stats.pickup){
          if(drop.type==='xp')xp+=Math.round(drop.value*stats.xpGain);
          if(drop.type==='lamens')runMoney+=Math.round(drop.value*stats.moneyGain);
          if(drop.type==='chakra')chakra=Math.min(100,chakra+drop.value);
          if(drop.type==='pill'){knownPills[drop.name]=(knownPills[drop.name]||0)+1;refreshStats(true);}
          if(drop.type==='item')pendingItemRewards++;
          playSfx('pickup');scene.remove(drop.mesh);drop.mesh.geometry.dispose();(drop.mesh.material as THREE.Material).dispose();drops.splice(i,1);
        }
      }
      if(!choiceData&&!sealing){if(xp>=xpNext){xp-=xpNext;level++;refreshStats(true);xpNext=Math.ceil(30+18*(level-1)+2*(level-1)**2);choiceLevel=level;choiceData=rollLevelOffers();invulnerability=3;keys.clear();}else if(pendingItemRewards>0){pendingItemRewards--;choiceLevel=0;choiceData=rollMegaLoot();keys.clear();}}
      } // Vivo
      } // Fora do ritual de selamento
`);
replace('onSnapshotRef.current({hp,level,', 'onSnapshotRef.current({hp:Math.ceil(hp),maxHp:stats.maxHp,stats:{...stats},defeated,allyDamage:Math.round(allyDamage),difficultyScale:difficultyAt(mission,elapsed,zoneDifficulty).hp,level,');
replace('onSnapshotRef.current(emptySnapshot);', 'onSnapshotRef.current({...emptySnapshot,hp:stats.maxHp,maxHp:stats.maxHp,stats});');
replace('}, [heroId]);', '}, [heroId,mission]);');
fs.writeFileSync(path,s);
