import type { Rarity } from '../game/catalog';
import { RARITY_ORDER } from '../game/combat';
import '../rarity.css';

/**
 * Filtro de raridade com as cores do jogo (src/rarity.css). Seleção única. Nenhum marcado mostra todas as raridades.
 * Usado na Bolsa da Missão e na aba Itens do plano de build. O nome acessível de cada botão é só a raridade
 * (ex.: "Raro"); a contagem aparece no botão e no title.
 */
export function RarityFilter({ selected, onChange, counts, label = 'Filtrar itens por raridade' }: {
  selected: Rarity[]; onChange: (next: Rarity[]) => void; counts: Partial<Record<Rarity, number>>; label?: string;
}) {
  const toggle = (r: Rarity) => onChange([r]);
  const total = RARITY_ORDER.reduce((sum, r) => sum + (counts[r] ?? 0), 0);
  return <div className="rarity-filter" role="group" aria-label={label}>
    <button className="rarity-all" aria-pressed={!selected.length} onClick={() => onChange([])} title="Mostrar todas as raridades">Todas as raridades <b aria-hidden="true">{total}</b></button>
    {RARITY_ORDER.map(r => <button key={r} className={`rarity-${r.toLowerCase()}`} aria-label={r} aria-pressed={selected.includes(r)} title={`${r} · ${counts[r] ?? 0} ${(counts[r] ?? 0) === 1 ? 'item' : 'itens'}${selected.includes(r) ? ' · selecionado' : ' · filtrar por esta raridade'}`} onClick={() => toggle(r)}>
      <i aria-hidden="true" />{r}<b aria-hidden="true">{counts[r] ?? 0}</b>
    </button>)}
  </div>;
}

/** Contagem por raridade de uma lista. */
export function rarityCounts<T extends { rarity: string }>(list: T[]): Partial<Record<Rarity, number>> {
  const out: Partial<Record<Rarity, number>> = {};
  for (const entry of list) if (RARITY_ORDER.includes(entry.rarity as Rarity)) out[entry.rarity as Rarity] = (out[entry.rarity as Rarity] ?? 0) + 1;
  return out;
}
