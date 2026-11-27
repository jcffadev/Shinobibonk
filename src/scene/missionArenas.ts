import * as THREE from 'three';
import { EXAM_ENTRANCE, INSTANCE_FLOOR, type InstanceArena } from '../game/missionArenas';
import { createHagoromoSeal } from './hagoromoVisual';

const PALETTE:Record<InstanceArena,{sky:string;fog:number;floor:string}> = {
  'exam-forest':{sky:'#263530',fog:56,floor:'#354831'},
  'exam-hall':{sky:'#2b3335',fog:68,floor:'#555956'},
  hagoromo:{sky:'#141913',fog:82,floor:'#22291a'},
};

function makeArena(kind:InstanceArena,x:number,z:number) {
  const root=new THREE.Group(), palette=PALETTE[kind];
  root.name=kind;root.position.set(x,INSTANCE_FLOOR,z);
  const materials=new Map<string,THREE.MeshBasicMaterial>();
  function solid(g:THREE.BufferGeometry,color:string,x:number,y:number,z:number,parent:THREE.Group=root) {
    let material=materials.get(color);
    if(!material){material=new THREE.MeshBasicMaterial({color});materials.set(color,material);}
    const mesh=new THREE.Mesh(g,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
  }
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,parent=root)=>solid(new THREE.BoxGeometry(w,h,d),c,x,y,z,parent);
  box(340,.25,340,palette.floor,0,-.15,0);

  if(kind==='exam-forest'){
    const soil=['#4b4e30','#586044','#4d583a'];
    // Rota contínua do pátio até o portão, sem troncos na faixa central.
    for(let i=0;i<21;i++)box(6+(i%3)*.9,.025,1.88,soil[i%3],Math.sin(i*.42)*1.1,-.01,20-i*2);
    for(let i=0;i<58;i++){
      const side=i%2?1:-1,z=-31+(i%29)*2.3;
      const x=side*(10+(i*7%19)*.98);
      const h=8+(i%5)*2.5,r=1+(i%5)*.17;
      solid(new THREE.CylinderGeometry(r*.7,r,h,7),'#3b3526',x,h*.5,z).rotation.z=Math.sin(i)*.13;
      solid(new THREE.IcosahedronGeometry(r*4,1),i%3===0?'#455636':'#2c4830',x,h,z);
      for(let k=0;k<2;k++){
        const b=solid(new THREE.CylinderGeometry(r*.35,r*.7,3.4,6),'#393b29',x+(k-.5)*1.8,1.15,z);
        b.rotation.z=(k-.5)*1.6;
      }
    }
    const z=EXAM_ENTRANCE.z;
    box(.52,4.4,.7,'#6d5140',-2.45,2.2,z);
    box(.52,4.4,.7,'#6d5140',2.45,2.2,z);
    box(5.9,.7,1.1,'#963c30',0,4.35,z);
    box(6.8,.25,1.35,'#c48756',0,4.75,z);
    box(3.8,.02,3,'#7b7156',0,.018,z+.25);
    return {root,palette};
  }

  if(kind==='exam-hall'){
    const slabs=['#81887c','#777f73','#85897e','#7a8278'];
    for(let row=-5;row<=5;row++)for(let col=-4;col<=4;col++)
      box(2.94,.04,2.94,slabs[(row*5+col*9+80)%4],col*3,0,row*3);
    box(29,6.7,.85,'#46514c',0,3.35,-16.6);
    box(29,4.4,.85,'#394541',0,2.2,16.6);
    for(const side of [-1,1]){
      box(.86,6.4,33,'#47524f',side*14.8,3.2,0);
      box(2.4,.42,31,'#58645a',side*13.2,3.9,0);
      box(.14,.12,31,'#3a3028',side*12.14,4.9,0);
      for(let i=-14;i<=14;i++)box(.06,.94,.056,'#4e4337',side*12.14,4.44,i);
    }
    for(let i=-3;i<=3;i++){
      box(2.8,1.8,.06,'#293741',i*3.75,5.3,-16.14);
      box(.09,1.8,.10,'#596460',i*3.75,5.3,-16.09);
    }
    box(15,.6,4.6,'#929485',0,.31,-12.98);
    box(8,.25,1.5,'#7e877a',0,.13,-10.2);
    // Mãos esculpidas formando o selo e tecido verde nas laterais do pedestal.
    for(const side of [-1,1]){
      const lower=solid(new THREE.CapsuleGeometry(.92,4.5,4,12),'#31544e',side*3.4,1.7,-13);
      lower.rotation.z=side*1.18;
      for(let i=0;i<6;i++){
        const band=solid(new THREE.TorusGeometry(.91,.045,4,12),'#223f3c',side*(2.1+i*.52),1.92-i*.16,-13);
        band.rotation.y=side*1.35;
      }
      const hand=solid(new THREE.CapsuleGeometry(.70,.95,4,10),'#827460',side*.68,2.64,-13.05);
      hand.rotation.z=side*.55;
      const index=solid(new THREE.CapsuleGeometry(.21,1.55,4,8),'#a19478',side*.21,3.62,-13.02);
      index.rotation.z=side*.16;
      for(let i=0;i<3;i++)box(.44,.18,.54,'#96846c',side*(.38+i*.25),2.74+i*.13,-12.48);
    }
    return {root,palette};
  }

  const beacon=new THREE.Group();
  beacon.position.set(0,5,-18);
  root.add(beacon);
  const portrait=new THREE.TextureLoader().load('/assets/hagoromo-treino-v1.png');
  portrait.colorSpace=THREE.SRGBColorSpace;
  portrait.magFilter=THREE.NearestFilter;
  const elder=new THREE.Sprite(new THREE.SpriteMaterial({map:portrait,color:'#e0e2c6',alphaTest:.15,transparent:true}));
  elder.scale.set(5.15,8.0,1);beacon.add(elder);
  for(let i=0;i<9;i++){
    const a=i*Math.PI*2/9;
    solid(new THREE.SphereGeometry(.29,10,8),'#131710',Math.cos(a)*3.2,-2.8,Math.sin(a)*1.08,beacon);
  }
  for(const [r,c] of [[3.8,'#d7cb78'],[7.4,'#877f4b'],[12,'#b9a256'],[15.6,'#564e2e']] as const){
    const ring=solid(new THREE.RingGeometry(r-.046,r+.046,112),c,0,.027,0);
    ring.rotation.x=-Math.PI/2;
  }
  return {root,palette,beacon};
}

