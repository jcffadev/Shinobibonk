import type { UrbanLot } from './villageDistricts';

export const MEMORIAL = { x: -38, z: -26, radius: 3.2 } as const;
export const ACADEMY_COURT = { x: -16.3, z: -50.95, rx: 4.35, rz: 2.8 } as const;

export function academySwingSite(academy: UrbanLot) {
  const swingZ = academy.z + academy.depth / 2 + 1.13;
  return { treeX: academy.x - 3.63, x: academy.x - 1.91, z: swingZ };
}
