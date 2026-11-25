import * as THREE from 'three';

export type ScrollStyle = { name: string; open: boolean; paper: string; border: string; rod: string; rodEnd: string; kanji: string; ink: string; band?: string };
export const SCROLL_STYLES: readonly ScrollStyle[] = [
  { name: 'Pergaminho ninja', open: true, paper: '#fff3d8', border: '#6b3a12', rod: '#e0703a', rodEnd: '#5a1f08', kanji: '忍', ink: '#c0392b' },
  { name: 'Pergaminho de selamento', open: true, paper: '#f7f4ec', border: '#2b2b34', rod: '#c8423a', rodEnd: '#2a2a33', kanji: '封', ink: '#1d1d24' },
  { name: 'Pergaminho de invocação', open: true, paper: '#efe2c4', border: '#5c6e8a', rod: '#8b2c2c', rodEnd: '#1f1f26', kanji: '口寄', ink: '#2c2c36' },
  { name: 'Pergaminho dos Sapos', open: true, paper: '#f1ead2', border: '#3f8a46', rod: '#d8c28c', rodEnd: '#b03a2e', kanji: '蝦', ink: '#2f6b35' },
  { name: 'Pergaminho do Céu', open: false, paper: '#2f5fae', border: '#16294d', rod: '#e9eef6', rodEnd: '#16294d', kanji: '天', ink: '#16294d', band: '#f2f4f8' },
  { name: 'Pergaminho da Terra', open: false, paper: '#f2f0ea', border: '#3b3b44', rod: '#2f5fae', rodEnd: '#16294d', kanji: '地', ink: '#2b2b33', band: '#2f5fae' },
  { name: 'Pergaminho de técnica secreta', open: true, paper: '#cfe3b8', border: '#4d7a3c', rod: '#c9b27a', rodEnd: '#6e5a2e', kanji: '秘術', ink: '#2c4a22' },
  { name: 'Pergaminho Proibido', open: false, paper: '#e9dcc0', border: '#4a3a28', rod: '#7a2d0e', rodEnd: '#2a160a', kanji: '禁', ink: '#7a1f12', band: '#3a2a1c' },
];
/** Estilo de um pergaminho no chão (sorteado ao nascer; o mesmo índice sempre dá o mesmo desenho). */
export const scrollStyle = (variant: number) => SCROLL_STYLES[((Math.floor(variant) % SCROLL_STYLES.length) + SCROLL_STYLES.length) % SCROLL_STYLES.length];

export function createPickupShadows(surface:(x:number,z:number)=>number) {
  const c=document.createElement('canvas');
  c.width=c.height=64;
  const g=c.getContext('2d')!;
  const halo=g.createRadialGradient(32,32,2,32,32,31);
  halo.addColorStop(0,'rgba(22,16,9,.66)');
  halo.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=halo;
  g.fillRect(0,0,64,64);
  const map=new THREE.CanvasTexture(c);
  const material=new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,
    polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2});
  const geometry=new THREE.PlaneGeometry(1,1);
  geometry.rotateX(-Math.PI/2);
  const up=new THREE.Vector3(0,1,0),normal=new THREE.Vector3();
  return {
    place(x:number,z:number,width:number) {
      const mesh=new THREE.Mesh(geometry,material);
      const step=.36;
      normal.set(surface(x-step,z)-surface(x+step,z),step*2,
        surface(x,z-step)-surface(x,z+step)).normalize();
      mesh.quaternion.setFromUnitVectors(up,normal);
      mesh.position.y=.018;
      mesh.scale.set(width,1,width*.74);
      return mesh;
    },
    dispose(){geometry.dispose();material.dispose();map.dispose();},
  };
}
