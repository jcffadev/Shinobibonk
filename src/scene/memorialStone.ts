import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MEMORIAL } from './leafLandmarkLayout';
import { fitArchitectureTile } from './villageArchitecture';
import type { createSolids } from './collision';

export function createMemorialStone(
  ground: (x: number, z: number) => number,
  solids: ReturnType<typeof createSolids>,
  atlas: THREE.Texture,
) {
  const root = new THREE.Group();
  root.name = 'pedra-memorial';
  const { x, z } = MEMORIAL;
  const y = ground(x, z);
  root.position.set(x, y, z);
  const mesh = (geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number) => {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z);
    object.castShadow = object.receiveShadow = true;
    root.add(object);
    return object;
  };
  const darkStone = new THREE.MeshStandardMaterial({ map: atlas, color: 0x606e79, roughness: .91 });
  const mortar = new THREE.MeshStandardMaterial({ color: 0x5f6269, roughness: 1 });
  const paving = [0xa7968b, 0x9e8d89, 0xb39993, 0x988980].map(color =>
    new THREE.MeshStandardMaterial({ map: atlas, color, roughness: .97 }));
  const soil = new THREE.MeshStandardMaterial({ color: 0x4b403b, roughness: 1 });

  const base = new THREE.CylinderGeometry(2.13, 2.18, .30, 40, 1);
  mesh(base, mortar, 0, -.135, .18);
  const bricks: THREE.BufferGeometry[][] = paving.map(() => []);
  for (let row = -5; row <= 5; row++) {
    const pz = row * .38;
    const limit = Math.sqrt(2.15 ** 2 - (Math.abs(pz) + .179) ** 2);
    for (let column = -5; column <= 5; column++) {
      const px = column * .48 + (row % 2 ? .24 : 0);
      const left = Math.max(px - .232, -limit), right = Math.min(px + .232, limit);
      if (right - left < .07) continue;
      const brick = new THREE.BoxGeometry(right - left, .11, .358);
      fitArchitectureTile(brick, 'stone');
      const variation = Math.abs(row * 7 + column * 11) % paving.length;
      bricks[variation].push(brick.translate((left + right) / 2, -.011, pz + .18));
    }
  }
  bricks.forEach((batch, i) => {
    mesh(mergeGeometries(batch)!, paving[i], 0, 0, 0);
    batch.forEach(brick => brick.dispose());
  });
  const plinth = new THREE.BoxGeometry(1.46, .25, .91);
  fitArchitectureTile(plinth, 'slate');
  mesh(plinth, darkStone, 0, .152, 0).name = 'pedra-memorial-base';
  for (const side of [-1, 1]) {
    const wing = new THREE.BoxGeometry(.78, .36, .69);
    fitArchitectureTile(wing, 'slate');
    mesh(wing, darkStone, side * 1.05, .204, -.09);
    solids.addBox(x + side * 1.05, z - .09, .39, .345, y + .384);
  }

  // Plano dos nomes e biséis partilham as mesmas arestas, incluindo o verso.
  const outline = [
    [-.39, .28], [.37, .28], [.90, 1.59], [.04, 2.88], [-.94, 1.55],
  ];
  const front = [
    [-.30, .37], [.28, .37], [.70, 1.58], [.035, 2.63], [-.73, 1.53],
  ];
  const vertices: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  type Point = readonly [number, number, number];
  const position = (outline: number[][], index: number, z: number): Point =>
    [outline[index][0], outline[index][1], z];
  function facet(color: number, ...points: Point[]) {
    const shade = new THREE.Color(color);
    for (const point of points) {
      vertices.push(...point);
      colors.push(shade.r, shade.g, shade.b);
      uvs.push((point[0] + 1 + point[2] * .13) / 2, point[1] / 3);
    }
  }
  const bevel = [0x3b5663, 0x3f606f, 0x7799a6, 0x98b8bf, 0x5b8592];
  const n = outline.length;
  const rim = (i: number, z: number) => position(outline, i, z);
  const face = (i: number, z: number) => position(front, i, z);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    facet(bevel[i], face(j, .305), face(i, .305), rim(i, .092), face(j, .305), rim(i, .092), rim(j, .092));
    facet(0x303f49, rim(j, .092), rim(i, .092), rim(i, -.24), rim(j, .092), rim(i, -.24), rim(j, -.24));
    facet(0x42565f, rim(j, -.24), rim(i, -.24), face(i, -.39), rim(j, -.24), face(i, -.39), face(j, -.39));
    facet(0x5f8395, [0, 1.36, .305], face(i, .305), face(j, .305));
    facet(0x475f6b, [0, 1.36, -.39], face(j, -.39), face(i, -.39));
  }
  const stone = new THREE.BufferGeometry();
  stone.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  stone.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  stone.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  fitArchitectureTile(stone, 'plaster');
  stone.computeVertexNormals();
  mesh(stone, new THREE.MeshStandardMaterial({ map: atlas, vertexColors: true, roughness: .5 }), 0, 0, 0).name =
    'pedra-memorial-facetada';
  solids.addBox(x, z, .66, .404, y + 2.72);

  const etching: number[] = [];
  for (let column = -4; column <= 4; column++) {
    for (let row = 0; row < 11; row++) {
      const px = column * .107, py = 1.78 - row * .091;
      if (Math.abs(px) > .46 - Math.max(0, row - 6) * .036 || (row + column * 4) % 17 === 11) continue;
      etching.push(px-.025, py, .306, px+.021, py+.003, .306);
      etching.push(px, py+.019, .306, px-.006, py-.030, .306);
      const accent = (row * 5 + column * 7) % 3;
      etching.push(px+.024, py-.012, .306, px+.035, py-.024-accent*.004, .306);
    }
  }
  const inscriptions = new THREE.BufferGeometry();
  inscriptions.setAttribute('position', new THREE.Float32BufferAttribute(etching, 3));
  root.add(new THREE.LineSegments(inscriptions, new THREE.LineBasicMaterial({ color: 0xa0b1b1, opacity: .64, transparent: true })));

  const leaves = new THREE.MeshStandardMaterial({ color: 0x4e6e4b, roughness: 1 });
  const flowers = [0xf3e9db, 0xd998a6, 0x9d8ac5].map(color => new THREE.MeshStandardMaterial({ color, roughness: .87 }));
  const bouquet = mesh(new THREE.CylinderGeometry(.16, .12, .15, 9), soil, 0, .12, .71);
  bouquet.name = 'pedra-memorial-oferendas';
  for (let i = 0; i < 11; i++) {
    const angle = i * 2.4, spread = Math.sqrt(i) * .058, height = .21 + (i * 13 % 8) * .023;
    const px = Math.cos(angle) * spread, pz = .71 + Math.sin(angle) * spread;
    const stem = mesh(new THREE.CylinderGeometry(.010, .013, height, 5), leaves, px * .8, .16 + height / 2, pz);
    stem.rotation.z = -px;
    const bloom = mesh(new THREE.IcosahedronGeometry(.051, 0), flowers[i % flowers.length], px, .16 + height, pz);
    bloom.scale.set(1.22, .74, 1.04);
  }

  return root;
}
