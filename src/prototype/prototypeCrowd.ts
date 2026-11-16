import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { AvatarMode } from './prototypeBenchmark';

export const PROTOTYPE_CROWD_MAX=1600;

export function createCrowd(scene:THREE.Scene, actor:THREE.Group, sprite:THREE.Texture) {
  const instances:THREE.InstancedMesh[] = [];
  const positions = Array.from({length:PROTOTYPE_CROWD_MAX},(_,i)=>{
    const a=i*2.39996323, radius=4+Math.sqrt(i/PROTOTYPE_CROWD_MAX)*22;
    return {x:Math.sin(a)*radius,z:-10+Math.cos(a)*radius,a};
  });
  const m=new THREE.Matrix4(), point=new THREE.Vector3(), scale=new THREE.Vector3(1,1,1), rotation=new THREE.Quaternion();
  const axis=new THREE.Vector3(0,1,0);
  function instance(mesh:THREE.InstancedMesh) {
    for (let i=0;i<positions.length;i++) {
      const {x,z,a}=positions[i];
      point.set(x,0,z);
      rotation.setFromAxisAngle(axis,a);
      m.compose(point,rotation,scale);
      mesh.setMatrixAt(i,m);
    }
    mesh.count=0;
    mesh.visible=false;
    mesh.frustumCulled=false;
    scene.add(mesh);
    return mesh;
  }

  const spriteMaterial = new THREE.ShaderMaterial({
    uniforms:{art:{value:sprite}},
    vertexShader:`
      varying vec2 artUv;
      void main(){
        artUv=vec2((uv.x+3.0)/5.0,uv.y/5.0);
        vec4 center=modelViewMatrix*instanceMatrix*vec4(0.0,0.58,0.0,1.0);
        center.xy+=position.xy;
        gl_Position=projectionMatrix*center;
      }`,
    fragmentShader:`
      uniform sampler2D art;
      varying vec2 artUv;
      void main(){
        vec4 pixel=texture2D(art,artUv);
        if(pixel.a<0.5)discard;
        gl_FragColor=vec4(pixel.rgb,1.0);
        #include <colorspace_fragment>
      }`,
  });
  const sprites = instance(new THREE.InstancedMesh(new THREE.PlaneGeometry(.95,1.16),spriteMaterial,PROTOTYPE_CROWD_MAX));

  actor.updateWorldMatrix(true,true);
  const groups = new Map<THREE.Material,THREE.BufferGeometry[]>();
  actor.traverse(part=>{
    if (!(part instanceof THREE.Mesh)||Array.isArray(part.material)) return;
    const geo = part.geometry.index ? part.geometry.toNonIndexed() : part.geometry.clone();
    geo.applyMatrix4(part.matrixWorld);
    const group=groups.get(part.material)??[];
    group.push(geo);
    groups.set(part.material,group);
  });
  for (const [material,parts] of groups) {
    const merged=mergeGeometries(parts);
    parts.forEach(part=>part.dispose());
    if(merged)instances.push(instance(new THREE.InstancedMesh(merged,material,PROTOTYPE_CROWD_MAX)));
  }
  const particles = new THREE.BufferGeometry();
  const points=positions.flatMap(({x,z},i)=>[x,.28+(i%7)*.12,z,x+.25,1.03+(i%9)*.05,z+.33]);
  particles.setAttribute('position',new THREE.Float32BufferAttribute(points,3));
  const fx = new THREE.Points(particles,new THREE.PointsMaterial({
    color:'#20d2ff',size:.21,transparent:true,opacity:.78,blending:THREE.AdditiveBlending,depthWrite:false,
  }));
  fx.visible=false;
  fx.frustumCulled=false;
  scene.add(fx);

  return {
    set(mode:AvatarMode,enemies:number,effects:boolean) {
      const count = Math.max(0,Math.min(enemies,PROTOTYPE_CROWD_MAX));
      sprites.count=count;
      sprites.visible=count>0&&mode==='sprite';
      for(const mesh of instances) {
        mesh.count=count;
        mesh.visible=count>0&&mode==='low-poly';
      }
      particles.setDrawRange(0,Math.max(64,count)*2);
      fx.visible=effects;
    },
    update(time:number) {
      if (!fx.visible) return;
      fx.position.y=.13*Math.sin(time*3);
      fx.material.opacity=.55+.24*Math.sin(time*4.8);
    }
  };
}
