import { useEffect } from 'react';
import { MAPS, MAP_BY_ID, DIFFICULTY_ORDER, type MapId } from '../game/maps';
import { HERO_BY_ID, heroAffinity } from '../game/heroes';
import { isDifficultyUnlocked, mapProgress, isHeroPlayable, isMapUnlocked, MAP_ORDER } from '../game/account';
import { MissionCard } from './MissionCard';
import { UNLOCK_MISSIONS } from '../game/unlockMissions';
import { MISSION_TIER, type Difficulty } from '../game/progression';
import type { BagPresets } from '../game/missionBag';
import { HeroPortrait } from './RunSheet';
import '../map-select.css';

/** Elementos temáticos de cada mapa (só para os selos da tela). */
const MAP_ELEMENTS: Record<MapId, string[]> = { folha: ['Vento', 'Fogo', 'Madeira'], areia: ['Areia', 'Vento'], pedra: ['Terra', 'Raio'], nevoa: ['Água', 'Sombra'] };
const DIFF_TEXT: Record<Difficulty, string> = { Genin: 'Treinamento de novato', Chunin: 'Teste de chunin', Jonin: 'Desafio de elite', Kage: 'Desafio máximo' };

/**
 * "Escolha o mapa" (referência do usuário): abas dos mapas no topo, prévia grande da região com guardiões por zona e
 * painel "Preparar partida" (modo, dificuldade, progresso, build, mochila e predefinições da Bolsa). Enter começa.
 */
