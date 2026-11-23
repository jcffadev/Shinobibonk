
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

/** A frente conserva a arte. O verso é rocha tridimensional limitada pela silhueta de cada fileira. */
export function makeLandmarkRelief(index:number,width:number,height:number,depth:number,art:THREE.Texture,stone:THREE.Material) {
  const root=new THREE.Group();
  const face=new THREE.Mesh(new THREE.PlaneGeometry(width,height),
    new THREE.MeshBasicMaterial({map:art,alphaTest:.26}));
  face.position.set(0,height/2,.025);
  root.add(face);

  const rows=LEAF_RELIEF_PROFILES[index],positions:number[]=[],uv:number[]=[],indices:number[]=[];
  const cols=12;
  for(const [row,[y,left,right]] of rows.entries()){
    const center=(left+right)/2,radius=(right-left)/2;
    for(let col=0;col<=cols;col++){
      const angle=Math.PI*(1-col/cols);
      const breadth=Math.sin(angle);
      const irregular=.84+.105*Math.cos(row*.48+col*.92)+.055*Math.sin(col*2.3);
      positions.push(width*(center+radius*Math.cos(angle)),height*y,-depth*breadth*irregular);
      uv.push(col/cols,y);
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
  geometry.computeVertexNormals();
  const rock=new THREE.Mesh(geometry,stone);
  rock.name='landmark-rock-relief';
  root.add(rock);
  return root;
}
