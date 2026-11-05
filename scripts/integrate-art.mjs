import fs from 'node:fs';
let s=fs.readFileSync('src/scene/GameCanvas.tsx','utf8');
s=s.replace('formAt, spriteFile','formAt, portraitRegion');
let a=s.indexOf('    const heroMaterial='),b=s.indexOf('    const makeHero=',a);
s=s.slice(0,a)+`    const heroMaterial=(id:string,lv=1)=>{const r=portraitRegion(id,lv),key=r.path+':'+r.index;let map=heroTextures.get(key);if(!map){map=new THREE.TextureLoader().load(r.path);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.repeat.set(1/r.cols,1/r.rows);map.offset.set((r.index%r.cols)/r.cols,(r.rows-1-Math.floor(r.index/r.cols))/r.rows);heroTextures.set(key,map);}return new THREE.SpriteMaterial({map,transparent:true,alphaTest:.1,depthWrite:false});};
`+s.slice(b);
s=s.replace("if(def.id==='orochimaru'){obj.material.map?.dispose();obj.material.map=orochimaruTexture.clone();obj.material.map.needsUpdate=true;obj.material.needsUpdate=true;obj.scale.set(2.2,3.1,1);}","if(def.id==='orochimaru'){obj.material.dispose();obj.material=heroMaterial('orochimaru');obj.scale.set(2.2,3.1,1);}");
s=s.replace('Math.min((now-last)/1000,.05)','Math.max(0,Math.min((now-last)/1000,.05))');
// Ground texture is deterministic code-native surface detail, no external image editing.
s=s.replace("new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:true})","new THREE.MeshStandardMaterial({vertexColors:true,map:groundTexture,roughness:1,flatShading:true})");
s=s.replace('    const terrainGeometry=',`    const tile=document.createElement('canvas');tile.width=tile.height=64;const tileCtx=tile.getContext('2d')!;tileCtx.fillStyle='#b7c698';tileCtx.fillRect(0,0,64,64);for(let i=0;i<700;i++){const x=(i*37)%64,y=(i*17+Math.floor(i/64)*7)%64;tileCtx.fillStyle=['#91a778','#c5d4ad','#acbd91','#7f996a'][i%4];tileCtx.fillRect(x,y,1+(i%3),1+(i%2));}const groundTexture=new THREE.CanvasTexture(tile);groundTexture.wrapS=groundTexture.wrapT=THREE.RepeatWrapping;groundTexture.repeat.set(32,32);groundTexture.magFilter=THREE.NearestFilter;groundTexture.colorSpace=THREE.SRGBColorSpace;
    const terrainGeometry=`);
// Tree crown replaces box placeholder with a low-poly leafy silhouette; dense yet bounded.
s=s.replace('new THREE.BoxGeometry(size,size*.85,size)','new THREE.IcosahedronGeometry(size*.62,1)');
s=s.replace("texture.dispose();orochimaruTexture.dispose();","groundTexture.dispose();texture.dispose();orochimaruTexture.dispose();");
fs.writeFileSync('src/scene/GameCanvas.tsx',s);
s=fs.readFileSync('src/ui/RunSheet.tsx','utf8').replace('spriteFile,formAt','portraitRegion,formAt');
a=s.indexOf('export function HeroPortrait(');b=s.indexOf('const fmt=',a);
s=s.slice(0,a)+`export function HeroPortrait({id,level=1}:{id:string;level?:number}){const r=portraitRegion(id,level);return <span className="hero-sprite roster-sprite" role="img" aria-label={HERO_BY_ID[id]?.name??id} style={{backgroundImage:\`url(\${r.path})\`,backgroundSize:\`\${r.cols*100}% \${r.rows*100}%\`,backgroundPosition:\`\${(r.index%r.cols)/(r.cols-1)*100}% \${Math.floor(r.index/r.cols)/(r.rows-1)*100}%\`}}/>;}
`+s.slice(b);fs.writeFileSync('src/ui/RunSheet.tsx',s);

