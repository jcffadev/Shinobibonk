import fs from 'node:fs';
const f='src/scene/GameCanvas.tsx';let s=fs.readFileSync(f,'utf8');
const r=(a,b)=>{if(s.includes(a))s=s.replace(a,b);else console.log('Revisar:',a.slice(0,90));};
r("import { MAP_SIZE,", "import { BIJUU, BIJUU_BY_ID, bijuuLamens, rollBijuu } from '../game/bijuu';\nimport { MAP_SIZE,");
r("zone:number; skillTimers?", "zone:number; phase?:'zone'|'arena'|'exit'; bijuu?:string; bijuuReward?:number; plansUsed?:number; skillTimers?");
r("accountTried:string[]; merchant?", "accountTried:string[]; campaign?:CampaignSave; merchant?");
r("export type SavedRun=", "type PortalKind='zone'|'arena'|'exit';\ntype CampaignSave={start:number;plans:number;arena:boolean;reward:number;bijuu:string;portal?:{kind:PortalKind;x:number;z:number};boss?:{id:string;hp:number;maxHp:number};locations?:{id:string;x:number;z:number}[];pickups?:{kind:MapPickup['kind'];x:number;z:number;discovered:boolean}[]};\nexport type SavedRun=");
r("guardianZone?:number; totem?", "guardianZone?:number; bijuu?:boolean; totem?");
r("let totalDamage=0,", "let zoneStart=0,plansUsed=0,arena=false,bijuuReward=0,defeatedBijuu='';\n    let portal:{kind:PortalKind;x:number;z:number;mesh:THREE.Group}|null=null;\n    let totalDamage=0,");
r("difficultyAt(mission,elapsed,zoneDifficulty)","difficultyAt(mission,arena?ZONE_SECONDS:zoneElapsed(),zoneDifficulty*(1+.33*shikamaruPlans))");
r("const heroMaterial=(id:string,lv=1)=>{const r=portraitRegion(id,lv)","const heroMaterial=(id:string,lv=1)=>{const beast=BIJUU.findIndex(b=>b.id===id);const r=beast<0?portraitRegion(id,lv):{path:'/assets/bijuu-atlas-v1.png',cols:3,rows:3,index:beast}");
r("const events=eventDefs.map",`const altarRarities:Rarity[]=['Comum','Incomum','Raro','Épico','Lendário'];
    const allEvents=[...eventDefs.filter(e=>e.id!=='altar').map(e=>({...e,altarTier:undefined as number|undefined})),...Array.from({length:8},(_,i)=>{const tier=i<5?i:Math.floor(Math.random()*5);return {id:'altar-'+i,name:'Altar · '+(tier===0?'Normal':altarRarities[tier]),x:0,z:0,icon:'🛕',sprite:11,altarTier:tier};})];
    const events=allEvents.map`);
r("    // Arsenal da Tenten (NPC",`    function scatterEvents(){
      const spots:{x:number;z:number}[]=[];
      for(const e of events){
        let x=0,z=0;
        for(let n=0;n<80;n++){
          const radius=e.id==='guardian-seal'?14+Math.random()*16:13+Math.random()*55;
          const angle=Math.random()*Math.PI*2;x=Math.cos(angle)*radius;z=Math.sin(angle)*radius;
          if(spots.every(p=>Math.hypot(p.x-x,p.z-z)>8))break;
        }
        spots.push({x,z});e.x=x;e.z=z;e.active=true;e.uses=0;e.discovered=false;
        e.obj.visible=false;e.obj.position.set(x,terrainHeight(x,z)+e.obj.scale.y*.45,z);
      }
    }
    scatterEvents();
    const altarCircle=new THREE.Mesh(new THREE.RingGeometry(2.94,3,48),new THREE.MeshBasicMaterial({color:'#d6b87a',transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));
    altarCircle.rotation.x=-Math.PI/2;altarCircle.visible=false;scene.add(altarCircle);
    let defenseAltar:(typeof events)[number]|null=null;
    const altarTimes=[10,14,18,23,30];
    function startAltar(e:(typeof events)[number]){
      if(defenseAltar!==e)defenseTime=0;
      defenseAltar=e;defenseActive=true;defenseDone=false;
      altarCircle.position.set(e.x,terrainHeight(e.x,e.z)+.13,e.z);altarCircle.visible=true;
      eventToast=e.name+' · fique dentro do círculo';
    }
    function tickAltar(dt:number){
      const e=defenseAltar;if(!e||!defenseActive)return;
      const tier=e.altarTier??0,inside=Math.hypot(player.position.x-e.x,player.position.z-e.z)<=3;
      defenseTime=Math.max(0,defenseTime+(inside?dt:-dt*1.6));
      if(defenseTime<altarTimes[tier])return;
      defenseActive=false;defenseDone=true;e.active=false;altarCircle.visible=false;
      const favored=eligibleItemPool().filter(i=>i.rarity===altarRarities[tier]);
      const count=choiceCount(permanent),prize=drawStock(1,knownItems,Math.random,favored);
      prize.push(...drawStock(count-prize.length,knownItems,Math.random,eligibleItemPool().filter(i=>!prize.includes(i))));
      choiceLevel=0;banning=false;choiceData=prize.length?prize.map(toOffer):[reserveOffer()];
      keys.clear();eventToast=e.name+' · 100% · escolha sua recompensa';snapshotTimer=0;
    }
    // Arsenal da Tenten (NPC`);
