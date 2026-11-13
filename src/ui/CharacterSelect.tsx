import { formAt, portraitRegion } from '../game/evolution';
import { directionalArt } from '../game/directionalArt';
import { VillageEmblem, villageName } from './VillageEmblem';
import { MissionCard } from './MissionCard';
import { UNLOCK_MISSIONS, LEGENDARY } from '../game/unlockMissions';
/** Ordem do elenco: jogáveis primeiro; bloqueados pela dificuldade da missão (Genin → Kage) e Lendários por último. */
const DIFF_RANK: Record<string, number> = { Genin: 1, Chunin: 2, Jonin: 3, Kage: 4 };
const unlockOrder = (id: string) => isHeroPlayable(id) ? 0 : (DIFF_RANK[UNLOCK_MISSIONS[id]?.difficulty ?? 'Genin'] ?? 1) * 10 + (LEGENDARY.has(id) ? 50 : 0);
/** Desempate: família na ordem do elenco e, dentro dela, a versão pela forma (Academia → Genin → Shippuden…). */
const familyOrder = (id: string) => HEROES.findIndex(h => h.id === familyOf(id)) * 100 + (HERO_BY_ID[id]?.form ?? 1);

import { isHeroPlayable } from '../game/account';
import { useEffect, useMemo, useState } from 'react';
import { HEROES, HERO_BY_ID, HERO_CLAN, ORGANIZATIONS, familyOf, heroAffinity, heroClan, heroOrganizations, type Element } from '../game/heroes';
import { matchesSearch } from './PoolFilters';

/** Cores dos selos de elemento (mesma paleta das técnicas em heroes.ts). */
export const ELEMENT_COLOR: Record<Element, string> = { Neutro: '#d7e6ff', Fogo: '#ff7c45', Água: '#5fb6ef', Vento: '#8de8ca', Terra: '#c7a16c', Raio: '#b3c5ff', Madeira: '#8bd464', Areia: '#ddae70', Sombra: '#ad84e8', Sábio: '#f5da86' };
const ELEMENT_GLYPH: Record<Element, string> = { Neutro: '◇', Fogo: '火', Água: '水', Vento: '風', Terra: '土', Raio: '雷', Madeira: '木', Areia: '砂', Sombra: '影', Sábio: '仙' };

/** Organizações + clãs de origem (clãs ausentes de ORGANIZATIONS, como Nara e Uzumaki, entram pelo HERO_CLAN). */
function heroGroups(id: string): string[] {
  const names = heroOrganizations(id).map(o => o.name);
  const clan = heroClan(id);
  if (clan && !names.includes(clan)) names.push(clan);
  return names;
}
// Só organizações com pelo menos 1 shinobi jogável (ORGANIZATIONS já lista membros do elenco futuro).
const ORG_OPTIONS = [...new Set([...ORGANIZATIONS.filter(o => o.members.some(id => HEROES.some(h => h.id === id))).map(o => o.name), ...Object.values(HERO_CLAN)])];
const VILLAGE_OPTIONS = [...new Set(HEROES.map(h => h.village))].sort();
const ELEMENT_OPTIONS = [...new Set(HEROES.map(h => heroAffinity(h.id)))].sort();

const initials = (name: string) => name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();

/** Selos de elemento e organizações para o painel de detalhes do shinobi. */
export function CharacterTags({ id }: { id: string }) {
  const element = heroAffinity(id),village=HERO_BY_ID[id]?.village;
  return <div className="cs-tags">
    <span className="cs-tag" style={{ ['--el' as string]: ELEMENT_COLOR[element] }}>{ELEMENT_GLYPH[element]} {element}</span>
    {village&&<span className="cs-tag cs-village-tag" title={'Vínculo de ajudantes · '+villageName(village)}><VillageEmblem village={village}/>{villageName(village,true)}</span>}
    {heroGroups(id).map(g => <span key={g} className="cs-tag org">{g}</span>)}
  </div>;
}

type Filters = { search: string; village: string; element: string; org: string };
const EMPTY: Filters = { search: '', village: '', element: '', org: '' };


