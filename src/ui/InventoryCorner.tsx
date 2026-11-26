import { ITEM_BY_NAME } from '../game/catalog';
import { ItemIcon } from './RunSheet';

/**
 * Grade de itens da run no canto inferior direito. 25/11/2026 (usuário: "Ajustar o hud para aparecer todos os itens que temos,
 * não minimizar e aparecer +60 por exemplo"): mostra sempre todos os itens, sem recolher e sem o botão com o total; com muitos
 * itens os ícones ficam menores para caber.
 */
export function InventoryCorner({ items }: { items: Record<string, number> }) {
  const entries = Object.entries(items);
  const size = entries.length > 48 ? 'tiny' : entries.length > 24 ? 'small' : '';
  return <section className={`inventory-corner all-items ${size}`} aria-label="Itens da partida">
    {entries.length ? entries.map(([name, count]) => <div className="inv-icon" key={name} title={`${name} · ${ITEM_BY_NAME[name]?.description ?? ''}`}><ItemIcon name={name} /><small>{count}</small></div>) : <span>🎒 Itens da run</span>}
  </section>;
}
