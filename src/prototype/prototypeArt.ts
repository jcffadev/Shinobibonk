import * as THREE from 'three';
import { HOUSES, ROCKS, TREES, TOWER, WALLS, IRUKA, isSquare, isStreet } from './prototypeWorld';

const ATLAS = { grass:0,dirt:1,plaster:2,redTile:3,goldTile:4,wood:5,stone:6,paint:7,
  orange:8,ink:9,skin:10,hair:11,leaves:12,path:13,water:14,slate:15 } as const;
type Surface = keyof typeof ATLAS;

export function createPrototypeArt(texture: THREE.Texture) {
  const material = new THREE.MeshStandardMaterial({ map:texture, roughness:.87, flatShading:true });
  const colors = new Map<THREE.ColorRepresentation,THREE.MeshStandardMaterial>();
  const trim = (color:THREE.ColorRepresentation) => {
    let mat = colors.get(color);
    if (!mat) { mat = new THREE.MeshStandardMaterial({ color, roughness:.84, flatShading:true }); colors.set(color,mat); }
    return mat;
  };
  const geometryCache = new Map<string,THREE.BufferGeometry>();

  function tile(geo:THREE.BufferGeometry,surface:Surface) {
    const cell = ATLAS[surface], x = (cell % 4)/4, y = (3-Math.floor(cell/4))/4;
    const coords = geo.attributes.uv;
    for (let i=0;i<coords.count;i++) coords.setXY(i,x+.0012+coords.getX(i)*.2476,y+.0012+coords.getY(i)*.2476);
    return geo;
  }
  function mesh(parent:THREE.Object3D,key:string,create:()=>THREE.BufferGeometry,
      surface:Surface | number,x:number,y:number,z:number,w:number,h:number,d:number) {
    let geometry = geometryCache.get(key+surface);
    if (!geometry) {
      geometry=create();
      if (typeof surface==='string') tile(geometry,surface);
      geometryCache.set(key+surface,geometry);
    }
    const m = new THREE.Mesh(geometry,typeof surface==='string'?material:trim(surface));
    m.position.set(x,y,z);
    m.scale.set(w,h,d);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  const box = (parent:THREE.Object3D,surface:Surface | number,x:number,y:number,z:number,w:number,h:number,d:number) =>
    mesh(parent,'box',()=>new THREE.BoxGeometry(1,1,1),surface,x,y,z,w,h,d);
  const orb = (parent:THREE.Object3D,surface:Surface | number,x:number,y:number,z:number,w:number,h:number,d:number,detail=0) =>
    mesh(parent,'orb'+detail,()=>new THREE.IcosahedronGeometry(.5,detail),surface,x,y,z,w,h,d);
  const round = (parent:THREE.Object3D,surface:Surface | number,x:number,y:number,z:number,r0:number,r1:number,h:number,sides=12,aspect=1) =>
    mesh(parent,'round'+r0+'-'+r1+'-'+sides,()=>new THREE.CylinderGeometry(r1,r0,1,sides),surface,x,y,z,1,h,aspect);

  function pitchedRoof() {
    const vertices = [
      -.5,0,-.5, .5,0,-.5, 0,1,-.5,
      -.5,0,.5, 0,1,.5, .5,0,.5,
      -.5,0,-.5, 0,1,-.5, 0,1,.5, -.5,0,-.5, 0,1,.5, -.5,0,.5,
      .5,0,-.5, .5,0,.5, 0,1,.5, .5,0,-.5, 0,1,.5, 0,1,-.5,
    ];
    const uv = [0,0,1,0,.5,1, 0,0,.5,1,1,0, 0,0,0,1,1,1, 0,0,1,1,1,0, 0,0,1,0,1,1, 0,0,1,1,0,1];
    for (let i=0;i<vertices.length;i+=9) {
      for (let j=0;j<3;j++) [vertices[i+j+3],vertices[i+j+6]]=[vertices[i+j+6],vertices[i+j+3]];
    }
    for (let i=0;i<uv.length;i+=6) {
      for (let j=0;j<2;j++) [uv[i+j+2],uv[i+j+4]]=[uv[i+j+4],uv[i+j+2]];
    }
    const result = new THREE.BufferGeometry();
    result.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
    result.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    result.computeVertexNormals();
    return result;
  }

  function lantern(parent:THREE.Object3D,x:number,y:number,z:number) {
    box(parent,'wood',x,y+.21,z,.33,.09,.30);
    const glow = box(parent,0xffb44b,x,y,z,.22,.30,.23);
    const mat = glow.material as THREE.MeshStandardMaterial;
    mat.emissive.setHex(0xff912c);
    mat.emissiveIntensity=.44;
    box(parent,'wood',x,y-.21,z,.28,.07,.25);
  }

  function makeVillage(scene:THREE.Scene) {
    const terrain = new THREE.Group();
    const ground = new THREE.PlaneGeometry(6,6).rotateX(-Math.PI/2);
    ground.translate(0,-.025,0);
    const groups = new Map<Surface,THREE.Matrix4[]>();
    for (let z=-84;z<=54;z+=6) for (let x=-72;x<=72;x+=6) {
      const key = isSquare(x,z)?'stone':isStreet(x,z)?'dirt':(Math.sin(x*.9+z*.7)>.75?'leaves':'grass');
      const spots=groups.get(key)??[];
      spots.push(new THREE.Matrix4().makeTranslation(x,0,z));
      groups.set(key,spots);
    }
    for (const [key,spots] of groups) {
      const m=new THREE.InstancedMesh(tile(ground.clone(),key),material,spots.length);
      spots.forEach((transform,i)=>m.setMatrixAt(i,transform));
      m.receiveShadow=true;
      m.computeBoundingSphere();
      terrain.add(m);
    }
    ground.dispose();
    scene.add(terrain);

    for (const house of HOUSES) {
      const h = new THREE.Group();
      h.position.set(house.x,0,house.z);
      scene.add(h);
      const {width:w,depth:d,top:y} = house;
      const roof = house.color==='red'?'redTile':'goldTile';
      const floor = y - 1.02;
      const face = d/2;
      if (house.round) {
        const aspect=d/w;
        round(h,'stone',0,.26,0,w*.5,w*.5,.52,14,aspect);
        round(h,'plaster',0,floor*.5,0,w*.48,w*.48,floor,14,aspect);
        round(h,'wood',0,floor-.05,0,w*.53,w*.53,.24,14,aspect);
        round(h,roof,0,floor+.49,0,w*.55,.58,1,14,aspect);
        round(h,'wood',0,y-.07,0,.58,.5,.18,12);
      } else {
        box(h,'stone',0,.21,0,w,.42,d);
        box(h,'plaster',0,floor*.5,0,w*.97,floor,d*.97);
        box(h,'wood',0,floor-.06,0,w*1.04,.22,d*1.04);
        const gable=mesh(h,'gable',pitchedRoof,roof,0,floor,0,d*1.12,1.02,w*1.1);
        gable.rotation.y=Math.PI*.5;
      }
      box(h,'wood',0,.83,face-.025,1.02,1.66,.16);
      box(h,'slate',-.12,.10,face+.20,1.56,.2,.64);
      for (const side of [-1,1]) {
        const x = side*w*.25, z = house.round?face*.87:face-.035;
        box(h,'wood',x,floor*.67,z,.81,.81,.14);
        box(h,0x66808a,x,floor*.67,z+.08,.61,.62,.04);
        box(h,'wood',x,floor*.67,z+.12,.06,.62,.055);
        box(h,'wood',x,floor*.67,z+.12,.62,.05,.055);
      }
      if (house.z>-27) lantern(h,.94,1.94,face+.12);
      if (house.round && house.z<0) {
        round(h,'stone',-.18,y+.33,-.13,.34,.34,.62,8);
        round(h,'slate',-.18,y+.63,-.13,.44,.34,.12,8);
      }
    }

    for (const wall of WALLS.slice(0,2)) {
      box(scene,'stone',wall.x,.24,wall.z,wall.width,.48,wall.depth*1.05);
      const bays=8;
      for(let i=0;i<bays;i++) {
        const w=wall.width/bays;
        const x=wall.x-wall.width/2+w*(i+.5);
        box(scene,'plaster',x,1.45,wall.z,w-.03,2.49,wall.depth);
        box(scene,'wood',x-w*.5+.08,1.42,wall.z,.14,2.51,wall.depth*1.05);
        const roof=mesh(scene,'gable',pitchedRoof,'redTile',x,2.62,wall.z,wall.depth*1.32,.38,w*1.01);
        roof.rotation.y=Math.PI*.5;
      }
    }
    for (const pier of WALLS.slice(2)) {
      box(scene,'stone',pier.x,.33,pier.z,pier.width*1.15,.66,pier.depth);
      box(scene,'paint',pier.x,2.72,pier.z,pier.width,5.27,pier.depth*.86);
      lantern(scene,pier.x,3.48,pier.z+.97);
    }
    box(scene,'wood',0,4.72,0,9.14,.54,1.62);
    box(scene,'paint',0,5.12,0,9.52,.35,1.9);
    const gateRoof=mesh(scene,'gable',pitchedRoof,'redTile',0,5.23,0,3.03,1.07,10.52);
    gateRoof.rotation.y=Math.PI*.5;
    const gateLabel = sign('忍','#ffedbd','#763827');
    gateLabel.scale.set(1.15,.75,1);
    gateLabel.position.set(0,4.92,1.02);
    scene.add(gateLabel);

    const {x:tx,z:tz} = TOWER;
    round(scene,'stone',tx,.35,tz,5.20,5.20,.7,18);
    round(scene,'paint',tx,2.12,tz,4.52,4.52,3.1,18);
    round(scene,'wood',tx,3.75,tz,5.10,5.10,.25,18);
    round(scene,'goldTile',tx,4.37,tz,5.22,3.83,1.2,18);
    round(scene,'paint',tx,5.97,tz,3.84,3.84,2.08,18);
    round(scene,'wood',tx,7.02,tz,4.07,4.18,.31,18);
    round(scene,'redTile',tx,7.9,tz,4.4,2.64,1.53,18);
    round(scene,'paint',tx,9.1,tz,2.64,2.56,.91,18);
    round(scene,'goldTile',tx,9.91,tz,2.88,.09,.68,18);
    for (let i=0;i<14;i++) {
      const a=i*Math.PI/7;
      const panel=box(scene,'plaster',tx+Math.sin(a)*3.84,6.03,tz+Math.cos(a)*3.84,.51,.91,.17);
      panel.rotation.y=a;
      const frame=box(scene,0x55433b,tx+Math.sin(a)*4.55,2.31,tz+Math.cos(a)*4.55,.53,.75,.22);
      frame.rotation.y=a;
    }
    box(scene,'wood',tx,1.46,tz+4.57,1.62,2.78,.38);
    const towerLabel=sign('火','#ffebbb','#842c24');
    towerLabel.scale.set(1.24,1.24,1);
    towerLabel.position.set(tx,8.80,tz+3.25);
    scene.add(towerLabel);

    TREES.forEach(({x,z,top},i) => {
      const trunk = round(scene,'wood',x,top*.30,z,.47,.28,top*.61,7);
      trunk.rotation.z=.12*Math.sin(i);
      for (let k=0;k<6;k++) {
        const a=k*Math.PI/3;
        const canopy=orb(scene,k%2?'leaves':'grass',x+Math.cos(a)*.98,top*.76+(k%2)*.3,z+Math.sin(a)*1.12,2.53,top*.69,2.62,1);
        canopy.rotation.y=i+k*.52;
      }
      orb(scene,'leaves',x,top*.88,z,2.88,top*.53,2.75,1);
    });
    ROCKS.forEach(({x,z,width,depth,top},i)=>{
      const stone=orb(scene,'stone',x,top*.41,z,width*1.16,top*1.21,depth*1.15,1);
      stone.rotation.y=i*.42;
      for(let k=0;k<3;k++)orb(scene,k%2?'stone':'path',x-.48+k*.44,.18,z+depth*.53,.51,.48,.48);
    });
    for (let i=0;i<18;i++) {
      const x=(i-8.5)*7.6;
      const cliff=orb(scene,i%3?'stone':'path',x,3.4,-64-Math.cos(i*2.2)*3.3,11+(i%3)*3,13+(i%5)*2.8,13,1);
      cliff.rotation.set(.06*Math.sin(i),i%7,Math.sin(i*1.3)*.15);
      orb(scene,'grass',x,10+(i%3)*2,-66,13,3.2,11.7,1);
    }
    const stoneHeads=new THREE.TextureLoader().load('/assets/leaf-landmarks-v1.png');
    stoneHeads.colorSpace=THREE.SRGBColorSpace;
    stoneHeads.repeat.x=1/3;
    const mountain=new THREE.Sprite(new THREE.SpriteMaterial({map:stoneHeads,alphaTest:.5}));
    mountain.center.set(.5,.1);
    mountain.position.set(0,5.2,-62);
    mountain.scale.set(36,21,1);
    scene.add(mountain);

    for (let i=0;i<28;i++) {
      const z=26-i*2.8;
      const side=i%2===0?-1:1;
      if (z>1 || z<-11) {
        box(scene,'wood',side*(3.9+Math.sin(i)*.75),.35,z,.14,.7,.15);
        if (i%3===0) orb(scene,'stone',side*(3.3+Math.sin(i)*.22),.1,z,.33,.23,.36);
      }
    }
    instanceStaticMeshes(scene);
    const iruka = new THREE.Group();
    const npcTexture=new THREE.TextureLoader().load('/assets/shinobi-folha-v3.png');
    npcTexture.colorSpace=THREE.SRGBColorSpace;
    npcTexture.magFilter=THREE.NearestFilter;
    npcTexture.repeat.x=1/3;
    npcTexture.generateMipmaps=false;
    npcTexture.minFilter=THREE.NearestFilter;
    const teacher=new THREE.Sprite(new THREE.SpriteMaterial({map:npcTexture,transparent:true,alphaTest:.2}));
    teacher.scale.set(1.12,1.41,1);
    teacher.center.set(.5,0);
    iruka.add(teacher);
    iruka.position.set(IRUKA.x,0,IRUKA.z);
    scene.add(iruka);
    const marker = new THREE.Mesh(new THREE.RingGeometry(.68,.79,24),
      new THREE.MeshBasicMaterial({color:'#ffd17b',transparent:true,opacity:.78,side:THREE.DoubleSide}));
    marker.rotation.x=-Math.PI/2;
    marker.position.set(IRUKA.x,.045,IRUKA.z);
    scene.add(marker);
    return { stoneHeads,npcTexture,marker };
  }

  function instanceStaticMeshes(scene:THREE.Scene) {
    const groups = new Map<string,THREE.Mesh[]>();
    scene.updateMatrixWorld(true);
    scene.traverse(object=>{
      if (!(object instanceof THREE.Mesh) || object instanceof THREE.InstancedMesh || Array.isArray(object.material)) return;
      if (!object.castShadow) return;
      const key=object.geometry.uuid+object.material.uuid;
      const matches=groups.get(key)??[];
      matches.push(object);
      groups.set(key,matches);
    });
    for (const meshes of groups.values()) {
      if(meshes.length<3)continue;
      const sample=meshes[0];
      const packed = new THREE.InstancedMesh(sample.geometry,sample.material,meshes.length);
      meshes.forEach((object,i)=>{
        packed.setMatrixAt(i,object.matrixWorld);
        object.removeFromParent();
      });
      packed.castShadow=true;
      packed.receiveShadow=true;
      packed.computeBoundingSphere();
      scene.add(packed);
    }
  }

  function sign(text:string,color:string,bg:string) {
    const face=document.createElement('canvas');
    face.width=160; face.height=160;
    const context=face.getContext('2d')!;
    context.fillStyle=bg;context.fillRect(0,0,160,160);
    context.strokeStyle='#dbaf6d';context.lineWidth=6;context.strokeRect(8,8,144,144);
    context.fillStyle=color;context.font='800 104px Georgia, serif';context.textAlign='center';context.textBaseline='middle';
    context.fillText(text,80,84);
    const map=new THREE.CanvasTexture(face);
    map.colorSpace=THREE.SRGBColorSpace;
    return new THREE.Sprite(new THREE.SpriteMaterial({map,depthTest:true}));
  }

  function makeNaruto(parent:THREE.Object3D) {
    const actor=new THREE.Group();
    parent.add(actor);
    // Chibi em metros de protótipo. A pose usa articulações do modelo.
    const hip=new THREE.Group();
    hip.position.y=.43;
    actor.add(hip);
    const chest=round(hip,'ink',0,.21,0,.196,.214,.40,10,.66);
    chest.rotation.y=Math.PI/10;
    box(hip,'orange',0,.13,.024,.354,.232,.286);
    box(hip,0xb6aba3,0,.194,.172,.025,.368,.012);
    round(hip,'ink',0,.416,0,.131,.124,.075,8,.84);
    round(hip,'orange',0,.0,0,.19,.186,.115,10,.78);
    const head=new THREE.Group();
    head.position.set(0,.63,.025);
    hip.add(head);
    const skin=0xffb67c;
    orb(head,'skin',0,.036,0,.474,.463,.433,1);
    for (const side of [-1,1]) {
      orb(head,'skin',side*.225,.025,-.009,.093,.137,.09,1);
      orb(head,0xd58760,side*.249,.025,.029,.034,.080,.028,1);
      const eye=orb(head,0xfff2de,side*.09,.045,.189,.109,.087,.052,1);
      eye.rotation.z=side*.14;
      orb(head,0x327ac1,side*.09,.042,.214,.057,.066,.023,1);
      orb(head,0x153251,side*.09,.041,.226,.027,.042,.013,1);
      orb(head,0xffffff,side*.084,.055,.231,.015,.021,.014);
      const brow=box(head,0xe1a334,side*.098,.101,.201,.099,.021,.021);
      brow.rotation.z=side*-.26;
      for (let i=0;i<3;i++) {
        const mark=box(head,0x735046,side*(.137+i*.014),-.003-i*.025,.180-i*.012,.064,.009,.010);
        mark.rotation.z=side*(.15-i*.17);
      }
    }
    orb(head,skin,0,.009,.224,.073,.067,.073);
    box(head,0x9c613d,0,-.053,.203,.070,.014,.015);
    round(head,'ink',0,.145,0,.236,.236,.112,12,.91);
    box(head,0xc0c3c4,0,.147,.214,.265,.095,.026);
    box(head,0x889299,0,.147,.230,.232,.072,.012);
    const leaf = leafEmblem();
    leaf.position.set(0,.147,.237);
    head.add(leaf);
    const hair=orb(head,'hair',0,.235,-.018,.52,.285,.49,1);
    hair.rotation.y=.47;
    const crown = [[0,.368,-.01,0,1,-.08,.25,.14],[.14,.31,-.047,.52,.79,-.20,.23,.121],[-.14,.31,-.06,-.60,.81,-.1,.24,.125],
      [.177,.254,.058,.84,.56,.28,.22,.13],[-.18,.258,.058,-.83,.56,.28,.24,.131],[.09,.308,.12,.48,.76,.44,.19,.112],
      [-.087,.313,.14,-.48,.80,.37,.20,.10],[.04,.27,.18,.14,.63,.81,.182,.108],[-.025,.27,-.182,-.16,.50,-.90,.26,.16],
      [.151,.248,-.161,.72,.42,-.53,.21,.118],[-.151,.252,-.158,-.72,.43,-.53,.22,.125],[0,.214,-.202,.05,-.28,-.98,.205,.139]];
    for (const [x,y,z,ax,ay,az,length,radius] of crown) {
      const spike=round(head,'hair',x,y,z,radius,.002,length,4);
      spike.rotation.y=.25;
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(ax,ay,az).normalize());
    }
    const ribbons=new THREE.Group();
    ribbons.position.set(-.055,.126,-.22);
    head.add(ribbons);
    for (const side of [-1,1]) {
      const strip=box(ribbons,'ink',side*.093,-.084,-.115,.08,.22,.027);
      strip.rotation.set(1.22,side*.71,side*.19);
      const tip=box(ribbons,'ink',side*.143,-.131,-.248,.067,.137,.021);
      tip.rotation.set(1.08,side*.74,side*.2);
    }

    function limb(side:number,arm:boolean) {
      const upper=new THREE.Group(),lower=new THREE.Group();
      const length=arm?.187:.201;
      upper.position.set(side*(arm?.221:.108),arm?.301:0,arm?.006:0);
      upper.add(lower);
      lower.position.y=-length;
      hip.add(upper);
      round(upper,arm?'ink':'orange',0,-length*.38,0,arm?.074:.088,arm?.086:.105,length*1.11,8,.85);
      round(lower,'orange',0,-length*.34,0,arm?.067:.076,arm?.078:.088,length*.97,8);
      if (arm) {
        round(lower,'ink',0,-.130,0,.069,.072,.037,8);
        orb(lower,'skin',0,-.176,.014,.139,.127,.135,1);
      } else {
        box(lower,'ink',0,-.177,.026,.151,.102,.181);
        box(lower,'slate',0,-.222,.057,.154,.043,.230);
        box(lower,'skin',0,-.184,.123,.119,.043,.079);
        box(lower,'ink',0,-.160,.097,.141,.043,.051);
      }
      return {upper,lower,side};
    }
    const arms=[limb(-1,true),limb(1,true)];
    const legs=[limb(-1,false),limb(1,false)];
    actor.scale.setScalar(.84);

    return {
      actor,
      pose(time:number,walk:boolean,dash:boolean,airborne:boolean,climb:boolean,seal:boolean) {
        const moving=walk||dash;
        const swing=moving?Math.sin(time*(dash?31:25)):0;
        hip.position.y=.43+(moving?Math.abs(swing)*.031:Math.sin(time*2.3)*.008);
        hip.rotation.x=moving ? -.24 : 0;
        head.rotation.x=moving ? .14 : 0;
        ribbons.rotation.x=Math.sin(time*(moving?11:3))*(moving?.27:.12);
        for (const {upper,lower,side} of arms) {
          upper.rotation.set(seal?-1.05:climb?2.0+swing*side*.43:moving?.78+swing*side*.13:-.1,0,side*(seal?.10:.18));
          lower.rotation.x=seal?-.84:moving?-.09:-.36;
          if(seal) lower.rotation.z=-side*.51;
          else lower.rotation.z=0;
        }
        for (const {upper,lower,side} of legs) {
          upper.rotation.set(airborne?-.76+side*.29:swing*side*.86,0,side*.09);
          lower.rotation.x=airborne?.78:Math.max(0,swing*side)*.90;
        }
      },
    };
  }

  function leafEmblem() {
    const c=document.createElement('canvas');
    c.width=168;c.height=64;
    const ctx=c.getContext('2d')!;
    ctx.fillStyle='#b6bbc0';ctx.fillRect(0,0,168,64);
    ctx.fillStyle='#5e6268';
    for (const x of [13,154]) for (const y of [16,48]) {ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#43464b';ctx.lineWidth=5;ctx.lineCap='round';
    ctx.beginPath();
    for(let i=0;i<=60;i++) {
      const a=i/60*Math.PI*2.73, r=2+i*.26;
      const x=84+Math.sin(a)*r,y=34+Math.cos(a)*r;
      if(!i)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.lineTo(102,49);ctx.lineTo(114,49);ctx.stroke();
    const map=new THREE.CanvasTexture(c);
    map.colorSpace=THREE.SRGBColorSpace;
    const badge=new THREE.Mesh(new THREE.PlaneGeometry(.247,.092),new THREE.MeshStandardMaterial({map,roughness:.55}));
    return badge;
  }

  return { makeVillage,makeNaruto,material };
}
