import fs from 'node:fs';
const file='src/scene/GameCanvas.tsx';let s=fs.readFileSync(file,'utf8');
const rep=(a,b)=>{if(!s.includes(a))throw Error('Missing '+a.slice(0,100));s=s.replace(a,b);};
const block=(a,b,content)=>{const start=s.indexOf(a),end=s.indexOf(b,start);if(start<0||end<0)throw Error('Missing block '+a);s=s.slice(0,start)+content+s.slice(end);};
rep("import { calculateStats, difficultyAt, incomingDamage,", "import { HEROES, HERO_BY_ID, skillPool, sandSynergy, type Technique, type Control } from '../game/heroes';\nimport { formAt, spriteFile } from '../game/evolution';\nimport { NO_GROWTH, rollGrowth, growthText, type SkillGrowth } from '../game/combat';\nimport type { Bonuses } from '../game/catalog';\nimport { techniqueVisual, disposeObject } from './techniqueEffects';\nimport { calculateStats, difficultyAt, incomingDamage, rollCritical,");
rep('planned?: boolean','planned?: boolean; growth?:SkillGrowth; bonus?:Bonuses');
rep('hp: number; maxHp:number;', 'victory:boolean; remaining:number; hiddenEffects:boolean; totalDamage:number; skillDamage:Record<string,number>; skillGrowth:Record<string,SkillGrowth>; techniques:Technique[]; synergy:boolean; zone:number; boss:string; defenseProgress:number; hp: number; maxHp:number;');
s=s.replaceAll("sealing:{target:string;phase", "sealing:{heroId:string;target:string;phase");
s=s.replaceAll("sealing:{target:string;phase", "sealing:{heroId:string;target:string;phase");
rep('type Enemy = {', 'type Enemy = { heroId?:string; elite?:boolean; guardian?:boolean; control?:Control; controlTime?:number; burn?:number;');
rep('mesh:THREE.Mesh; active:boolean','mesh:THREE.Object3D; active:boolean; discovered?:boolean');
block('type Projectile =','export const emptySnapshot',`type Projectile = {mesh:THREE.Object3D;direction:THREE.Vector3;remaining:number;speed:number;radius:number;technique:Technique;origin:THREE.Vector3;hit:Set<Enemy>;growth:SkillGrowth;ally?:boolean};
`);
rep('= { hp: 130', '= { victory:false,remaining:600,hiddenEffects:false,totalDamage:0,skillDamage:{},skillGrowth:{},techniques:skillPool(\'naruto\'),synergy:false,zone:1,boss:\'\',defenseProgress:0,hp: 130');
rep('const config=preparationRef.current,',"const hero=HERO_BY_ID[heroId]??HEROES[0],techniques=skillPool(hero.id),growth:Record<string,SkillGrowth>={},cooldowns:Record<string,number>={},runBuffs:Bonuses={},skillDamage:Record<string,number>={};\n    let totalDamage=0,hiddenEffects=false,victory=false,zone=1,ambushTimer=8,guardianSpawned=false,bossStacks=0,defenseTime=0,defenseActive=false,defenseDone=false;\n    const config=preparationRef.current,");
// Texture cache supplies the exact character and evolution to player, NPC, elite and support.
block('    const player=makeSprite(', '    const treeMat=', `    const heroTextures=new Map<string,THREE.Texture>();
    const heroMaterial=(id:string,lv=1)=>{const path=spriteFile(id,lv);if(!path)return spriteMaterial(HERO_BY_ID[id]?.atlas??0);let map=heroTextures.get(path);if(!map){map=new THREE.TextureLoader().load(path);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;heroTextures.set(path,map);}return new THREE.SpriteMaterial({map,transparent:true,depthWrite:false});};
    const makeHero=(id:string,lv=1)=>{const sprite=new THREE.Sprite(heroMaterial(id,lv));sprite.scale.set(1.65,2.25,1);return sprite;};
    const player=makeHero(heroId);player.position.y=terrainHeight(0,0)+1.15;scene.add(player);
`);
s=s.replaceAll("Rugido de Rhydon",'Provocação do guardião').replaceAll("Bênção de Snorlax",'Bênção de Tsunade').replaceAll('Snorlax concedeu','Tsunade concedeu');
rep("icon:'🦏'","icon:'⚔️'");rep("icon:'💤'","icon:'✚'");
rep("if(def.id==='orochimaru'){", "if(def.id==='snorlax'){obj.material.dispose();obj.material=heroMaterial('tsunade');}if(def.id==='orochimaru'){");
rep('let bonusHp=0,','let bonusHp=0,');
rep('calculateStats(heroId,level,knownItems,knownPills,bonusHp,permanent);',"calculateStats(heroId,level,knownItems,knownPills,bonusHp,permanent,{...runBuffs,defense:(runBuffs.defense||0)+(sandSynergy(allies)?12:0),damage:(runBuffs.damage||0)+(sandSynergy(allies)?.15:0)});");
block('    const recruitAlly=', '    const revealAround=', `    const recruitAlly=(id:string)=>{if(allyActors.length>=stats.supportSlots||allies.includes(id))return false;const sprite=makeHero(id);sprite.position.copy(player.position).add(new THREE.Vector3(2,0,1));scene.add(sprite);allyActors.push(sprite);allies.push(id);addRing(sprite.position,'#61ffa8',1);refreshStats(true);return true;};
`);
block('    const skillNames:', '    function rewardAction', `    skillLevels[hero.skills[0]]=1;
    const toOffer=(item:Item,index:number):LevelOffer=>({id:item.id+'-'+index,kind:'item',name:item.name,rarity:item.rarity,icon:item.icon,description:item.description+' Você tem '+(knownItems[item.name]||0)+'/'+item.max+'.'});
    const reserveOffer=():LevelOffer=>{const options:[string,Bonuses,string][]=[['Vitalidade',{health:6},'+6 HP e cura do valor acrescentado.'],['Força',{damage:.02},'+2% dano total.'],['Precisão',{crit:.005},'+0,5 ponto de chance crítica.'],['Agilidade',{move:.01},'+1% movimento.'],['Resistência',{defense:1},'+1 armadura.'],['Cadência',{attackSpeed:.01},'+1% velocidade de ataque.']];const [name,bonus,description]=options[Math.floor(Math.random()*options.length)];return{id:'power-'+name,kind:'stat',name,rarity:'Comum',icon:'↑',bonus,description:'Powerlevel · '+description};};
    const rollMegaLoot=():LevelOffer[]=>{const rolled=rollItems(itemPoolRef.current.filter(i=>!banned.has(i.name)),knownItems,stats.luck,choiceCount(permanent));return rolled.length?rolled.map(toOffer):[reserveOffer()];};
    const rollLevelOffers=():LevelOffer[]=>{
      const learned=Object.keys(skillLevels).length,maxSkills=permanent['Quarta técnica']?4:3;
      const skills=techniques.filter(t=>t.unlockLevel<=level&&!config.archivedSkills.includes(t.name)&&!banned.has(t.name)&&(skillLevels[t.name]||0)<9&&((skillLevels[t.name]||0)>0||learned<maxSkills));
      const cards:LevelOffer[]=[];
      for(let n=0;n<2&&skills.length;n++){const t=skills.splice(Math.floor(Math.random()*skills.length),1)[0],roll=rollGrowth(stats.luck,t),current=skillLevels[t.name]||0;cards.push({id:'skill-'+t.name,kind:'skill',name:t.name,rarity:roll.rarity,growth:roll.growth,icon:'⚔️',description:(current?'Nível '+current+' → '+(current+1):'Nova técnica · '+t.school+' · '+t.shape)+'. '+growthText(roll.growth)+(t.status?' · '+t.status:'')});}
      const pills=pillNames.filter(name=>!banned.has(name)&&(knownPills[name]||0)<10),pill=pills[Math.floor(Math.random()*pills.length)];
      if(pill)cards.push({id:'pill-'+pill,kind:'pill',name:pill,rarity:'Comum',icon:'💊',description:(pill==='Pílula Rubra'?'+8% dano total.':pill==='Pílula Verde'?'+12 HP máximo.':'+8% velocidade de recarga da Ultimate.')+' Nv. '+(knownPills[pill]||0)+' → '+((knownPills[pill]||0)+1)+' / 10'});
      cards.push(...rollItems(itemPoolRef.current.filter(i=>!banned.has(i.name)),knownItems,stats.luck,choiceCount(permanent)-cards.length).map(toOffer));
      if(!cards.length)cards.push(reserveOffer());
      return cards.slice(0,choiceCount(permanent));
    };
`);
rep("if(offer.kind==='skill')skillLevels[offer.name]=Math.min(9,(skillLevels[offer.name]||0)+1);", "if(offer.kind==='skill'){skillLevels[offer.name]=Math.min(9,(skillLevels[offer.name]||0)+1);const previous=growth[offer.name]??{...NO_GROWTH};for(const key of Object.keys(NO_GROWTH) as (keyof SkillGrowth)[])previous[key]+=offer.growth?.[key]||0;growth[offer.name]=previous;}");
rep("if(offer.kind==='stat')bonusHp+=18;", "if(offer.kind==='stat'&&offer.bonus){for(const key of Object.keys(offer.bonus) as (keyof Bonuses)[])runBuffs[key]=(runBuffs[key]||0)+(offer.bonus[key]||0);}");
rep('megaElitesSpawned=0,basicAttackIndex=0,skillTimer=0,','megaElitesSpawned=0,');
rep('const effects:THREE.Mesh[]=[];', 'const effects:THREE.Mesh[]=[],visuals:{object:THREE.Object3D;life:number}[]=[],numbers:{sprite:THREE.Sprite;life:number}[]=[];');
rep("if(!enabledRef.current||defeated)return;", "if(!enabledRef.current||defeated||victory)return;");
rep("if(allyActors.length>=stats.supportSlots)","if(allyActors.length>=stats.supportSlots||allies.includes(sealing.heroId))");
rep("eventToast='Orochimaru selado e adicionado à equipe desta missão'", "eventToast='Shinobi selado e adicionado à equipe desta missão'");
rep("if(key==='h'){for(const effect of effects)effect.visible=!effect.visible;return;}","if(key==='h'){hiddenEffects=!hiddenEffects;for(const effect of effects)effect.visible=!hiddenEffects;for(const shot of shots)shot.mesh.visible=!hiddenEffects;for(const fx of visuals)fx.object.visible=!hiddenEffects;for(const n of numbers)n.sprite.visible=!hiddenEffects;return;}");
rep("if(choiceData){if(e.repeat)return;", "if(choiceData){if(key==='p'){onPanelRef.current('sheet');return;}if(key==='escape'){onPanelRef.current(null);return;}if(e.repeat||pausedRef.current&&document.querySelector('.game-panel-backdrop'))return;");
rep("if(['w','a','s','d'", "if((e.target as HTMLElement)?.matches('input,select,textarea'))return;if(e.repeat&&['m','tab','p','e','r','g','y','h'].includes(key))return;if(['w','a','s','d'");
rep('const ring=new THREE.Mesh(new THREE.TorusGeometry', 'if(hiddenEffects)return;const ring=new THREE.Mesh(new THREE.TorusGeometry');
block('    function spawnEnemy(', '    function interact()', `    function spawnEnemy(challenge=false,megaElite=false,guardian=false,forcedId?:string){const candidates=HEROES.filter(h=>!allies.includes(h.id)),id=forcedId??candidates[Math.floor(Math.random()*candidates.length)]?.id??heroId,angle=Math.random()*Math.PI*2,r=challenge?7:megaElite?12:10+Math.random()*8,x=THREE.MathUtils.clamp(player.position.x+Math.cos(angle)*r,-47,47),z=THREE.MathUtils.clamp(player.position.z+Math.sin(angle)*r,-47,47),elite=!megaElite&&Math.random()<.08;
      const e=megaElite?makeHero(id,Math.max(1,level)):makeSprite(4+Math.floor(Math.random()*4),elite?1.9:1.55,elite?2.5:2);if(megaElite)e.scale.multiplyScalar(1.4);e.position.set(x,terrainHeight(x,z)+(megaElite?1.6:1),z);if(elite)e.material.color.set('#ffb969');scene.add(e);const threat=difficultyAt(mission,elapsed,zoneDifficulty);const enemy:Enemy={sprite:e,hp:(megaElite?260:elite?60:challenge?30:22)*threat.hp*(guardian?1+bossStacks*.3:1),speed:megaElite?2.6:elite?3.8:2.8+Math.random()*.8,hitTimer:.2,challenge,megaElite,elite,guardian,heroId:megaElite?id:undefined};enemyList.push(enemy);return enemy;}
    const pickupTextures=new Map<string,THREE.Texture>();
    function spawnPickup(kind:MapPickup['kind'],x:number,z:number){const icon=kind==='shuriken'?'shuriken':'kunai';let mesh:THREE.Object3D;if(kind==='ryu')mesh=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.1,8),new THREE.MeshBasicMaterial({color:'#ffd64e'}));else{let map=pickupTextures.get(icon);if(!map){map=new THREE.TextureLoader().load('/assets/icons/'+icon+'.svg');map.magFilter=THREE.NearestFilter;map.colorSpace=THREE.SRGBColorSpace;pickupTextures.set(icon,map);}mesh=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthWrite:false}));mesh.scale.set(1.2,1.2,1);}mesh.position.set(x,terrainHeight(x,z)+.7,z);scene.add(mesh);pickups.push({id:'pickup-'+pickups.length,kind,name:kind==='sealDrop'?'Kunai de recompensa grátis':kind==='ryu'?'Bolsa de Ryu':kind==='kunai'?'Kunai':'Shuriken',x,z,mesh,active:true});}
    for(let i=0;i<25;i++){spawnPickup((['kunai','shuriken','ryu'] as const)[i%3],(Math.random()-.5)*80,(Math.random()-.5)*80);}
`);
// Refusal leaves exactly one free reward, with the same icon as other floor weapons.
block("const position=player.position.clone();const kind=", "sealing=null;eventToast='Selamento recusado", "spawnPickup('sealDrop',player.position.x,player.position.z);");
rep("zoneDifficulty*=1.1;lootMultiplier*=1.1;", "bossStacks++;zoneDifficulty*=1.1;lootMultiplier*=1.1;");
rep("event.active=false;spawnEnemy(true);eventToast=", "if(event.id==='altar'){defenseActive=true;event.active=false;defenseTime=0;eventToast='Proteja o altar: permaneça no círculo por 20 segundos.';return;}event.active=false;for(let i=0;i<6;i++)spawnEnemy(true);eventToast=");
rep("derrote o ninja para ganhar uma kunai grátis", "derrote a horda para receber uma kunai grátis");
rep("if(enemy.megaElite){sealing={target:'Orochimaru · Edo Tensei',phase:'ready'};", "if(enemy.megaElite&&!sealing){sealing={heroId:enemy.heroId!,target:HERO_BY_ID[enemy.heroId!].name,phase:'ready'};");
rep("if(enemy.challenge){kunai++;eventToast='Desafio concluído: +1 kunai grátis';}", "if(enemy.guardian){for(let n=0;n<1+bossStacks;n++)spawnPickup('sealDrop',defeatedAt.x+n,defeatedAt.z);eventToast='Guardião derrotado! Recompensas disponíveis no chão.';}if(enemy.challenge&&!enemyList.some(e=>e.challenge)){spawnPickup('sealDrop',defeatedAt.x,defeatedAt.z);eventToast='Desafio concluído: kunai grátis no chão';}");
// Sprite texture cache is shared, never dispose a cached texture upon enemy death.
rep('enemy.sprite.material.map?.dispose();enemy.sprite.material.dispose();','enemy.sprite.material.dispose();');
rep("if(pillNames.length&&Math.random()<.10)addDrop", "if(pillNames.length&&Math.random()<.015)addDrop");
rep("if(Math.random()<.08)addDrop", "if(Math.random()<.018)addDrop");
block('    function castUltimate()', '    renderer.setAnimationLoop', `    function damageNumber(position:THREE.Vector3,amount:number,tier=0){if(hiddenEffects||numbers.length>60||amount<.5)return;const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const ctx=canvas.getContext('2d')!;ctx.font='bold 36px sans-serif';ctx.textAlign='center';ctx.lineWidth=5;ctx.strokeStyle='#111629';ctx.strokeText(Math.round(amount)+(tier===2?'!!':tier===1?'!':''),64,44);ctx.fillStyle=tier===2?'#ff8bdd':tier===1?'#ffe269':'#ffffff';ctx.fillText(Math.round(amount)+(tier===2?'!!':tier===1?'!':''),64,44);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(canvas),transparent:true,depthTest:false}));sprite.scale.set(2,1,1);sprite.position.copy(position).add(new THREE.Vector3((Math.random()-.5)*.5,1.5,0));scene.add(sprite);numbers.push({sprite,life:.8});}
    function takeDamage(enemy:Enemy,damage:number,color:string,fromAlly=false,tier=0,name='Status'){if(!enemyList.includes(enemy))return;const dealt=Math.min(enemy.hp,damage);if(fromAlly)allyDamage+=dealt;else{totalDamage+=dealt;skillDamage[name]=(skillDamage[name]||0)+dealt;}enemy.hp-=damage;damageNumber(enemy.sprite.position,damage,tier);if(enemy.hp<=0)removeEnemy(enemy);else if(!hiddenEffects){enemy.sprite.material.color.set(color);}}
    function hit(enemy:Enemy,t:Technique,g:SkillGrowth,origin:THREE.Vector3,ally=false){if(!enemyList.includes(enemy))return;const crit=rollCritical(stats.crit,stats.critDamage),school=t.school==='Taijutsu'?stats.physical:t.school==='Ninjutsu'?stats.ninjutsu:1,sage=t.element==='Sábio'||stats.sage>0,passive=!ally&&heroId==='naruto'?1+.2*(1-hp/stats.maxHp):!ally&&heroId==='hashirama'&&sage?1.2:1;
      const damage=stats.damage*t.power*(1+g.damage)*school*passive*crit.multiplier*(ally?.65*stats.allyDamage:damageMultiplier);
      if(enemy.control==='Dormir')enemy.controlTime=0;
      const status=t.status??(stats.status>0?'Lentidão':undefined);if(status&&Math.random()<Math.min(.95,(t.status?t.statusChance:0)+stats.status)){const duration=(status==='Lentidão'?1.8:.65)*stats.duration*(1+g.duration);if(status==='Empurrar'){const away=enemy.sprite.position.clone().sub(origin);away.y=0;enemy.sprite.position.addScaledVector(away.normalize(),1.4);}else{enemy.control=status;enemy.controlTime=duration;if(status==='Lentidão')enemy.slow=duration;}}
      if(stats.poison>0)enemy.poison={remaining:3*stats.duration*(1+g.duration),dps:damage*stats.poison/3};if(t.burn)enemy.burn=2*stats.duration*(1+g.duration);
      takeDamage(enemy,damage,t.color,ally,crit.tier,t.name);
    }
    function castTechnique(t:Technique,origin:THREE.Vector3,g:SkillGrowth,ally=false){const range=t.range*(1+Math.min(1,(level-1)*.005))*Math.sqrt(stats.area*(1+g.area));const target=enemyList.filter(e=>Math.hypot(e.sprite.position.x-origin.x,e.sprite.position.z-origin.z)<=range).sort((a,b)=>a.sprite.position.distanceToSquared(origin)-b.sprite.position.distanceToSquared(origin))[0];if(!target)return false;const direction=target.sprite.position.clone().sub(origin);direction.y=0;direction.normalize();
      if(['Projétil','Em V','Onda'].includes(t.shape)){const count=t.shape==='Em V'?2:1;for(let i=0;i<Math.min(12,count+Math.floor(stats.projectiles)-1);i++){const spread=t.shape==='Em V'?(i%2?.2:-.2):(i-(stats.projectiles-1)/2)*.1,aim=direction.clone().applyAxisAngle(new THREE.Vector3(0,1,0),spread),object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(origin);object.visible=!hiddenEffects;scene.add(object);shots.push({mesh:object,direction:aim,remaining:range,speed:t.name.includes('Bunshin')?6:10,radius:(t.shape==='Onda'?.85:.4)*Math.sqrt(stats.area*(1+g.area)),technique:t,origin:origin.clone(),hit:new Set(),growth:g,ally});}}
      else{const center=['Área'].includes(t.shape)?target.sprite.position:origin,radius=(t.shape==='Área'?1.2:t.shape==='Órbita'?1.7:range)*Math.sqrt(stats.area*(1+g.area));
        for(const enemy of [...enemyList]){const delta=enemy.sprite.position.clone().sub(origin);delta.y=0;const d=delta.length(),along=delta.dot(direction),cross=Math.abs(delta.x*direction.z-delta.z*direction.x);let inside=false;if(t.shape==='Linha')inside=along>=0&&along<=range&&cross<.65*Math.sqrt(stats.area*(1+g.area));else if(t.shape==='Cone')inside=d<=range&&(d<.2||delta.normalize().dot(direction)>.65);else inside=Math.hypot(enemy.sprite.position.x-center.x,enemy.sprite.position.z-center.z)<=radius;if(inside)hit(enemy,t,g,origin,ally);}
        const object=techniqueVisual(t);object.position.copy(center);object.scale.multiplyScalar(Math.max(.8,radius));object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.35});addRing(center,t.color,Math.min(radius,3));}
      if(!ally)playSfx('attack');return true;
    }
    function castUltimate(){if(chakra<100||defeated||pausedRef.current||choiceData||sealing)return;chakra=0;playSfx('ultimate');const t={...hero.techniques[3],name:hero.ultimate,power:6,shape:'Área' as const};addRing(player.position,hero.color,5);const object=techniqueVisual(t,()=>makeHero(heroId,level));object.position.copy(player.position);object.scale.multiplyScalar(4);object.visible=!hiddenEffects;scene.add(object);visuals.push({object,life:.7});for(const enemy of [...enemyList])if(Math.hypot(enemy.sprite.position.x-player.position.x,enemy.sprite.position.z-player.position.z)<6*Math.sqrt(stats.area))hit(enemy,t,NO_GROWTH,player.position);}
`);
rep('&&!choiceData&&!defeated){','&&!choiceData&&!defeated&&!victory){');
rep('if(!sealing)elapsed+=dt;',"if(!sealing){elapsed+=dt;if(elapsed>=600){elapsed=600;victory=true;keys.clear();eventToast='Missão concluída: você sobreviveu aos dez minutos!';}const nextZone=Math.min(3,1+Math.floor(elapsed/200));if(nextZone!==zone){zone=nextZone;guardianSpawned=false;bossStacks=0;eventToast='Zona '+zone+' · nova ameaça e eventos';for(const event of events){event.active=true;event.uses=0;}defenseDone=false;}}" );
rep('recruitAlly();eventToast=\'Orochimaru foi selado e agora integra sua equipe nesta missão\'',"recruitAlly(sealing.heroId);eventToast=sealing.target+' foi selado e agora luta ao seu lado'");
rep('megaElitesSpawned<2','megaElitesSpawned<9');
rep('megaTimer=70+Math.random()*45','megaTimer=45+Math.random()*25');
rep('const threat=difficultyAt(mission,elapsed,zoneDifficulty);\n      spawnTimer',`const threat=difficultyAt(mission,elapsed,zoneDifficulty);
      if(!guardianSpawned&&elapsed-(zone-1)*200>=160){spawnEnemy(false,true,true);guardianSpawned=true;eventToast='O guardião da zona chegou!';}
      ambushTimer-=dt;if(ambushTimer<=0){for(let n=0;n<Math.min(8+zone*2,threat.cap-enemyList.length);n++)spawnEnemy();ambushTimer=18+Math.random()*12;eventToast='Emboscada! Ninjas cercando a área.';}
      if(defenseActive&&!defenseDone){const altar=events.find(e=>e.id==='altar')!;addRing(new THREE.Vector3(altar.x,0,altar.z),'#ffe98c',4);if(Math.hypot(player.position.x-altar.x,player.position.z-altar.z)<4)defenseTime+=dt;if(defenseTime>=20){defenseActive=false;defenseDone=true;spawnPickup('sealDrop',altar.x,altar.z);eventToast='Altar protegido: recompensa disponível!';}}
      spawnTimer`);
