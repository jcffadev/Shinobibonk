import * as THREE from 'three';
import type { MapId } from '../game/maps';
import { RENDERED_GROUND_SIZE } from './terrainArt';
import { waterDistance, type WaterBody } from './water';

/** Divide só as células molhadas e vizinhas. Vizinhas secas compartilham os vértices extras da borda. */
export function createTerrainGeometry(map:MapId,ground:(x:number,z:number)=>number,
  waters?:readonly WaterBody[],size=RENDERED_GROUND_SIZE) {
  const cells=Math.ceil(size),sub=4,step=size/cells,half=size*.5,span=cells*sub;
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];
  const detailed=new Uint8Array(cells*cells);
  const additional=new Map<number,number>();
  function vertex(x:number,z:number) {
    const u=x/span,v=z/span,index=positions.length/3;
    const wx=u*size-half,wz=v*size-half;
    positions.push(wx,ground(wx,wz),wz);
    uvs.push(u,1-v);
    return index;
  }
  for(let z=0;z<=cells;z++)for(let x=0;x<=cells;x++)vertex(x*sub,z*sub);
  for(let z=0;z<cells;z++)for(let x=0;x<cells;x++){
    if(waterDistance(map,(x+.5)*step-half,(z+.5)*step-half,waters).outside<step*1.25)
      detailed[z*cells+x]=1;
  }
  function point(x:number,z:number) {
    if(x%sub===0&&z%sub===0)return z/sub*(cells+1)+x/sub;
    const key=z*(span+1)+x,existing=additional.get(key);
    if(existing!==undefined)return existing;
    const index=vertex(x,z);
    additional.set(key,index);
    return index;
  }
  function grid(x:number,z:number,n:number) {
    const stride=sub/n;
    for(let row=0;row<sub;row+=stride)for(let col=0;col<sub;col+=stride){
      const a=point(x+col,z+row),b=point(x+col,z+row+stride);
      const c=point(x+col+stride,z+row+stride),d=point(x+col+stride,z+row);
      indices.push(a,b,d,b,c,d);
    }
  }
  for(let z=0;z<cells;z++)for(let x=0;x<cells;x++){
    const i=z*cells+x,sx=x*sub,sz=z*sub;
    const north=z>0&&detailed[i-cells],south=z<cells-1&&detailed[i+cells];
    const west=x>0&&detailed[i-1],east=x<cells-1&&detailed[i+1];
    if(detailed[i])grid(sx,sz,sub);
    else if(north||south||west||east){
      const rim=[point(sx,sz)];
      if(north)for(let d=1;d<sub;d++)rim.push(point(sx+d,sz));
      rim.push(point(sx+sub,sz));
      if(east)for(let d=1;d<sub;d++)rim.push(point(sx+sub,sz+d));
      rim.push(point(sx+sub,sz+sub));
      if(south)for(let d=sub-1;d>0;d--)rim.push(point(sx+d,sz+sub));
      rim.push(point(sx,sz+sub));
      if(west)for(let d=sub-1;d>0;d--)rim.push(point(sx,sz+d));
      const center=point(sx+sub/2,sz+sub/2);
      for(let j=0;j<rim.length;j++)indices.push(center,rim[(j+1)%rim.length],rim[j]);
    }else grid(sx,sz,1);
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