export function createInstanceArenas(scene:THREE.Scene,hagoromo:{x:number;z:number}) {
  const pieces=new Map<InstanceArena,ReturnType<typeof makeArena>>();
  const seal=createHagoromoSeal(scene,hagoromo.x,INSTANCE_FLOOR+.025,hagoromo.z);
  let originalBackground:THREE.Scene['background'];
  let originalFog:THREE.Scene['fog'];
  let active:InstanceArena|undefined;
  return {
    set(next:InstanceArena|undefined){
      if(active===next)return;
      if(active)pieces.get(active)!.root.visible=false;
      else {originalBackground=scene.background;originalFog=scene.fog;}
      active=next;
      if(!next){scene.background=originalBackground;scene.fog=originalFog;seal.update(null,0,false);return;}
      let entry=pieces.get(next);
      if(!entry){
        const pos=next==='hagoromo'?hagoromo:{x:0,z:0};
        entry=makeArena(next,pos.x,pos.z);pieces.set(next,entry);scene.add(entry.root);
      }
      entry.root.visible=true;
      scene.background=new THREE.Color(entry.palette.sky);
      scene.fog=new THREE.Fog(entry.palette.sky,18,entry.palette.fog);
    },
    update(time:number,phase:Parameters<typeof seal.update>[0],dt:number,hidden:boolean){
      const sage=pieces.get('hagoromo')?.beacon;
      if(active==='hagoromo'&&sage)sage.position.y=5+(hidden?0:.23*Math.sin(time*1.6));
      seal.update(active==='hagoromo'?phase:null,dt,hidden);
    },
    dispose(){
      seal.dispose();
      for(const {root} of pieces.values()){
        const materials=new Set<THREE.Material>();
        root.traverse(o=>{
          if(o instanceof THREE.Mesh)o.geometry.dispose();
          if(o instanceof THREE.Mesh||o instanceof THREE.Sprite)materials.add(o.material);
        });
        for(const m of materials){if(m instanceof THREE.SpriteMaterial)m.map?.dispose();m.dispose();}
        root.removeFromParent();
      }
    },
  };
}
