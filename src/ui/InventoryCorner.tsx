import { useEffect, useState } from 'react';
import { ITEM_BY_NAME } from '../game/catalog';
import { ItemIcon } from './RunSheet';

/** Preferência local (por navegador) da grade de itens do HUD: recolhida (3 linhas com rolagem) ou expandida. */
export const INVENTORY_EXPANDED_KEY = 'sb_hud_items_expanded_v1';
function readExpanded() { try { return localStorage.getItem(INVENTORY_EXPANDED_KEY) === '1'; } catch { return false; } }
function saveExpanded(value: boolean) { try { localStorage.setItem(INVENTORY_EXPANDED_KEY, value ? '1' : '0'); } catch { /* sem armazenamento: vale só nesta sessão */ } }

/** Grade de itens da run no canto inferior direito. O botão (ou a tecla I) expande/recolhe e a escolha fica salva. */
export function InventoryCorner({ items }: { items: Record<string, number> }) {
  const [expanded, setExpanded] = useState(readExpanded);
  const toggle = () => setExpanded(value => { saveExpanded(!value); return !value; });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.key.toLowerCase() !== 'i' || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.target instanceof HTMLElement && e.target.matches('input,select,textarea')) return;
      toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const entries = Object.entries(items);
  return <section className={`inventory-corner${expanded ? ' expanded' : ''}`} aria-label="Itens da partida">
    {entries.length > 0 && <button type="button" className="inventory-toggle" aria-expanded={expanded} title={expanded ? 'Recolher a grade de itens (I)' : 'Expandir a grade de itens (I)'} onClick={toggle}>{expanded ? '▾' : '▴'} {entries.reduce((s, [, n]) => s + n, 0)}</button>}
    {entries.length ? entries.map(([name, count]) => <div className="inv-icon" key={name} title={`${name} · ${ITEM_BY_NAME[name]?.description ?? ''}`}><ItemIcon name={name} /><small>{count}</small></div>) : <span>🎒 Itens da run</span>}
  </section>;
}
