/**
 * Projétil/golpe extra nas recompensas de bênção (altares e recompensas do mesmo tipo) — Rodada 55, pedido do usuário:
 * "Temos um buff +35% chance projétil extra/golpe extra, remova e coloque +1 projétil... lendário será +3 projéteis/golpes.
 * Epico será 2, abaixo disso é raro é 1. Incomum/comum não tem projétil na lista de buffs."
 * Índice = tier de raridade (0 Comum · 1 Incomum · 2 Raro · 3 Épico · 4 Lendário). Valor inteiro somado a `projectiles`
 * (não é afetado pela Sorte). Em técnicas de projétil = projéteis a mais; nas demais (corpo a corpo, cone, linha, área) = golpes a mais.
 */
export const ALTAR_PROJECTILES=[0,0,1,2,3] as const;
export function altarProjectiles(tier:number):number{return ALTAR_PROJECTILES[Math.max(0,Math.min(4,Math.floor(tier)))]??0;}
export function projectileLabel(count:number):string{return count===1?'+1 projétil/golpe extra':`+${count} projéteis/golpes extras`;}
