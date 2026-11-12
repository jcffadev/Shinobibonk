import * as THREE from 'three';

export const KUROARI_TIME = 1.1;
export const KUROARI_STRIKE = .55;
export const KUROARI_ART='/assets/shinobi-motion/kuroari-cast-v4.png';
export const KAZEKAGE_PUPPET_ART='/assets/shinobi-motion/kazekage-puppet-cast-v1.png';
export function puppetArt(name:string){return name==='Kuroari'||name==='Prisão de Kuroari'?KUROARI_ART:name==='Mil Braços do Escorpião'?KAZEKAGE_PUPPET_ART:undefined;}

/** Kuroari, a Formiga Negra de Kankuro. Quatro quadros da invocação em kuroari-cast-v4.png. */
export function createKuroari(map:THREE.Texture, origin:THREE.Vector3, target:THREE.Vector3, right:THREE.Vector3){
  const group=new THREE.Group();
  const sheet=map.clone();
  sheet.repeat.set(.25,1);
  const pup=new THREE.Sprite(new THREE.SpriteMaterial({map:sheet,transparent:true,alphaTest:.18,depthWrite:false}));
  const BASE=1.7;
  pup.scale.set(BASE,BASE,1);
  group.add(pup);

  const forward=target.clone().sub(origin).setY(0);
  const dist=forward.length()||1;
  forward.normalize();
  const flipped=forward.dot(right)<0;
  const impact=target.clone();impact.y-=.04;
  const start=origin.clone();start.y+=.05;
  // Ponto de apoio um pouco antes do impacto: o estouro cobre o centro da área do golpe.
  const stand=impact.clone().addScaledVector(forward,-Math.min(.9,dist*.3));stand.y=impact.y;

  function tick(age:number){
    const frame=age<.2?0:age<KUROARI_STRIKE?1:age<.8?2:3;
    sheet.repeat.x=flipped?-.25:.25;
    sheet.offset.x=(frame+Number(flipped))/4;
    const appear=Math.min(1,age*9);
    const vanish=age>.85?Math.min(1,(age-.85)/.25):0;
    pup.material.opacity=Math.min(1,appear)*(1-vanish);
    // Avanço do invocador até o ponto de apoio (desacelera no final), depois fica no estouro.
    const travel=Math.min(1,Math.max(0,(age-.15)/.4));
    const eased=1-Math.pow(1-travel,3);
    pup.position.copy(start).lerp(stand,eased);
    pup.scale.y=BASE*(1+.03*Math.sin(age*18));
    group.userData.kuroariPhase=age<.2?'invocacao':age<KUROARI_STRIKE?'preparo':'estouro';
  }
  group.addEventListener('removed',()=>sheet.dispose());
  return {group,tick};
}
