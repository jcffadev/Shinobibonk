import { ITEM_BY_NAME } from './catalog.ts';
import { PILL_BY_NAME, pillEffectText } from './pills.ts';

/**
 * Rodada 101 (pedido do usuário: "Em pilulas e itens… Nome · Se esta no pool · Efeito · Descrição · Quantidade"): cada cartão
 * de pílula ou item separa o efeito (o número), a descrição (o texto da obra) e a quantidade máxima.
 */
export function plannerCardInfo(name: string) {
  const pill = PILL_BY_NAME[name];
  if (pill) return { effect: pillEffectText(name, 1) + ' por nível', flavor: pill.flavor, quantity: `Até ${pill.max} níveis` };
  const item = ITEM_BY_NAME[name];
  return item ? { effect: item.description, flavor: '', quantity: `${item.rarity} · até ${item.max} cópia${item.max > 1 ? 's' : ''}` } : undefined;
}
