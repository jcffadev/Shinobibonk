import * as THREE from 'three';
import { cardinalWalkArt, handSealArt, lateralWalkArt } from '../game/directionalArt';
import { formAt, portraitRegion } from '../game/evolution';
import { familyOf } from '../game/heroes';

const eventNpcs = {
  shikamaru: 'shikamaru-estrategista',
  orochimaru: 'orochimaru',
  ebisu: 'ebisu',
  iruka: 'iruka',
  challenge: 'zetsu',
  slot: 'tsunade',
  arsenal: 'tenten',
  youth: 'guy',
  'sapos-sabios': 'sapos-sabios',
} as const;

export type MissionNpcId = typeof eventNpcs[keyof typeof eventNpcs] | 'teuchi' | 'naruto-genin';

export function missionNpcForEvent(id: string): MissionNpcId | undefined {
  return Object.hasOwn(eventNpcs, id) ? eventNpcs[id as keyof typeof eventNpcs] : undefined;
}

type Cell = ReturnType<typeof portraitRegion>;
type View = 'front' | 'side' | 'back';
const extraViews = new Set<MissionNpcId>(['ebisu', 'teuchi', 'sapos-sabios']);
const band = Math.PI / 4;
const hysteresis = Math.PI / 30;
const cellAt = (row: { path: string; rows: number }, index: number): Cell => ({ ...row, cols: 4, index });

function facingView(angle: number, view: View): View {
  if (angle < band + (view === 'front' ? hysteresis : -hysteresis)) return 'front';
  if (angle > 3 * band + (view === 'back' ? -hysteresis : hysteresis)) return 'back';
  return 'side';
}