rep("enemy.slow=Math.max(0,(enemy.slow||0)-dt);", "enemy.sprite.material.color.lerp(new THREE.Color(enemy.elite?'#ffb969':'#ffffff'),dt*6);if(enemy.burn){enemy.burn-=dt;takeDamage(enemy,stats.damage*.15*dt,'#ff9b46');if(!enemyList.includes(enemy))continue;}enemy.controlTime=Math.max(0,(enemy.controlTime||0)-dt);enemy.slow=Math.max(0,(enemy.slow||0)-dt);if(enemy.controlTime>0&&enemy.control!=='Lentidão')continue;");
rep('enemy.megaElite?3:1.8','enemy.megaElite?1.7:1');
s=s.replaceAll('enemy.megaElite?3:1.8','enemy.megaElite?1.7:1');
s=s.replaceAll('enemy.megaElite?2.8:1.7','enemy.megaElite?1.6:1');
rep('enemy.hitTimer=.8','enemy.hitTimer=.9/threat.attackRate');
rep('enemy.windup=.65','enemy.windup=Math.max(.28,.65/Math.sqrt(threat.attackRate))');
// Support uses its own signature technique. Only captured IDs activate the Sand trio.
block('        if(allyTimer<=0&&!defeated)', '      for(let i=drops.length', `        if(allyTimer<=0&&!defeated)castTechnique(HERO_BY_ID[allies[i]].techniques[0],ally.position,NO_GROWTH,true);
      }if(allyTimer<=0)allyTimer=1.5/stats.allySpeed;
      if(!defeated){
      chakra=Math.min(100,chakra+100*dt/55*stats.ultimateRate);if(autoUlt&&chakra>=100)castUltimate();
      for(const t of techniques){if(!skillLevels[t.name])continue;cooldowns[t.name]=(cooldowns[t.name]||0)-dt;if(cooldowns[t.name]<=0){const g=growth[t.name]??NO_GROWTH;if(castTechnique(t,player.position,g))cooldowns[t.name]=t.cooldown/Math.max(.1,stats.attackSpeed*(1+g.haste));}}
      for(let i=shots.length-1;i>=0;i--){const shot=shots[i],travel=Math.min(shot.remaining,shot.speed*dt);shot.mesh.position.addScaledVector(shot.direction,travel);shot.mesh.position.y=terrainHeight(shot.mesh.position.x,shot.mesh.position.z)+1.1;shot.remaining-=travel;shot.mesh.rotation.y+=dt*6;
        for(const enemy of [...enemyList])if(!shot.hit.has(enemy)&&Math.hypot(enemy.sprite.position.x-shot.mesh.position.x,enemy.sprite.position.z-shot.mesh.position.z)<shot.radius+.4){shot.hit.add(enemy);hit(enemy,shot.technique,shot.growth,shot.origin,shot.ally);if(shot.technique.shape==='Projétil')shot.remaining=0;}
        if(shot.remaining<=0){scene.remove(shot.mesh);disposeObject(shot.mesh);shots.splice(i,1);}}
`);
rep("if(drop.type==='pill'){knownPills[drop.name]=(knownPills[drop.name]||0)+1;", "if(drop.type==='pill'&&!banned.has(drop.name)){knownPills[drop.name]=Math.min(10,(knownPills[drop.name]||0)+1);");
rep('level++;refreshStats(true);xpNext=Math.ceil(30+18*(level-1)+2*(level-1)**2);',"const oldForm=formAt(heroId,level).level;level++;refreshStats(true);xpNext=Math.ceil(18+6*(level-1)+.08*(level-1)**2);if(formAt(heroId,level).level!==oldForm){player.material.dispose();player.material=heroMaterial(heroId,level);eventToast=hero.name+' evoluiu: '+formAt(heroId,level).name+' · +25% do HP base';addRing(player.position,'#fff195',3);}");
rep('      // Só registra o evento',`      for(let i=visuals.length-1;i>=0;i--){const fx=visuals[i];fx.life-=dt;fx.object.rotation.y+=dt*5;if(fx.life<=0){scene.remove(fx.object);disposeObject(fx.object);visuals.splice(i,1);}}
      for(let i=numbers.length-1;i>=0;i--){const n=numbers[i];n.life-=dt;n.sprite.position.y+=dt*1.3;n.sprite.material.opacity=Math.max(0,n.life/.8);if(n.life<=0){scene.remove(n.sprite);n.sprite.material.map?.dispose();n.sprite.material.dispose();numbers.splice(i,1);}}
      // Só registra o evento`);
