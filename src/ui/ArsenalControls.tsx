import { useState } from 'react';
import { HERO_BY_ID } from '../game/heroes';
import { PRESET_LIMIT, PRESET_NAME_MAX, type BagPresets } from '../game/missionBag';

export type ArsenalControlsProps = {
  presets: BagPresets;
  homeCount: number;
  onSelect: (index: number | null) => void;
  onSave: (name: string, index: number | null) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
};

export function arsenalOrigin(heroId?: string) {
  return heroId ? (HERO_BY_ID[heroId]?.name ?? 'Origem desconhecida') : 'Origem não registrada';
}

export function ArsenalControls({ presets, homeCount, onSelect, onSave, onDuplicate, onDelete }: ArsenalControlsProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const index = presets.active;
  const slot = index === null ? undefined : presets.slots[index];
  const full = presets.slots.length >= PRESET_LIMIT;
  return <section className="arsenal-controls" aria-label="Arsenais da conta">
    <select aria-label="Arsenal de Missão" value={index ?? ''} onChange={event => {
      setDraft(null);
      setConfirmDelete(false);
      onSelect(event.target.value === '' ? null : Number(event.target.value));
    }}>
      <option value="">Configuração atual</option>
      {presets.slots.map((entry, i) => <option key={i} value={i}>{entry.name} · {arsenalOrigin(entry.originHeroId)}</option>)}
    </select>
    <small>{homeCount} fora do pool{slot && ' · ' + arsenalOrigin(slot.originHeroId)}</small>
    <div className="arsenal-control-buttons">
      <button type="button" disabled={!slot && full} onClick={() => {
        setConfirmDelete(false);
        setDraft(slot?.name ?? '');
      }}>Salvar</button>
      <button type="button" disabled={index === null || full} onClick={() => { if (index !== null) onDuplicate(index); }}>Duplicar</button>
      <button type="button" disabled={index === null} onClick={() => {
        setDraft(null);
        if (index !== null && confirmDelete) onDelete(index);
        setConfirmDelete(index !== null && !confirmDelete);
      }}>{confirmDelete ? 'Confirmar exclusão' : 'Excluir'}</button>
    </div>
    {draft !== null && <form onSubmit={event => {
      event.preventDefault();
      if (!draft.trim()) return;
      onSave(draft.trim(), index);
      setDraft(null);
    }}>
      <input aria-label="Nome do arsenal" placeholder="Nome do arsenal" value={draft} maxLength={PRESET_NAME_MAX} onChange={event => setDraft(event.target.value)} />
      <button type="submit" disabled={!draft.trim()}>Confirmar</button>
      <button type="button" onClick={() => setDraft(null)}>Cancelar</button>
    </form>}
  </section>;
}
