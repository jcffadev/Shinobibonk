/**
 * Chefes de zona (Guardiões) inabaláveis e com fúria (26/11/2026 — pedido do usuário: "Os bosses não podem ser empurrados e
 * entram em rage ao perder 30% do HP" → "adicione essa mecânica").
 *
 * - Sem deslocamento: empurrão (status Empurrar), puxões e repulsão de gravidade (Bansho Tenin, Chibaku Tensei, Shinra Tensei)
 *   não movem Guardião nem Bijū. Eles continuam tomando o dano e os outros status.
 * - Fúria: ao chegar a `hpShare` da vida máxima (perdeu 30%), o Guardião entra em fúria uma vez: +`damage` de dano (golpes e
 *   técnicas) e fecha `armor` do dano que ainda passa pela defesa. A Bijū segue as fases dela (BIJUU_FURY em bijuu.ts), que
 *   já começam ao perder 1/3 da vida.
 */
export const BOSS_RAGE = { hpShare: .7, damage: .25, armor: .3 };

/** O chefe entra em fúria agora? (uma vez só) */
export const bossRageDue = (hp: number, maxHp: number, raging = false) => !raging && hp > 0 && hp <= maxHp * BOSS_RAGE.hpShare;

/** Defesa com fúria: fecha `armor` do dano que ainda passava. */
export const rageDefense = (defense: number) => 1 - (1 - Math.max(0, defense)) * (1 - BOSS_RAGE.armor);

/** Chefe que não pode ser empurrado nem puxado. */
export const immovableBoss = (e: { guardian?: boolean; bijuu?: boolean; totem?: boolean }) => !!(e.guardian || e.bijuu || e.totem);
