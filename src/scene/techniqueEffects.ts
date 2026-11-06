import * as THREE from 'three';
import type { Technique } from '../game/heroes';

const UP = new THREE.Vector3(0, 1, 0);
const TAU = Math.PI * 2;
const round = (radius: number) => new THREE.IcosahedronGeometry(radius, 0);
const forward = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Geometria dos efeitos em espaço local. A direção de viagem é +Z. */
export function techniqueVisual(t: Technique, clone?: () => THREE.Sprite): THREE.Object3D {
  const group = new THREE.Group();
  const solid = new Map<string, THREE.MeshBasicMaterial>();
  const mesh = (geometry: THREE.BufferGeometry, color: string, x = 0, y = 0, z = 0) => {
    let material = solid.get(color);
    if (!material) {
      material = new THREE.MeshBasicMaterial({color,transparent:true,opacity:.93,depthWrite:false,side:THREE.DoubleSide});
      solid.set(color, material);
    }
    const part = new THREE.Mesh(geometry, material);
    part.position.set(x, y, z);
    group.add(part);
    return part;
  };
  const ring = (radius: number, color: string, angle = TAU) =>
    mesh(new THREE.TorusGeometry(radius, .024, 3, 18, angle), color);
  const trace = (points: THREE.Vector3[], width: number, color: string) =>
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, width, 4, false), color);
  const grains = (color: string, count: number, size: number, rise: number) => {
    for (let i=0;i<count;i++) {
      const angle = i * 2.4;
      mesh(round(size * (i%2 ? .65 : 1)), color, Math.sin(angle)*.58, (i%4)*rise, Math.cos(angle)*.58);
    }
  };
  const blade = (points: [number, number][], color: string) => {
    const shape = new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,z)));
    const part = mesh(new THREE.ShapeGeometry(shape), color);
    part.rotation.x = Math.PI/2;
    return part;
  };
  const name = t.name;
  if (name.includes('Bunshin') && clone) {
    group.add(clone());
    grains('#e8eef6', 6, .17, .09);
  } else if (/^Rasengan|Rasenshuriken|Bijūdama/.test(name)) {
    const bomb = name === 'Bijūdama';
    mesh(new THREE.SphereGeometry(.31, 10, 8), bomb ? '#20142f' : '#68cfff');
    for (let i=0;i<3;i++) {
      const swirl = ring(.36+i*.045, bomb ? '#e292ff' : i===1 ? '#fbffff' : '#a4f1ff', Math.PI*1.62);
      swirl.rotation.set(i*1.08,.5+i*.7,i);
    }
    if (name.includes('shuriken')) {
      for (let i=0;i<4;i++) {
        const edge=blade([[0,0],[.2,.32],[.3,1.04],[-.08,.65],[-.18,.23]], '#e3fbff');
        edge.rotateOnWorldAxis(UP,i*TAU/4);
      }
    }
    group.userData.spin = 12;
  } else if (/Dragão de Água|Dragão de Madeira|Kirin/.test(name)) {
    const wood = name.includes('Madeira'), lightning = name === 'Kirin';
    const skin = wood ? '#8b5838' : lightning ? '#5c9cfc' : '#379bdf';
    const crest = wood ? '#c38850' : '#d6f9ff';
    trace([forward(.22,-.11,-.98),forward(-.25,0,-.44),forward(-.18,.3,.02),forward(.07,.42,.38)],.12,skin);
    const head = mesh(round(.3), skin, 0,.4,.45);
    head.scale.set(1,.68,1.35);
    for (const side of [-1,1]) {
      mesh(round(.055),crest,side*.19,.48,.6);
      const horn = mesh(new THREE.ConeGeometry(.065,.32,4),crest,side*.15,.66,.34);
      horn.rotation.x=-.42;
      trace([forward(side*.19,.43,.66),forward(side*.37,.5,.53),forward(side*.44,.37,.36)],.023,crest);
    }
    mesh(round(.16),crest,0,.28,.63).scale.set(1,.42,1.25);
    group.userData.directed = true;
  } else if (/Invocação do Sapo|Gamabunta|Katsuyu|Invocação de Manda/.test(name)) {
    if (name.includes('Manda')) {
      trace([forward(-.37,-.12,-.44),forward(.37,-.1,-.18),forward(.18,.26,.1),forward(-.1,.48,.36)],.18,'#7855a7');
      mesh(round(.24),'#ad80c6',-.08,.49,.41).scale.set(1,.68,1.4);
      mesh(round(.042),'#f6d775',.03,.56,.58);
    } else if (name.includes('Katsuyu')) {
      mesh(round(.43),'#fff4df',0,.04,0).scale.set(1,.65,1.6);
      mesh(round(.23),'#9cc9eb',0,.22,.27).scale.set(.75,.46,1.1);
      for(const side of [-1,1]) trace([forward(side*.12,.2,.45),forward(side*.18,.46,.6)],.035,'#fff4df');
    } else {
      mesh(round(.39),'#ad604a',0,.12,0).scale.set(1.2,.8,1.28);
      mesh(round(.28),'#d18a5d',0,.23,.33).scale.set(1.45,.55,1);
      for(const side of [-1,1]){
        mesh(round(.115),'#b56d55',side*.23,.38,.34);
        mesh(round(.039),'#ffe286',side*.24,.41,.43);
        mesh(round(.19),'#8c4438',side*.4,.02,-.05).scale.set(.65,.6,1.55);
      }
    }
    grains('#d9dee2',6,.16,.075);
  } else if (name === 'Turbilhão de Tentáculos') {
    for (let i=0;i<4;i++) {
      const angle=i*TAU/4;
      const arms=[forward(.12,0,0),forward(.38,.12,.23),forward(.55,.22,.58),forward(.17,.29,.74)];
      trace(arms.map(point=>point.applyAxisAngle(UP,angle)),.092,i%2?'#c46d83':'#e195a1');
    }
    group.userData.spin=10;
  } else if (/Nuvem de Escamas|Rasante Alada|Nuvem de Tinta/.test(name)) {
    if(name==='Rasante Alada'){
      blade([[0,-.2],[.54,.05],[.85,.62],[.18,.35]],'#f1a343');
      blade([[0,-.2],[-.54,.05],[-.85,.62],[-.18,.35]],'#f1a343');
      group.userData.directed=true;
    }
    grains(name==='Nuvem de Tinta'?'#301e49':'#e7e99b',9,.17,.12);
  } else if (t.element === 'Raio') {
    mesh(round(.21),'#ecfbff',0,.12,.14);
    for (let i=0;i<5;i++) {
      const x=(i-2)*.19;
      const points=[forward(0,.12,.13),forward(x*.5,.29,.27),forward(x,.02,.49),forward(x*1.5,.25,.76)];
      const wire=new THREE.BufferGeometry().setFromPoints(points);
      group.add(new THREE.Line(wire,new THREE.LineBasicMaterial({color:i%2?'#c7f8ff':'#55a6ff'})));
    }
    group.userData.directed = true;
  } else if (/Kunai|Shuriken|Senbon/.test(name)) {
    if (name.includes('Shuriken')) {
      for(let i=0;i<4;i++){
        const edge=blade([[0,0],[.1,.14],[.41,.23],[.21,-.09]],'#c5d6e9');
        edge.rotateOnWorldAxis(UP,i*TAU/4);
      }
      ring(.074,'#303951').rotation.x=Math.PI/2;
      group.userData.spin=22;
    } else {
      blade([[0,.66],[.14,.16],[0,-.07],[-.14,.16]],'#c7d7e8');
      mesh(new THREE.BoxGeometry(.065,.035,.27),'#594561',0,0,-.18);
      ring(.064,'#a8bad0').rotateX(Math.PI/2).position.z=-.34;
      group.userData.directed = true;
    }
  } else if (t.element==='Madeira'||t.element==='Sábio'||/Mil Mãos/.test(name)) {
    for (let i=0;i<5;i++) {
      const x=(i-2)*.21, height=.48+(2-Math.abs(i-2))*.19;
      mesh(new THREE.CylinderGeometry(.032,.09,height,5),'#8d593a',x,height*.33,0).rotation.z=-x;
      trace([forward(x,.02,-.1),forward(x*1.3,.13,.25),forward(x*1.65,.015,.5)],.042,'#b8834d');
      mesh(round(.12),'#71a95a',x*1.1,height*.63,-.04).scale.set(1,.55,1.1);
    }
  } else if (t.element==='Areia'||/Deserto/.test(name)) {
    for (let i=0;i<3;i++) {
      const dune = ring(.38+i*.11,i===1?'#f3d798':'#b48650',Math.PI*1.27);
      dune.rotation.set(-1.2,i*.9,i*.55);
      dune.position.y=i*.14;
    }
    grains('#e9b873',9,.12,.11);
    group.userData.spin=5;
  } else if (t.element==='Fogo') {
    const dark=name==='Amaterasu', blue=t.color==='#69c9ff'||t.color==='#81e5ff';
    const edge=dark?'#23102f':blue?'#43a9ff':'#e74e20', core=dark?'#67428b':blue?'#d8faff':'#ffc253';
    if(name==='Bola de Fogo') mesh(new THREE.SphereGeometry(.42,10,8),core,0,.27,.04);
    for (let i=0;i<5;i++) {
      const x=(i-2)*.18;
      mesh(round(.21),edge,x,i%2*.19,.05).scale.set(.92,1.65,1.1);
      const flame=mesh(new THREE.ConeGeometry(.115,.52,5),i%2?edge:core,x,.22,.07);
      flame.rotation.set(.4,0,x);
    }
    grains(core,6,.07,.16);
  } else if (t.element==='Água'||t.element==='Vento') {
    const water=t.element==='Água';
    for(let i=0;i<3;i++){
      const flow=ring(.37+i*.12,water?(i%2?'#c2f7ff':'#43b6e7'):'#ccfbde',Math.PI*.95);
      flow.rotation.set(Math.PI/2,.05+i*.18,-Math.PI/2);
      flow.position.set(0,i*.13,i*.11);
    }
    group.userData.directed = true;
  } else if(t.element==='Terra') {
    for(let i=0;i<6;i++) mesh(round(.15+i*.024),i%2?'#b78b67':'#715647',(i-2.5)*.19,i%3*.12,0).rotation.z=i*.25;
  } else if(t.school==='Genjutsu'||t.element==='Sombra') {
    for (let i=0;i<3;i++) {
      const shadow=ring(.31+i*.1,i===2?'#cf9bed':'#70488f',Math.PI*1.65);
      shadow.rotation.set(Math.PI/2,.2+i*.2,i*2);
    }
    grains('#37224d',6,.14,.08);
    group.userData.spin=-3;
  } else {
    const strike = ring(.48,t.color,Math.PI*.85);
    strike.rotation.set(Math.PI/2,.38,-Math.PI/3);
    strike.scale.set(1.3,.8,1);
    grains('#f4f2ee',4,.08,.08);
    group.userData.directed = true;
  }
  return group;
}

