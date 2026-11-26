import { HEROES, heroOrganizations } from './heroes.ts';
import { ENEMY_TIERS } from './enemyTiers.ts';

export const AKATSUKI_MEMBERS = HEROES.filter(hero => heroOrganizations(hero.id).some(group => group.id === 'akatsuki'))
  .map(hero => hero.id);

export const AKATSUKI_AMBUSH = { reveal: 7, interact: 3.6, riseTime: .9, spawnRadius: 10, rewards: 3 } as const;
/**
 * Zetsu visto: o jogador chegou a `reveal` m dele (25/11/2026 — pedido do usuário: "Confirmar se ao ver o Zetsu o ícone está
 * aparecendo no M/TAB"). Antes a conta usava o z do jogador sem subtrair o do Zetsu, e ele quase nunca era marcado como visto.
 */
export const zetsuSeen = (px: number, pz: number, x: number, z: number) => Math.hypot(px - x, pz - z) <= AKATSUKI_AMBUSH.reveal;
export type AmbushMemberSave = { id: string; x: number; z: number; hp: number; maxHp: number };

export function akatsukiAmbushHp(threat: number) {
  return Math.max(1, Math.round(ENEMY_TIERS.mega.hp * threat));
}

export function zetsuEmergence(seconds: number) {
  const t = Math.min(1, Math.max(0, seconds / AKATSUKI_AMBUSH.riseTime));
  return t * t * (3 - 2 * t);
}