export function createMissionNpcs() {
  const textures = new Map<string, THREE.Texture>();
  const frames = new Map<string, { left: number; right: number; bottom: number; top: number; aspect: number }>();
  const loader = new THREE.TextureLoader();
  const viewFrom = new THREE.Vector3();
  const worldYaw = new THREE.Quaternion();
  const heading = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const npcAt = new THREE.Vector3();
  const facing = new THREE.Quaternion();
  let canvas: HTMLCanvasElement | undefined;

  function textureFor(path: string) {
    let texture = textures.get(path);
    if (!texture) {
      texture = loader.load(path);
      texture.name = path;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestMipmapLinearFilter;
      textures.set(path, texture);
    }
    return texture;
  }

  // Recorta a transparência de cada vista para alinhar os pés e manter a escala
  // quando a câmera troca de fileira. A textura compartilhada continua intacta.
  function frameFor(cell: Cell, texture: THREE.Texture) {
    const key = cell.path + ':' + cell.index;
    const cached = frames.get(key);
    if (cached) return cached;
    const source = texture.image as HTMLImageElement | undefined;
    if (!source?.width || !source.height) return;
    const col = cell.index % cell.cols, row = Math.floor(cell.index / cell.cols);
    const x = Math.round(col * source.width / cell.cols);
    const y = Math.round(row * source.height / cell.rows);
    const w = Math.round((col + 1) * source.width / cell.cols) - x;
    const h = Math.round((row + 1) * source.height / cell.rows) - y;
    canvas ??= document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    const pixels = ctx.getImageData(0, 0, w, h).data;
    let left = w, right = 0, top = h, bottom = 0;
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        if (pixels[(py * w + px) * 4 + 3] < 64) continue;
        left = Math.min(left, px);
        right = Math.max(right, px + 1);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py + 1);
      }
    }
    if (right <= left || bottom <= top) {
      left = top = 0;
      right = w;
      bottom = h;
    }
    const frame = {
      left: (x + left) / source.width, right: (x + right) / source.width,
      bottom: 1 - (y + bottom) / source.height, top: 1 - (y + top) / source.height,
      aspect: (right - left) / (bottom - top),
    };
    frames.set(key, frame);
    return frame;
  }

  function create(id: MissionNpcId) {
    const root = new THREE.Group();
    root.name = 'npc-pixel-' + id;
    const front = portraitRegion(id);
    const family = familyOf(id);
    const form = formAt(id).level;
    const cardinal = cardinalWalkArt(family, form), lateral = lateralWalkArt(family, form);
    const views = extraViews.has(id) ? { path: '/assets/shinobis/' + id + '-perfil-costas-v1.png', cols: 2, rows: 1 } : undefined;
    const side = views ? { ...views, index: 0 } : lateral && cellAt(lateral, 4 * lateral.row + 1);
    const back = views ? { ...views, index: 1 }
      : cardinal?.back !== undefined ? cellAt(cardinal, 4 * cardinal.back + 1) : undefined;
    const seal = id === 'naruto-genin' ? handSealArt(family, form) : undefined;
    const seals = seal && Array.from({ length: 4 }, (_, i) => cellAt({ path: seal.path, rows: 4 }, 4 * seal.row + i));
    for (const cell of [front, side, back, ...(seals ?? [])]) if (cell) textureFor(cell.path);

    const geometry = new THREE.PlaneGeometry(1, 1, 4, 8).translate(0, .5, 0);
    const position = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');
    const base = Float32Array.from(position.array);
    const material = new THREE.MeshBasicMaterial({ map: textureFor(front.path), alphaTest: .25 });
    const visual = new THREE.Mesh(geometry, material);
    visual.name = 'arte-original';
    visual.visible = false;
    visual.frustumCulled = false;
    visual.raycast = () => {};
    root.add(visual);

    // O alvo do clique acompanha os pés, inclusive durante a subida do Zetsu.
    // Ele independe da direção visual e fica invisível na renderização.
    const hitbox = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, 1, 10), new THREE.MeshBasicMaterial({ visible: false }));
    hitbox.name = 'alvo-interacao';
    hitbox.position.y = .5;
    if (id === 'sapos-sabios') hitbox.scale.x = hitbox.scale.z = 1.3;
    root.add(hitbox);

    let view: View = 'front';
    let frame: ReturnType<typeof frameFor>;
    let lastCell: Cell | undefined, lastFlip = false;
    let showingSeal = false;
    const phase = id.length * .87;

    /**
     * `lookAt` (25/11/2026 — pedido do usuário: "Os npcs tem que olhar pro jogador, ficar sempre olhando pra ele... mesmo se
     * girarmos a câmera"): a frente do NPC aponta para o jogador e a câmera só escolhe a vista (frente, perfil ou costas).
     */
    function update(time: number, camera: THREE.Camera, action = false, lookAt?: THREE.Vector3) {
      root.getWorldPosition(viewFrom);
      npcAt.copy(viewFrom);
      if (camera instanceof THREE.OrthographicCamera) {
        camera.getWorldDirection(viewFrom).negate();
      } else {
        viewFrom.sub(camera.getWorldPosition(heading)).negate();
      }
      if (Math.hypot(viewFrom.x, viewFrom.z) > .001) {
        root.getWorldQuaternion(worldYaw);
        const towardX = lookAt ? lookAt.x - npcAt.x : 0, towardZ = lookAt ? lookAt.z - npcAt.z : 0;
        if (lookAt && Math.hypot(towardX, towardZ) > .05) facing.setFromAxisAngle(up, Math.atan2(towardX, towardZ));
        else facing.copy(worldYaw);
        heading.copy(viewFrom).applyQuaternion(facing.invert());
        worldYaw.invert();
        const angle = Math.atan2(heading.x, heading.z);
        view = facingView(Math.abs(angle), view);
        // Só a malha de desenho acompanha o ângulo de leitura. A direção no
        // mundo, a posição, os objetos ao redor e o clique seguem no root fixo.
        const yaw = Math.atan2(viewFrom.x, viewFrom.z);
        visual.quaternion.setFromAxisAngle(up, yaw).premultiply(worldYaw);
        const sealCell = seals?.[(Math.abs(angle) > Math.PI / 2 ? 2 : 0) + Number(action)];
        const cell = sealCell ?? ((view === 'back' ? back : view === 'side' ? side : undefined) ?? front);
        const flip = !sealCell && cell === side && angle > 0;
        if (cell !== lastCell || flip !== lastFlip) {
          const map = textureFor(cell.path);
          const next = frameFor(cell, map);
          if (next) {
            frame = next;
            lastCell = cell;
            lastFlip = flip;
            showingSeal = !!sealCell;
            material.map = map;
            visual.visible = true;
            for (let i = 0; i < uv.count; i++) {
              const x = base[i * 3] + .5;
              const y = base[i * 3 + 1];
              uv.setXY(i, THREE.MathUtils.lerp(next.left, next.right, flip ? 1 - x : x),
                THREE.MathUtils.lerp(next.bottom, next.top, y));
            }
            uv.needsUpdate = true;
          }
        }
      }
      if (!frame) return;
      const t = time + phase;
      const breath = Math.sin(t * 2.45), shift = Math.sin(t * 1.47), head = Math.sin(t * 1.08);
      const emphasis = id === 'teuchi' || id === 'sapos-sabios' ? 1.35 : 1;
      for (let i = 0; i < position.count; i++) {
        const x = base[i * 3], y = base[i * 3 + 1];
        const torso = THREE.MathUtils.smoothstep(y, .18, .61);
        const neck = THREE.MathUtils.smoothstep(y, .59, .88);
        const chest = 1 - Math.min(1, Math.abs(y - .56) * 5);
        position.setXYZ(i,
          frame.aspect * (x * (1 + .025 * chest * breath) + emphasis * (.025 * torso * shift + .024 * neck * head)),
          y + emphasis * (.020 * torso * breath + .016 * neck * head * x),
          .026 * torso * shift);
      }
      position.needsUpdate = true;
    }

    return {
      root, material, update,
      sealing: () => showingSeal,
      dispose() {
        root.removeFromParent();
        geometry.dispose();
        material.dispose();
        hitbox.geometry.dispose();
        hitbox.material.dispose();
      },
    };
  }

  return {
    create,
    dispose() {
      for (const texture of textures.values()) texture.dispose();
      textures.clear();
      frames.clear();
      canvas = undefined;
    },
  };
}

export type MissionNpc = ReturnType<ReturnType<typeof createMissionNpcs>['create']>;
