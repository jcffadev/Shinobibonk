type Point = { x:number; z:number };
export type Foundation = Point & { r:number; halfZ?:number; top?:number; bottom?:number };

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/** Positivo fora da base, negativo dentro. Círculo para troncos e retângulo para paredes. */
export function foundationDistance(x:number,z:number,s:Foundation) {
  const dx=Math.abs(x-s.x),dz=Math.abs(z-s.z);
  if(s.halfZ===undefined)return Math.hypot(dx,dz)-s.r;
  const edgeX=dx-s.r,edgeZ=dz-s.halfZ;
  return Math.hypot(Math.max(0,edgeX),Math.max(0,edgeZ))+Math.min(0,Math.max(edgeX,edgeZ));
}

export function foundationNormal(p:Point,s:Foundation) {
  const dx=p.x-s.x,dz=p.z-s.z;
  if(s.halfZ===undefined) {
    const d=Math.hypot(dx,dz);
    return d>.001?{x:dx/d,z:dz/d}:{x:1,z:0};
  }
  const x=dx-clamp(dx,-s.r,s.r),z=dz-clamp(dz,-s.halfZ,s.halfZ),d=Math.hypot(x,z);
  if(d>.001)return {x:x/d,z:z/d};
  return s.r-Math.abs(dx)<s.halfZ-Math.abs(dz)?{x:Math.sign(dx)||1,z:0}:{x:0,z:Math.sign(dz)||1};
}

export function foundationBlocks(s:Foundation,elevation:number) {
  return (s.top===undefined||s.top>elevation+.045) && (s.bottom===undefined||s.bottom<elevation+1.02);
}

export function boxExit(p:Point,s:Foundation,radius:number,ux:number,uz:number) {
  const distance=(value:number,center:number,half:number,component:number)=>
    Math.abs(component)<1e-9?Infinity:(center+Math.sign(component)*(half+radius)-value)/component;
  return Math.min(distance(p.x,s.x,s.r,ux),distance(p.z,s.z,s.halfZ!,uz));
}
