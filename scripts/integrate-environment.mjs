import fs from 'node:fs';
const file='src/scene/GameCanvas.tsx';let s=fs.readFileSync(file,'utf8');
let a=s.indexOf('    const cliffMat='),b=s.indexOf('    const texture =',a);s=s.slice(0,a)+s.slice(b);
a=s.indexOf('    const treeMat=');b=s.indexOf('    const eventDefs=',a);
s=s.slice(0,a)+`    const environmentMaps=new Map<number,THREE.Texture>(),decor:THREE.Sprite[]=[];
    const environmentSprite=(index:number,width:number,height:number)=>{let map=environmentMaps.get(index);if(!map){map=new THREE.TextureLoader().load('/assets/environment-v2.png');map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(.25,.5);map.offset.set((index%4)*.25,(1-Math.floor(index/4))*.5);environmentMaps.set(index,map);}const obj=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false}));obj.scale.set(width,height,1);return obj;};
    const scenery=(index:number,x:number,z:number,w:number,h:number)=>{const obj=environmentSprite(index,w,h);obj.position.set(x,terrainHeight(x,z)+h*.45,z);scene.add(obj);decor.push(obj);};
    // Keep paths and the spawn clearing open; scatter foliage across hills.
    for(let i=0;i<150;i++){const x=(Math.random()-.5)*94,z=(Math.random()-.5)*94;if(Math.hypot(x,z)<6||Math.abs(x-Math.sin(z*.15)*5)<2.5)continue;const kind=i%9===0?3:i%5===0?2:i%3===0?1:0;scenery(kind,x,z,kind===3?2.4:3.2,kind===3?1.8:4.2);}
    scenery(4,0,-12,7,6);for(const [x,z] of [[-7,-17],[7,-18],[-10,18],[12,19]])scenery(7,x,z,5.5,5.5);
`+s.slice(b);
s=s.replace('const obj=makeSprite(def.sprite,2.6,2.6);',"const obj=environmentSprite(def.id==='slot'?5:def.id==='trader'?7:6,3.2,3.2);");
s=s.replace('environmentMaps', 'environmentMaps');
s=s.replace("heroTextures.forEach(t=>t.dispose());", "environmentMaps.forEach(t=>t.dispose());heroTextures.forEach(t=>t.dispose());");
s=s.replace('      // Só registra o evento',"      for(const tree of decor)tree.material.opacity=tree.position.distanceTo(player.position)<3?.45:1;\n      // Só registra o evento");
s=s.replace("if(event.id==='mega'){event.active=false;spawnEnemy(false,true);eventToast='Orochimaru invocado por Edo Tensei!';return;}",'');
s=s.replaceAll("'rhydon'","'guardian-altar'").replaceAll("'snorlax'","'tsunade'");
fs.writeFileSync(file,s);

