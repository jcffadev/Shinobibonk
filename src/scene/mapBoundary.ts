import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { MapId } from '../game/maps';
import { WORLD_LIMIT } from '../game/worldScale';
import { ARCHITECTURE_ATLAS, fitArchitectureTile, type ArchitectureSurface } from './villageArchitecture';
import { villageRandom } from './villageDistricts';

type Ground = (x:number,z:number)=>number;
const themes:Record<MapId,{post:ArchitectureSurface;rail:ArchitectureSurface;cap:ArchitectureSurface}> = {
  folha:{post:'stone',rail:'wood',cap:'red'},
  areia:{post:'sand',rail:'clay',cap:'bronze'},
  pedra:{post:'stone',rail:'slate',cap:'blue'},
  nevoa:{post:'stone',rail:'dark',cap:'blue'},
};

function makeBorderForest(ground:Ground) {
  const texture=new THREE.TextureLoader().load('/assets/environment-v2.png');
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.magFilter=THREE.NearestFilter;
  const material=new THREE.MeshBasicMaterial({map:texture,color:0x9dbaa3,alphaTest:.35,side:THREE.DoubleSide});
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  const random=villageRandom(6839);
  for(let side=0;side<4;side++){
    const angle=side*Math.PI/2,axisX=Math.round(Math.sin(angle)),axisZ=Math.round(Math.cos(angle));
    for(let row=0;row<3;row++)for(let i=0;i<23;i++){
      const out=WORLD_LIMIT+12+row*15+random()*9;
      const along=(i-11)*8.4+(random()-.5)*9;
      const x=out*axisX+along*axisZ,z=out*axisZ-along*axisX;
      const y=ground(x,z)-.1,height=6+random()*5+row*.8,width=height*(.70+random()*.12);
      const u=(i%3===0?0:.25)+.003;
      for(const yaw of [angle+.55,angle+2.12]){
        const dx=Math.cos(yaw)*width/2,dz=Math.sin(yaw)*width/2,start=positions.length/3;
        positions.push(x-dx,y,z-dz,x+dx,y,z+dz,x+dx,y+height,z+dz,x-dx,y+height,z-dz);
        uvs.push(u,.503,u+.244,.503,u+.244,.997,u,.997);
        indices.push(start,start+1,start+2,start,start+2,start+3);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  const forest=new THREE.Mesh(geometry,material);
  forest.name='bosque-fora-do-limite';
  return forest;
}

/** O lado de dentro da cerca coincide com o limite usado pelo movimento. */
export function createMapBoundary(map:MapId, ground:Ground, surface:Ground) {
  const root=new THREE.Group();
  root.name='limite-da-missao';
  const atlas=new THREE.TextureLoader().load(ARCHITECTURE_ATLAS);
  atlas.colorSpace=THREE.SRGBColorSpace;
  atlas.anisotropy=4;
  const material=new THREE.MeshStandardMaterial({map:atlas,roughness:1});
  const theme=themes[map],line=WORLD_LIMIT+.24,sections=38,span=2*line/sections;
  const piece=new THREE.Object3D();
  for(let side=0;side<4;side++){
    const angle=side*Math.PI/2,outerX=Math.round(Math.sin(angle)),outerZ=Math.round(Math.cos(angle));
    const point=(i:number)=>{
      const along=-line+span*i;
      const x=line*outerX+along*outerZ,z=line*outerZ-along*outerX;
      return {x,z,y:surface(x,z)};
    };
    const parts:THREE.BufferGeometry[]=[];
    function box(tile:ArchitectureSurface,x:number,y:number,z:number,width:number,height:number,depth:number,slope=0) {
      const geometry=new THREE.BoxGeometry(width,height,depth);
      fitArchitectureTile(geometry,tile);
      piece.position.set(x,y,z);
      piece.rotation.set(0,angle,slope,'YXZ');
      piece.updateMatrix();
      geometry.applyMatrix4(piece.matrix);
      parts.push(geometry);
    }
    for(let i=0;i<sections;i++){
      const a=point(i),b=point(i+1);
      const height=(i%4===0?1.49:1.11),bottom=ground(a.x,a.z)-.10;
      const postDepth=.48;
      box(theme.post,a.x,(a.y+height+bottom)/2,a.z,.46,a.y+height-bottom,postDepth);
      box(i%4===0?theme.cap:theme.rail,a.x,a.y+height+.065,a.z,.54,.13,postDepth);
      const slope=Math.atan2(b.y-a.y,span),length=Math.hypot(span,b.y-a.y);
      for(const h of [.38,.85])
        box(theme.rail,(a.x+b.x)/2,(a.y+b.y)/2+h,(a.z+b.z)/2,length,.17,.23,slope);
    }
    const geometry=mergeGeometries(parts);
    parts.forEach(part=>part.dispose());
    if(geometry)root.add(new THREE.Mesh(geometry,material));
  }
  const forest=map==='folha'?makeBorderForest(ground):null;
  if(forest)root.add(forest);
  return {
    root,
    dispose(){
      root.removeFromParent();
      for(const side of root.children)(side as THREE.Mesh).geometry.dispose();
      material.dispose();
      atlas.dispose();
      forest?.material.map?.dispose();
      forest?.material.dispose();
    },
  };
}