r("function zoneElapsed(){return elapsed-ZONES[zone-1].start;}","function zoneElapsed(){return Math.max(0,elapsed-zoneStart);}");
r("function summonGuardian(auto:boolean){if(guardianSpawned)","function summonGuardian(auto:boolean){if(guardianSpawned||arena||portal)");
r("if(enemy.megaElite){const pending=","if(enemy.megaElite&&!enemy.guardian){const pending=");
r("if(enemy.totem){endTotem('derrotado');return;}","if(enemy.totem){endTotem('derrotado');return;}\n      if(enemy.bijuu){defeatedBijuu=BIJUU_BY_ID[enemy.heroId!].name;enemyList.splice(i,1);disposeEnemySprite(enemy);kills++;bijuuReward=bijuuLamens(MISSION_TIER[mission],plansUsed);openPortal('exit',enemy.sprite.position.x,enemy.sprite.position.z);eventToast=defeatedBijuu+' derrotada · +'+bijuuReward+' Lamens no portal de saída';saveRun();return;}");
r("eventToast='Guardião derrotado! '","openPortal(zone===3?'arena':'zone',defeatedAt.x,defeatedAt.z);eventToast='Portal aberto! Guardião derrotado. '");
r("shikamaruPlans++;const ev=","shikamaruPlans++;plansUsed++;const ratio=(1+.33*shikamaruPlans)/(1+.33*(shikamaruPlans-1));for(const enemy of enemyList){enemy.hp*=ratio;if(enemy.maxHp)enemy.maxHp*=ratio;bossCombat.rescale(enemy,ratio);}const ev=");
r("guardião da zona deixará ${1+shikamaruPlans} kunais","${shikamaruPlans*33}% mais dificuldade nesta zona · +33% HP da Bijuu por plano · ${1+shikamaruPlans} kunais");
r("    for(let i=0;i<Math.round(25*tune().mapPickups);i++){spawnPickup((['kunai','shuriken','ryu'] as const)[i%3],(Math.random()-.5)*80,(Math.random()-.5)*80);}",`    function scatterPickups(){
      const count=Math.round((36+zone*8)*tune().mapPickups);
      for(let i=0;i<count;i++){
        const kind=i%5<3?'ryu':i%5===3?'kunai':'shuriken';
        const angle=Math.random()*Math.PI*2,radius=i<6?9+Math.random()*12:16+Math.random()*55;
        spawnPickup(kind,Math.cos(angle)*radius,Math.sin(angle)*radius);
      }
    }
    scatterPickups();
    const portalTitle=(kind:PortalKind)=>kind==='zone'?'Portal da próxima zona':kind==='arena'?'Portal para a Bijuu':'Portal de saída';
    function openPortal(kind:PortalKind,x:number,z:number){
      const mesh=new THREE.Group(),color=kind==='exit'?'#ffcf76':kind==='arena'?'#cc84ff':'#73e8de';
      mesh.add(new THREE.Mesh(new THREE.TorusGeometry(1.25,.1,8,36),new THREE.MeshBasicMaterial({color})),
        new THREE.Mesh(new THREE.CircleGeometry(1.18,36),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.23,side:THREE.DoubleSide,depthWrite:false})));
      mesh.position.set(x,terrainHeight(x,z)+1.24,z);scene.add(mesh);portal={kind,x,z,mesh};snapshotTimer=0;
    }
    function clearZone(){
      for(const enemy of enemyList)disposeEnemySprite(enemy);
      enemyList.length=0;
      for(const d of drops)scene.remove(d.mesh);drops.length=0;
      for(const p of pickups)scene.remove(p.mesh);pickups.length=0;
      for(const shot of shots){scene.remove(shot.mesh);disposeObject(shot.mesh);}shots.length=0;
      pendingHits.length=0;totem=null;totemBar?.dispose();totemBar=null;totemDiscovered=false;
      pendingSeals.length=0;lockedTarget=null;currentPing=null;clearRoute();exploredCells.clear();
      defenseAltar=null;defenseActive=false;defenseTime=0;defenseDone=false;altarCircle.visible=false;
      ebisuDeals=null;irukaLesson=null;irukaScroll=null;npcEvent=null;
    }
    function spawnBijuu(id=rollBijuu().id,saved?:{hp:number;maxHp:number}){
      const sprite=makeHero(id);sprite.scale.set(5,5.5,1);
      sprite.position.set(0,terrainHeight(0,-8)+2.5,-8);scene.add(sprite);
      const maxHp=saved?.maxHp??(4600+level*60)*MISSION_TIER[mission]*(1+.33*plansUsed);
      const beast:Enemy={heroId:id,bijuu:true,guardian:true,megaElite:true,hp:saved?.hp??maxHp,maxHp,sprite,speed:1.7,hitTimer:.5,dmgMult:2.1,defense:.14,uid:++megaUid};
      enemyList.push(beast);bossCombat.attach(beast,maxHp,true);return beast;
    }
    function enterPortal(){
      if(!portal)return;
      const {kind,mesh}=portal;portal=null;scene.remove(mesh);disposeObject(mesh);keys.clear();
      if(kind==='exit'){victory=true;snapshotTimer=0;eventToast='Missão concluída!';return;}
      clearZone();zoneStart=elapsed;player.position.set(0,terrainHeight(0,0)+.75,0);revealAround(0,0);
      invulnerability=2;
      if(kind==='arena'){
        arena=true;weather='Arena da Bijuu';scene.background=new THREE.Color('#282441');scene.fog=new THREE.Fog('#282441',15,55);
        for(const e of events){e.active=false;e.discovered=false;e.obj.visible=false;}
        const beast=spawnBijuu();eventToast=BIJUU_BY_ID[beast.heroId!].name+' · Fase 1/3';
      }else{
        zone++;guardianSpawned=false;shikamaruPlans=0;zoneDifficulty=1;xpMultiplier=1;lootMultiplier=1;
        spawnTimer=1;ambushTimer=8;megaTimer=32+Math.random()*14;megaElitesSpawned=0;totemSpawned=false;
        weatherDef=MAP.weathers[Math.floor(Math.random()*MAP.weathers.length)];weather=weatherDef.name;applyWeather();
        scatterEvents();scatterPickups();eventToast='Zona '+zone+' · 10:00 · explore os novos eventos';
      }
      snapshotTimer=0;saveRun();
    }`);