rep('camera.lookAt(player.position.x,0,player.position.z);resize();','camera.lookAt(player.position);camera.updateMatrixWorld();');
rep('zoom+Math.sign(e.deltaY)*1.6));','zoom+Math.sign(e.deltaY)*1.6));resize();');
rep('onSnapshotRef.current({hp:Math.ceil(hp)',"onSnapshotRef.current({victory,remaining:Math.max(0,600-elapsed),hiddenEffects,totalDamage:Math.round(totalDamage),skillDamage:{...skillDamage},skillGrowth:{...growth},techniques,synergy:sandSynergy(allies),zone,boss:enemyList.filter(e=>e.guardian).map(e=>HERO_BY_ID[e.heroId!].name+' · '+Math.ceil(e.hp)+' HP').join(', '),defenseProgress:defenseActive?Math.floor(defenseTime/20*100):0,hp:Math.ceil(hp)");
rep("pickups:pickups.filter(p=>p.active).map", "pickups:pickups.filter(p=>p.active&&p.discovered).map");
block('      for(const event of events){if(event.discovered)', '      }\n      offset.set', `      const frustum=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      for(const event of events){if(!event.discovered&&frustum.containsPoint(event.obj.position)&&event.obj.position.distanceTo(player.position)<40){event.discovered=true;event.obj.visible=true;}}
      for(const pickup of pickups){if(!pickup.discovered&&frustum.containsPoint(pickup.mesh.position)&&pickup.mesh.position.distanceTo(player.position)<40)pickup.discovered=true;}
`);
// Developer-only harness: inaccessible in the production bundle, used to exercise actual runtime systems.
rep('    onSnapshotRef.current({...emptySnapshot',`    const debugWindow=window as unknown as {__shinobiTest?:Record<string,unknown>};
    if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test'))debugWindow.__shinobiTest={
      grantItem,spawn:(id:string)=>spawnEnemy(false,true,false,id),defeatMega:(id:string)=>{const e=spawnEnemy(false,true,false,id);removeEnemy(e);},
      reward:()=>{choiceLevel=level;choiceData=rollLevelOffers();},loot:()=>{choiceLevel=0;choiceData=rollMegaLoot();},
      setLevel:(n:number)=>{level=n;player.material.dispose();player.material=heroMaterial(heroId,n);refreshStats(true);},
      learn:(name:string)=>{skillLevels[name]=1;},clearEnemies:()=>{for(const e of [...enemyList]){scene.remove(e.sprite);if(e.marker)scene.remove(e.marker);}enemyList.length=0;},
      setTime:(n:number)=>{elapsed=n;},teleport:(x:number,z:number)=>{player.position.set(x,terrainHeight(x,z)+1.15,z);},
      setCrit:(n:number)=>{runBuffs.crit=n;refreshStats();},recruitAlly,
      inspect:()=>({heroId,level,form:formAt(heroId,level).name,hiddenEffects,totalDamage,stats,allies,synergy:sandSynergy(allies),skills:{...skillLevels},growth:{...growth},enemies:enemyList.map(e=>({hp:e.hp,heroId:e.heroId,control:e.control,controlTime:e.controlTime})),items:{...knownItems},uses:{...uses},paidWeapons,runMoney,choice:choiceData,sealing,elapsed}),
    };
    onSnapshotRef.current({...emptySnapshot`);
rep('return()=>{observer.disconnect();','return()=>{delete debugWindow.__shinobiTest;heroTextures.forEach(t=>t.dispose());pickupTextures.forEach(t=>t.dispose());numbers.forEach(n=>n.sprite.material.map?.dispose());observer.disconnect();');
fs.writeFileSync(file,s);
