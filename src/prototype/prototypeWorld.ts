import { CAMERA_VIEW, CAMERA_ZOOM } from '../game/settings';

export type Point = { x: number; z: number };
export type Obstacle = Point & { width: number; depth: number; top: number; round?: boolean };
export type House = Obstacle & { color: 'red' | 'yellow'; round?: boolean };
export const PROTOTYPE_CAMERA = { fov: CAMERA_VIEW.fov, pitch: CAMERA_VIEW.pitch, ...CAMERA_ZOOM };
export const START = { x: 0, z: 12 };
export const GATE = { z: 0, halfGap: 3.7 };
export const IRUKA = { x: -6, z: -16 };
export const TOWER = { x: 0, z: -32, width: 10.4, depth: 10.4, top: 10.25, round: true };
export const CITY = { x: 35, south: 0, north: -50 };
export const LIMIT = { x: 52, minZ: -62, maxZ: 32 };

export const HOUSES: House[] = [
  {x:-9,z:7,width:5.7,depth:5.4,top:4.1,color:'red',round:true},
  {x:10,z:8,width:5.4,depth:5.5,top:4.2,color:'yellow'},
  {x:-12,z:-6,width:6.9,depth:5.5,top:4.8,color:'yellow',round:true},
  {x:11,z:-7,width:7.5,depth:5.8,top:4.6,color:'red'},
  {x:-20,z:-12,width:6.3,depth:5.8,top:4.7,color:'red'},
  {x:22,z:-10,width:6.6,depth:5.8,top:4.6,color:'yellow',round:true},
  {x:-11,z:-21,width:6.6,depth:6.1,top:4.4,color:'red',round:true},
  {x:12,z:-21,width:6.5,depth:6.4,top:4.8,color:'yellow',round:true},
  {x:-24,z:-21,width:7.1,depth:5.8,top:5.0,color:'yellow'},
  {x:24,z:-25,width:7.0,depth:5.8,top:5.2,color:'red'},
  {x:-13,z:-32,width:6.8,depth:6.8,top:5.5,color:'yellow'},
  {x:13,z:-35,width:6.4,depth:6.5,top:5.0,color:'red',round:true},
  {x:-24,z:-39,width:6.0,depth:5.9,top:4.4,color:'red',round:true},
  {x:24,z:-44,width:7.0,depth:5.4,top:6.1,color:'yellow'},
  {x:-11,z:-45,width:6.3,depth:5.6,top:5.5,color:'red'},
  {x:12,z:-49,width:6.8,depth:5.4,top:6.2,color:'red'},
  {x:-30,z:-26,width:6.6,depth:4.6,top:4.5,color:'yellow'},
  {x:32,z:-32,width:6.2,depth:5.5,top:4.7,color:'red',round:true},
];

export const WALLS: Obstacle[] = [
  {x:-20,z:0,width:32.6,depth:1.25,top:3.0},
  {x:20,z:0,width:32.6,depth:1.25,top:3.0},
  {x:-3.95,z:0,width:1.23,depth:1.7,top:6.3},
  {x:3.95,z:0,width:1.23,depth:1.7,top:6.3},
];

export const TREES = [[-18,9],[-7,18],[9,22],[18,15],[-17,18],[21,7],[-28,8],[-36,-3],[32,5],[-25,-6],
  [19,-16],[-17,-28],[19,-34],[-15,-41],[19,-52],[-30,-52],[31,-50],[-39,-36],[42,-30],[-33,19],[39,20]]
  .map(([x,z],i) => ({x,z,width:1.05,depth:1.05,top:3.26+(i%4)*.45,round:true}));

export const ROCKS = [[-8,23],[14,15],[-12,3],[26,15],[-28,-32],[35,-11],[-18,-37],[21,-38]]
  .map(([x,z],i) => ({x,z,width:1.35+(i%3)*.4,depth:1.40+(i%3)*.3,top:.65+(i%3)*.33,round:true}));

export const OBSTACLES = [...HOUSES, ...WALLS, TOWER, ...TREES, ...ROCKS];

const clamp = (n:number,min:number,max:number) => Math.max(min,Math.min(max,n));
const RADIUS = .24;
const RUN_SPEED = 7.25;

export function inCity(point: Point) {
  return Math.abs(point.x) < CITY.x && point.z < CITY.south && point.z > CITY.north;
}

export function isStreet(x: number, z: number) {
  if (Math.abs(x) < 3.15 && z > -52) return true;
  if (z < 0 && z > -52 && [ -15, 16 ].some(col => Math.abs(x - col) < 1.7)) return true;
  return Math.abs(x) < 33 && [-14,-26,-40,-48].some(row => Math.abs(z - row) < 1.95);
}

export function isSquare(x:number,z:number) {
  return Math.abs(x) < 8.65 && z < -10 && z > -24;
}

export function cameraInput(x:number, z:number, yaw:number): Point {
  const scale = Math.max(1,Math.hypot(x,z));
  return { x:(x*Math.cos(yaw)+z*Math.sin(yaw))/scale, z:(-x*Math.sin(yaw)+z*Math.cos(yaw))/scale };
}

