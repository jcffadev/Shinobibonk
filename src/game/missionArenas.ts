export type InstanceArena = 'exam-forest' | 'exam-hall' | 'hagoromo';

export const INSTANCE_FLOOR=125;
export const EXAM_ENTRANCE={x:0,z:-16,radius:3} as const;
export const EXAM_SPAWN={x:0,z:9} as const;

export function constrainArena(kind:InstanceArena, point:{x:number;z:number}, center:{x:number;z:number}, sageRadius:number) {
  if(kind==='hagoromo'){
    const dx=point.x-center.x,dz=point.z-center.z,d=Math.hypot(dx,dz);
    if(d>sageRadius){point.x=center.x+dx/d*sageRadius;point.z=center.z+dz/d*sageRadius;}
    return;
  }
  const hall=kind==='exam-hall';
  const x=hall?13:21,z=hall?15:22;
  point.x=Math.max(-x,Math.min(x,point.x));
  point.z=Math.max(-z,Math.min(z,point.z));
}
