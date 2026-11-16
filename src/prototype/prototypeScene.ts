import * as THREE from 'three';
import { prototypeTextureUrl } from './prototypeTexture';
import { runningArt, runningRow } from '../game/runningArt';
import { translateKey } from '../game/settings';
import { createPrototypeArt } from './prototypeArt';
import { createCrowd } from './prototypeCrowd';
import { BENCHMARK_CASES, frameStats, type BenchmarkConfig, type BenchmarkResult } from './prototypeBenchmark';
import { cameraInput, createPrototypePlayer, inCity, IRUKA, PROTOTYPE_CAMERA, type Point } from './prototypeWorld';

const DEFAULT:BenchmarkConfig={avatar:'low-poly',texture:4096,enemies:0,effects:true};
const TRAINER_TEXT='Iruka: faça um selo com R. Passe pelo portão e use Espaço junto a uma parede para escalar.';
const look = (value:number,min:number,max:number) => Math.min(max,Math.max(min,value));

export type PrototypeReadout={
  config:BenchmarkConfig; preparing:boolean; place:string; action:string; message:string; nearby:boolean;
  fps:number; triangles:number; calls:number; progress:number|null; finished:BenchmarkResult[]|null;
};

export function createPrototypeScene(host:HTMLDivElement,publish:(data:PrototypeReadout)=>void) {
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.append(renderer.domElement);

  const camera=new THREE.PerspectiveCamera(PROTOTYPE_CAMERA.fov,1,.09,240);
  const scene=new THREE.Scene();
  scene.background=new THREE.Color('#9ac5d3');
  scene.fog=new THREE.Fog('#9fbec7',46,117);
  scene.add(new THREE.HemisphereLight('#e4f3ff','#917665',2.15));
  const sun=new THREE.DirectionalLight('#fff1d2',1.85);
  sun.position.set(-22,35,20);
  sun.target.position.set(0,0,-17);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-46,right:46,top:45,bottom:-45,near:1,far:112});
  sun.shadow.normalBias=.075;
  scene.add(sun,sun.target);

  const loader=new THREE.TextureLoader();
  const materialSeed = new THREE.DataTexture(new Uint8Array([165,150,118,255]),1,1);
  materialSeed.needsUpdate=true;
  materialSeed.colorSpace=THREE.SRGBColorSpace;
  const art=createPrototypeArt(materialSeed);
  const village=art.makeVillage(scene);
  const avatar=art.makeNaruto(scene);
  const idle=loader.load('/assets/shinobi-roster-v2.png');
  const running=runningArt('naruto-shippuden')!;
  const walkMap=loader.load(running.path);
  const castMap=loader.load('/assets/naruto-shippuden-motion-v1.png');
  for (const texture of [idle,walkMap,castMap]) {
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=THREE.NearestFilter;
    texture.minFilter=THREE.NearestFilter;
    texture.generateMipmaps=false;
  }
  idle.repeat.set(1/5,1/5);
  idle.offset.set(3/5,0);
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:idle,alphaTest:.18}));
  sprite.scale.set(1.15,1.22,1);
  sprite.center.set(.5,.075);
  scene.add(sprite);
  const crowd=createCrowd(scene,avatar.actor,idle);

  const burst=new THREE.Mesh(new THREE.RingGeometry(.82,1,28),
    new THREE.MeshBasicMaterial({color:'#39d4ff',transparent:true,opacity:0,side:THREE.DoubleSide,
      depthWrite:false,blending:THREE.AdditiveBlending}));
  burst.rotation.x=-Math.PI/2;
  scene.add(burst);

  const player=createPrototypePlayer();
  let disposed=false;
  let yaw=0, pitch=PROTOTYPE_CAMERA.pitch as number, zoom=PROTOTYPE_CAMERA.default as number;
  let config={...DEFAULT};
  if(renderer.capabilities.maxTextureSize<config.texture)config.texture=1024;
  let atlasTexture:THREE.Texture=materialSeed, displayed:BenchmarkConfig['texture']|0=0;
  let request=0, loading=true, loadError=false;
  let message='', msgUntil=0, sealAt=-Infinity;
  let last=performance.now(), raf=0, statsAt=last, frameWindow:number[]=[];
  let finished:BenchmarkResult[]|null=null;
  type Benchmark = { original:BenchmarkConfig; yaw:number; pitch:number; zoom:number; index:number;
    results:BenchmarkResult[]; timings:number[]; start:number; invalid:boolean; framesSinceStart:number };
  let bench:Benchmark|null=null;
  const physical=new Map<string,string>();
  const target=new THREE.Vector3();
  const nearTrainer=()=>Math.hypot(player.position.x-IRUKA.x,player.position.z-IRUKA.z)<2.8;

  function readout(fps:number) {
    publish({ config:{...config},preparing:loading,place:inCity(player.position)?'Dentro de Konoha':'Entrada de Konoha',
      action:player.climbing?'Escalando':player.dashing?'Dash':player.position.y>1.5&&!player.jumping?'Em altura':'',
      message,nearby:nearTrainer(),fps,triangles:renderer.info.render.triangles,calls:renderer.info.render.calls,
      progress:bench?bench.index:null,finished });
  }
  function announce(text:string,seconds=4) { message=text;msgUntil=performance.now()+1000*seconds; }
  function setConfig(next:BenchmarkConfig) {
    config={...next};
    avatar.actor.visible=next.avatar==='low-poly';
    sprite.visible=next.avatar==='sprite';
    crowd.set(next.avatar,next.enemies,next.effects);
    if (displayed===next.texture) {
      request++;
      loading=false;
      loadError=false;
      return;
    }
    const token=++request;
    if(renderer.capabilities.maxTextureSize<next.texture) {
      loading=false;
      loadError=true;
      announce('O hardware não suporta esse tamanho de atlas.');
      return;
    }
    loading=true;
    loadError=false;
    loader.load(prototypeTextureUrl(next.texture),texture=>{
      if(disposed||token!==request) {texture.dispose();return;}
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
      texture.minFilter=THREE.LinearMipmapLinearFilter;
      texture.magFilter=THREE.LinearFilter;
      atlasTexture.dispose();
      atlasTexture=texture;
      art.material.map=texture;
      art.material.needsUpdate=true;
      displayed=next.texture;
      loading=false;
    },undefined,()=>{
      if(disposed||token!==request)return;
      loading=false;
      loadError=true;
      announce('Falha ao carregar a textura deste tamanho. O último atlas disponível continua em uso.');
    });
  }

  function resize() {
    const width=Math.max(1,host.clientWidth),height=Math.max(1,host.clientHeight);
    renderer.setSize(width,height,false);
    camera.aspect=width/height;
    camera.updateProjectionMatrix();
    if(bench)bench.invalid=true;
  }
  const observer=new ResizeObserver(resize);
  observer.observe(host);
  resize();

  function movement():Point {
    const keys=new Set(physical.values());
    return cameraInput(Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),
      Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup')),yaw);
  }
  function keyDown(event:KeyboardEvent) {
    if (event.altKey||event.ctrlKey||event.metaKey||bench) return;
    const key=translateKey(event.key.toLowerCase());
    if (!key) return;
    if (key===' ' && event.target instanceof HTMLElement && event.target.closest('button')) return;
    if ([' ','w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(key)) event.preventDefault();
    physical.set(event.code||key,key);
    if (event.repeat) return;
    if (key===' ') player.jump(movement());
    if (key==='shift') player.dash(movement());
    if (key==='e'&&nearTrainer()) announce(TRAINER_TEXT,7);
    if (key==='r'&&performance.now()-sealAt>=675) sealAt=performance.now();
  }
  const keyUp=(event:KeyboardEvent)=>physical.delete(event.code||event.key.toLowerCase());
  const clear=()=>physical.clear();
  const visibility=()=>{clear();if(bench)bench.invalid=true;};
  window.addEventListener('keydown',keyDown);
  window.addEventListener('keyup',keyUp);
  window.addEventListener('blur',clear);
  document.addEventListener('visibilitychange',visibility);
  let dragging:number|null=null;
  function pointerDown(event:PointerEvent) {
    if(bench||event.button!==0)return;
    dragging=event.pointerId;
    host.focus({preventScroll:true});
    host.setPointerCapture(event.pointerId);
  }
  function pointerMove(event:PointerEvent) {
    if(dragging!==event.pointerId||bench)return;
    yaw-=event.movementX*.008;
    pitch=look(pitch+event.movementY*.005,.14,1.27);
  }
  function pointerUp(event:PointerEvent) { if(dragging===event.pointerId)dragging=null; }
  function wheel(event:WheelEvent) {
    if(bench)return;
    event.preventDefault();
    zoom=look(zoom+Math.sign(event.deltaY)*PROTOTYPE_CAMERA.step,PROTOTYPE_CAMERA.min,PROTOTYPE_CAMERA.max);
  }
  const pointerEvents=[['pointerdown',pointerDown],['pointermove',pointerMove],['pointerup',pointerUp],
    ['pointercancel',pointerUp],['lostpointercapture',pointerUp]] as const;
  pointerEvents.forEach(([type,handler])=>host.addEventListener(type,handler));
  host.addEventListener('wheel',wheel,{passive:false});

  function showAvatar(time:number,now:number,delta:number,input:Point) {
    const {position,facing}=player;
    const sealing=now-sealAt<675 && !bench;
    avatar.actor.position.set(position.x,position.y,position.z);
    const to=Math.atan2(facing.x,facing.z);
    const turn=Math.atan2(Math.sin(to-avatar.actor.rotation.y),Math.cos(to-avatar.actor.rotation.y));
    avatar.actor.rotation.y+=turn*(1-Math.exp(-delta*17));
    avatar.actor.rotation.x=player.climbing?-.46:0;
    avatar.pose(time,player.walking,player.dashing,player.jumping,!!player.climbing,sealing);
    sprite.position.copy(avatar.actor.position);
    sprite.material.rotation=player.climbing?.35:0;
    if(sealing) {
      sprite.material.map=castMap;
      castMap.repeat.set(.25,1/3);
      castMap.offset.set(Math.min(3,Math.floor((now-sealAt)/169))/4,0);
    } else if (player.walking) {
      const x=facing.x*Math.cos(yaw)-facing.z*Math.sin(yaw),z=facing.x*Math.sin(yaw)+facing.z*Math.cos(yaw);
      const side=Math.abs(z)<.26, diagonal=Math.abs(x)>.28&&Math.abs(z)>.28;
      const back=z<-.25, flip=x<-.22;
      const row=running.firstRow+runningRow(back,diagonal,side), frame=Math.floor(time*10)%4;
      sprite.material.map=walkMap;
      walkMap.repeat.set(flip?-.25:.25,1/running.rows);
      walkMap.offset.set((frame+Number(flip))*.25,(running.rows-row-1)/running.rows);
    } else {
      sprite.material.map=idle;
    }
    const pulse=(now-sealAt-.31*1000)/850;
    burst.visible=config.effects&&pulse>=0&&pulse<1&&!bench;
    if(burst.visible) {
      burst.position.set(position.x,position.y+.04,position.z);
      burst.scale.setScalar(.55+pulse*4.5);
      burst.material.opacity=(1-pulse)*.86;
    }
    const distance=zoom/(2*Math.tan(camera.fov*Math.PI/360));
    target.set(position.x,position.y+.65,position.z);
    if(bench)target.set(0,.65,-8);
    camera.position.set(target.x+Math.sin(yaw)*Math.cos(pitch)*distance,
      target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*Math.cos(pitch)*distance);
    camera.lookAt(target);
    village.marker.material.opacity=.55+.21*Math.sin(time*4.3);
    if(input.x||input.z) village.marker.scale.setScalar(1+.08*Math.sin(time*5));
  }

  function finishBench(cancelled=false) {
    if(!bench)return;
    const previous=bench;
    yaw=previous.yaw;
    pitch=previous.pitch;
    zoom=previous.zoom;
    finished=previous.results;
    bench=null;
    setConfig(previous.original);
    announce(cancelled?'Medição interrompida.':'Medição concluída. Baixe o relatório para comparar os resultados.');
  }
  function nextCase(now:number,elapsed:number) {
    if(!bench||loading||document.hidden)return;
    if(bench.invalid) {
      bench.invalid=false;
      bench.start=0;
      bench.framesSinceStart=0;
      bench.timings.length=0;
    }
    if(!bench.start)bench.start=now;
    bench.framesSinceStart++;
    const age=now-bench.start;
    if(age>500 && bench.framesSinceStart>2 && !loadError)bench.timings.push(elapsed);
    if(age<1600&&!loadError)return;
    const view=renderer.getDrawingBufferSize(new THREE.Vector2());
    bench.results.push({...config,...frameStats(bench.timings),triangles:renderer.info.render.triangles,
      calls:renderer.info.render.calls,width:view.x,height:view.y,pixelRatio:renderer.getPixelRatio(),available:!loadError});
    bench.index++;
    if(bench.index>=BENCHMARK_CASES.length) {finishBench();return;}
    bench.start=0;
    bench.framesSinceStart=0;
    bench.timings=[];
    setConfig(BENCHMARK_CASES[bench.index]);
  }

  function frame(now:number) {
    const ms=now-last, dt=Math.min(.05,Math.max(0,ms/1000));
    last=now;
    const input=bench?{x:0,z:0}:movement();
    if(!bench)player.update(dt,input);
    showAvatar(now/1000,now,dt,input);
    crowd.update(now/1000);
    renderer.render(scene,camera);
    nextCase(now,ms);
    if(now>msgUntil)message='';
    frameWindow.push(ms);
    if(now-statsAt>=360) {
      readout(frameStats(frameWindow).fps);
      frameWindow=[];
      statsAt=now;
    }
    raf=requestAnimationFrame(frame);
  }
  setConfig(config);
  readout(0);
  raf=requestAnimationFrame(frame);

  return {
    setConfig(next:BenchmarkConfig) {if(!bench)setConfig(next);},
    reset() {
      if(bench)return;
      player.reset();
      yaw=0; pitch=PROTOTYPE_CAMERA.pitch; zoom=PROTOTYPE_CAMERA.default;
      clear();
    },
    benchmark() {
      if(bench){finishBench(true);return;}
      bench={original:{...config},yaw,pitch,zoom,index:0,results:[],timings:[],start:0,invalid:false,framesSinceStart:0};
      finished=null;
      yaw=0; pitch=PROTOTYPE_CAMERA.pitch; zoom=PROTOTYPE_CAMERA.max;
      clear();
      setConfig(BENCHMARK_CASES[0]);
    },
    dispose() {
      disposed=true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      pointerEvents.forEach(([type,handler])=>host.removeEventListener(type,handler));
      host.removeEventListener('wheel',wheel);
      window.removeEventListener('keydown',keyDown);
      window.removeEventListener('keyup',keyUp);
      window.removeEventListener('blur',clear);
      document.removeEventListener('visibilitychange',visibility);
      const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
      const textures=new Set<THREE.Texture>([atlasTexture,idle,walkMap,castMap,village.stoneHeads,village.npcTexture]);
      scene.traverse(object=>{
        if(object instanceof THREE.InstancedMesh)object.dispose();
        if(object instanceof THREE.Mesh||object instanceof THREE.Points)geometries.add(object.geometry);
        if(object instanceof THREE.Mesh||object instanceof THREE.Sprite||object instanceof THREE.Points) {
          for(const material of Array.isArray(object.material)?object.material:[object.material]) {
            materials.add(material);
            if(material.map)textures.add(material.map);
          }
        }
      });
      geometries.forEach(obj=>obj.dispose());
      materials.forEach(obj=>obj.dispose());
      textures.forEach(obj=>obj.dispose());
      sun.shadow.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    }
  };
}