export function overlaps(point:Point, body:Obstacle, margin=0) {
  if(body.round) return ((point.x-body.x)/(body.width/2+margin))**2+((point.z-body.z)/(body.depth/2+margin))**2<1;
  return Math.abs(point.x-body.x) < body.width/2+margin && Math.abs(point.z-body.z) < body.depth/2+margin;
}

function closestBase(point:Point, body:Obstacle) {
  if(body.round) {
    const dx=point.x-body.x,dz=point.z-body.z;
    const r=Math.hypot(dx/(body.width/2),dz/(body.depth/2));
    return {x:body.x+dx/r,z:body.z+dz/r};
  }
  return {x:clamp(point.x,body.x-body.width/2,body.x+body.width/2),
    z:clamp(point.z,body.z-body.depth/2,body.z+body.depth/2)};
}

export function canWalk(point: Point, floor = 0, obstacles: readonly Obstacle[] = OBSTACLES) {
  return Math.abs(point.x) <= LIMIT.x && point.z >= LIMIT.minZ && point.z <= LIMIT.maxZ
    && !obstacles.some(body => body.top > floor + .04 && overlaps(point,body,RADIUS));
}

export function nearbyClimb(point:Point, movement:Point, floor:number, obstacles:readonly Obstacle[]) {
  let distance = .62;
  let nearest: { body:Obstacle; inward:Point } | undefined;
  for (const body of obstacles) {
    if (body.top <= floor+.2 || !overlaps(point,body,.68) || overlaps(point,body)) continue;
    const nearestPoint=closestBase(point,body);
    const dx=nearestPoint.x-point.x, dz=nearestPoint.z-point.z;
    const length = Math.hypot(dx,dz);
    if (length < .01 || length > distance || (dx*movement.x+dz*movement.z)/length < .34) continue;
    distance = length;
    nearest = {body,inward:{x:dx/length,z:dz/length}};
  }
  return nearest;
}

export function createPrototypePlayer(obstacles: readonly Obstacle[] = OBSTACLES) {
  const position = { ...START, y:0 };
  let facing = { x:0,z:-1 };
  let jumpSpeed = 0, dash = 0, cooldown = 0, walk = false;
  let dashDirection = facing;
  let climbing: ReturnType<typeof nearbyClimb>;
  let traveled = 0;

  return {
    position,
    get facing() {return facing;},
    get walking() {return walk;},
    get climbing() {return climbing;},
    get dashing() {return dash>0;},
    get jumping() {return jumpSpeed>0;},
    get distance() {return traveled;},
    jump(input:Point) {
      if (dash > 0) return;
      if (climbing) { climbing=undefined; jumpSpeed=3.5; return; }
      if (jumpSpeed !== 0) return;
      const direction = Math.hypot(input.x,input.z) > .1 ? input : facing;
      climbing = nearbyClimb(position,direction,position.y,obstacles);
      if (!climbing) jumpSpeed = 6.25;
    },
    dash(input:Point) {
      if (cooldown>0 || climbing) return;
      dash = .22;
      cooldown = .78;
      dashDirection = Math.hypot(input.x,input.z)>.1 ? input : facing;
    },
    reset() {
      Object.assign(position,START,{y:0});
      facing={x:0,z:-1};
      jumpSpeed=dash=cooldown=traveled=0;
      walk=false;
      climbing=undefined;
    },
    update(dt:number,direction:Point) {
      dash=Math.max(0,dash-dt);
      cooldown=Math.max(0,cooldown-dt);
      const input=dash>0?dashDirection:direction;
      const length=Math.hypot(input.x,input.z);
      walk=length>.02;
      if (walk) facing = {x:input.x/length,z:input.z/length};
      if (climbing) {
        const {body,inward}=climbing, up = direction.x*inward.x+direction.z*inward.z;
        if (up < -.25) climbing=undefined;
        else {
          position.y=Math.min(body.top,position.y+Math.max(0,up)*dt*5.9);
          if (position.y>=body.top-.001) {
            const surface=closestBase(position,body);
            position.x=surface.x+inward.x*.22;
            position.z=surface.z+inward.z*.22;
            climbing=undefined;
          }
          return;
        }
      }
      const advance = dt*RUN_SPEED*(dash>0?2.45:1), x0=position.x, z0=position.z;
      const x=position.x+input.x*advance, z=position.z+input.z*advance;
      if (canWalk({x,z:position.z},position.y,obstacles)) position.x=x;
      if (canWalk({x:position.x,z},position.y,obstacles)) position.z=z;
      traveled+=Math.hypot(position.x-x0,position.z-z0);
      let floor=0;
      for (const body of obstacles)
        if (body.top<=position.y+.07 && overlaps(position,body)) floor=Math.max(floor,body.top);
      if (position.y>floor+.002 || jumpSpeed>0) {
        jumpSpeed-=19*dt;
        position.y=Math.max(floor,position.y+jumpSpeed*dt);
        if (position.y===floor) jumpSpeed=0;
      }
    }
  };
}
