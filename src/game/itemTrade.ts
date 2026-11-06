import type { Rarity } from './catalog.ts';

const BUY_PRICE: Record<Rarity, number> = { Comum: 45, Incomum: 65, Raro: 95, Épico: 145, Lendário: 220 };
const SALE_PRICE: Record<Rarity, number> = { Comum: 12, Incomum: 18, Raro: 28, Épico: 45, Lendário: 75 };

export const merchantPrice = (rarity: Rarity, purchases: number) => BUY_PRICE[rarity] + 15 * purchases;
export const merchantRerollPrice = (rerolls: number, discount: number) =>
  Math.round((20 + 10 * rerolls) * (1 - Math.min(.4, Math.max(0, discount))));
export const itemSalePrice = (rarity: Rarity) => SALE_PRICE[rarity];