const SELECT_PORTRAITS = ["hiruzen","raikage-terceiro","raikage-quarto","killer-b","onoki","ao","rasa","hanzo","mei","gengetsu","naruto-hokage","choji","kiba","shino","ino","kurenai","iruka","sai","yamato","shisui","obito","hiashi","hanabi","kisame","zabuza","suigetsu","mangetsu","karin","nagato","sasori","haku","chiriku","sakumo","deidara","hidan","kakuzu","konan","zetsu","jugo","kabuto","kabuto-sabio","kimimaro","jirobo","kidomaru","tayuya","sakon-ukon","dosu","zaku","kin","juzo","orochimaru-akatsuki","choji-guerra","kiba-shippuden","shino-shippuden","ino-guerra","tobi-akatsuki","obito-guerra","hanabi-adulta"];

type PortraitRegion = ReturnType<typeof portraitRegion>;
type Framing = { x: number; y: number; scale: number };

const loadedAtlases = new Map<string, Promise<HTMLImageElement>>();
const measuredPortraits = new Map<string, Promise<Framing>>();

function measurePortrait(region: PortraitRegion): Promise<Framing> {
  const key = [region.path, region.cols, region.rows, region.index].join(':');
  const cached = measuredPortraits.get(key);
  if (cached) return cached;
  let atlas = loadedAtlases.get(region.path);
  if (!atlas) {
    atlas = new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = region.path;
    });
    loadedAtlases.set(region.path, atlas);
  }
  const frame = atlas.then(image => {
    const size = 96;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const w = image.naturalWidth / region.cols, h = image.naturalHeight / region.rows;
    ctx.drawImage(image, (region.index % region.cols) * w, Math.floor(region.index / region.cols) * h, w, h, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    const rows = Array.from({ length: size }, (_, y) => {
      const xs: number[] = [];
      for (let x = 0; x < size; x++) if (data[(y * size + x) * 4 + 3] >= 144) xs.push(x);
      return xs;
    });
    const top = rows.findIndex(xs => xs.length > 1);
    let bottom=size-1;
    while(bottom>top&&rows[bottom].length<=1)bottom--;
    if (bottom <= top) return { x: 50, y: 0, scale: 1 };
    const bodyHeight = bottom - top + 1;
    const headRows = rows.slice(top + Math.floor(bodyHeight * .12), top + Math.ceil(bodyHeight * .36));
    const headXs = headRows.flat().sort((a, b) => a - b);
    const headX = headXs[Math.floor(headXs.length / 2)] ?? size / 2;
    const bust=region.path.includes('shinobi-select-portraits');
    const scale = Math.min(2.4, Math.max(1, size * (bust?.91:1.32) / bodyHeight));
    return { x: 50 - headX / size * scale * 100, y: 13 - top / size * scale * 100, scale };
  });
  measuredPortraits.set(key, frame);
  return frame;
}

function cardRegion(id:string) {
  const family=familyOf(id);
  const index=SELECT_PORTRAITS.indexOf(id);
  if(index>=0)return {path:'/assets/shinobi-select-portraits-v1-'+(1+Math.floor(index/12))+'.png',cols:4,rows:3,index:index%12};
  if(family==='gaara'){
    const sheet=directionalArt(family,formAt(id).level);
    if(sheet)return {path:sheet.path,cols:4,rows:sheet.rows,index:(sheet.firstRow??0)*4};
  }
  return portraitRegion(id);
}

function CardPortrait({ id, decorative }: { id: string; decorative: boolean }) {
  const [framing, setFraming] = useState<Framing>();
  useEffect(() => {
    let mounted = true;
    measurePortrait(cardRegion(id)).then(value => { if (mounted) setFraming(value); }).catch(() => {});
    return () => { mounted = false; };
  }, [id]);
  const {path,cols,rows,index}=cardRegion(id);
  return <span className="cs-cropped-sprite" data-framed={Boolean(framing)}
    style={framing ? { transform: `translate(${framing.x}%,${framing.y}%) scale(${framing.scale})` } : undefined}>
    <span className="hero-sprite roster-sprite" role={decorative?undefined:"img"} aria-hidden={decorative||undefined} aria-label={decorative?undefined:HERO_BY_ID[id]?.name} style={{backgroundImage:`url(${path})`,backgroundSize:`${cols*100}% ${rows*100}%`,backgroundPosition:`${cols===1?0:index%cols/(cols-1)*100}% ${rows===1?0:Math.floor(index/cols)/(rows-1)*100}%`}}/>
  </span>;
}

