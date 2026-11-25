import * as THREE from 'three';
import { HAGOROMO } from '../game/hagoromoTraining';

type Phase = 'wave' | 'boss' | 'complete';

export function createHagoromoSeal(scene:THREE.Scene,x:number,y:number,z:number) {
  const root=new THREE.Group();
  root.name='selo-do-hagoromo';
  root.position.set(x,y+.06,z);
  const paint=(color:string,opacity:number)=>new THREE.MeshBasicMaterial({
    color,opacity,transparent:true,depthWrite:false,side:THREE.DoubleSide,
    polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2,
  });
  const ringPaint=paint('#a57bfa',.34),corePaint=paint('#e4cdff',.57);
  const radius=HAGOROMO.arenaRadius;
  const rim=new THREE.RingGeometry(radius-.11,radius,80).rotateX(-Math.PI/2);
  const inner=new THREE.RingGeometry(2.58,2.65,48).rotateX(-Math.PI/2);
  const glyphs=new THREE.Group();
  const glyph=new THREE.RingGeometry(.17,.24,12).rotateX(-Math.PI/2);
  for(let i=0;i<6;i++){
    const marker=new THREE.Mesh(glyph,corePaint);
    const angle=i*Math.PI/3;
    marker.position.set(Math.cos(angle)*2.18,.01,Math.sin(angle)*2.18);
    glyphs.add(marker);
  }
  root.add(new THREE.Mesh(rim,ringPaint),new THREE.Mesh(inner,ringPaint),glyphs);
  root.visible=false;
  scene.add(root);
  let pulse=0;
  const colors={ wave:'#a57bfa',boss:'#ea9ef3',complete:'#a3e4b5' };
  return {
    root,
    update(phase:Phase|null,dt:number,hidden:boolean){
      root.visible=phase!==null&&!hidden;
      if(!root.visible||phase===null)return;
      pulse+=dt;
      glyphs.rotation.y=pulse*(phase==='boss'?.8:.43);
      ringPaint.color.set(colors[phase]);
      ringPaint.opacity=.3+.09*Math.sin(pulse*2.7);
      corePaint.opacity=.55+.15*Math.sin(pulse*3.5);
    },
    dispose(){
      root.removeFromParent();
      rim.dispose();inner.dispose();glyph.dispose();
      ringPaint.dispose();corePaint.dispose();
    },
  };
}
