import * as THREE from 'three';

/** Deforma regiões do sprite existente sem mover o ponto de apoio nem alterar a simulação. */
export function createPlayerPose() {
  const legs = { value: new THREE.Vector2() };
  const arms = { value: new THREE.Vector2() };
  const region = { value: new THREE.Vector4(1, 1, 0, 0) };
  const materials = new WeakSet<THREE.SpriteMaterial>();

  return {
    apply(material: THREE.SpriteMaterial, stride: number, lift: number, reach: number, guard: number, flip: boolean) {
      const map = material.map;
      if (!map) return;
      legs.value.set(stride, lift);
      arms.value.set(reach, guard);
      region.value.set(flip ? -map.repeat.x : map.repeat.x, map.repeat.y,
        map.offset.x + (flip ? map.repeat.x : 0), map.offset.y);
      if (materials.has(material)) return;
      materials.add(material);
      material.customProgramCacheKey = () => 'shinobi-player-pose-v1';
      material.onBeforeCompile = shader => {
        shader.uniforms.poseLegs = legs;
        shader.uniforms.poseArms = arms;
        shader.uniforms.poseRegion = region;
        shader.vertexShader = 'varying vec2 vPoseUv;\n' + shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\n vPoseUv = uv;');
        shader.fragmentShader = `varying vec2 vPoseUv;
uniform vec2 poseLegs;
uniform vec2 poseArms;
uniform vec4 poseRegion;
` + shader.fragmentShader.replace('#include <map_fragment>', `
#ifdef USE_MAP
  vec2 p = vPoseUv;
  float foot = 1.0 - smoothstep(0.03, 0.30, p.y);
  float side = smoothstep(0.41, 0.59, p.x) * 2.0 - 1.0;
  float shoulder = smoothstep(0.21, 0.33, p.y) * (1.0 - smoothstep(0.49, 0.64, p.y));
  float arm = shoulder * smoothstep(0.08, 0.25, abs(p.x - 0.5));
  p.x -= foot * poseLegs.x * side + arm * poseArms.x;
  p.y -= foot * (poseLegs.y + max(0.0, side * poseLegs.x) * 0.6) + arm * poseArms.y;
  if (any(lessThan(p, vec2(0.0))) || any(greaterThanEqual(p, vec2(1.0)))) discard;
  diffuseColor *= texture2D(map, p * poseRegion.xy + poseRegion.zw);
#endif`);
      };
      material.needsUpdate = true;
    },
  };
}
