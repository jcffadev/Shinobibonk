import type { MouseEvent, ReactNode } from 'react';
import type { WorldSnapshot } from '../scene/GameCanvas';
import { HeroPortrait } from './RunSheet';
import '../map.css';

// Mapa completo (M), mapa rápido (Tab), marcadores do minimapa e HUD de rota/ping.
// Só recebe o que o GameCanvas já marcou como VISTO em tela (world.events / world.pickups).
// Rota: clicar num ícone traça rota até ele; clicar numa área livre do mapa = ping com rota.
// Um único alvo por vez (ping livre e rota de ícone se substituem). O GameCanvas mede a distância,
// limpa ao chegar (< 3 m · "Chegou!") ou quando o alvo deixa de existir.

type Marker = WorldSnapshot['events'][number];
type Pickup = WorldSnapshot['pickups'][number];

/** Eventos com NPC: retrato do atlas (src/game/evolution.ts → portraitRegion). */
const NPC_PORTRAIT: Record<string, string> = { kakashi: 'kakashi', shikamaru: 'shikamaru', slot: 'tsunade', ebisu: 'ebisu', iruka: 'iruka', orochimaru: 'orochimaru' };
/** Ícone/cor por tipo de evento. tone → classe CSS (map.css). */
const EVENT_STYLE: Record<string, { glyph: string; tone: string }> = {
  kakashi: { glyph: '👁', tone: 'npc' }, shikamaru: { glyph: '♟️', tone: 'npc' }, slot: { glyph: '🎰', tone: 'npc' }, ebisu: { glyph: '🕶', tone: 'npc' }, iruka: { glyph: '📚', tone: 'npc' },
  orochimaru: { glyph: '🐍', tone: 'curse' }, 'guardian-seal': { glyph: '⚔️', tone: 'danger' }, challenge: { glyph: '⛩️', tone: 'challenge' }, altar: { glyph: '🛕', tone: 'altar' },
  trader: { glyph: '⚖️', tone: 'shop' }, ichiraku: { glyph: '🍜', tone: 'shop' },
};
const PICKUP_LABEL: Record<string, string> = { kunai: 'Kunai (pago em Ryu)', shuriken: 'Shuriken (pago em Ryu)', ryu: 'Bolsa de Ryu', sealDrop: 'Kunai de recompensa grátis' };

const route = (id: string | null) => window.dispatchEvent(new CustomEvent('shinobi-route', { detail: { id } }));
const meters = (n: number) => `${Math.max(0, Math.round(n))} m`;
const dist = (world: WorldSnapshot, x: number, z: number) => Math.hypot(x - world.player.x, z - world.player.z);

function markerTone(m: Marker) {
  if (m.kind === 'enemy') return m.id === 'naruto-totem' ? 'totem' : m.guardian ? 'guardian' : 'elite';
  return EVENT_STYLE[m.id]?.tone ?? 'event';
}
function markerGroup(m: Marker) {
  if (m.kind === 'enemy') return 'Inimigo especial';
  return NPC_PORTRAIT[m.id] ? 'NPC' : 'Evento';
}

/** Ícone de um evento/NPC/inimigo especial visto. size: 'map' (M/Tab) ou 'mini' (minimapa). */
export function MarkerIcon({ m, size }: { m: Marker; size: 'map' | 'mini' }) {
  const portrait = m.portrait ?? NPC_PORTRAIT[m.id];
  const glyph = EVENT_STYLE[m.id]?.glyph ?? m.icon;
  return <span className={`mk mk-${size} tone-${markerTone(m)}${portrait ? ' has-portrait' : ''}${m.active === false ? ' used' : ''}`}>
    {portrait ? <HeroPortrait id={portrait} /> : <em>{glyph}</em>}
    {portrait && <sup>{glyph}</sup>}
  </span>;
}
export function PickupIcon({ p, size }: { p: Pickup; size: 'map' | 'mini' }) {
  return <span className={`mk mk-${size} tone-pickup${p.kind === 'sealDrop' ? ' free' : ''}`}>
    {p.kind === 'ryu' ? <em>🪙</em> : <img src={'/assets/icons/' + (p.kind === 'shuriken' ? 'shuriken' : 'kunai') + '.svg'} alt={p.kind} />}
  </span>;
}

