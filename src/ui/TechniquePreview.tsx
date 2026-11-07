import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { portraitRegion } from '../game/evolution';
import { familyOf, type Technique } from '../game/heroes';
import { animateTechniqueVisual, disposeObject, techniqueImpact, techniqueVisual } from '../scene/techniqueEffects';
import { createAtlasEffect } from '../scene/atlasEffects';
import { createPlayerMotion } from '../scene/playerMotion';
import { createGamabunta, GAMABUNTA_IGNITION, GAMABUNTA_TIME } from '../scene/gamabunta';
import { createParticleFx } from '../scene/particleFx';
import { createSusanooFx, susanooStyleFor } from '../scene/susanooFx';

export function TechniquePreview({technique,heroId}:{technique:Technique;heroId:string}){
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const box=host.current;
    if(!box)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-5,5,3,-3,.1,40);
    camera.position.set(3.1,7,10);
    camera.lookAt(0,.25,0);
    const loader=new THREE.TextureLoader(),maps:THREE.Texture[]=[];
    function texture(path:string){
      const map=loader.load(path);
      map.colorSpace=THREE.SRGBColorSpace;map.minFilter=map.magFilter=THREE.NearestFilter;
      map.generateMipmaps=false;maps.push(map);
      return map;
    }
    const region=portraitRegion(heroId);
    const character=texture(region.path);
    character.repeat.set(1/region.cols,1/region.rows);
    character.offset.set(region.index%region.cols/region.cols,1-(1+Math.floor(region.index/region.cols))/region.rows);
    const enemyArt=texture('/assets/shinobi-enemy-motion-v1.png');
    enemyArt.repeat.set(1/6,.25);enemyArt.offset.set(1/6,.75);
    const actor=(map:THREE.Texture,x:number,z:number)=>{
      const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,alphaTest:.32,transparent:true}));
      sprite.scale.set(1.9,2.2,1);sprite.position.set(x,1,z);scene.add(sprite);return sprite;
    };
    const player=actor(character,-2.6,0);
    const playerMotion=createPlayerMotion(scene,player,heroId,false);
    const dummies=[actor(enemyArt,2,0),actor(enemyArt,3,.75),actor(enemyArt,2.7,-1.1)];
    const grid=new THREE.GridHelper(12,12,'#397065','#2c4f50');
    scene.add(grid);
    const forward=new THREE.Vector3(1,0,0);
    const susanoo=/susano/i.test(technique.name);
    const particles=susanoo?createParticleFx(scene,()=>0):null;
    const guardian=particles?createSusanooFx(scene,particles,()=>0):null;
    const impact=techniqueImpact(technique);impact.position.copy(dummies[0].position);scene.add(impact);
    const frog=familyOf(heroId)==='naruto'&&technique.name==='Invocação do Sapo'
      ?createGamabunta(texture('/assets/gamabunta-oil-v1.png'),player.position,dummies[0].position,forward):null;
    const movingClone=technique.name==='Kage Bunshin'||technique.name==='Técnica de Substituição';
    const clone=movingClone?actor(character,-2.6,0):null;
    const cloneMotion=clone?createPlayerMotion(scene,clone,heroId,false):null;
    const sage=technique.setup?.sage?createAtlasEffect('sage'):null;
    const effect=frog?.group??sage?.sprite??techniqueVisual(technique);
    scene.add(effect);
    const travel=movingClone||['Projétil','Em V','Onda'].includes(technique.shape);
    const anchored=technique.setup||['Órbita','Cone','Linha','Corpo a corpo'].includes(technique.shape);
    const resize=()=>{
      const w=Math.max(1,box.clientWidth),h=Math.max(1,box.clientHeight),ratio=w/h;
      camera.left=-3.05*ratio;camera.right=3.05*ratio;camera.updateProjectionMatrix();
      renderer.setSize(w,h,false);
    };
    const observer=new ResizeObserver(resize);
    box.appendChild(renderer.domElement);resize();observer.observe(box);
    let start=0,last=0,lastAge=0;
    renderer.setAnimationLoop((now)=>{
      start ||= now;
      const age=(now-start)/1000%2.65,dt=Math.min(.05,(now-(last||now))/1000);
      last=now;
      if(age<lastAge){guardian?.clear();particles?.clear();}
      if(lastAge<.25&&age>=.25){
        playerMotion.attack(['Projétil','Em V'].includes(technique.shape),false,false,technique.school==='Taijutsu'?'punch':undefined,/Bunshin|Caixão de Areia/.test(technique.name));
        guardian?.trigger(susanooStyleFor(familyOf(heroId)),player.position,forward,dummies[0].position,1.2);
      }
      lastAge=age;
      playerMotion.update(dt,0,1,1,false,false,false,1,0,false,false,0,0);
      const p=Math.max(0,Math.min(1,(age-.33)/.54));
      const hitAt=frog?GAMABUNTA_IGNITION+.23:susanoo?.47:.88;
      const hit=!technique.setup&&age>=hitAt&&age<hitAt+.23;
      for(const [i,dummy] of dummies.entries()){
        const contacted=i===0||['Área','Cone','Onda','Órbita','Em V'].includes(technique.shape);
        dummy.material.color.set(hit&&contacted?'#ff796b':'#ffffff');
      }
      impact.visible=hit;
      impact.scale.setScalar(1+Math.max(0,age-hitAt)*4);
      impact.quaternion.copy(camera.quaternion);
      if(clone){
        clone.visible=age>=.33&&age<hitAt;
        clone.position.copy(player.position).lerp(dummies[0].position,p);
        cloneMotion?.update(dt,0,1,1,clone.visible,false,false,1,0,false,false,0,0);
        if(import.meta.env.DEV)renderer.domElement.dataset.clonePose=cloneMotion?.state()??'';
      }
      if(guardian){
        effect.visible=false;
        impact.visible=false;
        guardian.update(dt,camera);
        particles?.update(dt);
        if(import.meta.env.DEV)renderer.domElement.dataset.susanoo=JSON.stringify(guardian.active());
      }else if(frog){
        effect.visible=age>=.23&&age<.23+GAMABUNTA_TIME;
        if(effect.visible)frog.tick(age-.23);
      }else{
        effect.visible=age>=.33&&age<(technique.setup?1.65:1.23)&&(!movingClone||technique.name==='Técnica de Substituição'&&age>=hitAt);
        effect.position.copy(anchored&&!movingClone?player.position:travel?player.position.clone().lerp(dummies[0].position,p):dummies[0].position);
        effect.scale.setScalar(technique.setup?1+p:Math.max(.65,p*1.45));
        if(sage){sage.frame(Math.floor(age*9)%4);effect.scale.set(2.6,2.6,1);}
        else if(movingClone&&effect.userData.atlasFrame)effect.userData.atlasFrame(Math.max(0,age-hitAt));
        else animateTechniqueVisual(effect,dt,forward);
      }
      renderer.render(scene,camera);
    });
    return()=>{
      renderer.setAnimationLoop(null);observer.disconnect();guardian?.dispose();particles?.dispose();cloneMotion?.dispose();playerMotion.dispose();sage?.dispose();effect.removeFromParent();disposeObject(effect);
      scene.traverse(child=>{
        if(child instanceof THREE.Sprite)child.material.dispose();
      });
      grid.geometry.dispose();grid.material.dispose();disposeObject(impact);
      for(const map of maps)map.dispose();
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();
    };
  },[technique.name,technique.element,technique.shape,heroId]);
  return <div ref={host} className="technique-preview" role="img" aria-label={'Prévia da técnica '+technique.name}/>;
}
