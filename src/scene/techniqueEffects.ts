import * as THREE from 'three';
import type { Technique } from '../game/heroes';

/** Small reusable shapes; damage and hitboxes are owned by the simulation. */
export function techniqueVisual(t:Technique, clone?:()=>THREE.Sprite):THREE.Object3D {
  const group=new THREE.Group();
  const material=new THREE.MeshBasicMaterial({color:t.color,transparent:true,opacity:.9});
  const mesh=(geometry:THREE.BufferGeometry)=>new THREE.Mesh(geometry,material);
  if(t.name.includes('Bunshin')&&clone){group.add(clone());return group;}
  if(t.name.includes('Rasengan')){
    group.add(mesh(new THREE.SphereGeometry(.3,10,8)));
    for(let i=0;i<3;i++){const swirl=new THREE.Mesh(new THREE.TorusGeometry(.4,.035,4,20),new THREE.MeshBasicMaterial({color:'#d9fbff'}));swirl.rotation.set(i*Math.PI/3,i*Math.PI/4,0);group.add(swirl);}
  }else if(t.element==='Madeira'||t.element==='Sábio'){
    for(let i=0;i<3;i++){const wood=mesh(new THREE.BoxGeometry(.14,.65+i*.2,.18));wood.position.x=(i-1)*.22;wood.rotation.z=(i-1)*.3;group.add(wood);}
  }else if(t.element==='Areia'){
    for(let i=0;i<7;i++){const grain=mesh(new THREE.OctahedronGeometry(.12+(i%3)*.04));grain.position.set(Math.cos(i)*.35,(i%3)*.16,Math.sin(i)*.35);group.add(grain);}
  }else if(t.shape==='Onda'||t.shape==='Cone'||t.shape==='Em V'){
    const arc=mesh(new THREE.TorusGeometry(.6,.07,4,16,Math.PI*1.2));arc.rotation.x=Math.PI/2;group.add(arc);
  }else if(t.school==='Genjutsu'){
    const illusion=mesh(new THREE.TorusGeometry(.5,.06,4,16));illusion.rotation.x=Math.PI/2;group.add(illusion);group.add(mesh(new THREE.OctahedronGeometry(.22)));
  }else if(t.shape==='Corpo a corpo'){
    group.add(mesh(new THREE.TorusGeometry(.5,.09,4,12,Math.PI)));
  }else if(t.element==='Fogo'){
    group.add(mesh(new THREE.IcosahedronGeometry(.32)));const flame=mesh(new THREE.ConeGeometry(.24,.8,5));flame.rotation.x=Math.PI/2;group.add(flame);
  }else{
    const star=mesh(new THREE.OctahedronGeometry(.25));star.scale.y=.25;group.add(star);
  }
  return group;
}
export function disposeObject(object:THREE.Object3D){object.traverse(child=>{if(child instanceof THREE.Mesh){child.geometry.dispose();const materials=Array.isArray(child.material)?child.material:[child.material];materials.forEach(m=>m.dispose());}else if(child instanceof THREE.Sprite){child.material.dispose();}});}