/** Marcadores + rota dentro do minimapa (centrado no jogador, 1,55 % por metro). */
export function MinimapMarkers({ world }: { world: WorldSnapshot }) {
  const p = world.player;
  const at = (x: number, z: number, max = 44) => { let dx = (x - p.x) * 1.55, dy = (z - p.z) * 1.55; const r = Math.hypot(dx, dy); if (r > max) { dx *= max / r; dy *= max / r; } return { x: 50 + dx, y: 50 + dy, edge: r > max }; };
  const r = world.route, t = r ? at(r.x, r.z, 45) : null;
  return <>
    {r && t && <svg className="mini-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1="50" y1="50" x2={t.x} y2={t.y} /></svg>}
    {world.pickups.filter(pk => dist(world, pk.x, pk.z) < 30).map((pk, i) => { const q = at(pk.x, pk.z); return <i key={pk.id ?? 'pk' + i} className="mini-marker" title={pk.name ?? PICKUP_LABEL[pk.kind]} style={{ left: `${q.x}%`, top: `${q.y}%` }}><PickupIcon p={pk} size="mini" /></i>; })}
    {world.events.map(m => { const q = at(m.x, m.z); return <i key={m.id} className={`mini-marker${q.edge ? ' edge' : ''}${r?.id === m.id ? ' routed' : ''}`} title={`${m.name} · ${meters(dist(world, m.x, m.z))}`} style={{ left: `${q.x}%`, top: `${q.y}%` }}><MarkerIcon m={m} size="mini" /></i>; })}
    {world.ping && (() => { const q = at(world.ping.x, world.ping.z); return <i className="map-ping" title="Ping" style={{ left: `${q.x}%`, top: `${q.y}%` }}>📍</i>; })()}
    {r && t && <i className={`mini-target${t.edge ? ' edge' : ''}`} style={{ left: `${t.x}%`, top: `${t.y}%` }} title={`Rota: ${r.name} · ${meters(r.distance)}`} />}
  </>;
}

/** Painel do mapa (M completo / Tab rápido): ícones vistos, clique = rota, área livre = ping. */
export function MapPanel({ world, quick }: { world: WorldSnapshot; quick: boolean }) {
  const r = world.route;
  const pos = (x: number, z: number) => ({ left: `${50 + x}%`, top: `${50 + z}%` });
  const pick = (id: string) => (e: MouseEvent) => { e.stopPropagation(); route(id); };
  const rows = [...world.events].sort((a, b) => dist(world, a.x, a.z) - dist(world, b.x, b.z));
  return <div className={`map-layout${quick ? ' quick' : ''}`}>
    <div className="world-map" onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); window.dispatchEvent(new CustomEvent('shinobi-ping', { detail: { x: ((e.clientX - rect.left) / rect.width - .5) * 100, z: ((e.clientY - rect.top) / rect.height - .5) * 100 } })); }}>
      <div className="map-terrain" />
      {world.explored.map((cell, i) => <span className="map-revealed" key={i} style={pos(cell.x, cell.z)} />)}
      {r && <svg className="map-route-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={50 + world.player.x} y1={50 + world.player.z} x2={50 + r.x} y2={50 + r.z} /></svg>}
      <span className="world-player" style={pos(world.player.x, world.player.z)}>▲</span>
      {world.enemies.map((enemy, i) => <b key={i} style={pos(enemy.x, enemy.z)} />)}
      {world.pickups.map((p, i) => <i className={`known-map-event map-marker pickup${r?.id === p.id ? ' routed' : ''}`} key={p.id ?? 'p' + i} style={pos(p.x, p.z)} title={`${p.name ?? PICKUP_LABEL[p.kind]} · ${meters(dist(world, p.x, p.z))} · clique para traçar rota`} onClick={p.id ? pick(p.id) : undefined}><PickupIcon p={p} size="map" /></i>)}
      {world.events.map(m => <i className={`known-map-event map-marker${r?.id === m.id ? ' routed' : ''}${m.active === false ? ' used' : ''}`} key={m.id} style={pos(m.x, m.z)} title={`${m.name} · ${meters(dist(world, m.x, m.z))}${m.active === false ? ' · já usado nesta zona' : r?.id === m.id ? ' · clique para limpar a rota' : ' · clique para traçar rota'}`} onClick={pick(m.id)}><MarkerIcon m={m} size="map" /><small>{m.name}</small></i>)}
      {world.ping && <i className={`known-map-event map-marker ping${r?.id === 'ping' ? ' routed' : ''}`} style={pos(world.ping.x, world.ping.z)} title={r?.id === 'ping' ? 'Ping · clique para limpar' : 'Ping (G) · clique para traçar rota'} onClick={e => { e.stopPropagation(); route(r?.id === 'ping' ? null : 'ping'); }}>📍</i>}
      <b className="map-north">N</b><b className="map-south">S</b>
    </div>
    <aside className="discovered-list">
      <div className={`route-box${r ? ' on' : ''}`}>
        {r ? <><small>ROTA ATIVA</small><b>🎯 {r.name}</b><span>{meters(r.distance)} de distância</span><button onClick={() => route(null)}>✕ Limpar rota</button></>
          : <><small>SEM ROTA</small><span>Clique num ícone para traçar rota ou numa área livre para pingar.</span></>}
      </div>
      <h3>VISTO NESTA RUN</h3>
      {rows.length ? rows.map(m => <button className={`discovered-row${r?.id === m.id ? ' routed' : ''}${m.active === false ? ' used' : ''}`} key={m.id} disabled={m.active === false} onClick={() => route(m.id)} title={m.active === false ? 'Já usado nesta zona' : r?.id === m.id ? 'Limpar rota' : 'Traçar rota'}>
        <MarkerIcon m={m} size="mini" /><b>{m.name}<small>{markerGroup(m)}</small></b><small>{m.active === false ? 'usado' : r?.id === m.id ? '🎯 rota' : meters(dist(world, m.x, m.z))}</small>
      </button>) : <p>Explore olhando ao redor para revelar eventos e personagens no mapa.</p>}
      {!quick && <div className="map-legend">
        <span><i className="lg tone-npc" />NPC (retrato)</span><span><i className="lg tone-event" />Evento</span><span><i className="lg tone-elite" />Inimigo especial</span><span><i className="lg tone-pickup" />Recompensa no chão</span><span>📍 Ping</span>
        <p>Só aparece o que já foi visto na câmera. Clique num ícone para traçar rota (clique de novo para limpar); clique numa área livre para pingar. Ao chegar a menos de 3 m a rota é limpa.</p>
      </div>}
    </aside>
  </div>;
}

