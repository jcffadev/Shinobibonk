import * as THREE from 'three';

let atlas:THREE.Texture|undefined;

export function createAtlasEffect(kind:'substitution'|'sage'){
  if(!atlas){
    atlas=new THREE.TextureLoader().load('/assets/sage-substitution-effects-v1.png');
    atlas.colorSpace=THREE.SRGBColorSpace;
    atlas.minFilter=atlas.magFilter=THREE.NearestFilter;
    atlas.generateMipmaps=false;
  }
  const map=atlas.clone(),sage=kind==='sage';
  map.repeat.set(.25,.5);
  const material=new THREE.SpriteMaterial({map,transparent:true,alphaTest:sage?.25:.63,depthWrite:false});
  material.onBeforeCompile=shader=>{
    const filter=sage
      ?'if (min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)) > .74 && max(diffuseColor.r,max(diffuseColor.g,diffuseColor.b))-min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)) < .075) discard;'
      :'if (min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b)) > .87) discard;';
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n'+filter);
  };
  material.customProgramCacheKey=()=>kind;
  const sprite=new THREE.Sprite(material);
  sprite.scale.set(sage?2.6:2.0,sage?2.6:2.0,1);
  const frame=(index:number)=>map.offset.set(index*.25,sage?0:.5);
  frame(0);
  return {sprite,frame,dispose:()=>{map.dispose();material.dispose();}};
}
