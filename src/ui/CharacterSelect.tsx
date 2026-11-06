import { useMemo, useState } from 'react';
import { HEROES, HERO_CLAN, ORGANIZATIONS, heroAffinity, heroOrganizations, type Element } from '../game/heroes';
import { HeroPortrait } from './RunSheet';
import { matchesSearch } from './PoolFilters';

/** Cores dos selos de elemento (mesma paleta das técnicas em heroes.ts). */
export const ELEMENT_COLOR: Record<Element, string> = { Neutro: '#d7e6ff', Fogo: '#ff7c45', Água: '#5fb6ef', Vento: '#8de8ca', Terra: '#c7a16c', Raio: '#b3c5ff', Madeira: '#8bd464', Areia: '#ddae70', Sombra: '#ad84e8', Sábio: '#f5da86' };
const ELEMENT_GLYPH: Record<Element, string> = { Neutro: '◇', Fogo: '火', Água: '水', Vento: '風', Terra: '土', Raio: '雷', Madeira: '木', Areia: '砂', Sombra: '影', Sábio: '仙' };

/** Organizações + clãs de origem (clãs ausentes de ORGANIZATIONS, como Nara e Uzumaki, entram pelo HERO_CLAN). */
function heroGroups(id: string): string[] {
  const names = heroOrganizations(id).map(o => o.name);
  const clan = HERO_CLAN[id];
  if (clan && !names.includes(clan)) names.push(clan);
  return names;
}
// Só organizações com pelo menos 1 shinobi jogável (ORGANIZATIONS já lista membros do elenco futuro).
const ORG_OPTIONS = [...new Set([...ORGANIZATIONS.filter(o => o.members.some(id => HEROES.some(h => h.id === id))).map(o => o.name), ...Object.values(HERO_CLAN)])];
const VILLAGE_OPTIONS = [...new Set(HEROES.map(h => h.village))].sort();
const ELEMENT_OPTIONS = [...new Set(HEROES.map(h => heroAffinity(h.id)))].sort();
const shortVillage = (village: string) => village.replace(/^Vila d[aoe]s?\s+/i, '');
const initials = (name: string) => name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();

/** Selos de elemento e organizações para o painel de detalhes do shinobi. */
export function CharacterTags({ id }: { id: string }) {
  const element = heroAffinity(id);
  return <div className="cs-tags">
    <span className="cs-tag" style={{ ['--el' as string]: ELEMENT_COLOR[element] }}>{ELEMENT_GLYPH[element]} {element}</span>
    {heroGroups(id).map(g => <span key={g} className="cs-tag org">{g}</span>)}
  </div>;
}

type Filters = { search: string; village: string; element: string; org: string };
const EMPTY: Filters = { search: '', village: '', element: '', org: '' };

export function CharacterSelect({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const set = (key: keyof Filters, value: string) => setFilters(f => ({ ...f, [key]: value }));
  const active = Object.values(filters).some(Boolean);
  const list = useMemo(() => HEROES.filter(h => {
    const groups = heroGroups(h.id);
    return matchesSearch(h.name + ' ' + h.village + ' ' + groups.join(' '), filters.search)
      && (!filters.village || h.village === filters.village)
      && (!filters.element || heroAffinity(h.id) === filters.element)
      && (!filters.org || groups.includes(filters.org));
  }), [filters]);

  return <div className="cs-root">
    <div className="cs-filters" role="search">
      <input className="cs-search" aria-label="Buscar shinobi" placeholder="Buscar por nome…" value={filters.search} onChange={e => set('search', e.target.value)} />
      <select aria-label="Aldeia" value={filters.village} onChange={e => set('village', e.target.value)}>
        <option value="">Vila · todas</option>
        {VILLAGE_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <select aria-label="Elemento" value={filters.element} onChange={e => set('element', e.target.value)}>
        <option value="">Elemento · todos</option>
        {ELEMENT_OPTIONS.map(el => <option key={el} value={el}>{el}</option>)}
      </select>
      <select aria-label="Organização" value={filters.org} onChange={e => set('org', e.target.value)}>
        <option value="">Organização · todas</option>
        {ORG_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <button type="button" className="cs-clear" disabled={!active} onClick={() => setFilters(EMPTY)}>Limpar filtros</button>
      <span className="cs-count" aria-live="polite"><b>{list.length}</b> de {HEROES.length}</span>
    </div>
    <div className="character-grid cs-grid">
      {list.map(entry => {
        const element = heroAffinity(entry.id), groups = heroGroups(entry.id), selected = entry.id === selectedId;
        return <button key={entry.id} type="button" aria-pressed={selected}
          title={`${entry.name} · ${entry.village} · ${element}${groups.length ? ' · ' + groups.join(', ') : ''}`}
          className={`character-card cs-card ${selected ? 'selected' : ''}`} style={{ ['--hero' as string]: entry.color }}
          onClick={() => onSelect(entry.id)}>
          <span className="cs-portrait">
            <span className="cs-initials" aria-hidden="true">{initials(entry.name)}</span>
            <HeroPortrait id={entry.id} />
            <span className="cs-element" style={{ ['--el' as string]: ELEMENT_COLOR[element] }} title={`Elemento: ${element}`}>{ELEMENT_GLYPH[element]}</span>
          </span>
          <b>{entry.name}</b>
          <small className="cs-village">{shortVillage(entry.village)}</small>
          {selected && <i className="cs-picked">SELECIONADO</i>}
        </button>;
      })}
      {list.length === 0 && <p className="cs-empty">Nenhum shinobi combina com esses filtros. <button type="button" onClick={() => setFilters(EMPTY)}>Limpar filtros</button></p>}
    </div>
  </div>;
}