export function CharacterSelect({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const set = (key: keyof Filters, value: string) => setFilters(f => ({ ...f, [key]: value }));
  const active = Object.values(filters).some(Boolean);
  const list = useMemo(() => HEROES.filter(h => {
    const groups = heroGroups(h.id);
    const known = isHeroPlayable(h.id);
    return matchesSearch(known ? h.name + ' ' + h.village + ' ' + villageName(h.village) + ' ' + groups.join(' ') : h.village+' '+villageName(h.village), filters.search)
      && (!filters.village || h.village === filters.village)
      && (!filters.element || known && heroAffinity(h.id) === filters.element)
      && (!filters.org || known && groups.includes(filters.org));
  }).sort((a, b) => unlockOrder(a.id) - unlockOrder(b.id) || familyOrder(a.id) - familyOrder(b.id)), [filters]);
  // Card da missão em camada fixa (por cima de tudo, sem ser cortado pela grade).
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const showMission = (id: string, el: HTMLElement) => { if (isHeroPlayable(id) || !UNLOCK_MISSIONS[id]) { setHover(null); return; } const r = el.getBoundingClientRect(); const w = 280, x = Math.min(window.innerWidth - w - 8, Math.max(8, r.left + r.width / 2 - w / 2)); const below = r.bottom + 330 < window.innerHeight; setHover({ id, x, y: below ? r.bottom + 6 : Math.max(8, r.top - 330) }); };

  return <div className="cs-root">
    <div className="cs-filters" role="search">
      <input className="cs-search" aria-label="Buscar shinobi" placeholder="Buscar por nome…" value={filters.search} onChange={e => set('search', e.target.value)} />
      <select aria-label="Aldeia" value={filters.village} onChange={e => set('village', e.target.value)}>
        <option value="">Vila · todas</option>
        {VILLAGE_OPTIONS.map(v => <option key={v} value={v}>{villageName(v)} · {v}</option>)}
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
        const element = heroAffinity(entry.id), groups = heroGroups(entry.id), selected = entry.id === selectedId, playable = isHeroPlayable(entry.id);
        return <button key={entry.id} type="button" aria-pressed={selected}
          title={isHeroPlayable(entry.id) ? `${entry.name} · ${entry.village} · ${element}${groups.length ? ' · ' + groups.join(', ') : ''}` : undefined}
          className={`character-card cs-card ${selected ? 'selected' : ''} ${isHeroPlayable(entry.id) ? '' : 'cs-locked'} ${LEGENDARY.has(entry.id) ? 'cs-legendary' : ''}`} style={{ ['--hero' as string]: entry.color }}
          onClick={() => onSelect(entry.id)} onMouseEnter={(e) => showMission(entry.id, e.currentTarget)} onMouseLeave={() => setHover(null)} onFocus={(e) => showMission(entry.id, e.currentTarget)} onBlur={() => setHover(null)}>
          <span className="cs-portrait">
            <span className="cs-initials" aria-hidden="true">{playable?initials(entry.name):null}</span>
            <CardPortrait id={entry.id} decorative={!playable} />
            {!isHeroPlayable(entry.id) && <span className="cs-village-mark" aria-hidden="true"><VillageEmblem village={entry.village}/></span>}
            {playable&&<span className="cs-element" style={{ ['--el' as string]: ELEMENT_COLOR[element] }} title={`Elemento: ${element}`}>{ELEMENT_GLYPH[element]}</span>}
          </span>
          {playable&&<b>{entry.name}</b>}
          
          <small className="cs-village"><VillageEmblem village={entry.village}/>{villageName(entry.village,true)}</small>
          {playable && LEGENDARY.has(entry.id) && <span className="cs-legend-tag">Lendário</span>}
          {!playable&&<small className="cs-mission-label">{entry.family!==entry.id?'Nova versão · missão':'Liberado com missão'}</small>}
          {selected && <i className="cs-picked">SELECIONADO</i>}
        </button>;
      })}
      {hover && <div className="cs-mission-float" style={{ left: hover.x, top: hover.y }} role="tooltip"><MissionCard id={hover.id} compact anonymous /></div>}
      {list.length === 0 && <p className="cs-empty">Nenhum shinobi combina com esses filtros. <button type="button" onClick={() => setFilters(EMPTY)}>Limpar filtros</button></p>}
    </div>
  </div>;
}
