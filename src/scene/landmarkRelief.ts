
import * as THREE from 'three';
import { LEAF_RELIEF_PROFILES } from './leafReliefProfiles';

export const HOKAGE_MOUNTAIN_ROUTE = [
  {dx:-24.5,dz:-2.3,height:.12,width:3.8,depth:3.0},
  {dx:-21.3,dz:-3.6,height:.25,width:4.1,depth:3.3},
  {dx:-18.3,dz:-4.7,height:.38,width:4.3,depth:3.4},
  {dx:-15.4,dz:-5.8,height:.51,width:4.2,depth:3.6},
  {dx:-12.5,dz:-7,height:.64,width:4.5,depth:3.8},
  {dx:-9.6,dz:-7.6,height:.76,width:4.7,depth:4.0},
  {dx:2.9,dz:-9.0,height:.83,width:24,depth:4.5},
] as const;

/** O verso curvo acompanha a silhueta, com arte dedicada nas estátuas. */
export function makeLandmarkRelief(
  index:number,width:number,height:number,depth:number,art:THREE.Texture,stone:THREE.Material,
  options:{footing?:(x:number,z:number)=>number; backArt?:THREE.Texture}={},
) {
  const {footing,backArt}=options;
  const root=new THREE.Group();
  const faceGeometry=new THREE.PlaneGeometry(width,height,footing?48:1,footing?32:1);
  const face=new THREE.Mesh(faceGeometry,
    new THREE.MeshBasicMaterial({map:art,alphaTest:.26}));
  face.position.set(0,height/2,.025);
  root.add(face);

  const rows=LEAF_RELIEF_PROFILES[index],positions:number[]=[],uv:number[]=[],backUv:number[]=[],indices:number[]=[];
  const cols=12;
  for(const [row,[y,left,right]] of rows.entries()){
    const center=(left+right)/2,radius=(right-left)/2;
    for(let col=0;col<=cols;col++){
      const angle=Math.PI*(1-col/cols);
      const breadth=Math.sin(angle);
      const irregular=.84+.105*Math.cos(row*.48+col*.92)+.055*Math.sin(col*2.3);
      const x=center+radius*Math.cos(angle);
      positions.push(width*x,height*y,-depth*breadth*irregular);
      uv.push(col/cols,y);
      if(backArt)backUv.push((index-1+.5-x)*.5,y,THREE.MathUtils.smoothstep(breadth,.03,.55));
      if(row>0&&col>0){
        const i=row*(cols+1)+col,prev=i-cols-1;
        indices.push(i-1,prev-1,prev,i-1,prev,i);
      }
    }
  }
  // As laterais chegam à borda da face pintada; comprimento e altura deixam de ser prismas retangulares.
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  geometry.setIndex(indices);
  if(footing){
    // Enterra a borda do alfa na encosta, tanto na face pintada quanto no verso de pedra.
    function embedBase(mesh:THREE.BufferGeometry,yOffset:number,zOffset:number) {
      const points=mesh.attributes.position;
      for(let i=0;i<points.count;i++){
        const x=points.getX(i),y=points.getY(i)+yOffset,z=points.getZ(i)+zOffset;
        const blend=1-THREE.MathUtils.smoothstep(y/height,.205,.39);
        if(blend===0)continue;
        const edgeZ=z+blend*.55*(z < -depth*.55 ? -1 : 1);
        const buried=footing!(x,edgeZ)-height*.232-.38;
        points.setXYZ(i,x,y+blend*buried-yOffset,edgeZ-zOffset);
      }
    }
    embedBase(faceGeometry,face.position.y,face.position.z);
    embedBase(geometry,0,0);
  }
  let backMaterial=stone;
  if(backArt){
    geometry.setAttribute('backArtUv',new THREE.Float32BufferAttribute(backUv,3));
    backMaterial=stone.clone();
    backMaterial.userData.backArt=backArt;
    backMaterial.onBeforeCompile=shader=>{
      shader.uniforms.backArt={value:backArt};
      shader.vertexShader='attribute vec3 backArtUv; varying vec3 carvedUv;\n'+shader.vertexShader
        .replace('#include <uv_vertex>','#include <uv_vertex>\ncarvedUv=backArtUv;');
      shader.fragmentShader='uniform sampler2D backArt; varying vec3 carvedUv;\n'+shader.fragmentShader
        .replace('#include <map_fragment>',`
          #include <map_fragment>
          vec4 sculpture=texture2D(backArt,carvedUv.xy);
          if(sculpture.a<.20)discard;
          float carving=smoothstep(.20,.75,sculpture.a)*carvedUv.z;
          diffuseColor.rgb=mix(diffuseColor.rgb,sculpture.rgb,carving);
        `);
    };
    backMaterial.customProgramCacheKey=()=> 'valley-statue-carving';
  }
  geometry.computeVertexNormals();
  const rock=new THREE.Mesh(geometry,backMaterial);
  rock.name='landmark-rock-relief';
  root.add(rock);
  return root;
}
