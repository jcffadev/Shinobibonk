import * as THREE from 'three';

export const GAMABUNTA_TIME = 1.42;
export const GAMABUNTA_IGNITION = .76;

/** Fases do sprite e partículas contínuas, da boca ao ponto de ignição. */
export function createGamabunta(map:THREE.Texture, origin:THREE.Vector3, target:THREE.Vector3, right:THREE.Vector3, preview=false){
  const group=new THREE.Group();
  const sheet=map.clone();
  sheet.repeat.set(.25,.65);
  sheet.offset.y=.16;
  const frog=new THREE.Sprite(new THREE.SpriteMaterial({map:sheet,transparent:true,alphaTest:.18,depthWrite:false}));
  frog.scale.set(4.25,3.5,1);
  frog.position.copy(origin);
  frog.position.y+=.58;
  group.add(frog);

  const forward=target.clone().sub(origin).setY(0).normalize();
  frog.position.addScaledVector(forward,-1.65);
  const flipped=forward.dot(right)<0;
  const mouth=frog.position.clone().addScaledVector(right,flipped?-1.55:1.55);
  mouth.addScaledVector(forward,.5);
  mouth.y+=.42;
  const impact=target.clone();
  impact.y-=.15;
  const spread=new THREE.Vector3(-forward.z,0,forward.x);
  const motes=Array.from({length:28},(_,index)=>({
    index, seed:Math.random()*Math.PI*2, offset:Math.random()*2-1,
    light:new THREE.MeshBasicMaterial({color:'#e8aa37',transparent:true,depthWrite:false,opacity:0})
  }));
  const geometry=new THREE.IcosahedronGeometry(1,0);
  const jet=motes.map(m=>{const flame=new THREE.Mesh(geometry,m.light);flame.visible=false;group.add(flame);return flame;});

  function tick(age:number){
    const frame=age<.17?0:age<.35?1:age<1.03&&!preview?2:3;
    sheet.repeat.x=flipped?-.25:.25;
    sheet.offset.x=(frame+Number(flipped))/4;
    frog.material.opacity=Math.min(1,age*13,(GAMABUNTA_TIME-age)*6);
    frog.scale.y=3.5*(1+.024*Math.sin(age*15));
    group.userData.gamabuntaPhase=age<.35?'preparo':age<GAMABUNTA_IGNITION?'óleo':'fogo';
    if(preview)return;
    for(const [i,mote] of motes.entries()){
      const elapsed=age-.34-mote.index*.015;
      const progress=elapsed/.43;
      const flame=jet[i];
      flame.visible=progress>=0&&progress<1.37;
      if(!flame.visible)continue;
      const travel=Math.min(1,progress);
      const ignition=Math.max(0,1-(age-GAMABUNTA_IGNITION)*2.8);
      const burning=age>=GAMABUNTA_IGNITION&&travel>=ignition;
      const lateral=mote.offset*travel*(burning?1.35:.24);
      flame.position.copy(mouth).lerp(impact,travel).addScaledVector(spread,lateral);
      flame.position.y+=Math.sin(progress*Math.PI)*.25+(burning?Math.max(0,progress-.3)*.65:0);
      flame.scale.setScalar(burning?.17+travel*.48:.09+travel*.13);
      flame.rotation.set(mote.seed+age*5,age*7,mote.seed);
      mote.light.color.set(burning?(i%3===0?'#fff0a1':i%3===1?'#ff932b':'#ff4d27'):'#b97722');
      mote.light.opacity=Math.min(1,(1.37-progress)*3)*(burning?.93:.86);
    }
  }
  group.addEventListener('removed',()=>sheet.dispose());
  return {group,tick};
}
