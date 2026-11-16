import { COLLISION_RULES, type Solid } from './collision';
import { foundationDistance, foundationNormal } from './villageCollision';

type Point = { x: number; z: number };
const SPEED = 6.8;

export function createVillageTraversal(solidList: readonly Solid[]) {
  let wall: Solid | undefined;
  let feet = -Infinity;
  let normal = { x: 0, z: 0 };

  function roofAt(point: Point) {
    let top = -Infinity;
    for (const solid of solidList) {
      if (solid.top === undefined || solid.top > feet + .06) continue;
      if (foundationDistance(point.x, point.z, solid)<.045) top = Math.max(top, solid.top);
    }
    return top;
  }

  return {
    get climbing() { return !!wall; },
    get facing() { return normal; },
    get elevation() { return Number.isFinite(feet) ? feet : undefined; },
    reset() { wall = undefined; feet = -Infinity; },
    restore(point: Point, savedFeet: number | undefined, base: number) {
      // A suspensão no meio de uma parede volta para o chão. No telhado, restaura o apoio.
      feet = Number.isFinite(savedFeet) ? savedFeet! : -Infinity;
      feet = Math.max(base, roofAt(point));
    },
    jump(point: Point, heading: Point, base: number) {
      if (wall) { wall = undefined; return false; }
      const foot = Math.max(base, feet);
      let bestDistance = COLLISION_RULES.playerRadius + .55;
      for (const solid of solidList) {
        if (solid.top === undefined || solid.top <= foot + .18 || (solid.bottom??-Infinity)>foot+.3) continue;
        const distance=foundationDistance(point.x,point.z,solid);
        if(distance<-.06||distance>bestDistance)continue;
        const outward=foundationNormal(point,solid);
        if(-outward.x*heading.x-outward.z*heading.z<.42)continue;
        bestDistance = distance;
        wall = solid;
        normal = { x:-outward.x,z:-outward.z };
      }
      if (!wall) return false;
      feet = foot;
      return true;
    },
    advance(point: Point, movement: Point, base: number, dt: number) {
      if (wall) {
        const upward = normal.x*movement.x + normal.z*movement.z;
        if (upward < -.30) wall = undefined;
        else {
          feet = Math.min(wall.top!, feet + SPEED * Math.max(0,upward) * dt);
          if (feet < wall.top!) return feet;
          const distance = foundationDistance(point.x,point.z,wall)+.19;
          point.x += normal.x*distance;
          point.z += normal.z*distance;
          wall = undefined;
          return feet;
        }
      }
      const support = Math.max(base,roofAt(point));
      feet = Number.isFinite(feet) ? Math.max(support,feet-SPEED*1.8*dt) : support;
      return feet;
    },
  };
}
