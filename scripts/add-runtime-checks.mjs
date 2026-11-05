import fs from 'node:fs';
let s=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
s=s.replace("inspect:()=>({heroId,level,", "inspect:()=>({hp,chakra,autoUlt,player:{x:player.position.x,z:player.position.z},atlasReady:!!player.material.map?.image?.width,visibleShots:shots.filter(s=>s.mesh.visible).length,visibleNumbers:numbers.filter(n=>n.sprite.visible).length,heroId,level,");
s=s.replace("      setCrit:(n:number)",`      setMoney:(n:number)=>{runMoney=n;},pickup:(kind:MapPickup['kind'])=>spawnPickup(kind,player.position.x,player.position.z),dismiss:()=>{choiceData=null;sealing=null;xp=0;},
+      addXp:(n:number)=>{xp+=n;},setChakra:()=>{chakra=100;},setHp:(n:number)=>{hp=n;},
+      target:(distance=2)=>{const e=spawnEnemy();e.sprite.position.copy(player.position).add(new THREE.Vector3(distance,0,0));e.hp=10000;e.speed=0;return enemyList.length;},
+      cast:(name:string)=>{const t=techniques.find(t=>t.name===name);if(t)castTechnique(t,player.position,growth[name]??NO_GROWTH);},
+      setCrit:(n:number)`.replaceAll('\n+','\n'));
fs.writeFileSync('src/scene/GameCanvas.tsx',s);