r("function interact(){let bestPickup","function interact(){if(portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<2.2){enterPortal();return;}if(arena)return;let bestPickup");
r("else runMoney+=10;","else runMoney+=14+zone*6;");
r("if(event.id==='altar'){defenseActive=true;event.active=false;defenseTime=0;eventToast='Proteja o altar: permaneça no círculo por 20 segundos.';return;}","if(event.altarTier!==undefined){startAltar(event);return;}");
let a=s.indexOf("if(!sealing){elapsed+=dt;"),b=s.indexOf("if(sealing?.phase==='sealing')",a);
if(a>=0&&b>=0)s=s.slice(0,a)+"if(!sealing){elapsed+=dt;if(!arena&&!portal&&zoneElapsed()>=ZONE_SECONDS){defeated=true;keys.clear();eventToast='O tempo da zona acabou antes de derrotar o guardião.';}}"+s.slice(b);
r("if(megaTimer<=0&&megaElitesSpawned<9","if(!arena&&megaTimer<=0&&megaElitesSpawned<9");
r("if(!testRun&&!sealing&&elapsed>=nextAccountAt)","if(!arena&&!testRun&&!sealing&&elapsed>=nextAccountAt)");
r("if(!guardianSpawned&&elapsed>=ZONES[zone-1].guardianAt)summonGuardian(true);","if(!arena&&!guardianSpawned&&zoneElapsed()>=160)summonGuardian(true);");
r("      updateTotem(dt);","      if(!arena)updateTotem(dt);");
r("ambushTimer-=dt;if(ambushTimer<=0)","ambushTimer-=dt;if(!arena&&ambushTimer<=0)");
a=s.indexOf("      if(defenseActive&&!defenseDone)");b=s.indexOf("      spawnTimer",a);
if(a>=0&&b>=0)s=s.slice(0,a)+"      tickAltar(dt);\n"+s.slice(b);
r("if(spawnTimer<=0&&enemyList.length<threat.cap)","if(!arena&&spawnTimer<=0&&enemyList.length<threat.cap)");
r("+(enemy.megaElite?1.9:1)","+enemy.sprite.scale.y*.46");
r("const stunned=enemy.controlTime>0","const stunned=!enemy.bijuu&&enemy.controlTime>0");
r("remaining:Math.max(0,ZONE_SECONDS-elapsed)","remaining:Math.max(0,ZONE_SECONDS-zoneElapsed()),phase:portal?.kind==='exit'?'exit':arena?'arena':'zone',bijuu:enemyList.find(e=>e.bijuu)?.boss?.name??defeatedBijuu,bijuuReward,plansUsed");
r("HERO_BY_ID[e.heroId!].name+' · '+Math.ceil(e.hp)","(e.bijuu?e.boss?.name+' · Fase '+e.boss?.phase+'/3':HERO_BY_ID[e.heroId!].name)+' · '+Math.ceil(e.hp)");
r("defenseProgress:defenseActive?Math.floor(defenseTime/20*100):0","defenseProgress:defenseActive&&defenseAltar?Math.floor(defenseTime/altarTimes[defenseAltar.altarTier??0]*100):0");
r("const p=pickups.find(p=>p.active&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<3.2);","if(portal&&Math.hypot(portal.x-player.position.x,portal.z-player.position.z)<3.2)return{name:portalTitle(portal.kind),description:portal.kind==='exit'?'E · finalizar e receber '+bijuuReward+' Lamens':'E · atravessar portal'};const p=pickups.find(p=>p.active&&Math.hypot(p.x-player.position.x,p.z-player.position.z)<3.2);");
r("function mapMarkers():WorldSnapshot['events']{return [","function mapMarkers():WorldSnapshot['events']{return [\n      ...(portal?[{id:'portal',name:portalTitle(portal.kind),x:portal.x,z:portal.z,icon:'🌀',kind:'event' as const,active:true}]:[]),");
r("      renderer.render(scene,camera);","      if(portal)portal.mesh.rotation.y=yaw;\n      renderer.render(scene,camera);");
r("rouletteSession:roulette};","rouletteSession:roulette,campaign:{start:zoneStart,plans:plansUsed,arena,reward:bijuuReward,bijuu:defeatedBijuu,portal:portal?{kind:portal.kind,x:portal.x,z:portal.z}:undefined,boss:enemyList.filter(e=>e.bijuu).map(e=>({id:e.heroId!,hp:e.hp,maxHp:e.maxHp!}))[0],locations:events.map(e=>({id:e.id,x:e.x,z:e.z})),pickups:pickups.filter(p=>p.active).map(p=>({kind:p.kind,x:p.x,z:p.z,discovered:!!p.discovered}))}};");
r("elapsed=s.elapsed;zone=s.zone;","elapsed=s.elapsed;zone=s.zone;const camp=s.campaign;zoneStart=camp?.start??Math.max(0,(zone-1)*200);plansUsed=camp?.plans??s.shikamaruPlans;arena=camp?.arena??false;bijuuReward=camp?.reward??0;defeatedBijuu=camp?.bijuu??'';");
r("guardianSpawned=s.guardianSpawned;","guardianSpawned=!!camp?.portal||arena;if(!guardianSpawned){const seal=events.find(e=>e.id==='guardian-seal');if(seal)seal.active=true;}");
r("if(!roulette)showRouletteItem();","if(!roulette)showRouletteItem();\n      for(const point of camp?.locations??[]){const e=events.find(e=>e.id===point.id);if(e){e.x=point.x;e.z=point.z;e.obj.position.set(e.x,terrainHeight(e.x,e.z)+e.obj.scale.y*.45,e.z);}}\n      if(camp?.pickups){for(const p of pickups)scene.remove(p.mesh);pickups.length=0;for(const p of camp.pickups){spawnPickup(p.kind,p.x,p.z);pickups.at(-1)!.discovered=p.discovered;}}\n      if(camp?.portal)openPortal(camp.portal.kind,camp.portal.x,camp.portal.z);\n      if(arena){weather='Arena da Bijuu';for(const e of events)e.obj.visible=false;if(camp?.boss)spawnBijuu(camp.boss.id,camp.boss);}");
r("      merchant:()=>showMerchant(),","      campaign:()=>({zone,zoneElapsed:zoneElapsed(),arena,portal:portal?.kind,plansUsed,bijuuReward,beast:enemyList.find(e=>e.bijuu)?.heroId,events:events.map(e=>({id:e.id,x:e.x,z:e.z})),ryu:pickups.filter(p=>p.active&&p.kind==='ryu').length}),\n      enterPortal:()=>enterPortal(),\n      merchant:()=>showMerchant(),");
fs.writeFileSync(f,s);

