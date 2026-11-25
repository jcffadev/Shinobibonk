type GroundPoint = { x: number; z: number };
type Target = { hp: number; sprite: { position: GroundPoint } };

export function selectCombatTarget<T extends Target>(
  enemies: readonly T[], origin: GroundPoint, range: number, locked: T | null,
  alreadyHit?: ReadonlySet<T>,
): T | undefined {
  const distance = (enemy: T) => (enemy.sprite.position.x - origin.x) ** 2 + (enemy.sprite.position.z - origin.z) ** 2;
  const rangeSq = range ** 2;
  if (locked && locked.hp > 0 && !alreadyHit?.has(locked) && distance(locked) <= rangeSq && enemies.includes(locked)) return locked;
  let nearest: T | undefined;
  let nearestSq = rangeSq;
  for (const enemy of enemies) {
    if (enemy.hp <= 0 || alreadyHit?.has(enemy)) continue;
    const candidateSq = distance(enemy);
    if (candidateSq <= rangeSq && (!nearest || candidateSq < nearestSq)) {
      nearest = enemy;
      nearestSq = candidateSq;
    }
  }
  return nearest;
}

export function projectileSpread(fan: boolean, index: number, projectiles: number, focused: boolean): number {
  if (focused && index === 0) return 0;
  if (fan) return index % 2 ? .2 : -.2;
  if (!focused) return (index - (projectiles - 1) / 2) * .1;
  return Math.ceil(index / 2) * (index % 2 ? .1 : -.1);
}

/** Primeiro ponto de contato ao longo de um segmento horizontal. A direção tem comprimento 1. */
export function projectileContact(
  origin: GroundPoint, direction: GroundPoint, travel: number, radius: number, target: GroundPoint,
): number {
  const x = target.x - origin.x;
  const z = target.z - origin.z;
  const along = x * direction.x + z * direction.z;
  if (along < -radius || along > travel + radius) return Infinity;
  const cross = x * direction.z - z * direction.x;
  const reachSq = radius ** 2 - cross ** 2;
  if (reachSq < 0) return Infinity;
  const reach = Math.sqrt(reachSq);
  const entry = Math.max(0, along - reach);
  return along + reach >= 0 && entry <= travel ? entry : Infinity;
}

export function firstProjectileContact<T extends Target>(
  enemies: readonly T[], origin: GroundPoint, direction: GroundPoint, travel: number,
  radius: number, alreadyHit: ReadonlySet<T>,
): { target: T; distance: number } | undefined {
  let target: T | undefined;
  let distance = Infinity;
  for (const enemy of enemies) {
    if (enemy.hp <= 0 || alreadyHit.has(enemy)) continue;
    const contact = projectileContact(origin, direction, travel, radius, enemy.sprite.position);
    if (contact < distance) {
      target = enemy;
      distance = contact;
    }
  }
  return target && { target, distance };
}