/** HUD de rota durante o jogo: cartão com nome/metros, seta na borda (alvo fora de vista) e aviso "Chegou!". */
export function RouteHud({ world }: { world: WorldSnapshot }) {
  const r = world.route, notice = world.routeNotice;
  let pointer: ReactNode = null;
  if (r) {
    const W = window.innerWidth, H = window.innerHeight, X = (r.screen.x + 1) / 2 * W, Y = (1 - r.screen.y) / 2 * H;
    // Margens livres do HUD: cartão do herói/topo, minimapa à direita e dock de habilidades embaixo.
    const box = { l: 60, r: W - 60, t: 170, b: H - 210 };
    if (X > box.l && X < box.r && Y > box.t && Y < box.b) pointer = <div className="route-pin" style={{ left: X, top: Y }}><span>▼</span><small>{meters(r.distance)}</small></div>;
    else {
      const cx = W / 2, cy = H / 2, dx = X - cx, dy = Y - cy;
      const k = Math.min(dx > 0 ? (box.r - cx) / dx : dx < 0 ? (box.l - cx) / dx : Infinity, dy > 0 ? (box.b - cy) / dy : dy < 0 ? (box.t - cy) / dy : Infinity);
      pointer = <div className="route-arrow" style={{ left: cx + dx * k, top: cy + dy * k }}><span style={{ transform: `rotate(${Math.atan2(dy, dx)}rad)` }}>➤</span><small>{r.name} · {meters(r.distance)}</small></div>;
    }
  }
  return <>
    {r && <div className="route-chip"><span>🎯</span><b>{r.name}<small>{meters(r.distance)}</small></b><button title="Limpar rota" onClick={() => route(null)}>✕</button></div>}
    {pointer}
    {/* Rota definida/perdida já aparece no toast do jogo (world.toast); o selo grande é só para a chegada. */}
    {notice?.kind === 'arrived' && <div className="route-notice arrived"><b>Chegou!</b><small>{notice.text.replace(/^Chegou!\s*/, '')}</small></div>}
  </>;
}