/** Impacto curto no alvo. Mantém o efeito legível mesmo com vários acertos. */
export function techniqueImpact(t: Technique) {
  const color = t.name.startsWith('Rasengan') ? '#a4edff' : t.element==='Areia' ? '#f3d798' : t.color;
  const geometry = new THREE.BufferGeometry();
  const rays: number[] = [];
  for (let i=0;i<7;i++) {
    const a = i*TAU/7, x = Math.cos(a), y = Math.sin(a);
    rays.push(x*.13,y*.13,0,x*(i%2?.31:.49),y*(i%2?.31:.49),0);
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(rays,3));
  const impact = new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({color,transparent:true,depthWrite:false}));
  impact.userData.impact = true;
  return impact;
}

export function animateTechniqueVisual(object: THREE.Object3D, dt: number, direction?: THREE.Vector3) {
  if(object.userData.directed && direction) object.rotation.y = Math.atan2(direction.x,direction.z);
  else if(object.userData.spin) object.rotation.y += dt*object.userData.spin;
}

export function disposeObject(object:THREE.Object3D) {
  const materials = new Set<THREE.Material>();
  object.traverse(child=>{
    if(child instanceof THREE.Mesh || child instanceof THREE.Line) child.geometry.dispose();
    if(child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite)
      for(const material of Array.isArray(child.material)?child.material:[child.material]) materials.add(material);
  });
  materials.forEach(material=>material.dispose());
}
