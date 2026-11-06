import type { Rarity } from './catalog.ts';

const BUY_PRICE: Record<Rarity, number> = { Comum: 45, Incomum: 65, Raro: 95, Épico: 145, Lendário: 220 };
const SALE_PRICE: Record<Rarity, number> = { Comum: 12, Incomum: 18, Raro: 28, Épico: 45, Lendário: 75 };

/**
 * Economia EXPANSIVA (pedido do usuário, 06/11/2026: "no late game uma kunai custar 2,0M, 5,0M..."):
 * todo preço de recompensa paga com Ryu (kunai/shuriken do chão, Roleta da Tsunade, compra e atualização do Mercador) é
 *   base × usoGrowth^(vezes usadas na run) × inflação(tempo de run)
 * inflação = perMinute^(minutos inteiros de run). Começo acessível (preço base no 1º minuto); fim muito caro.
 * Descontos de itens continuam valendo (com teto) e o multiplicador do debug (tuning.kunaiPrice) é aplicado por cima no GameCanvas.
 */
export const PRICE_INFLATION = { perMinute: 1.15 };
export const PRICE_GROWTH = { merchantBuy: 1.35, merchantReroll: 1.5 };
/** Inflação de preço pelo tempo TOTAL da run (s); usa minutos inteiros para o preço não mudar a cada quadro. */
export function runInflation(runSeconds = 0) { return Math.pow(PRICE_INFLATION.perMinute, Math.floor(Math.max(0, runSeconds) / 60)); }

export const merchantPrice = (rarity: Rarity, purchases: number, runSeconds = 0) =>
  Math.round(BUY_PRICE[rarity] * Math.pow(PRICE_GROWTH.merchantBuy, Math.max(0, purchases)) * runInflation(runSeconds));
export const merchantRerollPrice = (rerolls: number, discount: number, runSeconds = 0) =>
  Math.round(20 * Math.pow(PRICE_GROWTH.merchantReroll, Math.max(0, rerolls)) * runInflation(runSeconds) * (1 - Math.min(.4, Math.max(0, discount))));
export const itemSalePrice = (rarity: Rarity) => SALE_PRICE[rarity];
