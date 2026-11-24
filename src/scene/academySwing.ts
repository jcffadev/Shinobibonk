import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { createSolids } from './collision';
import { academySwingSite } from './leafLandmarkLayout';
import { fitArchitectureTile } from './villageArchitecture';
import type { UrbanLot } from './villageDistricts';

export function createAcademySwing(
  academy: UrbanLot,
  ground: (x: number, z: number) => number,
  solids: ReturnType<typeof createSolids>,
  atlas: THREE.Texture,
  canopy: THREE.Texture,
) {
  const { treeX, x, z } = academySwingSite(academy);
  const y = ground(treeX, z);
  const root = new THREE.Group();
  root.name = 'balanco-da-academia';
  root.position.set(treeX, y, z);
  const bark = new THREE.MeshStandardMaterial({ map: atlas, color: 0x9a8569, roughness: 1 });
  const wood = new THREE.MeshStandardMaterial({ map: atlas, color: 0xbf9874, roughness: .8 });
  const rope = new THREE.MeshStandardMaterial({ color: 0x83644b, roughness: 1 });
  const foliage = [0xd3e0af, 0xe1e9c5, 0xffffff, 0xb8c899].map(color =>
    new THREE.MeshStandardMaterial({ map: canopy, color, roughness: 1 }));
  function place(
    parent: THREE.Group, geometry: THREE.BufferGeometry, material: THREE.Material,
    x: number, y: number, z: number,
  ) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  type Point = readonly [number, number, number];
  const up = new THREE.Vector3(0, 1, 0);
  function limb(start: Point, end: Point, foot: number, tip: number) {
    const a = new THREE.Vector3(...start), b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    const size = direction.length();
    const center = a.lerp(b, .5);
    const woodGrain = new THREE.CylinderGeometry(tip, foot, size, 9);
    const uv=woodGrain.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getY(i),uv.getX(i));
    fitArchitectureTile(woodGrain, 'wood');
    const mesh = place(root, woodGrain, bark, center.x, center.y, center.z);
    mesh.quaternion.setFromUnitVectors(up, direction.normalize());
  }
  const knot = new THREE.IcosahedronGeometry(1, 1);
  fitArchitectureTile(knot, 'wood');
  for (const [px, py, pz, sx, sy, sz] of [
    [0, 1.06, 0, .39, .55, .36], [-.08, 2.36, -.02, .35, .49, .32], [.28, 3.35, .07, .28, .38, .29],
    [1.15, 3.61, .02, .24, .21, .24],
  ]) place(root, knot, bark, px, py, pz).scale.set(sx, sy, sz);
  limb([0, -.27, 0], [0, 1.06, 0], .51, .36);
  limb([0, 1.06, 0], [-.08, 2.36, -.02], .36, .32);
  limb([-.08, 2.36, -.02], [.28, 3.35, .07], .32, .26);
  limb([.28, 3.35, .07], [1.15, 3.61, .02], .27, .22);
  limb([1.15, 3.61, .02], [2.44, 3.83, -.014], .22, .095);
  limb([2.33, 3.81, -.01], [3.02, 4.25, -.27], .105, .055);
  limb([-.03, 2.51, 0], [-.81, 3.43, -.37], .21, .127);
  limb([-.81, 3.43, -.37], [-1.16, 4.46, -.53], .13, .08);
  limb([.07, 3.03, .06], [.17, 4.36, .89], .20, .07);
  for (let i = 0; i < 6; i++) {
    const angle = i * 2.399, dx = Math.cos(angle) * .71, dz = Math.sin(angle) * .68;
    limb([0, .15, 0], [dx, ground(treeX + dx, z + dz) - y - .09, dz], .16, .041);
  }
  const leaves = new THREE.IcosahedronGeometry(1, 1);
  const uv = leaves.attributes.uv;
  // Recorte de folhas opacas da copa antiga, usado como textura do volume.
  for (let i = 0; i < uv.count; i++) uv.setXY(i, .047 + (uv.getX(i) % 1) * .047, .824 + uv.getY(i) * .077);
  const crown = [
    [-1.3, 4.39, -.5, 1.35, .53, 1.03], [-.62, 4.88, -.6, 1.20, .74, 1.06],
    [.41, 4.73, -.76, 1.36, .66, .93], [1.4, 4.32, -.53, 1.29, .61, .89],
    [2.52, 4.49, -.38, 1.07, .51, .88], [.13, 4.43, .97, 1.35, .57, .90],
    [1.13, 4.44, .69, 1.19, .53, .85], [-1.18, 4.17, .61, 1.28, .53, .81],
    [.2, 5.17, .09, 1.06, .57, .92], [-1.71, 4.61, -.82, .82, .54, .81],
  ];
  const batches: THREE.BufferGeometry[][] = foliage.map(() => []);
  const transform = new THREE.Object3D();
  crown.forEach(([px, py, pz, sx, sy, sz], i) => {
    for (let lobe = 0; lobe < 4; lobe++) {
      const angle = i * 1.82 + lobe * 2.25;
      const span = lobe ? .62 : 1;
      transform.position.set(px + (lobe ? Math.cos(angle) * sx * .6 : 0),
        py + (lobe ? .10 + Math.sin(angle) * sy * .55 : 0), pz + (lobe ? Math.sin(angle) * sz * .68 : 0));
      transform.scale.set(sx * span, sy * span, sz * span);
      transform.rotation.set(.14 * Math.sin(angle), angle, .12 * Math.cos(angle));
      transform.updateMatrix();
      batches[(i + lobe) % batches.length].push(leaves.clone().applyMatrix4(transform.matrix));
    }
  });
  batches.forEach((batch, i) => {
    place(root, mergeGeometries(batch)!, foliage[i], 0, 0, 0);
    batch.forEach(cluster => cluster.dispose());
  });
  leaves.dispose();

  const swing = new THREE.Group();
  swing.name = 'balanco-assento-e-cordas';
  swing.position.set(x - treeX, 3.70, .015);
  root.add(swing);
  const seatGround = Math.max(ground(x - .43, z), ground(x + .43, z));
  const length = y + swing.position.y - seatGround - .59;
  for (const side of [-1, 1]) {
    const px = side * .38;
    const knotY = side * .07;
    place(swing, new THREE.CylinderGeometry(.025, .025, length + knotY, 8), rope, px, (knotY - length) / 2, 0);
    const wrap = place(root, new THREE.TorusGeometry(.189, .027, 7, 13), rope, x - treeX + px, 3.71 + knotY, .015);
    wrap.rotation.y = Math.PI / 2;
    place(swing, new THREE.SphereGeometry(.047, 8, 6), rope, px, -length + .049, 0);
  }
  const board = new THREE.BoxGeometry(.96, .086, .33);
  fitArchitectureTile(board, 'wood');
  place(swing, board, wood, 0, -length, 0).name = 'balanco-assento';
  solids.add(treeX, z, .49, true, y + 3.4);

  return {
    root, x, z,
    update(time: number) { swing.rotation.x = Math.sin(time * 1.63) * .077; },
  };
}
