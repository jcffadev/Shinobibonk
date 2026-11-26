/**
 * Preço acima do item no chão (25/11/2026 — pedido do usuário: "Colocar o valor de custo das kunais/shurikens/pergaminhos/valor
 * atual da roleta em cima do item no chão, pro jogador visualizar ao chegar perto"). Lógica pura: escolhe o alvo mais perto
 * dentro de `PRICE_TAG.radius` m e monta o texto.
 */
export const PRICE_TAG = { radius: 5, lift: 1.5 };
export type PriceTarget = { id: string; x: number; z: number; price: number | 'free' };
export function nearestPriceTag(px: number, pz: number, targets: readonly PriceTarget[]) {
  let best: PriceTarget | undefined, bestD = PRICE_TAG.radius;
  for (const t of targets) { const d = Math.hypot(t.x - px, t.z - pz); if (d <= bestD) { best = t; bestD = d; } }
  return best;
}
export const priceTagText = (price: PriceTarget['price'], format: (n: number) => string) => price === 'free' ? 'Grátis' : format(price) + ' Ryu';