export function MapSelect({ heroId, mapId, onMap, mission, onMission, planned, homeCount, presets, onApplyPreset, onStart, onBack, onChangeHero, onEditPlan, onBag }: {
  heroId: string; mapId: MapId; onMap: (id: MapId) => void; mission: Difficulty; onMission: (d: Difficulty) => void;
  planned: string[]; homeCount: number; presets: BagPresets; onApplyPreset: (index: number) => void;
  onStart: () => void; onBack: () => void; onChangeHero: () => void; onEditPlan: () => void; onBag: () => void;
}) {
  const map = MAP_BY_ID[mapId], hero = HERO_BY_ID[heroId], progress = mapProgress()[mapId] ?? [];
  const mapOpen = isMapUnlocked(mapId), canStart = mapOpen && isHeroPlayable(heroId) && isDifficultyUnlocked(mapId, mission);
  const unlockHere = Object.entries(UNLOCK_MISSIONS).filter(([id, m]) => m.map === mapId && !isHeroPlayable(id));
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.target instanceof HTMLElement && e.target.matches('input,select,textarea')) return; if (e.key === 'Enter' && canStart) onStart(); if (e.key === 'Escape') onBack(); };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [canStart, onStart, onBack]);

  return <div className="ms-page" style={{ ['--map' as string]: map.color }}>
    <header className="ms-top"><button type="button" className="ms-back" onClick={onBack}><kbd>Esc</kbd> Voltar</button><h1>Escolha o mapa</h1></header>
    <nav className="ms-tabs">{MAPS.map((m) => {
      const done = mapProgress()[m.id] ?? [];
      const open = isMapUnlocked(m.id), prev = MAP_BY_ID[MAP_ORDER[MAP_ORDER.indexOf(m.id) - 1] as MapId];
      return <button type="button" key={m.id} className={`${m.id === mapId ? 'active' : ''} ${open ? '' : 'locked'}`} title={open ? undefined : `Vença o Genin em ${prev?.name} para liberar`} style={{ ['--map' as string]: m.color }} onClick={() => onMap(m.id)}>
        <span className="ms-tab-symbol">{m.symbol}</span><span><b>{m.name}</b><small>{MAP_ELEMENTS[m.id].join(' · ')}</small></span><em title="Dificuldades vencidas">{open ? done.length + '/4' : '🔒'}</em>
      </button>;
    })}</nav>
    <section className={`ms-preview ms-preview-${mapId}`}>
      {!mapOpen && <div className="ms-locked-map">🔒 {map.name} bloqueada<small>Vença o Genin em {MAP_BY_ID[MAP_ORDER[MAP_ORDER.indexOf(mapId) - 1] as MapId]?.name} para liberar este mapa.</small></div>}
      <div className="ms-region"><small>REGIÃO · {map.country.toUpperCase()}</small><h2>{map.name}</h2><div className="ms-tags">{MAP_ELEMENTS[mapId].map((el) => <i key={el}>{el}</i>)}</div><p>{map.description} Climas: {map.weathers.map((w) => w.name).join(' / ')}.</p></div>
      <button type="button" className="ms-hero" onClick={onChangeHero}><HeroPortrait id={heroId} /><span><small>Seu shinobi</small><b>{hero.name}</b><i>{heroAffinity(heroId)}</i></span><em>Trocar</em></button>
      {unlockHere.length > 0 && <details className="ms-unlocks"><summary>Missões de desbloqueio · {unlockHere.length}</summary><div>{unlockHere.filter(([, m]) => m.difficulty === mission).slice(0, 2).map(([id]) => <MissionCard key={id} id={id} compact />)}{unlockHere.filter(([, m]) => m.difficulty !== mission).length > 0 && <small>+ {unlockHere.filter(([, m]) => m.difficulty !== mission).length} em outras dificuldades</small>}</div></details>}
      <div className="ms-guardians"><small>GUARDIÕES · um por zona, invocado no altar</small><div>{map.zones.map((zone, i) => <div className="ms-zone" key={zone.name}><b>ZONA {i + 1} · {zone.name}</b><span>{zone.guardians.map((g) => <HeroPortrait key={g} id={g} />)}</span></div>)}</div></div>
    </section>
    <aside className="ms-prepare">
      <div className="ms-prepare-head"><b>Preparar partida</b><small>{map.name}</small></div>
      <div className="ms-prepare-body">
        <h3>MODO</h3>
        <div className="ms-modes"><button type="button" className="active"><b>Clássico</b><small>Zonas, guardiões e eventos · 10 min por zona</small></button><button type="button" disabled><b>Sobrevivência</b><small>Hordas infinitas · em breve</small></button></div>
        <h3>DIFICULDADE</h3>
        <div className="ms-diffs">{DIFFICULTY_ORDER.map((d, i) => {
          const open = isDifficultyUnlocked(mapId, d);
          return <button type="button" key={d} disabled={!open} className={`${mission === d ? 'active' : ''} ${progress.includes(d) ? 'done' : ''}`} title={open ? undefined : `Vença o ${DIFFICULTY_ORDER[i - 1]} em ${map.name} para liberar`} onClick={() => onMission(d)}>
            <b>{open ? '' : '🔒 '}{d}{progress.includes(d) ? ' ✓' : ''}</b><small>{DIFF_TEXT[d]} · inimigos ×{MISSION_TIER[d]} · drops ×{Math.sqrt(MISSION_TIER[d]).toFixed(2)}</small>
          </button>;
        })}</div>
        <h3>BUILD SELECIONADA <button type="button" className="ms-link" onClick={onEditPlan}>Editar plano</button></h3>
        <div className="ms-box">{planned.length ? planned.map((n) => <i key={n} className="ms-chip">★ {n}</i>) : <small>Nenhuma técnica ou pílula planejada.</small>}</div>
        <h3>MOCHILA <small>itens para levar antes de começar · em breve</small></h3>
        <div className="ms-box ms-soon"><small>O sistema de itens levados para a partida ainda será definido. Por enquanto as recompensas vêm só de kunais, shurikens e eventos.</small></div>
        <h3>BOLSA DA MISSÃO <button type="button" className="ms-link" onClick={onBag}>Abrir</button></h3>
        <div className="ms-box"><small>{homeCount} item(ns) em casa (fora do pool).</small>
          {presets.slots.map((slot, i) => slot && <div className={`ms-preset ${presets.active === i ? 'active' : ''}`} key={i}><b>{i + 1} · {slot.name}</b><small>{slot.items.length} itens em casa</small><button type="button" disabled={presets.active === i} onClick={() => onApplyPreset(i)}>{presets.active === i ? 'Em uso' : 'Aplicar'}</button></div>)}
          {!presets.slots.some(Boolean) && <small> Sem predefinições salvas.</small>}
        </div>
      </div>
      <button type="button" className="ms-start" disabled={!canStart} onClick={onStart}>{canStart ? <>▶ Começar! <kbd>Enter</kbd></> : !isHeroPlayable(heroId) ? '🔒 Shinobi bloqueado' : '🔒 Dificuldade bloqueada'}</button>
    </aside>
  </div>;
}
